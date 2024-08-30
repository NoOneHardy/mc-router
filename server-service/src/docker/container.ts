import {ApiImpl} from './api-impl'
import {HostConfig} from './types/container/host-config'
import {ContainerJson} from './types/container/container-json'
import {ContainerController} from './container-controller'
import {RejectionReason} from './rejection-reason'

export class Container {
  private readonly _id: string
  private _name: string
  private readonly _image: string
  private readonly _created: number
  private readonly _ports: Ports[]

  private _stream: NodeJS.ReadWriteStream | null = null

  public get id() {
    return this._id
  }

  public get name() {
    return this._name
  }

  public get image() {
    return this._image
  }

  public get version() {
    const tag = this.image.split(':')[-1]
    const version = tag.split('-')[0]
    if (tag.split('-').length > 1) {
      return `${version} ${tag.split('-').slice(1).join(' ')}`
    }
    return version
  }

  public get created(): Date {
    return new Date(this._created)
  }

  public get ports() {
    return this._ports
  }

  public get stream() {
    return this._stream
  }

  private constructor(
    id: string,
    name: string,
    image: string,
    created: number,
    ports: Ports[]
  ) {
    if (id.length > 12) id = id.slice(0, 12)
    this._id = id
    this._name = name
    this._image = image
    this._created = created
    this._ports = ports
  }

  public async attach(): Promise<NodeJS.ReadWriteStream> {
    return new Promise<NodeJS.ReadWriteStream>((resolve, reject) => {
      const params: string[] = [
        'stdin=true',
        'stdout=true',
        'stderr=true',
        'stream=true'
      ]

      const url = `/containers/${this.id}/attach${params.length > 0 ? '?' + params.join('&') : ''}`

      const reqOptions = {
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'tcp'
        }
      }

      const post = ApiImpl.post(url, reqOptions)

      post.on('upgrade', (_, socket: NodeJS.ReadWriteStream) => {
        this._stream = socket
        resolve(socket)
      })

      post.on('response', response => {
        switch (response) {
          default:
            reject('Not implemented yet') // TODO: implement all possible responses
        }
      })

      post.on('error', err => reject(err))
    })
  }

  public async start(): Promise<true> {
    return new Promise<true>((resolve, reject) => {
      const post = ApiImpl.post(`/containers/${this._id}/start`)
      post.on('response', response => {
        switch (response.statusCode) {
          case 204:
            this.attach().then(() => {
              resolve(true)
            }).catch(e => reject(e))
            break
          default:
            reject('Not implemented yet') // TODO: implement all possible responses
        }
      })

      post.on('error', err => {
        reject(err)
      })
    })
  }

  public static async getInfo(id: string): Promise<ContainerJson> {
    return new Promise<ContainerJson>((resolve, reject) => {
      const request = ApiImpl.get(`/containers/json?all=true&filters={"id":["${id}"]}`)

      request.on('response', response => {
        switch (response.statusCode) {
          case 200:
            response.on('data', (raw: string) => {
              const containers: ContainerJson[] = JSON.parse(raw)
              if (containers.length > 0) {
                resolve(JSON.parse(raw)[0])
                return
              }
              reject(`No container with id ${id}`)
            })
            break
          default:
            reject('Not implemented yet') // TODO: implement all possible responses
        }
      })

      request.on('error', err => {
        reject(err.message)
      })
    })
  }

  private static createContainerFromJSON(json: ContainerJson): Container {
    const container = new Container(json.Id, json.Names[0], json.Image, json.Created, json.Ports)

    ContainerController.saveContainer(container)
    return container
  }

  public static async create(name: string, image: string, config?: ContainerConfig): Promise<Container> {
    return new Promise<Container>((resolve, reject) => {
      const post = ApiImpl.post(`/containers/create?name=${name}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        }, {
          ...config,
          Image: 'docker.no1hardy.ch/minecraft-server:' + image
        })

      post.on('response', response => {
        switch (response.statusCode) {
          case 201:
            response.on('data', (raw: string) => {
              const data: { Id: string, Warnings: string[] } = JSON.parse(raw)

              Container.getInfo(data.Id.slice(0, 12)).then(info => {
                resolve(Container.createContainerFromJSON(info))
                return
              })
            })
            break
          case 400:
            response.on('data', (raw: string) => {
              const data: {message: string} = JSON.parse(raw)
              reject({
                reason: RejectionReason.BAD_PARAMETER,
                message: data.message
              })
              return
            })
            break
          case 404:
            response.on('data', (raw: string) => {
              const data: {message: string} = JSON.parse(raw)
              reject({
                reason: RejectionReason.NO_SUCH_IMAGE,
                message: data.message
              })
              return
            })
            break
          case 409:
            response.on('data', (raw: string) => {
              const data: {message: string} = JSON.parse(raw)
              reject({
                reason: RejectionReason.CONFLICT,
                message: data.message
              })
              return
            })
            break
          case 500:
            response.on('data', (raw: string) => {
              const data: {message: string} = JSON.parse(raw)
              reject({
                reason: RejectionReason.SERVER_ERROR,
                message: data.message
              })
              return
            })
            break
          default:
            reject('Not implemented yet') // TODO: implement response codes
            return
        }
      })

      post.on('error', err => {
        reject(err.message)
      })
    })
  }

  public static async createFromId(id: string): Promise<Container> {
    return new Promise<Container>((resolve, reject) => {
      Container.getInfo(id).then(info => {
        resolve(Container.createContainerFromJSON(info))
      }).catch(e => {
        reject(e)
      })
    })
  }
}

interface Ports {
  IP: string
  PrivatePort: number
  PublicPort: number
  Type: 'tcp' | 'udp' | 'sctp'
}

export interface ContainerConfig {
  ExposedPorts?: {
    [key: `${number}/${'tcp' | 'udp' | 'sctp'}`]: Record<never, never>
  },
  Tty?: boolean
  HostConfig?: HostConfig
  OpenStdin?: boolean
}

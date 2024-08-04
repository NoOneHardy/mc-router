import {ApiImpl} from './api-impl'
import {HostConfig} from './types/container/host-config'
import {ContainerJson} from './types/container/container-json'
import {ContainerController} from './container-controller'
import {ContainerAttachOptions} from './types/container/container-attach-options'

export class Container {
  private readonly _id: string
  private _name: string
  private _image: string
  private _created: Date
  private _ports: {
    IP: string
    PrivatePort: number
    PublicPort: number
    Type: 'tcp' | 'udp' | 'sctp'
  }[]
  private _state: string

  private _stream?: NodeJS.ReadWriteStream

  public get id() {
    return this._id
  }

  public get name() {
    return this._name
  }

  private set name(name: string) {
    if (name.startsWith('/')) this._name = name.slice(1)
    else this._name = name
  }

  public get image() {
    return this._image
  }

  public get created() {
    return this._created
  }

  public get ports() {
    return this._ports
  }

  public get state() {
    return this._state
  }

  private constructor(id: string) {
    if (id.length > 12) id = id.slice(0, 12)
    this._id = id
    console.log(`Created container with id ${this._id}`)
  }

  public get stream() {
    return new Promise<NodeJS.ReadWriteStream>((resolve) => {
      if (!this._stream) {
        this.attach({
          stream: true,
          stdin: true,
          stdout: true
        }).then(resolve)
      } else {
        console.log('Existing Stream')
        resolve(this._stream)
      }
    })
  }

  public async start() {
    return new Promise<true>((resolve, reject) => {
      const post = ApiImpl.post(`/containers/${this._id}/start`)
      post.on('response', response => {
        switch (response.statusCode) {
          case 204:
            resolve(true)
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

  public async attach(options: ContainerAttachOptions) {
    return new Promise<NodeJS.ReadWriteStream>((resolve, reject) => {
      if (!options.stream && !options.logs) options.stream = true

      const params: string[] = []

      if (options.stdin) params.push('stdin=true')
      if (options.stdout) params.push('stdout=true')
      if (options.stderr) params.push('stderr=true')
      if (options.stream) params.push('stream=true')
      if (options.logs) params.push('logs=true')
      if (options.detachKeys) params.push(`detachKeys=${options.detachKeys}`)

      const url = `/containers/${this._id}/attach${params.length > 0 ? '?' + params.join('&') : ''}`

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

  private static createContainerFromJSON(json: ContainerJson): Container {
    const container = new Container(json.Id)

    container.name = json.Names[0]
    container._image = json.Image
    container._created = new Date(json.Created)
    container._ports = json.Ports
    container._state = json.State

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
        Image: image
      })

      post.on('response', response => {
        switch (response.statusCode) {
          case 201:
            response.on('data', raw => {
              const data: { Id: string, Warnings: string[] } = JSON.parse(raw.toString())
              for (const warning of data.Warnings) console.warn(warning)

              Container.getInfo(data.Id.slice(0, 12)).then(info => {
                resolve(Container.createContainerFromJSON(info))
              })
            })
            break
          default:
            reject('Not implemented yet') // TODO: implement all possible responses
        }
      })

      post.on('error', err => {
        reject(err.message)
      })
    })
  }

  public static async createById(id: string): Promise<Container | null> {
    return new Promise<Container>((resolve) => {
      Container.getInfo(id).then((info: ContainerJson | null) => {
        if (!info) {
          resolve(null)
          return
        }
        resolve(Container.createContainerFromJSON(info))
      })
    })
  }

  public static async createByName(name: string): Promise<Container | null> {
    return new Promise<Container>((resolve, reject) => {
      const request = ApiImpl.get(`/containers/json?all=true&filters={"name":["${name}"]}`)

      request.on('response', response => {
        switch (response.statusCode) {
          case 200:
            response.on('data', raw => {
              resolve(Container.createContainerFromJSON(JSON.parse(raw)[0]))
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

  public static async getInfo(id: string): Promise<ContainerJson | null> {
    return new Promise<ContainerJson | null>((resolve, reject) => {
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
              resolve(null)
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
}

export interface ContainerConfig {
  ExposedPorts?: {
    [key: `${number}/${'tcp' | 'udp' | 'sctp'}`]: Record<never, never>
  },
  Tty?: boolean
  HostConfig?: HostConfig
  OpenStdin?: boolean
}

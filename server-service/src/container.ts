import {ApiImpl} from './api-impl'

export class Container {
  private readonly id: string
  private state: string = 'Exited'

  private constructor(id: string) {
    this.id = id
    console.log(`Created container with id ${this.id}`)

    if (this.state === 'Exited') this.start().then(() => console.log('Started successfully'))
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
              const data: {Id: string, Warnings: string[]} = JSON.parse(raw.toString())
              for (const warning of data.Warnings) console.warn(warning)

              const container = new Container(data.Id)
              resolve(container)
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

  public async start() {
    return new Promise<true>((resolve, reject) => {
      if (!this.id) reject('Container has no id (this is weird)')
      const post = ApiImpl.post(`/containers/${this.id}/start`)
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
}

export interface ContainerConfig {
  ExposedPorts?: {
    [key: `${number}/${'tcp' | 'udp' | 'sctp'}`]: Record<never, never>
  },
  Tty?: boolean
}

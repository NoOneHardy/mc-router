import {Container} from './container'
import {RejectionReason} from './rejection-reason'

export abstract class ContainerController {
  private static containerRepository: { [key: string]: Container } = {}

  public static saveContainer(container: Container) {
    this.containerRepository[container.id] = container
  }

  public static async getContainer(id: string): Promise<Container> {
    return new Promise((resolve, reject) => {
      if (Object.keys(this.containerRepository).includes(id)) {
        resolve(this.containerRepository[id])
        return
      }

      Container.createFromId(id).then((container: Container | null) => {
        if (!container) {
          reject(RejectionReason.NO_SUCH_CONTAINER)
          return
        }
        resolve(container)
      })
    })
  }
}
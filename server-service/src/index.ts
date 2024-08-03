import fetch from 'node:fetch'
import * as process from 'node:process'
// import * as process from 'node:process'
// import {Container} from 'dockerode'

const docker = new Docker()

// const containerOptions: Docker.ContainerCreateOptions = {
//   Image: 'docker.no1hardy.ch/minecraft-server:1.21-fabric',
//   OpenStdin: true,
//   Tty: true,
//   ExposedPorts: {
//     '25565/tcp': {}
//   },
//   HostConfig: {
//     PortBindings: {
//       '25565/tcp': [
//         {
//           HostPort: '8080'
//         }
//       ]
//     }
//   }
// }
//
// class ServerContainer {
//   private container: Container | null = null
//
//   constructor() {
//     this.create()
//   }
//
//   private async create(): Promise<void> {
//     this.container = await docker.createContainer(containerOptions)
//     console.log('Container created')
//     await this.container.start()
//
//     console.log('Container started')
//   }

// public async attach(): Promise<void> {
//   if (!this.container) {
//     console.log('No container instance available')
//     return
//     }
//
//     const stream = await this.container.attach({
//       stream: true,
//       stdout: true,
//       stderr: true,
//       stdin: true,
//     });
//
//     // Demultiplex the stream to standard output and error
//     this.container.modem.demuxStream(stream, process.stdout, process.stderr);
//     console.log(`Attaching container ${this.container.id}`)
//
//     setTimeout(() => {
//       stream.write('say Hello World')
//     }, 20000)
//   }
// }
//
// new ServerContainer()
//
//
// setTimeout(() => {
//   container.attach();
// }, 10000);


const container = docker.getContainer('720736bad7ecc2f1ced7364366a69e240d1a6ad5dea02f9a77f3c2b0bb7990ae')

container.attach({
  stream: true,
  stdin: true,
  stdout: true,
  stderr: true,
  hijack: true,
  logs: false
}, (_, stream) => {
  // Map output to console
  stream.pipe(process.stdout)
  process.stdin.pipe(stream)

  // process.stdin.write('say hello')
  // stream.on('data', chunk => {
  //   if ((/^\[[0-9]{2}:[0-9]{2}:[0-9]{2}/).test(chunk.toString('utf-8'))) console.log(chunk.toString('utf-8'))
  // })

  const string = 'say hello\n'
  // Write data to the container's stdin
  stream.write(string)
})



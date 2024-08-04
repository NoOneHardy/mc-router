import * as express from 'express'
import {Container, ContainerConfig} from './docker/container'
import {ContainerController} from './docker/container-controller'
import {RejectionReason} from './docker/rejection-reason'

const app = express()

app.post('/welcome', async (_, res) => {
  const containerOptions: ContainerConfig = {
    ExposedPorts: {
      '25565/tcp': {},
      '8080/tcp': {},
    },
    HostConfig: {
      PortBindings: {
        '25565/tcp': [{HostPort: '21067'}],
        '8080/tcp': [{HostPort: '80'}]
      },
      AutoRemove: true
    },
    Tty: true,
    OpenStdin: true
  }

  const container = await Container.create('test', 'docker.no1hardy.ch/minecraft-server:1.21-fabric', containerOptions)
  ContainerController.saveContainer(container)
  let started = await container.start()
  if (!started) res.send('Couldn\'t start container')

  container.stream.then(stream => {
    stream.pipe(process.stdout)
    setTimeout(() => {
      stream.write('say Hello World\n')
    }, 35000)
  })

  res.send(container)

  // const attachOptions = {
  //   stream: true,
  //   stdin: true,
  //   stdout: true
  // }

  // const socket = await container.attach(attachOptions)
  // socket.on('data', data => {
  //   console.log(data.toString().slice(0, data.toString().length - 2))
  // })
  //
  // setTimeout(() => {
  //   socket.write('say Hello World\n')
  //   res.send('Command executed successfully')
  // }, 35000)
})

// TODO: make every method like this
app.get('/register/container/:id', (req, res) => {
  const id = req.params.id
  ContainerController.getContainer(id)
    .then(container => {
      res.appendHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(container))
    })
    .catch((reason: RejectionReason) => {
      switch (reason) {
        case RejectionReason.NO_SUCH_CONTAINER:
          res.statusCode = 404
          res.send({"error": reason})
          return
      }
    })
})

app.get('/register/container/name/:name', async (req, res) => {
  const name = req.params.name
  const container = await ContainerController.getContainerByName(name)

  res.appendHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(container))
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})

// Container.create('test', 'docker.no1hardy.ch/minecraft-server:1.21-fabric', {
//   ExposedPorts: {
//     '25565/tcp': {},
//     '8080/tcp': {},
//   },
//   HostConfig: {
//     PortBindings: {
//       '25565/tcp': [{ HostPort: '21067' }],
//       '8080/tcp': [{ HostPort: '80' }]
//     }
//   },
//   Tty: true,
//   OpenStdin: true
// }).then(container => {
//   if (container instanceof Container) {
//     container.start().then(() => {
//       setTimeout(() => {
//         console.log('Attaching to container')
//         container.attach({
//           stream: true,
//           stdin: true,
//           stdout: true
//         }).then(handle)
//       }, 35000)
//     })
//   }
// })
//
// function handle(stream: NodeJS.ReadWriteStream) {
//   stream.on('data', data => {
//     console.log(data.toString().slice(0, data.toString().length - 2))
//   })
//
//   stream.write('say hello\n')
// }

// const url = 'http://localhost/containers/720736bad7ec/attach?stream=true&stdout=true&stdin=true'
// const options = {
//   headers: {
//     'Connection': 'Upgrade',
//     'Upgrade': 'tcp'
//   }
// }
// const request = ApiImpl.post(url, options)
//
// request.on('upgrade', (_, socket: NodeJS.ReadWriteStream) => {
//   socket.on('data', data => {
//     console.log(data.toString().slice(0, data.toString().length - 2))
//     if (data.toString().includes('?test')) test()
//   })
//
//   socket.write('execute as No1Hardy at @s run summon wither ~ ~ ~\n')
// })
//
// function test() {
//   console.log('Executed')
// }
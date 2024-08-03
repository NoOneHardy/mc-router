import {ApiImpl} from './api-impl'
import {Container} from './container'


Container.create('test', 'docker.no1hardy.ch/minecraft-server:1.21-fabric').then(container => {
  if (container instanceof Container) {
    console.log('Successful')
  }
})

const url = 'http://localhost/containers/720736bad7ec/attach?stream=true&stdout=true&stdin=true'
const options = {
  headers: {
    'Connection': 'Upgrade',
    'Upgrade': 'tcp'
  }
}
const request = ApiImpl.post(url, options)

request.on('upgrade', (_, socket: NodeJS.ReadWriteStream) => {
  socket.on('data', data => {
    console.log(data.toString().slice(0, data.toString().length - 2))
    if (data.toString().includes('?test')) test()
  })

  socket.write('execute as No1Hardy at @s run summon wither ~ ~ ~\n')
})

function test() {
  console.log('Executed')
}
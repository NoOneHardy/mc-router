import {createServer} from 'net'
import {Connection} from './connection'

const proxy = createServer()
proxy.on('connection', socketToClient => {
  console.log(`New incoming connection from: ${socketToClient.remoteAddress.slice(7)}`)
  new Connection(socketToClient)
})

proxy.listen(25565, () => {
  console.log('opened server on', proxy.address())
})
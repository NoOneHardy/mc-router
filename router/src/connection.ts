import {Socket} from 'net'
import {BufferWrapper} from './protocol/utils/buffer-wrapper'
import {State} from './protocol/packets/state'
import {PacketHandler} from './protocol/packets/packet-handler'
import {Handshake} from './protocol/packets/server-bound/handshake.packet'
import {Packet} from './protocol/packets/packet'
import {config, ProxyRoute} from './config'
import {DisconnectBuilder} from './protocol/packets/client-bound/disconnect.packet'
import {Status} from './protocol/packets/server-bound/status.packet'
import {Login} from './protocol/packets/server-bound/login.packet'

export class Connection {
  private playerSocket: Socket
  private serverSocket: Socket

  private proxyRoute: ProxyRoute

  private packetHandler: PacketHandler = PacketHandler.instance
  private state = State.handshaking

  constructor(playerSocket: Socket) {
    this.playerSocket = playerSocket
    this.serverSocket = new Socket()

    this.setupSocketsErrorHandlers()
    this.setupSocketsCloseHandlers()

    this.playerSocket.on('data', (data) => this.handlePlayerSocketData(data))
  }

  handlePlayerSocketData(psData: Buffer) {
    try {
      const buff = new BufferWrapper(psData)

      const packet = this.packetHandler.readPacket(buff, this.state)

      if (!packet) {
        console.log('No packet')
        this.closeConnection()
        return
      }

      this.handlePacket(psData, packet)

      this.playerSocket.unshift(psData.slice(buff.packetOffset))
    } catch (e) {
      console.log('Unshifting')

      this.playerSocket.unshift(psData)
    }
  }

  handlePacket(psData: Buffer, packet: Packet) {
    switch (this.state) {
      case State.handshaking:
        this.handshake(psData, packet)
        break
      case State.status:
        this.status(psData, packet)
        break
      case State.login:
        this.login(psData, packet)
        break
    }
  }

  handshake(psData: Buffer, packet: Packet) {
    if (!packet || !(packet instanceof Handshake)) {
      console.log('first package wasn\'t handshake')
      this.closeConnection()
      return
    }

    this.state = packet.nextState
    console.log(this.state)

    if (!this.connectServerSocket(packet.serverAddress)) return

    console.log(`Connection to ${packet.serverAddress}`)

    this.serverSocket.write(psData.slice(0, packet.totalLength))
  }

  status(psData: Buffer, packet: Packet) {
    if (!packet || !(packet instanceof Status)) {
      console.log('package wasn\'t status request')
      this.closeConnection()
      return
    }

    this.serverSocket.write(psData.slice(0, packet.totalLength))
    this.serverSocket.write(psData.slice(packet.totalLength))

    this.bindClientServer()
  }

  login(psData: Buffer, packet: Packet) {
    if (!packet || !(packet instanceof Login)) {
      console.log('package wasn\'t login start')
      this.closeConnection()
      return
    }

    console.log('...')
    this.serverSocket.write(psData)

    this.bindClientServer()
  }

  connectServerSocket(domain: string): boolean {
    this.proxyRoute = config.serverList.get(domain)
    if (!this.proxyRoute) {
      this.closeConnection(`${domain} existiert nicht`)
      return false
    }

    console.log(`Connecting ${domain} => ${this.proxyRoute.ip}:${this.proxyRoute.port}`)

    this.serverSocket.connect(this.proxyRoute.port, this.proxyRoute.domain)
    return true
  }

  bindClientServer() {
    console.log('Binding Player <--> Server')

    this.playerSocket.removeAllListeners('data')
    this.playerSocket.pipe(this.serverSocket)
    this.serverSocket.pipe(this.playerSocket)
  }

  setupSocketsCloseHandlers() {
    this.playerSocket.on('close', () => {
      this.closeConnection()
    })

    this.serverSocket.on('close', () => {
      this.closeConnection()
    })
  }

  setupSocketsErrorHandlers() {
    this.playerSocket.on('error', (err) => {
      console.log(`Error on the client socket: ${err}`)
      this.closeConnection()
    })

    this.serverSocket.on('error', (err) => {
      console.log(`Error on the server socket: ${err}`)
      this.closeConnection()
    })
  }


  closeConnection(errorMessage?: string) {
    console.log(`Closing connection with ${this.playerSocket.remoteAddress.slice(7)}`)
    if (errorMessage) {
      const disconnectPacket = DisconnectBuilder.error(errorMessage).toBuffer()
      this.playerSocket.write(disconnectPacket)
    }

    if (this.playerSocket.writable) this.playerSocket.end()
    if (this.serverSocket.writable) this.serverSocket.end()
  }

}
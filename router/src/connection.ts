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
  private readonly playerSocket: Socket
  private readonly serverSocket: Socket

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

      this.playerSocket.unshift(psData.subarray(buff.packetOffset))
    } catch (e) {
      console.log(e)
      this.playerSocket.unshift(psData)
    }
  }

  handlePacket(psData: Buffer, packet: Packet) {
    switch (this.state) {
      case State.handshaking:
        console.log('\x1b[34mHandshake\x1b[0m')
        this.handshake(psData, packet)
        break
      case State.status:
        console.log('\x1b[34mStatus\x1b[0m')
        this.status(psData, packet)
        break
      case State.login:
        console.log('\x1b[34mLogin\x1b[0m')
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

    if (!this.connectServerSocket(packet.serverAddress)) return

    this.serverSocket.write(psData.subarray(0, packet.totalLength))
  }

  status(psData: Buffer, packet: Packet) {
    if (!packet || !(packet instanceof Status)) {
      console.log('\x1b[31mpackage wasn\'t status request\x1b[0m')
      this.closeConnection()
      return
    }

    this.serverSocket.write(psData.subarray(0, packet.totalLength))
    this.serverSocket.write(psData.subarray(packet.totalLength))

    this.bindClientServer()
  }

  login(psData: Buffer, packet: Packet) {
    if (packet && (packet instanceof Login)) {
      console.log(`\x1b[34mUser: ${packet.username}\x1b[0m`)
    }

    this.serverSocket.write(psData.subarray(0, packet.totalLength))
    this.bindClientServer()
  }

  connectServerSocket(domain: string): boolean {
    this.proxyRoute = config.serverList.get(domain)
    if (!this.proxyRoute) {
      this.closeConnection(true, `${domain} existiert nicht`)
      return false
    }

    console.log(`\x1b[32mConnecting ${domain} => ${this.proxyRoute.ip}:${this.proxyRoute.port}\x1b[0m`)

    this.serverSocket.connect(this.proxyRoute.port, this.proxyRoute.domain)
    return true
  }

  bindClientServer() {
    console.log('\x1b[32mBinding Player <--> Server\x1b[0m')

    this.playerSocket.removeAllListeners('data')
    this.playerSocket.pipe(this.serverSocket)
    this.serverSocket.pipe(this.playerSocket)
  }

  setupSocketsCloseHandlers() {
    this.playerSocket.on('close', () => {
      this.closeConnection(false)
    })

    this.serverSocket.on('close', () => {
      console.log('\x1b[33mServer socket closed\x1b[0m')
      this.closeConnection(false)
    })
  }

  setupSocketsErrorHandlers() {
    this.playerSocket.on('error', (err) => {
      console.log('\x1b[31mError on the client socket:\x1b[0m', err)
      this.closeConnection(false)
    })

    this.serverSocket.on('error', (err) => {
      console.log('\x1b[31mError on the server socket:\x1b[0m', err)
      this.closeConnection(false)
    })
  }


  closeConnection(log = true, errorMessage?: string) {
    if (log) console.log(`Closing connection with ${this.playerSocket.remoteAddress}`)
    if (errorMessage) {
      const disconnectPacket = DisconnectBuilder.error(errorMessage).toBuffer()
      this.playerSocket.write(disconnectPacket)
    }

    if (this.playerSocket.writable) this.playerSocket.end()
    if (this.serverSocket.writable) this.serverSocket.end()
  }

}
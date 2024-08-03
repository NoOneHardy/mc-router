import {Socket} from 'net'
import {BufferWrapper} from './protocol/utils/buffer-wrapper'
import {State} from './protocol/packets/state'
import {PacketHandler} from './protocol/packets/packet-handler'
import {Handshake} from './protocol/packets/server-bound/handshake.packet'
import {Packet} from './protocol/packets/packet'
import {config, ProxyRoute} from './config'
import {DisconnectBuilder} from './protocol/packets/client-bound/disconnect.packet'

export class Connection {
  private playerSocket: Socket
  private serverSocket: Socket

  // TODO: enable => private playerUsername: string | undefined
  private proxyRoute: ProxyRoute

  private packetHandler: PacketHandler = PacketHandler.instance
  private state = State.handshaking

  constructor(playerSocket: Socket) {
    this.playerSocket = playerSocket
    this.serverSocket = new Socket()

    this.playerSocket.on('data', (data) => this.handlePlayerSocketData(data))
  }

  handlePlayerSocketData(psData: Buffer) {
    try {
      if (this.state > 3) return

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
      console.log(psData)

      this.playerSocket.unshift(psData)
    }
  }

  handlePacket(psData: Buffer, packet: Packet) {
    switch (this.state) {
      case State.handshaking:
        this.handshake(psData, packet)
        break
      default:
        this.closeConnection()
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

    console.log(`Connection to ${packet.serverAddress}`)

    // this.serverSocket.write(psData.slice(0, packet.totalLength))
  }

  connectServerSocket(domain: string): boolean {
    this.proxyRoute = config.serverList.get(domain)
    if (!this.proxyRoute) {
      this.closeConnection(`${domain} existiert nicht`)
      return false
    }
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
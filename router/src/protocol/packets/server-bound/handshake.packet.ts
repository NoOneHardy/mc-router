import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'
import {BufferWrapper} from '../../utils/buffer-wrapper'

export class Handshake extends Packet {
  id: number = 0

  protocolVersion: number
  serverAddress: string
  port: number
  nextState: number

  constructor(protocolVersion: number, serverAddress: string, port: number, nextState: number) {
    super()
    this.protocolVersion = protocolVersion
    this.serverAddress = serverAddress
    this.port = port
    this.nextState = nextState
  }

  get payloadLength(): number {
    return this.varIntLength(this.protocolVersion)
    + this.stringLength(this.serverAddress)
    + this.unsignedShortLength() // length for port
    + this.varIntLength(this.nextState)
  }
}

export class HandshakeBuilder extends PacketBuilder<Handshake> {
  static instance = new HandshakeBuilder()

  fromBuffer(buff: BufferWrapper): Handshake {
    return new Handshake(
      buff.readVarInt(), // Protocol version
      buff.readString(), // Server address
      buff.readUnsignedInt(), // Port
      buff.readVarInt() // next state
    )
  }
}
import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'

export class Ping extends Packet {
  id: number = 0x01

  constructor() {
    super()
  }

  get payloadLength(): number {
    return 0
  }
}

export class PingBuilder extends PacketBuilder<Ping> {
  static instance = new PingBuilder()

  fromBuffer(): Ping {
    return new Ping()
  }
}
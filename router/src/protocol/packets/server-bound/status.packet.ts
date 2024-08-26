import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'

export class Status extends Packet {
  id: number = 0x00

  get payloadLength(): number {
    return 0
  }
}

export class StatusBuilder extends PacketBuilder<Status> {
  static instance = new StatusBuilder()

  fromBuffer(): Status {
    return new Status()
  }
}
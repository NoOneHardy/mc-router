import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'
import {BufferWrapper} from '../../utils/buffer-wrapper'

export class Ping extends Packet {
  id: number = 0x01

  private _payload: bigint

  get payload(): bigint {
    return this._payload
  }

  set payload(payload: bigint) {
    this._payload = payload
  }

  constructor(payload: bigint) {
    super()
    this.payload = payload
  }

  get payloadLength(): number {
    return this.longLength()
  }
}

export class PingBuilder extends PacketBuilder<Ping> {
  static instance = new PingBuilder()

  fromBuffer(buff: BufferWrapper): Ping {
    return new Ping(buff.readLong())
  }
}
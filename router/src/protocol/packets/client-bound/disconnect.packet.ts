import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'
import {BufferWrapper} from '../../utils/buffer-wrapper'

export class Disconnect extends Packet {
  id: number = 0x00

  protected get payloadLength(): number {
    return this.stringLength(this.reason);
  }

  private _reason: string

  public get reason(): string {
    return this._reason
  }

  public set reason(reason: string) {
    this._reason = reason
  }

  constructor(reason: string) {
    super()
    this.reason = reason
  }

  toBuffer(): Buffer {
    const buff = this.initBuffer()
    buff.writeString(this.reason)
    return buff.buffer
  }
}

export class DisconnectBuilder extends PacketBuilder<Disconnect> {
  fromBuffer(buff: BufferWrapper): Disconnect {
    return new Disconnect(buff.readString())
  }

  static error(message: string): Disconnect {
    const reason = `{"text": "${message}"}`
    return new Disconnect(reason)
  }
}
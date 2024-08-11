import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'
import {BufferWrapper} from '../../utils/buffer-wrapper'

export class StatusResponse extends Packet {
  id: number = 0x00

  protected get payloadLength(): number {
    return this.stringLength(JSON.stringify(this.status));
  }

  private _status: StatusInformation

  public get status(): StatusInformation {
    return this._status
  }

  public set status(status: StatusInformation) {
    this._status = status
  }

  constructor(status: StatusInformation) {
    super()
    this.status = status
  }

  toBuffer(): Buffer {
    const buff = this.initBuffer()
    buff.writeString(JSON.stringify(this.status))
    return buff.buffer
  }
}

export class StatusResponseBuilder extends PacketBuilder<StatusResponse> {
  static instance = new StatusResponseBuilder()

  fromBuffer(buff: BufferWrapper): StatusResponse {
    try {
      return new StatusResponse(JSON.parse(buff.readString()))
    } catch (e) {
      console.log(e)
    }
  }

  static sendInfo(info: StatusInformation): StatusResponse {
    return new StatusResponse(info)
  }
}

interface StatusInformation {
  version: {
    name: string
    protocol: number
  }
  players: {
    max: number
  }
}
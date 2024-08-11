import {Packet} from '../packet'
import {PacketBuilder} from '../packet-builder'
import {BufferWrapper} from '../../utils/buffer-wrapper'

export class Login extends Packet {
  id: number = 0

  private _username: string

  set username(username: string) {
    this._username = username
  }

  get username(): string {
    return this._username
  }

  constructor(username: string) {
    super()
    this.username = username
  }

  get payloadLength(): number {
    return this.stringLength(this.username)
  }
}

export class LoginBuilder extends PacketBuilder<Login> {
  static instance = new LoginBuilder()

  fromBuffer(buff: BufferWrapper): Login {
    return new Login(buff.readString())
  }
}
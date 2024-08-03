import {encodingLength} from 'varint'
import {BufferWrapper} from '../utils/buffer-wrapper'

export abstract class Packet {
  abstract id: number

  protected abstract get payloadLength(): number

  protected get length() {
    return encodingLength(this.id) + this.payloadLength
  }

  get totalLength(): number {
    return this.length + encodingLength(this.length)
  }

  protected varIntLength(varInt: number): number {
    return encodingLength(varInt)
  }

  protected stringLength(string: string): number {
    return this.varIntLength(Buffer.byteLength(string)) + Buffer.byteLength(string)
  }

  protected unsignedShortLength(): number {
    return 2
  }

  // protected longLength(): number {
  //   return 4
  // }

  protected initBuffer() {
    const buffer = new BufferWrapper(Buffer.alloc(this.totalLength))
    this.writeHeaders(buffer)
    return buffer
  }

  protected writeHeaders(buff: BufferWrapper) {
    buff.writeVarInt(this.length)
    buff.writeVarInt(this.id)
  }
}
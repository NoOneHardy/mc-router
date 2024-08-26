import {decode, encode, encodingLength} from 'varint'

export class BufferWrapper {
  private readonly _buffer: Buffer
  private _readOffset = 0
  packetOffset = 0

  public length = 0

  private _writeOffset = 0

  get buffer(): Buffer {
    return this._buffer
  }

  constructor(buffer: Buffer) {
    this._buffer = buffer
    this.length = buffer.length
  }

  readVarInt(): number {
    try {
      const varInt = decode(this._buffer, this._readOffset)
      this._readOffset += encodingLength(varInt)
      return varInt
    } catch (e) {
      if (e instanceof RangeError) throw new Error()
      throw e
    }
  }

  readString(): string {
    const stringSize = this.readVarInt()
    const string = this._buffer.toString('utf-8', this._readOffset, this._readOffset + stringSize)
    this._readOffset += stringSize
    return string
  }

  readUnsignedShort(): number {
    const short = this._buffer.readUInt16BE(this._readOffset)
    this._readOffset += 2
    return short
  }

  readLong(): bigint {
    const long = this._buffer.readBigInt64BE(this._readOffset)
    this._readOffset += 4
    return long
  }

  writeVarInt(varInt: number) {
    encode(varInt, this._buffer, this._writeOffset)
    this._writeOffset += encodingLength(varInt)
  }

  writeString(string: string) {
    // Write string length
    this.writeVarInt(string.length)

    this._buffer.write(string, this._writeOffset, 'utf-8')
    this._writeOffset += Buffer.byteLength(string)
  }
}
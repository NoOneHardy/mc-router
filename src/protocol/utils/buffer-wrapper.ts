import { decode, encodingLength } from 'varint'

export class BufferWrapper {
    private _buffer: Buffer
    private _readOffset = 0
    packetOffset = 0

    public length = 0

    // TODO: enable => private _writeOffset = 0

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
      const stringSize = decode(this._buffer, this._readOffset)
      this._readOffset += encodingLength(stringSize)
      return this._buffer.toString('utf-8', this._readOffset, this._readOffset + stringSize)
    }

    readUnsignedInt(): number {
      const short = this._buffer.readUInt16BE(this._readOffset)
      this._readOffset += 2
      return short
    }
}
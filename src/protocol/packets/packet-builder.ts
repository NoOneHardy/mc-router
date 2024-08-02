import {BufferWrapper} from '../utils/buffer-wrapper'

export abstract class PacketBuilder<Packet> {
  abstract fromBuffer(buff: BufferWrapper): Packet
}
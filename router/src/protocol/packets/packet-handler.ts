import {BufferWrapper} from '../utils/buffer-wrapper'
import {State} from './state'
import {Packet} from './packet'
import {PacketBuilder} from './packet-builder'
import {HandshakeBuilder} from './server-bound/handshake.packet'

export class PacketHandler {
  static instance = new PacketHandler()

  static handShakingPackets: Map<number, PacketBuilder<Packet>> = new Map()
    .set(0x00, HandshakeBuilder.instance)

  static packets: Map<State, Map<number, PacketBuilder<Packet>>> = new Map()
    .set(State.handshaking, PacketHandler.handShakingPackets)

  readPacket(buff: BufferWrapper, state: State): Packet | false {
    buff.readVarInt()
    const packetId = buff.readVarInt()

    const packetClass = PacketHandler.packets.get(state)?.get(packetId)

    if (!packetClass) {
      console.log(`No packet builder for ID: ${packetId} in state: ${state}`)
      return false
    }

    const packet = packetClass.fromBuffer(buff)
    buff.packetOffset += packet.totalLength
    return packet
  }
}
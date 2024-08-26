import {BufferWrapper} from '../utils/buffer-wrapper'
import {State} from './state'
import {Packet} from './packet'
import {PacketBuilder} from './packet-builder'
import {HandshakeBuilder} from './server-bound/handshake.packet'
import {StatusBuilder} from './server-bound/status.packet'
import {LoginBuilder} from './server-bound/login.packet'
import {PingBuilder} from './server-bound/ping.packet'

export class PacketHandler {
  static instance = new PacketHandler()

  static handShakingPackets: Map<number, PacketBuilder<Packet>> = new Map()
    .set(0x00, HandshakeBuilder.instance)

  static statusPackets: Map<number, PacketBuilder<Packet>> = new Map()
    .set(0x00, StatusBuilder.instance)
    .set(0x01, PingBuilder.instance)

  static loginPackets: Map<number, PacketBuilder<Packet>> = new Map()
    .set(0x00, LoginBuilder.instance)

  static packets: Map<State, Map<number, PacketBuilder<Packet>>> = new Map()
    .set(State.handshaking, PacketHandler.handShakingPackets)
    .set(State.status, PacketHandler.statusPackets)
    .set(State.login, PacketHandler.loginPackets)

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
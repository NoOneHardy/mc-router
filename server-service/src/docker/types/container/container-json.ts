import {MountPoint} from './mount-point'

export interface ContainerJson {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  Command: string
  Created: number
  Ports: {
    IP: string
    PrivatePort: number
    PublicPort: number
    Type: 'tcp' | 'udp' | 'sctp'
  }[]
  SizeRw: number
  SizeRootFs: number
  Labels: { [key: string]: string }
  State: string
  Status: string
  HostConfig: {
    NetworkMode: string
    Annotations: { [key: string]: string }
  },
  NetworkSettings: {
    Networks: { [key: string]: string }
  },
  Mounts: MountPoint[]
}
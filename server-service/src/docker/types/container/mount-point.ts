export interface MountPoint {
  Type: 'bind' | 'volume' | 'tmpfs' | 'npipe' | 'cluster'
  Name: string
  Source: string
  Destination: string
  Driver: string
  Mode: string
  RW: boolean
  Propagation: string
}
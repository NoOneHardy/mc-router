export interface Mount {
  Target: string
  Source: string
  Type: 'bind' | 'volume' | 'tmpfs' | 'npipe' | 'cluster'
  ReadOnly: boolean
  Consistency: 'default' | 'consistent' | 'cached' | 'delegated'
  BindOptions?: {
    Propagation: 'private' | 'rprivate' | 'shared' | 'rshared' | 'slave' | 'rslave'
    NonRecursive: boolean
    CreateMountpoint: boolean
    ReadOnlyNonRecursive: boolean
    ReadOnlyForceRecursive: boolean
  },
  VolumeOptions?: {
    NoCopy: boolean
    Labels: {
      [key: string]: string
    }
    DriverConfig: {
      Name: string,
      Options: {
        [key: string]: string
      }
    }
    Subpath: string
  },
  TmpfsOptions?: {
    SizeBytes: number
    Mode: number
    Options: string[][]
  }
}
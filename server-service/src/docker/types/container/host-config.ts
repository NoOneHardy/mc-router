import {Mount} from './mount'

export interface HostConfig {
  CpuShares?: number
  Memory?: number
  CgroupParent?: string
  BlkioWeight?: number
  BlkioWeightDevice?: {
    Path: string
    Weight: number
  }[]
  BlkioDeviceReadBps?: ThrottleDevice[]
  BlkioDeviceWriteBps?: ThrottleDevice[]
  BlkioDeviceReadIOps?: ThrottleDevice[]
  BlkioDeviceWriteIOps?: ThrottleDevice[]
  CpuPeriod?: number
  CpuQuota?: number
  CpuRealtimePeriod?: number
  CpuRealtimeRuntime?: number
  CpusetCpus?: string
  CpusetMems?: string
  Devices?: DeviceMapping[]
  DeviceCgroupRules?: string[]
  DeviceRequests?: DeviceRequest[]
  KernelMemoryTCP?: number
  MemoryReservation?: number
  MemorySwap?: number
  MemorySwappiness?: number
  NanoCpus?: number
  OomKillDisable?: boolean
  Init?: boolean
  PidsLimit?: number
  Ulimits?: {
    Name: string
    Soft: number
    Hard: number
  }[]
  CpuCount?: number
  CpuPercent?: number
  IOMaximumIOps?: number
  IOMaximumBandwidth?: number
  Binds?: string[]
  ContainerIDFile?: string
  LogConfig?: {
    Type: 'json-file' | 'syslog' | 'journald' | 'gelf' | 'fluentd' | 'awslogs' | 'splunk' | 'etwlogs' | 'none'
    config: { [key: string]: string }
  }
  NetworkMode?: string
  PortBindings: PortMap
  RestartPolicy?: RestartPolicy
  AutoRemove?: boolean
  VolumeDriver?: string
  VolumesFrom?: string[]
  Mounts?: Mount[]
  ConsoleSize?: [number, number]
  Annotations?: { [key: string]: string }
  CapAdd?: string[]
  CapDrop?: string[]
  CgroupnsMode?: 'private' | 'host'
  Dns?: string[]
  DnsOptions?: string[]
  DnsSearch?: string[]
  ExtraHosts?: string[]
  GroupAdd?: string[]
  IpcMode?: 'none' | 'private' | 'shareable' | `container:${string}` | 'host'
  Cgroup?: string
  Links?: string[]
  OomScoreAdj?: number
  PidMode?: `container:${string}` | 'host'
  Privileged?: boolean
  PublishAllPorts?: boolean
  ReadonlyRootfs?: boolean
  SecurityOpt?: string[]
  StorageOpt?: {
    [key: string]: string
  }
  Tmpfs?: {
    [key: string]: string
  }
  UTSMode?: string
  UsernsMode?: string
  ShmSize?: number
  Sysctls?: {
    [key: string]: string
  }
  Runtime?: string
  Isolation?: 'default' | 'process' | 'hyperv'
  MaskedPaths?: string[]
  ReadonlyPaths?: string[]
}

interface ThrottleDevice {
  Path: string
  Rate: number
}

interface DeviceMapping {
  PathOnHost: string
  PathInContainer: string
  CgroupPermissions: string
}

interface DeviceRequest {
  Drive: string
  Count: number
  DeviceIDs: string[]
  Capabilities: string[]
  Options: {
    [key: string]: string
  }
}

interface PortMap {
  [key: `${number}/${'tcp'}`]: { HostPort: `${number}` }[]
}

interface RestartPolicy {
  Name: '' | 'no' | 'always' | 'unless-stopped' | 'on-failure'
  MaximumRetryCount: number
}
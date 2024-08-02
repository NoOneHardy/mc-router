import {readFileSync} from 'fs'

export interface ProxyRoute {
  domain: string
  ip: string
  port: number
}

class Config {
  serverList = new Map<string, ProxyRoute>()

  constructor() {
  }

  loadFromFile(): void {
    const rawConfig = readFileSync('config.json', 'utf-8')
    this.addRoutes(JSON.parse(rawConfig))
  }

  addRoutes(routes: ProxyRoute[]): void {
    routes.forEach(route => {
      this.serverList.set(route.domain, {
        ...route,
        port: route.port || 25565
      })
    })
  }
}

export const config = new Config()
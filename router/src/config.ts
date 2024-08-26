import {readFileSync} from 'fs'

export interface ProxyRoute {
  domain: string
  ip: string
  port: number
}

class Config {
  serverList = new Map<string, ProxyRoute>()

  constructor() {
    this.loadFromFile()
  }

  loadFromFile(): void {
    const rawConfig = readFileSync('../config.json', 'utf-8')
    this.addRoutes(JSON.parse(rawConfig))
  }

  addRoutes(routes: ProxyRoute[]): void {
    const locals = ['localhost', '::1', '127.0.0.1']
    routes.forEach(route => {
      // Filter locals without port otherwise they will use router port, and it will create an infinite loop
      if (locals.includes(route.domain) && !route.port) return

      this.serverList.set(route.domain, {
        ...route,
        port: route.port || 25565
      })
    })
  }
}

export const config = new Config()
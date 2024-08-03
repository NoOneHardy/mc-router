import * as http from 'http'

export abstract class ApiImpl {
   private static socket = process.platform === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock'
  private static baseUrl = 'http://localhost'

   public static post(url: string, options?: {headers: {[key: string]: string}}, body?: object | string): http.ClientRequest {
     const req = http.request(this.baseUrl + url, {
       method: 'POST',
       socketPath: this.socket,
       ...options
     })

     if (body) {
       // req.write()
       req.end(JSON.stringify(body))
     } else {
       req.end('')
     }
     return req
   }
 }
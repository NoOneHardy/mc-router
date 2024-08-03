import * as http from 'http'

// axios.get('/container/json', {
//   socketPath: '//./pipe/docker_engine'
// }).then((response: object) => {
//   console.log(response)
// })

const request = http.request({
  headers: {
    'Connection': 'Upgrade',
    'Upgrade': 'tcp'
  },
  socketPath: '//./pipe/docker_engine',
  method: 'POST',
  path: 'http://localhost/containers/720736bad7ec/attach?stream=true&stdout=true&stdin=true',
})

request.end()

request.on('upgrade', (response, socket: NodeJS.ReadWriteStream) => {
  socket.on('data', data => {
    console.log(data.toString().slice(0, data.toString().length - 2))
    if (data.toString().includes('?test')) test()
  })

  socket.write('execute as No1Hardy at @s run summon wither ~ ~ ~\n')
})

function test() {
  console.log('Executed')
}
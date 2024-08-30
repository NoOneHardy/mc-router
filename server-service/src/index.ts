import * as express from 'express'
import {Container, ContainerConfig} from './docker/container'

const app = express()

app.use(express.json())

app.post('/new', (req, res) => {
  const name: string | null = req.body.name ?? null
  const image: string | null = req.body.image ?? null

  if (!name) {
    res.statusCode = 400
    res.send({
      missingParameter: 'name'
    })
    return
  }

  if (!image) {
    res.statusCode = 400
    res.send({
      missingParameter: 'image'
    })
    return
  }

  const containerOptions: ContainerConfig = {
    Tty: true,
    OpenStdin: true
  }

  Container.create(name, image, containerOptions).then(container => {
    container.start().then(() => {
      res.send(container)
    }).catch(e => {
      res.statusCode = 500
      res.send(e)
    })
  }).catch(e => {
    res.statusCode = 500
    res.send(e)
  })
})

app.listen(3000, () => {
  console.log('Listening on port 3000')
})

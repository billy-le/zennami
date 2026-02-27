import { Hono } from 'hono'
import { renderer } from './renderer'
import stations from './routes/stations'

const app = new Hono()

app.use(renderer)

app.route('/api/stations', stations)

app.get('/', async (c) => {
  return c.render(<h1>Hello!</h1>)
})

export default app

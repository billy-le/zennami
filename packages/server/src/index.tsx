import { Hono } from 'hono'
import { renderer } from './renderer'
import stations from './routes/stations'

const app = new Hono()

app.use(renderer)

app.route('/api/stations', stations)

export default app

import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import { settings } from './settings'
import logger from './utils/logger/logger'
import authRouter from './routes/auth'
import keyManager from './routes/key-manager'

const app = express()
app.set('trust proxy', true)
app.use(
  cors({
    origin: settings.allowedOrigins.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);
app.options('*', cors());



app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRouter)
app.use('/api/key-manager', keyManager)

app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});


app.listen(settings.port, () => {
  logger.info(`Server is running on ${settings.url}:${settings.port}`)
})

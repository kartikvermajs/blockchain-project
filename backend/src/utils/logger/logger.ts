/* eslint-disable @typescript-eslint/restrict-template-expressions */
import winston from 'winston'
import { settings } from '../../settings'

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info: winston.Logform.TransformableInfo) => {
        return `[${info.timestamp}] ${info.level}: ${info.message}`
      })
    ),
  }),
]

// Add combined log transport if enabled
if (settings.fileLogging) {
  transports.push(new winston.transports.File({ filename: 'logs/combined.log' }))
}

// Add error log transport if enabled
if (settings.fileErrorLogging) {
  transports.push(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }))
}

const logger = winston.createLogger({
  levels: winston.config.npm.levels, // Standard levels: error, warn, info, etc.
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info: winston.Logform.TransformableInfo) => {
      return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
    })
  ),
  transports,
})

export default logger

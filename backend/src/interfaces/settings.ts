export interface ISettings {
  nodeEnv: string
  allowedOrigins: string
  fileLogging: boolean
  fileErrorLogging: boolean
  port: number
  url: string

  smtpUser: string
  smtpPass: string

  keyManagerContract: string
  rpcURL: string
  ownerPvtKey: string
}

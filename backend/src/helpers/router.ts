import { ResponseMessage, ResponseStatus } from '../data/enumerators'
import { type Request, type Response, type NextFunction } from 'express'
import { ZodError, type ZodObject } from 'zod'

export function responseData<T>(res: Response, data: T, status?: number): Response {
  if (!status) status = ResponseStatus.Success
  return res.status(status).json({ data })
}

export function responseError(res: Response, message: string, status?: number): Response {
  if (!status) status = ResponseStatus.BadRequest
  return res.status(status).json({ error: message })
}

export function responseValidationError(res: Response, errors: ZodError): Response {
  const status = ResponseStatus.ValidationError
  const parsedErrors = errors.issues.map((issue) => {
    return {
      ...issue,
      path: issue.path.join('.'),
    }
  })
  return res.status(status).json({ errors: parsedErrors })
}

export function validateQuery(schema: ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        responseValidationError(res, error)
      } else {
        responseError(res, ResponseMessage.InternalServerError, ResponseStatus.InternalServerError)
      }
    }
  }
}

export function validateBody(schema: ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        responseValidationError(res, error)
      } else {
        responseError(res, ResponseMessage.InternalServerError, ResponseStatus.InternalServerError)
      }
    }
  }
}

export function validateParams(schema: ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      responseError(res, ResponseMessage.InternalServerError, ResponseStatus.InternalServerError)
    }
  }
}

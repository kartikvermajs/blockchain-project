import express from 'express'
import { KeyManager, KeyStatus } from '../services/key-manager' // your class here
import { responseData, responseError } from '../helpers/router'
import { SActivateKey, SCreateKey, SGetKeyInfo } from '../serializers/key-manager'
import { ethers } from 'ethers'
import { ResponseMessage, ResponseStatus } from '../data/enumerators'

const router = express.Router()
const keyManager = new KeyManager()

router.post('/create-key', async (req, res) => {
  try {
    const parsed = SCreateKey.safeParse(req.body)
    if (!parsed.success) {
      responseError(res, 'Invalid key')
      return
    }
    const { key } = parsed.data

    const tx = await keyManager.createKey(key)
    await tx.wait()

    responseData(res, 'Key created successfully')
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
      if (error.message.includes('KEY_ALREADY_EXISTS')) {
        responseError(res, 'Key Already used', ResponseStatus.BadRequest) // Bad Request
      } else {
        responseError(res, 'Internal Server Error', 500)
      }
    } else responseError(res, ResponseMessage.InternalServerError, ResponseStatus.InternalServerError)
  }
})

router.post('/activate-key', async (req, res) => {
  try {
    console.log('🔥 HIT /activate-key');
    const parsed = SActivateKey.safeParse(req.body)
    if (!parsed.success) {
      responseError(res, 'Invalid key')
      return
    }
    const { key } = parsed.data

    const tx = await keyManager.activateKey(key)

    console.log('Waiting for transaction...')
    await tx.wait()
    console.log('Transaction confirmed')

    // Fetch updated info
    const info = await keyManager.getKeyInfo(key)
    console.log('Retrived key info:', info)

    responseData(res, {
      message: 'Key activated successfully',
      activation_date: info.activationDate,
      expiration_date: info.expiryDate,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('KEY_DOES_NOT_EXIST')) {
        responseError(res, 'No such key exists', 400) // Bad Request
      } else if (error.message.includes('KEY_ACTIVE_OR_DOESNT_EXIST')) {
        responseError(res, "Key already activated or doesn't exist", 400) // Bad Request
      } else {
        responseError(res, 'Internal Server Error', 500)
      }
    } else responseError(res, ResponseMessage.InternalServerError, ResponseStatus.InternalServerError)
  }
})

router.get('/key-info', async (req, res) => {
  try {
    const parsed = SGetKeyInfo.safeParse(req.query)
    if (!parsed.success) {
      responseError(res, 'Invalid key')
      return
    }
    const { key } = parsed.data

    const info = await keyManager.getKeyInfo(key)

    // Optional: map status number to string
    const statusText = info.status === KeyStatus.Active ? 'Active' : 'Inactive'

    responseData(res, { ...info, statusText })
  } catch (error) {
    if (error instanceof Error) {
      // Example: error.message might include "Key does not exist" or "Key is already active or doesn't exist"
      if (error.message.includes('KEY_DOES_NOT_EXIST')) {
        responseError(res, 'Key Does Not exist', 400) // Bad Request
      } else {
        responseError(res, 'Internal Server Error', 500)
      }
    } else responseError(res, ResponseMessage.InternalServerError, ResponseStatus.InternalServerError)
  }
})

export default router

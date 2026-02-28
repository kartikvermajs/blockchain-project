import { ethers, Contract } from 'ethers'
import { settings } from '../settings'

// ABI trimmed to the relevant functions and events
const abi = [
  'function createKey(string key) public',
  'function activateKey(string key) public',
  'function setExpiryDate(string key, uint256 expiryTimestamp) public',
  'function getKeyInfo(string key) public view returns (uint8 status, uint256 activationDate, uint256 expiryDate)',
  'event KeyCreated(bytes32 keyHash)',
  'event KeyActivated(bytes32 keyHash, uint256 activationDate)',
  'event KeyExpirySet(bytes32 keyHash, uint256 expiryDate)',
]

export enum KeyStatus {
  Inactive = 0,
  Active = 1,
}

export interface KeyInfo {
  status: KeyStatus
  activationDate: number
  expiryDate: number
}

export class KeyManager {
  private contract: Contract

  constructor() {
    const contractAddress = settings.keyManagerContract
    const PROVIDER = new ethers.providers.JsonRpcProvider(settings.rpcURL)
    const signerOrProvider = new ethers.Wallet(settings.ownerPvtKey, PROVIDER)
    this.contract = new ethers.Contract(contractAddress, abi, signerOrProvider)
  }

  async createKey(key: string): Promise<ethers.ContractTransaction> {
    return this.contract.createKey(key)
  }

  async activateKey(key: string): Promise<ethers.ContractTransaction> {
    return this.contract.activateKey(key)
  }

  async getKeyInfo(key: string): Promise<KeyInfo> {
    const [status, activationDate, expiryDate] = await this.contract.getKeyInfo(key)
    return {
      status,
      activationDate: activationDate.toNumber(),
      expiryDate: expiryDate.toNumber(),
    }
  }
}

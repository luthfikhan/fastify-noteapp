import crypto from "crypto"
import config from "../config/index.js"

const ALGORITHM = config.encryption.chipperAlgorithm
const CIPHER_PASS = config.encryption.chipperPass
const BLOCK_SIZE = config.encryption.chipperBlockSize

export const decrypt = (text) => {
  try {
    const contents = Buffer.from(text, "hex")
    const iv = contents.slice(0, BLOCK_SIZE)
    const textBytes = contents.slice(BLOCK_SIZE)

    const decipher = crypto.createDecipheriv(ALGORITHM, CIPHER_PASS, iv)
    return decipher.update(textBytes, "hex", "utf8") + decipher.final("utf8")
  } catch (error) {
    return null
  }
}

export const encrypt = (plain) => {
  const iv = crypto.randomBytes(BLOCK_SIZE)
  const cipher = crypto.createCipheriv(ALGORITHM, CIPHER_PASS, iv)
  let chipper
  try {
    chipper = cipher.update(plain, "utf8", "hex")
    chipper += cipher.final("hex")
    chipper = iv.toString("hex") + chipper
  } catch (e) {
    chipper = null
  }
  return chipper
}

import jwt from "jsonwebtoken"
import config from "../config/index.js"

const { jwtSecret, jwtSecretExtend } = config.encryption

export const generateToken = (payload) => {
  const accessTokenP = { ...payload, tokenName: "access_token" }
  const refreshTokenP = { ...payload, tokenName: "refresh_token" }

  return {
    accessToken: jwt.sign(accessTokenP, jwtSecret, { expiresIn: "1d" }),
    refreshToken: jwt.sign(refreshTokenP, jwtSecret, { expiresIn: "7d" }),
  }
}

export const verifyToken = (token, reply) => {
  try {
    const decryptedToken = jwt.verify(token, jwtSecret)

    if (!decryptedToken.id) {
      reply.code(401).send()
      return
    }
    return decryptedToken
  } catch (error) {
    reply.code(401).send()
  }
}

export const verifyTokenHeader = (req, reply, done) => {
  const token = req.headers.authorization

  if (!token) {
    reply.code(401).send()
    return
  }

  const decryptedToken = verifyToken(token, reply)

  if (!decryptedToken) {
    return
  }
  if (decryptedToken.tokenName !== "access_token") {
    return reply.code(401).send()
  }

  req.user = decryptedToken.id
  done()
}

export const isValidExtendToken = (token, id) => {
  try {
    const decryptedToken = jwt.verify(token, jwtSecretExtend)

    return decryptedToken.id === id
  } catch (error) {
    return false
  }
}

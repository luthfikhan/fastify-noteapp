import { sendOtpMail } from "../service/mail-service.js"
import { decrypt, encrypt } from "../utils/encryption-helper.js"
import { generateToken, verifyToken } from "../utils/token-helper.js"

const genereOtp = () => {
  const sixDigitOtp = Math.floor(100000 + Math.random() * 900000).toString()
  return {
    created: Date.now(),
    otp: sixDigitOtp,
  }
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param  {import("fastify").FastifyReply} reply
 * @param {{
 *    redisService: import("../service/redis-service").RedisService,
 *    mongoService: import("../service/mongo-service").MongoService,
 * }} fastify
 */
export const signupController = async (
  req,
  reply,
  { redisService, mongoService, mailer }
) => {
  const { email } = req.body
  const authId = encrypt(JSON.stringify(req.body))
  const otpValue = genereOtp()
  const user = await mongoService.getUserByIdDb(email)
  const otpValueStored = JSON.parse(await redisService.getOtp(email))

  if (user) {
    return reply.code(400).send("USER_ALREADY_EXISTS")
  }

  if (otpValueStored?.created > Date.now() - 1000 * 60) {
    return reply.code(400).send("RESTRICTED_REQUEST")
  }

  try {
    await redisService.setOtp(email, JSON.stringify(otpValue))
    await sendOtpMail(email, otpValue.otp, mailer)

    reply.send({ authId })
  } catch (error) {
    reply.code(500).send()
  }
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param {{redisService: import("../service/redis-service").RedisService, mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const signupValidationController = async (
  req,
  reply,
  { redisService, mongoService }
) => {
  const { email, password } = JSON.parse(decrypt(req.body.authId))
  const otpValueStored = JSON.parse(await redisService.getOtp(email))
  const otpValidTime = 1000 * 60 * 5
  const user = await mongoService.getUserByIdDb(email)

  if (!otpValueStored || otpValueStored?.created < Date.now() - otpValidTime) {
    return reply.code(400).send("OTP_EXPIRED")
  }

  if (req.body.otp !== otpValueStored?.otp) {
    return reply.code(400).send("OTP_INVALID")
  }

  try {
    if (!user) {
      await mongoService.insertUserByIdDb({
        id: email,
        password: encrypt(password),
      })
    }

    reply.send(generateToken({ id: email }))
  } catch (error) {
    console.log(error)
    reply.code(500).send()
  }
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param  {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const loginController = async (req, reply, { mongoService }) => {
  const { email, password } = req.body
  const user = await mongoService.getUserByIdDb(email)

  if (!user) {
    return reply.code(400).send("INVALID_EMAIL_OR_PASSWORD")
  }

  if (decrypt(user.password) !== password) {
    return reply.code(400).send("INVALID_EMAIL_OR_PASSWORD")
  }

  reply.send(generateToken({ id: email }))
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 */
export const refreshTokenController = async (req, reply) => {
  const token = verifyToken(req.query.token, reply)

  if (!token) return

  if (token.tokenName === "refresh_token") {
    return reply.send(generateToken({ id: token.id }))
  }

  reply.code(401).send()
}

const forgotPassAuthIdStep = {
  submit_email: "submit_email",
  submit_otp: "submit_otp",
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param  {import("fastify").FastifyReply} reply
 * @param {{
 *    redisService: import("../service/redis-service").RedisService,
 *    mongoService: import("../service/mongo-service").MongoService,
 * }} fastify
 */
export const forgotPassController = async (
  req,
  reply,
  { redisService, mongoService, mailer }
) => {
  const { email } = req.body
  const authId = encrypt(
    JSON.stringify({ email, type: forgotPassAuthIdStep.submit_email })
  )
  const otpValue = genereOtp()
  const user = await mongoService.getUserByIdDb(email)
  const otpValueStored = JSON.parse(await redisService.getOtp(email))

  if (!user) {
    return reply.code(400).send("USER_NOT_FOUND")
  }

  if (otpValueStored?.created > Date.now() - 1000 * 60) {
    return reply.code(400).send("RESTRICTED_REQUEST")
  }

  try {
    await redisService.setOtp(email, JSON.stringify(otpValue))
    await sendOtpMail(email, otpValue.otp, mailer)

    reply.send({ authId })
  } catch (error) {
    console.log(error)
    reply.code(500).send()
  }
}
/**
 * OTP validation controller for forgot password
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param {{redisService: import("../service/redis-service").RedisService, mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const forgotPassValidationController = async (
  req,
  reply,
  { redisService }
) => {
  const { authId, otp } = req.body
  const { email, type } = JSON.parse(decrypt(authId))
  const otpValueStored = JSON.parse(await redisService.getOtp(email))
  const otpValidTime = 1000 * 60 * 5

  if (type !== forgotPassAuthIdStep.submit_email) {
    return reply.code(400).send("INVALID_AUTH_ID")
  }

  if (!otpValueStored || otpValueStored?.created < Date.now() - otpValidTime) {
    return reply.code(400).send("OTP_EXPIRED")
  }

  if (otp !== otpValueStored?.otp) {
    return reply.code(400).send("OTP_INVALID")
  }

  try {
    reply.send({
      authId: encrypt(
        JSON.stringify({ email, type: forgotPassAuthIdStep.submit_otp })
      ),
    })
  } catch (error) {
    console.log(error)
    reply.code(500).send()
  }
}

/**
 * Submit new password controller for forgot password
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const forgotPassSubmitController = async (
  req,
  reply,
  { mongoService }
) => {
  const { authId, password } = req.body
  const { email, type } = JSON.parse(decrypt(authId))

  if (type !== forgotPassAuthIdStep.submit_otp) {
    return reply.code(400).send("INVALID_AUTH_ID")
  }

  try {
    await mongoService.updateUserPasswordByIdDb(email, encrypt(password))

    reply.send(generateToken({ id: email }))
  } catch (error) {
    console.log(error)
    reply.code(500).send()
  }
}

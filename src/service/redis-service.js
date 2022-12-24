const otpPrefix = "otp-"
const otpExpiredSeconds = 60 * 60

export class RedisService {
  /**
   * @param  {import("@fastify/redis").FastifyRedis} client
   */
  constructor(client) {
    this.client = client
  }

  getOtp = async (id) => {
    return await this.client.get(`${otpPrefix}${id}`)
  }

  setOtp = async (id, value) => {
    await this.client.setex(`${otpPrefix}${id}`, otpExpiredSeconds, value)
  }
}

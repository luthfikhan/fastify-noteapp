import fastifyMailer from "fastify-mailer"
import fastifyAutoload from "@fastify/autoload"
import fastifyRedis from "@fastify/redis"
import fastifyMongo from "@fastify/mongodb"
import path from "path"
import { RedisService } from "./src/service/redis-service.js"
import { MongoService } from "./src/service/mongo-service.js"

/**
 * @param  {import("fastify").FastifyInstance} app
 */
export default (app) => {
  app.register(fastifyMailer, {
    defaults: { from: `Jaga Otp <${process.env.MAILER_EMAIL}>` },
    transport: {
      host: process.env.MAILER_HOST,
      port: process.env.MAILER_PORT,
      auth: {
        user: process.env.MAILER_USERNAME,
        pass: process.env.MAILER_PASSWORD,
      },
    },
  })
  app.register(fastifyAutoload, {
    dir: path.join(__dirname, "src/routes"),
    options: { prefix: "/api" },
  })
  app
    .register(fastifyMongo, {
      url: process.env.MONGO_URL,
      database: "jagadb",
    })
    .after((err) => {
      if (err) {
        console.log(err)
        throw err
      }
      const mongo = new MongoService(app.mongo)
      app.decorate("mongoService", mongo)
    })
  app
    .register(fastifyRedis, {
      url: process.env.REDIS_URL,
    })
    .after((err) => {
      if (err) {
        console.log(err)
        throw err
      }
      const redis = new RedisService(app.redis)
      app.decorate("redisService", redis)
    })
}

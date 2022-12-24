import "dotenv/config"

import fastify from "fastify"
import { dirname } from "path"
import { fileURLToPath } from "url"
import responseScheme from "./src/utils/response-scheme.js"
import plugins from "./plugins.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const port = process.env.PORT || 8080

global.__dirname = __dirname
global.__filename = __filename

const app = fastify({
  logger: {
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          path: request.routerPath,
          parameters: request.params,
          headers: request.headers,
        }
      },
    },
  },
  ajv: {
    customOptions: {
      removeAdditional: "all",
      coerceTypes: true,
    },
    options: [],
    plugins: [
      (/**@type {import("ajv").Ajv} */ ajv) => {
        ajv.addFormat("notempty", (str) => str?.trim().length > 0)
      },
    ],
  },
})
plugins(app)

app.addHook("onSend", (request, reply, payload, done) => {
  reply.header("Content-Type", "application/json")
  const newPayload = responseScheme(reply.statusCode, payload)

  done(null, newPayload)
})

const start = async () => {
  try {
    await app.listen({ port, host: "0.0.0.0" })
    console.log(`server listening on port ${app.server.address().port}`)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

start()

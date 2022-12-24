/**
 * @param fastify {import("fastify").FastifyInstance}
 * @param options {import("fastify").FastifyPluginOptions}
 */
export default function (fastify, options, done) {
  fastify.get("/ping", (request, reply) => {
    reply.send("200")
  })
  done()
}

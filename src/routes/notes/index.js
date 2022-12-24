import {
  createNotesController,
  deleteNoteController,
  extendNoteController,
  getNotesController,
  updateNotesController,
} from "../../controllers/notes.js"
import { verifyTokenHeader } from "../../utils/token-helper.js"

const noteSchema = {
  type: "object",
  properties: {
    title: { type: "string", format: "notempty" },
    note: { type: "array" },
    pinned: { type: "boolean", default: false },
  },
  required: ["title", "note"],
}
const paramsSchema = {
  id: { type: "string", format: "notempty" },
}

/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const getAllNotesOpts = {
  preHandler: verifyTokenHeader,
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const getDetailNoteOpts = {
  schema: {
    params: paramsSchema,
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const createNotesOpts = {
  preHandler: verifyTokenHeader,
  schema: {
    body: noteSchema,
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const updateNotesOpts = {
  preHandler: verifyTokenHeader,
  schema: {
    params: paramsSchema,
    body: noteSchema,
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const deleteNoteOpts = {
  preHandler: verifyTokenHeader,
  schema: {
    params: paramsSchema,
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const extendNoteOpts = {
  preHandler: verifyTokenHeader,
  schema: {
    params: {
      type: "object",
      properties: {
        id: { type: "string", format: "notempty" },
      },
      required: ["id"],
    },
    body: {
      type: "object",
      properties: {
        token: { type: "string", format: "notempty" },
      },
      required: ["token"],
    },
  },
}

/**
 * @param {import("fastify").FastifyInstance} fastify
 * @param {import("fastify").FastifyPluginOptions} options
 */
export default function (fastify, options, done) {
  fastify.get("/", getAllNotesOpts, (req, reply) =>
    getNotesController(req, reply, fastify)
  )
  fastify.get("/:id", getDetailNoteOpts, (req, reply) =>
    getNotesController(req, reply, fastify)
  )
  fastify.post("/", createNotesOpts, (req, reply) =>
    createNotesController(req, reply, fastify)
  )
  fastify.put("/:id", updateNotesOpts, (req, reply) =>
    updateNotesController(req, reply, fastify)
  )
  fastify.delete("/:id", deleteNoteOpts, (req, reply) =>
    deleteNoteController(req, reply, fastify)
  )
  fastify.post("/_extend/:id", extendNoteOpts, (req, reply) =>
    extendNoteController(req, reply, fastify)
  )

  done()
}

import { ObjectId } from "@fastify/mongodb"
import { isValidExtendToken } from "../utils/token-helper.js"

const expDurationTime = 1000 * 60 * 60 * 24 * 30 // 30 days
const expDurationDate = Date.now() + expDurationTime

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param  {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const getNotesController = async (req, reply, { mongoService }) => {
  const { id } = req.params

  // get detail note
  if (id) {
    const note = await mongoService.getNoteById(id)

    if (!note) {
      return reply.code(404).send("Note not found")
    }

    return reply.send(note)
  }

  const notes = await mongoService.getAllNotesByUserId(req.user)

  reply.send(notes)
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param  {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const createNotesController = async (req, reply, { mongoService }) => {
  const note = req.body
  const createdAt = Date.now()
  const expiredAt = expDurationDate // 30 days

  const data = await mongoService.insertNote({
    ...note,
    userId: req.user,
    createdAt,
    expiredAt,
    updatedAt: createdAt,
    pinned: false,
  })

  reply.code(201).send({ _id: data.insertedId.toString() })
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param  {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const updateNotesController = async (req, reply, { mongoService }) => {
  const noteUpdate = req.body
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    return reply.code(400).send("Note not found")
  }

  const currentNote = await mongoService.getNoteById(id, true)

  if (!currentNote) {
    return reply.code(404).send("Note not found")
  }

  if (currentNote.userId !== req.user) {
    return reply.code(403).send("You are not authorized to update this note")
  }

  await mongoService.updateNote(id, { ...noteUpdate, updatedAt: Date.now() })

  reply.code(200).send({ _id: id })
}

/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param  {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const deleteNoteController = async (req, reply, { mongoService }) => {
  const { id } = req.params

  if (!ObjectId.isValid(id)) {
    return reply.code(400).send("Note not found")
  }

  const currentNote = await mongoService.getNoteById(id, true)

  if (!currentNote) {
    return reply.code(404).send("Note not found")
  }

  if (currentNote.userId !== req.user) {
    return reply.code(403).send("You are not authorized to delete this note")
  }

  await mongoService.deleteNote(id)

  reply.code(200).send({ _id: id })
}
/**
 * @param {import("fastify").FastifyRequest} req
 * @param {import("fastify").FastifyReply} reply
 * @param  {{mongoService: import("../service/mongo-service").MongoService}} fastify
 */
export const extendNoteController = async (req, reply, { mongoService }) => {
  const { id } = req.params
  const { token } = req.body

  if (!ObjectId.isValid(id)) {
    return reply.code(400).send("Note not found")
  }

  if (!isValidExtendToken(token, id)) {
    return reply.code(400).send("Invalid token")
  }

  const currentNote = await mongoService.getNoteById(id, true)

  if (!currentNote) {
    return reply.code(404).send("Note not found")
  }

  if (currentNote.userId !== req.user) {
    return reply.code(403).send("You are not authorized to extend this note")
  }

  await mongoService.updateNote(id, {
    ...currentNote,
    expiredAt: currentNote.expiredAt + expDurationTime,
  })

  reply.code(200).send({ _id: id })
}

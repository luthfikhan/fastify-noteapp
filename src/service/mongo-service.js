import { ObjectId } from "@fastify/mongodb"

const userCollectionName = "jagausers"
const notesCollectionName = "jaganotes"

export class MongoService {
  /**
   * @param  {import("@fastify/mongodb").FastifyMongoObject} mongo
   */
  constructor(mongo) {
    this.userCollection = mongo.db.collection(userCollectionName)
    this.notesCollection = mongo.db.collection(notesCollectionName)
  }
  getUserByIdDb = async (id) => {
    return await this.userCollection.findOne({ id })
  }

  insertUserByIdDb = async (data) => {
    return await this.userCollection.insertOne(data)
  }

  updateUserPasswordByIdDb = async (id, password) => {
    return await this.userCollection.updateOne({ id }, { $set: { password } })
  }

  getAllNotesByUserId = async (userId) => {
    return await this.notesCollection
      .find({ userId }, { projection: { userId: 0 } })
      .sort({ pinned: -1 })
      .toArray()
  }

  getNoteById = async (id, includeUserId) => {
    const _id = new ObjectId(id)

    return await this.notesCollection.findOne(
      { _id },
      !includeUserId && { projection: { userId: 0 } }
    )
  }

  insertNote = async (data) => {
    return await this.notesCollection.insertOne(data)
  }

  updateNote = async (id, data) => {
    const _id = new ObjectId(id)

    return await this.notesCollection.updateOne({ _id }, { $set: data })
  }

  deleteNote = async (id) => {
    const _id = new ObjectId(id)

    return await this.notesCollection.deleteOne({ _id })
  }
}

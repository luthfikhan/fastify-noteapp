import {
  loginController,
  signupValidationController,
  refreshTokenController,
  signupController,
  forgotPassController,
  forgotPassValidationController,
  forgotPassSubmitController,
} from "../../controllers/auth.js"
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const loginOpts = {
  schema: {
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string" },
      },
      required: ["email", "password"],
    },
  },
}

/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const signupOpts = {
  schema: {
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        password: { type: "string", minLength: 8 },
      },
      required: ["email", "password"],
    },
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const signupValidationOpts = {
  schema: {
    body: {
      type: "object",
      properties: {
        authId: { type: "string", format: "notempty" },
        otp: { type: "string", minLength: 6, maxLength: 6 },
      },
      required: ["authId", "otp"],
    },
  },
}

/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const refreshTokenOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        token: { type: "string", format: "notempty" },
      },
      required: ["token"],
    },
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const forgotPassOpts = {
  schema: {
    body: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
      },
      required: ["email"],
    },
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const forgotPassValidationOpts = {
  schema: {
    body: {
      type: "object",
      properties: {
        authId: { type: "string", format: "notempty" },
        otp: { type: "string", minLength: 6, maxLength: 6 },
      },
      required: ["authId", "otp"],
    },
  },
}
/**
 * @type {import("fastify").RouteShorthandOptions}
 */
const forgotPassSubmitOpts = {
  schema: {
    body: {
      type: "object",
      properties: {
        authId: { type: "string", format: "notempty" },
        password: { type: "string", minLength: 8 },
      },
      required: ["authId", "password"],
    },
  },
}

/**
 * @param {import("fastify").FastifyInstance} fastify
 * @param {import("fastify").FastifyPluginOptions} options
 */
export default function (fastify, options, done) {
  fastify.post("/signup", signupOpts, (req, reply) =>
    signupController(req, reply, fastify)
  )
  fastify.post("/signup/validation", signupValidationOpts, (req, reply) =>
    signupValidationController(req, reply, fastify)
  )
  fastify.post("/login", loginOpts, (req, reply) =>
    loginController(req, reply, fastify)
  )
  fastify.get("/refresh_token", refreshTokenOpts, (req, reply) =>
    refreshTokenController(req, reply, fastify)
  )
  fastify.post("/forgot-password", forgotPassOpts, (req, reply) =>
    forgotPassController(req, reply, fastify)
  )
  fastify.post(
    "/forgot-password/validation",
    forgotPassValidationOpts,
    (req, reply) => forgotPassValidationController(req, reply, fastify)
  )
  fastify.post("/forgot-password/submit", forgotPassSubmitOpts, (req, reply) =>
    forgotPassSubmitController(req, reply, fastify)
  )
  done()
}

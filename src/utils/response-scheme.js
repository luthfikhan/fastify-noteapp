export default (code, payload) => {
  let data
  try {
    data = JSON.parse(payload)
  } catch (error) {
    data = payload
  }

  let status = ""
  switch (code) {
    case 200:
    case 201:
      status = "SUCCESS"
      break
    case 400:
      status = "BAD_REQUEST"
      break
    case 401:
      status = "UNAUTHORIZED"
      break
    case 403:
      status = "FORBIDDEN"
      break
    case 404:
      status = "NOT_FOUND"
      break
    default:
      status = "INTERNAL_SERVER_ERROR"
      break
  }

  if (typeof data === "object" && Object.keys(data).includes("statusCode")) {
    return JSON.stringify(data)
  }

  return JSON.stringify({
    statusCode: code,
    status,
    message: typeof data === "string" ? data : undefined,
    data: typeof data === "object" || Array.isArray(data) ? data : undefined,
  })
}

import development from "./development.js"
import production from "./production.js"

const getConfig = () => {
  const env = process.env.APP_ENV || "development"

  return (
    {
      development,
      production,
    }[env] || development
  )
}

const config = getConfig()

export default config

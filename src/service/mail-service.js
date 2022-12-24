import fs from "fs"
import path from "path"

export const sendOtpMail = async (email, text, mailer) => {
  let html = fs.readFileSync(
    path.join(__dirname, "src/assets/otp.html"),
    "utf8"
  )

  html = html.replace("{{otp}}", text)
  await mailer.sendMail({
    to: email,
    subject: "Jaga OTP Anda",
    html,
  })
}

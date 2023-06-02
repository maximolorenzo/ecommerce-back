import nodemailer from "nodemailer";
import config from "./config.js";
export default class Mail {
  constructor() {
    this.transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: config.USER_EMAIL,
        pass: config.USER_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  send = async (email, subject, html) => {
    const result = await this.transport.sendMail({
      from: config.USER_EMAIL,
      to: email,
      subject: subject,
      html: html,
    });

    return result;
  };
}

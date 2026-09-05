import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  /* =========================
     UPLOAD
  ========================= */

  upload: {
    config: {
      provider: "local",
      sizeLimit: 50 * 1024 * 1024,
    },
  },

  /* =========================
     EMAIL
  ========================= */

  email: {
    config: {
      provider: "nodemailer",

      providerOptions: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,

        auth: {
          user: env("GMAIL_USER"),
          pass: env("GMAIL_PASS"),
        },
      },

      settings: {
        defaultFrom: env("GMAIL_USER"),
        defaultReplyTo: env("GMAIL_USER"),
      },
    },
  },
});

export default config;
import { NextResponse } from "next/server";
import { resolveMx } from "node:dns/promises";
import nodemailer from "nodemailer";

/* =========================================================
   Helper - Escape HTML
========================================================= */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   Helper - Check Email Domain
========================================================= */

async function hasValidMailDomain(
  email: string
): Promise<boolean> {
  try {
    const domain = email
      .split("@")[1]
      ?.toLowerCase()
      .trim();

    if (!domain) {
      return false;
    }

    const mxRecords = await resolveMx(domain);

    return mxRecords.length > 0;
  } catch (error) {
    console.error(
      "Email domain validation error:",
      error
    );

    return false;
  }
}

/* =========================================================
   POST - Contact Us
========================================================= */

export async function POST(req: Request) {
  try {
    /* =====================================================
       Read request body
    ===================================================== */

    const body = await req.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    /* =====================================================
       Required fields
    ===================================================== */

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error:
            "Name, email and message are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Length validation
    ===================================================== */

    if (name.length > 100) {
      return NextResponse.json(
        {
          error:
            "Name must be less than 100 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (email.length > 254) {
      return NextResponse.json(
        {
          error:
            "Email address is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Message must be less than 5000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Email format validation
    ===================================================== */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Check email domain
    ===================================================== */

    const validMailDomain =
      await hasValidMailDomain(email);

    if (!validMailDomain) {
      return NextResponse.json(
        {
          error:
            "This email address does not appear to have a valid mail domain. Please check your email address.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       Check required environment variables
    ===================================================== */

    if (
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_PASS
    ) {
      console.error(
        "Missing GMAIL_USER or GMAIL_PASS"
      );

      return NextResponse.json(
        {
          error:
            "Email service is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (!process.env.ADMIN_EMAIL) {
      console.error(
        "Missing ADMIN_EMAIL"
      );

      return NextResponse.json(
        {
          error:
            "Admin email is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    if (
      !process.env.STRAPI_URL ||
      !process.env.STRAPI_API_TOKEN
    ) {
      console.error(
        "Missing STRAPI_URL or STRAPI_API_TOKEN"
      );

      return NextResponse.json(
        {
          error:
            "Database service is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       Escape values for HTML email
    ===================================================== */

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    /* =====================================================
       Create mail transporter
    ===================================================== */

    const transporter =
      nodemailer.createTransport({
        service: "gmail",

        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

    /* =====================================================
       Verify SMTP connection
    ===================================================== */

    try {
      await transporter.verify();
    } catch (error) {
      console.error(
        "SMTP verification failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Email service is currently unavailable. Please try again later.",
        },
        {
          status: 503,
        }
      );
    }

    /* =====================================================
       1. Send confirmation to USER
    ===================================================== */

    try {
      await transporter.sendMail({
        from: `"FriscoDesi" <${process.env.GMAIL_USER}>`,
        to: email,

        replyTo: process.env.GMAIL_USER,

        subject:
          "We received your message - FriscoDesi",

        text: `
Hi ${name},

Thank you for contacting FriscoDesi.

We have received your message and our team will get back to you shortly.

Your message:

${message}

Thank you,
FriscoDesi Team
        `.trim(),

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Thank you for contacting FriscoDesi</h2>

            <p>
              Hi ${safeName},
            </p>

            <p>
              We have received your message and our team
              will get back to you shortly.
            </p>

            <hr />

            <p>
              <strong>Your message:</strong>
            </p>

            <p>
              ${safeMessage.replace(/\n/g, "<br />")}
            </p>

            <hr />

            <p>
              Thank you,<br />
              <strong>FriscoDesi Team</strong>
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        "User email delivery failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "We could not deliver a confirmation email to this address. Please check that your email address is correct.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       2. Send message to ADMIN
    ===================================================== */

    try {
      await transporter.sendMail({
        from: `"FriscoDesi Contact" <${process.env.GMAIL_USER}>`,

        to: process.env.ADMIN_EMAIL,

        replyTo: email,

        subject:
          `New message from ${name}`,

        text: `
New Contact Message

Name: ${name}
Email: ${email}

Message:

${message}
        `.trim(),

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Contact Message</h2>

            <p>
              <strong>Name:</strong>
              ${safeName}
            </p>

            <p>
              <strong>Email:</strong>
              ${safeEmail}
            </p>

            <p>
              <strong>Message:</strong>
            </p>

            <p>
              ${safeMessage.replace(/\n/g, "<br />")}
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error(
        "Admin email delivery failed:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Your message could not be delivered to our team. Please try again later.",
        },
        {
          status: 503,
        }
      );
    }

    /* =====================================================
       3. Save message to Strapi
    ===================================================== */

    try {
      const strapiResponse =
        await fetch(
          `${process.env.STRAPI_URL}/api/contact-messages`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${process.env.STRAPI_API_TOKEN}`,
            },

            body: JSON.stringify({
              data: {
                name,
                email,
                message,
                messageStatus: "new",
              },
            }),

            cache: "no-store",
          }
        );

      const strapiData =
        await strapiResponse.json();

      console.log(
        "Strapi response:",
        strapiData
      );

      if (!strapiResponse.ok) {
        console.error(
          "Strapi save error:",
          strapiData
        );

        return NextResponse.json(
          {
            error:
              "Your message was received by email, but we could not save it. Please try again later.",
          },
          {
            status: 500,
          }
        );
      }
    } catch (error) {
      console.error(
        "Strapi connection error:",
        error
      );

      return NextResponse.json(
        {
          error:
            "Unable to save your message. Please try again later.",
        },
        {
          status: 500,
        }
      );
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        message:
          "Message sent successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "CONTACT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending your message.",
      },
      {
        status: 500,
      }
    );
  }
}
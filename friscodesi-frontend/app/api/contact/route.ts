import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🔹 1️⃣ SAVE TO STRAPI FIRST
    const strapiResponse = await fetch(
      `${process.env.STRAPI_URL}/api/contact-messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            name,
            email,
            message,
            messageStatus: "new",
          },
        }),
      }
    );

    const strapiData = await strapiResponse.json();
    console.log("Strapi response:", strapiData);

    if (!strapiResponse.ok) {
      throw new Error("Failed to save to Strapi");
    }

    // 🔹 2️⃣ SEND EMAILS AFTER SUCCESS
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Admin email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p>${message}</p>
      `,
    });

    // User confirmation
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "We received your message!",
      html: `
        <h2>Thank you for contacting FriscoDesi</h2>
        <p>Hi ${name},</p>
        <p>We have received your message and will get back to you shortly.</p>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("CONTACT API ERROR:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // TEMPORARILY DISABLED FOR LOCAL DEVELOPMENT
    // Uncomment later if you implement admin authentication.

    /*
    const adminToken = req.cookies.get("adminToken")?.value;

    if (!adminToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    */

    const { documentId, userEmail, replyText } = await req.json();

    if (!documentId || !userEmail || !replyText) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // 1. Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: "Reply from FriscoDesi",
      html: `
        <h3>Reply from FriscoDesi</h3>
        <p>${replyText}</p>
        <br />
        <p>Thank you,</p>
        <p><strong>FriscoDesi Team</strong></p>
      `,
    });

    // 2. Update status in Strapi
    const updateRes = await fetch(
      `http://localhost:1337/api/contact-messages/${documentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            messageStatus: "replied",
          },
        }),
      }
    );

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
      console.error("Strapi Update Error:", updateData);

      return NextResponse.json(
        {
          error: "Failed to update status in Strapi",
          details: updateData,
        },
        { status: updateRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (error) {
    console.error("Reply API Error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while sending the reply",
      },
      { status: 500 }
    );
  }
}
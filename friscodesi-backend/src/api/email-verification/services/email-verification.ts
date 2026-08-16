import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const VERIFICATION_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type OtpRequest = {
  codeHash: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
};

type VerifiedEmail = {
  tokenHash: string;
  expiresAt: number;
};

const otpRequests = new Map<string, OtpRequest>();
const verifiedEmails = new Map<string, VerifiedEmail>();

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

function hash(value: string) {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error('OTP email verification is not configured.');
  }

  return crypto.createHash('sha256').update(`${secret}:${value}`).digest('hex');
}

function hashesMatch(left: string, right: string) {
  return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

function cleanExpiredEntries() {
  const now = Date.now();

  for (const [email, request] of otpRequests) {
    if (request.expiresAt <= now) otpRequests.delete(email);
  }

  for (const [email, verification] of verifiedEmails) {
    if (verification.expiresAt <= now) verifiedEmails.delete(email);
  }
}

export default ({ strapi }) => ({
  isValidEmail(email: string) {
    return EMAIL_PATTERN.test(normaliseEmail(email));
  },

  async requestOtp(rawEmail: string) {
    const email = normaliseEmail(rawEmail);
    cleanExpiredEntries();

    if (!this.isValidEmail(email)) {
      throw new Error('Enter a valid email address.');
    }

    const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { email },
    });

    if (existingUser) {
      throw new Error('An account already exists for this email address.');
    }

    const existingRequest = otpRequests.get(email);
    if (existingRequest && Date.now() - existingRequest.sentAt < RESEND_COOLDOWN_MS) {
      throw new Error('Please wait one minute before requesting another OTP.');
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      throw new Error('OTP email delivery is not configured.');
    }

    const otp = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your FriscoDesi verification code',
      text: `Your FriscoDesi verification code is ${otp}. It expires in 10 minutes.`,
      html: `<p>Your FriscoDesi verification code is <strong>${otp}</strong>.</p><p>It expires in 10 minutes.</p>`,
    });

    otpRequests.set(email, {
      codeHash: hash(`${email}:${otp}`),
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      attempts: 0,
      sentAt: Date.now(),
    });
  },

  verifyOtp(rawEmail: string, otp: string) {
    const email = normaliseEmail(rawEmail);
    cleanExpiredEntries();

    const request = otpRequests.get(email);
    if (!request || !/^\d{6}$/.test(otp)) {
      throw new Error('Entered OTP is invalid');
    }

    request.attempts += 1;
    if (request.attempts > MAX_OTP_ATTEMPTS) {
      otpRequests.delete(email);
      throw new Error('Entered OTP is invalid');
    }

    if (!hashesMatch(request.codeHash, hash(`${email}:${otp}`))) {
      throw new Error('Entered OTP is invalid');
    }

    otpRequests.delete(email);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    verifiedEmails.set(email, {
      tokenHash: hash(`${email}:${verificationToken}`),
      expiresAt: Date.now() + VERIFICATION_EXPIRY_MS,
    });

    return verificationToken;
  },

  consumeVerification(rawEmail: string, verificationToken: string) {
    const email = normaliseEmail(rawEmail);
    cleanExpiredEntries();

    const verification = verifiedEmails.get(email);
    if (!verification || !/^[a-f0-9]{64}$/.test(verificationToken)) {
      return false;
    }

    const isValid = hashesMatch(
      verification.tokenHash,
      hash(`${email}:${verificationToken}`)
    );

    if (isValid) verifiedEmails.delete(email);
    return isValid;
  },
});

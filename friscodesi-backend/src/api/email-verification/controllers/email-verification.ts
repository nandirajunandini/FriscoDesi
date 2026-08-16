export default ({ strapi }) => ({
  async request(ctx) {
    const email = ctx.request.body?.email;

    if (typeof email !== 'string') {
      return ctx.badRequest('A valid email address is required.');
    }

    try {
      await strapi.service('api::email-verification.email-verification').requestOtp(email);
      ctx.send({ sent: true });
    } catch (error) {
      ctx.badRequest(error instanceof Error ? error.message : 'Unable to send an OTP.');
    }
  },

  async verify(ctx) {
    const { email, otp } = ctx.request.body ?? {};

    if (typeof email !== 'string' || typeof otp !== 'string') {
      return ctx.badRequest('Email and OTP are required.');
    }

    try {
      const verificationToken = strapi
        .service('api::email-verification.email-verification')
        .verifyOtp(email, otp);

      ctx.send({ verified: true, verificationToken });
    } catch (error) {
      ctx.badRequest(error instanceof Error ? error.message : 'Entered OTP is invalid');
    }
  },
});

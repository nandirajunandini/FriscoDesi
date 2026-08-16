export default (plugin) => {
  const originalRegister = plugin.controllers.auth.register;

  plugin.controllers.auth.register = async (ctx) => {
    const email = ctx.request.body?.email;
    const verificationToken = ctx.request.header['x-email-verification-token'];

    if (typeof email !== 'string' || typeof verificationToken !== 'string') {
      return ctx.badRequest('Email verification is required before registration.');
    }

    const verificationService = strapi.service(
      'api::email-verification.email-verification'
    );

    if (!verificationService.consumeVerification(email, verificationToken)) {
      return ctx.badRequest('Email verification is required before registration.');
    }

    return originalRegister(ctx);
  };

  return plugin;
};

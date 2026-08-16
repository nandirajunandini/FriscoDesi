export default {
  routes: [
    {
      method: 'POST',
      path: '/email-verification/request',
      handler: 'email-verification.request',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/email-verification/verify',
      handler: 'email-verification.verify',
      config: { auth: false },
    },
  ],
};

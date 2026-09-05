/**
 * user-profile router
 */

export default {
  routes: [
    {
      method: "PUT",
      path: "/user-profile/me",
      handler: "user-profile.updateMe",
      config: {
        auth: {},
      },
    },
  ],
};
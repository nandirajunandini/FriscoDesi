export default {
  routes: [
    {
      method: "GET",
      path: "/admin-setting",
      handler: "admin-setting.find",
      config: {
        auth: false,
      },
    },
    {
      method: "PUT",
      path: "/admin-setting",
      handler: "admin-setting.update",
      config: {
        auth: false,
      },
    },
  ],
};
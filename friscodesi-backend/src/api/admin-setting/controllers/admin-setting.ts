import { factories } from "@strapi/strapi";

const UID = "api::admin-setting.admin-setting";

export default factories.createCoreController(
  UID,
  ({ strapi }) => ({

    /* =====================================================
       Verify Admin
    ===================================================== */

    async verifyAdmin(ctx: any) {
      try {
        const authorization =
          ctx.request.header.authorization;

        if (!authorization) {
          return null;
        }

        if (!authorization.startsWith("Bearer ")) {
          return null;
        }

        const token =
          authorization.substring(7);

        if (!token) {
          return null;
        }

        /* ---------------------------------------------
           Verify Strapi Users-Permissions JWT
        --------------------------------------------- */

        const jwtService =
          strapi.service(
            "plugin::users-permissions.jwt"
          );

        const payload =
          await jwtService.verify(token);

        if (!payload?.id) {
          return null;
        }

        /* ---------------------------------------------
           Get User
        --------------------------------------------- */

        const user =
          await strapi.db
            .query(
              "plugin::users-permissions.user"
            )
            .findOne({
              where: {
                id: payload.id,
              },
            });

        if (!user) {
          return null;
        }

        /* ---------------------------------------------
           Admin Check
        ---------------------------------------------

           Your current admin username is:

           admin123
        */

        if (
          user.username?.toLowerCase() !==
          "admin123"
        ) {
          return null;
        }

        return user;

      } catch (error) {

        console.error(
          "Admin verification failed:",
          error
        );

        return null;
      }
    },


    /* =====================================================
       GET SETTINGS
    ===================================================== */

    async find(ctx: any) {

      try {

        console.log(
          "⚙️ GET ADMIN SETTINGS"
        );

        /* ---------------------------------------------
           Verify Admin
        --------------------------------------------- */

        const user =
          await this.verifyAdmin(ctx);

        if (!user) {

          return ctx.unauthorized(
            "Admin access required"
          );
        }

        console.log(
          "👑 Admin verified:",
          user.username
        );


        /* ---------------------------------------------
           Find Single Type
        --------------------------------------------- */

        let settings =
          await strapi.documents(UID).findFirst();


        /* ---------------------------------------------
           Automatically create if missing
        --------------------------------------------- */

        if (!settings) {

          console.log(
            "⚙️ Admin settings not found. Creating defaults..."
          );

          settings =
            await strapi.documents(UID).create({
              data: {

                adminName:
                  user.username || "Admin",

                email:
                  user.email || "",

                emailNotifications:
                  true,

                newMessageNotifications:
                  true,

                listingNotifications:
                  true,

                maintenanceMode:
                  false,
              },
            });

          console.log(
            "✅ Default admin settings created"
          );
        }


        /* ---------------------------------------------
           Return settings
        --------------------------------------------- */

        return {
          data: settings,
        };

      } catch (error) {

        console.error(
          "❌ Failed to fetch admin settings:",
          error
        );

        return ctx.internalServerError(
          "Failed to fetch admin settings"
        );
      }
    },


    /* =====================================================
       UPDATE SETTINGS
    ===================================================== */

    async update(ctx: any) {

      try {

        console.log(
          "⚙️ UPDATE ADMIN SETTINGS"
        );


        /* ---------------------------------------------
           Verify Admin
        --------------------------------------------- */

        const user =
          await this.verifyAdmin(ctx);

        if (!user) {

          return ctx.unauthorized(
            "Admin access required"
          );
        }

        console.log(
          "👑 Admin verified:",
          user.username
        );


        /* ---------------------------------------------
           Get request body
        --------------------------------------------- */

        const body =
          ctx.request.body || {};

        const data =
          body.data || body;


        /* ---------------------------------------------
           Find existing settings
        --------------------------------------------- */

        let settings =
          await strapi.documents(UID).findFirst();


        /* ---------------------------------------------
           Create if it doesn't exist
        --------------------------------------------- */

        if (!settings) {

          console.log(
            "⚙️ No settings found. Creating..."
          );

          settings =
            await strapi.documents(UID).create({
              data: {
                adminName:
                  data.adminName ||
                  user.username ||
                  "Admin",

                email:
                  data.email ||
                  user.email ||
                  "",

                emailNotifications:
                  data.emailNotifications ??
                  true,

                newMessageNotifications:
                  data.newMessageNotifications ??
                  true,

                listingNotifications:
                  data.listingNotifications ??
                  true,

                maintenanceMode:
                  data.maintenanceMode ??
                  false,
              },
            });

          console.log(
            "✅ Admin settings created"
          );

        } else {

          /* -------------------------------------------
             Update existing settings
          ------------------------------------------- */

          settings =
            await strapi.documents(UID).update({
              documentId:
                settings.documentId,

              data: {

                adminName:
                  data.adminName,

                email:
                  data.email,

                emailNotifications:
                  data.emailNotifications,

                newMessageNotifications:
                  data.newMessageNotifications,

                listingNotifications:
                  data.listingNotifications,

                maintenanceMode:
                  data.maintenanceMode,
              },
            });

          console.log(
            "✅ Admin settings updated"
          );
        }


        return {
          data: settings,
        };

      } catch (error) {

        console.error(
          "❌ Failed to update admin settings:",
          error
        );

        return ctx.internalServerError(
          "Failed to update admin settings"
        );
      }
    },

  })
);
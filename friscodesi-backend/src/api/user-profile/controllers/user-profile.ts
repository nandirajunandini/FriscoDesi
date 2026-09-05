/**
 * user-profile controller
 */

export default ({ strapi }) => ({
  async updateMe(ctx) {
    try {
      // Get the currently authenticated user
      const currentUser = ctx.state.user;

      if (!currentUser) {
        return ctx.unauthorized(
          "You must be logged in"
        );
      }

      // Get data sent from frontend
      const { username, email } =
        ctx.request.body;

      // Validate username
      if (
        typeof username !== "string" ||
        !username.trim()
      ) {
        return ctx.badRequest(
          "Username is required"
        );
      }

      // Validate email
      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return ctx.badRequest(
          "Email is required"
        );
      }

      const cleanUsername =
        username.trim();

      const cleanEmail =
        email.trim().toLowerCase();

      // Basic email validation
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        return ctx.badRequest(
          "Please enter a valid email address"
        );
      }

      // Update ONLY the authenticated user
      const updatedUser =
        await strapi.db
          .query(
            "plugin::users-permissions.user"
          )
          .update({
            where: {
              id: currentUser.id,
            },
            data: {
              username: cleanUsername,
              email: cleanEmail,
            },
          });

      if (!updatedUser) {
        return ctx.notFound(
          "User not found"
        );
      }

      return ctx.send({
        message:
          "Profile updated successfully",

        user: {
          id: updatedUser.id,
          username:
            updatedUser.username,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      strapi.log.error(
        "Update user profile error:",
        error
      );

      return ctx.internalServerError(
        "Unable to update profile"
      );
    }
  },
});
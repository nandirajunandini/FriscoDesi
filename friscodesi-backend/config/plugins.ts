import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: "local",
      sizeLimit: 50 * 1024 * 1024,
      breakpoints: {},
      generateThumbnails: false,
    },
  },
});

export default config;
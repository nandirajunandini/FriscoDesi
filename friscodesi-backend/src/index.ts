import sharp from "sharp";

export default {
  register() {},

  async bootstrap() {
    sharp.cache(false);

    console.log("=================================");
    console.log("SHARP CACHE DISABLED");
    console.log("=================================");
  },
};
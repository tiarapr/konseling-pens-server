require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  HOST: process.env.HOST,
  BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
  BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
  AUTH_HEADER_KEY: process.env.AUTH_HEADER_KEY,
  ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY,
};

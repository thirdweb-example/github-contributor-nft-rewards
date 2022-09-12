import { ThirdwebAuth } from "@thirdweb-dev/auth/next";

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  // It is not best practice to store your private key in an environment variable.
  // Learn how to store your private key securely: https://portal.thirdweb.com/sdk/set-up-the-sdk/securing-your-private-key
  privateKey: process.env.PRIVATE_KEY as string,
  domain: "example.com",
});

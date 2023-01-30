import { ThirdwebAuth } from "@thirdweb-dev/auth/next";
import { PrivateKeyWallet } from "@thirdweb-dev/auth/evm";

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  domain: "example.com",
  wallet: new PrivateKeyWallet(process.env.PRIVATE_KEY || ""),
});

export default ThirdwebAuthHandler();

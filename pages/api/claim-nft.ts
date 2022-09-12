import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { getUser } from "../../auth.config";
import GithubContributor from "../../types/GithubContributor";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { authOptions } from "./auth/[...nextauth]";
import GithubRepo from "../../types/GithubRepo";

export default async function claimNft(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Verify the user with NextAuth (their GitHub account)
  // Session validates github account i guess?
  const session = await unstable_getServerSession(req, res, authOptions);

  // 2. Verify the user using thirdweb Auth
  const thirdwebUser = await getUser(req);

  if (!session || !thirdwebUser) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // First, get all the public repos of the thirdweb-dev organization
  // by asking the github api for the org's repos
  // We don't use this here, but you could use it if you like.
  const repos: GithubRepo[] = await fetch(
    `https://api.github.com/orgs/thirdweb-dev/repos?per_page=100`
  ).then((res) => res.json());

  const reposToCheck = [
    "js",
    "react",
    "typescript-sdk",
    "thirdweb-cli",
    "contracts",
    "auth",
    "storage",
    "go-sdk",
    "python-sdk",
  ];

  let hasContributed = false;
  // For each repo, check their contribution status
  for (const repo of reposToCheck) {
    const contributors: GithubContributor[] = await fetch(
      `https://api.github.com/repos/thirdweb-dev/${repo}/contributors`,
      {
        // Use my access token from .env.local
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
        },
      }
    ).then((res) => res.json());

    // Based on the id, check if the user is in the contributors list
    const hasContributedToThisRepo = contributors?.some((contributor) => {
      return contributor.id.toString() === session.id;
    });

    if (hasContributedToThisRepo) {
      hasContributed = true;
      break;
    }
  }

  // 3. Check if they have contributed to https://github.com/thirdweb-dev/react
  // Make a fetch request to the github api to get the contributors
  // Check if the user is in the contributors list

  if (!hasContributed) {
    // return a message saying they haven't contributed
    res.status(401).json({ message: "Sorry, you don't qualify" });
    return;
  }

  const sdk = ThirdwebSDK.fromPrivateKey(
    // Learn more about securely accessing your private key: https://portal.thirdweb.com/sdk/set-up-the-sdk/securing-your-private-key
    process.env.PRIVATE_KEY as string,
    "goerli" // configure this to your network
  );

  const edition = sdk.getEdition("0x50cFC3C293498AF5BFa8c4f589bf25afc70AA8a3");

  // 4. If they have, call the mintAdditionalSupplyTo from the Edition contract.

  // If you already have one, you can't mint again.
  const balance = await edition.balanceOf(thirdwebUser.address, 0);

  if (balance.gt(0)) {
    res.status(401).json({ message: "You already have an NFT" });
    return;
  }

  const signedPayload = await edition.signature.generateFromTokenId({
    quantity: 1,
    tokenId: 0,
    to: thirdwebUser.address,
  });

  res.status(200).json({ signedPayload });
}

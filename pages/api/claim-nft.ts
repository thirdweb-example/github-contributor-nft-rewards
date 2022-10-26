import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { getUser } from "../../auth.config";
import GithubContributor from "../../types/GithubContributor";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { authOptions } from "./auth/[...nextauth]";
import GithubRepo from "../../types/GithubRepo";

const claimNft = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  // 1. Verify the user with NextAuth (their GitHub account)
  const session = await unstable_getServerSession(req, res, authOptions);
  // 2. Verify the user using thirdweb Auth
  const thirdwebUser = await getUser(req);

  // First, get all the public repos of the thirdweb-dev organization
  // by asking the github api for the org's repos
  // We don't use this here, but you could use it if you like.
  const repos: GithubRepo[] = await fetch(
    `https://api.github.com/orgs/thirdweb-dev/repos?per_page=100`
  ).then((res) => res.json());

  if (!session || !thirdwebUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

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
    "docs",
    "portal",
    "examples",
  ];

  let hasContributed = false;

  // 3. Check if they have contributed to any repo
  // Make a fetch request to the github api to get the contributors
  // Check if the user is in the contributors list
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
    }
  }

  if (!hasContributed) {
    return res.status(401).json({ message: "Sorry, you don't qualify" });
  }

  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY as string,
    "goerli" // configure this to your network
  );

  const edition = await sdk.getContract("0xD71c27e6325f018b15E16C3992654F1b089C5fCe", 'edition');

  const balance = await edition.balanceOf(thirdwebUser.address, 0);

  // If you already have one, you can't mint again.
  if (balance.gt(0)) {
    return res.status(401).json({ message: "You already have an NFT" });
  }

  // 4. If they have contributed and not minted before, call the generateFromTokenId from the Edition contract.
  const signedPayload = await edition.signature.generateFromTokenId({
    quantity: 1,
    tokenId: 0,
    to: thirdwebUser.address,
  });

  return res.status(200).json({ signedPayload });
};

export default claimNft;

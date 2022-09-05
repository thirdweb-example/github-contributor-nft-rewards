import type { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { getUser } from "../../auth.config";
import GithubContributor from "../../types/GithubContributor";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { authOptions } from "./auth/[...nextauth]";

export default async function claimNft(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const thirdwebUser = await getUser(req);

  if (!session || !thirdwebUser) {
    res.status(401).json({ message: "Unauthorized" });
    return;
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
  for (const repo of reposToCheck) {
    const contributors: GithubContributor[] = await fetch(
      `https://api.github.com/repos/thirdweb-dev/${repo}/contributors`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
        },
      }
    ).then((res) => res.json());

    const hasContributedToThisRepo = contributors?.some((contributor) => {
      return contributor.id.toString() === session.id;
    });

    if (hasContributedToThisRepo) {
      hasContributed = true;
      break;
    }
  }

  if (!hasContributed) {
    res.status(401).json({ message: "Sorry, you don't qualify" });
    return;
  }

  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.PRIVATE_KEY as string,
    "goerli"
  );

  const edition = sdk.getEdition("0xD71c27e6325f018b15E16C3992654F1b089C5fCe");

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

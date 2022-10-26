import { useContract, Web3Button } from "@thirdweb-dev/react";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { getUser } from "../auth.config";
import styles from "../styles/Home.module.css";
import { authOptions } from "./api/auth/[...nextauth]";

const EDITION_CONTRACT_ADDRESS = "0xD71c27e6325f018b15E16C3992654F1b089C5fCe";

const Home: NextPage = () => {
  const { contract: edition } = useContract(
    EDITION_CONTRACT_ADDRESS,
    "edition"
  );

  const mintNft = async () => {
    try {
      const req = await fetch("/api/claim-nft", {
        method: "POST",
      });

      const res = await req.json();

      if (!req.ok) {
        return alert(`Error: ${res.message}`);
      }

      await edition?.signature.mint(res.signedPayload);

      alert("Successfully minted NFT 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to mint NFT");
    }
  };

  return (
    <div className={styles.container}>
      <h1>GitHub Contributor NFTs</h1>
      <p>
        Claim an NFT if you have contributed to any of thirdweb&apos;s repos.
      </p>

      <Web3Button
        contractAddress={EDITION_CONTRACT_ADDRESS}
        action={() => mintNft()}
      >
        Claim NFT
      </Web3Button>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const thirdwebUser = await getUser(context.req);

  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!thirdwebUser || !session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

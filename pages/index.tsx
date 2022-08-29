import { useAddress, useEdition, useMetamask } from "@thirdweb-dev/react";
import type { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import { getUser } from "../auth.config";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const edition = useEdition("0x50cFC3C293498AF5BFa8c4f589bf25afc70AA8a3");

  const connect = useMetamask();
  const address = useAddress();

  const [loading, setLoading] = useState<boolean>(false);

  async function mintNft() {
    setLoading(true);

    try {
      // Fetch /api/claim-nft
      const req = await fetch("/api/claim-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await req.json();

      if (!req.ok) {
        alert(`Error:, ${res.message}`);
        return;
      }

      // Use the payload to mint the nft
      const tx = await edition?.signature.mint(res.signedPayload);

      alert("Succesfully minted NFT 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to mint NFT");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1>GitHub Contributor NFTs</h1>

      <p>
        Claim an NFT if you have contributed to any of thirdweb&apos;s repos.
      </p>

      {!address ? (
        <button
          className={styles.mainButton}
          disabled={loading}
          onClick={() => connect()}
        >
          Connect to Metamask
        </button>
      ) : (
        <button
          className={styles.mainButton}
          disabled={loading}
          onClick={mintNft}
        >
          {loading ? "Loading..." : "Claim NFT"}
        </button>
      )}
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get user (both NextAuth & Thirdweb)
  const thirdwebUser = getUser(context.req);

  // Get NextAuth session
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  // If either !thirdwebUser || !session, redirect to login
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

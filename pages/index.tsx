import {
  ChainId,
  useAddress,
  useEdition,
  useMetamask,
  useNetwork,
  useNetworkMismatch,
  useOwnedNFTs,
  useUser,
} from "@thirdweb-dev/react";
import type { GetServerSideProps, NextPage } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUser } from "../auth.config";
import styles from "../styles/Home.module.css";
import { authOptions } from "./api/auth/[...nextauth]";

const Home: NextPage = () => {
  const edition = useEdition("0xD71c27e6325f018b15E16C3992654F1b089C5fCe");
  const connect = useMetamask();
  const address = useAddress();
  const [, switchNetwork] = useNetwork();
  const networkMismatch = useNetworkMismatch();
  const { data: ownedNFTs, isLoading } = useOwnedNFTs(edition, address);
  const { user, isLoading: userLoading } = useUser();
  const { status } = useSession();

  const [loading, setLoading] = useState<boolean>(false);

  const mintNft = async () => {
    setLoading(true);

    if (!address) {
      connect();
      return;
    }

    if (networkMismatch) {
      switchNetwork?.(ChainId.Goerli);
      return;
    }

    try {
      const req = await fetch("/api/claim-nft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const res = await req.json();

      if (!req.ok) {
        alert(`Error: ${res.message}`);
        return;
      }

      await edition?.signature.mint(res.signedPayload);

      alert("Successfully minted NFT 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to mint NFT");
    } finally {
      setLoading(false);
    }
  };

  const hasClaimed = ownedNFTs && ownedNFTs?.length > 0;

  useEffect(() => {
    if (userLoading || status === "loading") return;

    if (!user || status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status, user, userLoading]);

  if (isLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>GitHub Contributor NFTs</h1>

      {hasClaimed ? (
        <p>You already have an NFT!</p>
      ) : (
        <p>
          Claim an NFT if you have contributed to any of thirdweb&apos;s repos.
        </p>
      )}

      {!address ? (
        <button
          className={styles.mainButton}
          disabled={loading}
          onClick={() => connect()}
        >
          Connect to Metamask
        </button>
      ) : (
        !hasClaimed && (
          <button
            className={styles.mainButton}
            disabled={loading || hasClaimed}
            onClick={mintNft}
          >
            {loading ? "Loading..." : "Claim NFT"}
          </button>
        )
      )}
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

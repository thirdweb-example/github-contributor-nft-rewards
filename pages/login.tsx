import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { useSession, signIn } from "next-auth/react";
import styles from "../styles/Home.module.css";

const Login = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className={styles.container}>
        <h1>GitHub Contributor Rewards</h1>
        <p>
          Claim an NFT if you have contributed to any of thirdweb&apos;s GitHub
          repositories!
        </p>
        <button className={styles.mainButton} onClick={() => signIn()}>
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>GitHub Contributor Rewards</h1>
      <p>
        Claim an NFT if you have contributed to any of thirdweb&apos;s GitHub
        repositories!
      </p>
      <ConnectWallet
        auth={{
          loginOptional: false,
        }}
      />
    </div>
  );
};

export default Login;

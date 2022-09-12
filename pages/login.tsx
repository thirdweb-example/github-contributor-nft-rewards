import React from "react";
import { useAddress, useLogin, useMetamask } from "@thirdweb-dev/react";
import { useSession, signIn } from "next-auth/react";
import styles from "../styles/Home.module.css";

export default function Login() {
  const login = useLogin();
  const { data: session } = useSession();
  const address = useAddress();
  const connect = useMetamask();

  return (
    <div className={styles.container}>
      {!address ? (
        <button className={styles.mainButton} onClick={() => connect()}>
          Connect Wallet
        </button>
      ) : !session ? (
        <button className={styles.mainButton} onClick={() => signIn()}>
          Sign in
        </button>
      ) : (
        <button className={styles.mainButton} onClick={() => login()}>
          Sign in with Ethereum
        </button>
      )}
    </div>
  );
}

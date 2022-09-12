import React from "react";
import { useAddress, useLogin, useMetamask } from "@thirdweb-dev/react";
import { useSession, signIn } from "next-auth/react";
import styles from "../styles/Home.module.css";

const Login = () => {
  const { data: session } = useSession();
  const login = useLogin();
  const address = useAddress();
  const connect = useMetamask();

  if (!session) {
    return (
      <div className={styles.container}>
        <button className={styles.mainButton} onClick={() => signIn()}>
          Sign in with GitHub
        </button>
      </div>
    );
  }

  if (!address) {
    return (
      <div className={styles.container}>
        <button className={styles.mainButton} onClick={() => connect()}>
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button className={styles.mainButton} onClick={() => login()}>
        Sign in with Ethereum
      </button>
    </div>
  );
};

export default Login;

import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
import { useSession, signIn } from "next-auth/react";
import styles from "../styles/Home.module.css";

const Login = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className={styles.container}>
        <button className={styles.mainButton} onClick={() => signIn()}>
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ConnectWallet
        auth={{
          loginOptional: false,
        }}
      />
    </div>
  );
};

export default Login;

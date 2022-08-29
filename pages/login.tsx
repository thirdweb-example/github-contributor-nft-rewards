import React from "react";
import { useLogin } from "@thirdweb-dev/react";
import { useSession, signIn } from "next-auth/react";

export default function Login() {
  const login = useLogin();
  const { data: session } = useSession();

  return (
    <div>
      {!session ? (
        <button onClick={() => signIn()}>Sign in</button>
      ) : (
        <button onClick={() => login()}>Sign in with Ethereum</button>
      )}
    </div>
  );
}

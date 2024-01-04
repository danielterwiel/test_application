import Head from "next/head";
import { env } from "../env";

export default function Home() {
  console.log("env", env.NEXT_PUBLIC_GITHUB_API_KEY);
  return (
    <>
      <Head>
        <title>Test Application</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="prose font-sans">
        <h1>Test Application</h1>
      </main>
    </>
  );
}

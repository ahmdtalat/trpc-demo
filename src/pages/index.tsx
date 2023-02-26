import { type NextPage } from "next";
import Head from "next/head";
import { useSession } from "next-auth/react";

import { api } from "~/utils/api";

const Home: NextPage = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>tRPC Demo</title>
        <meta name="description" content="a tRPC demo app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <div className="flex flex-col items-center gap-2">
          <p className="text-2xl ">
            {hello.data ? hello.data.greeting : "Loading tRPC query..."}
          </p>
          <div className="flex items-center gap-2">
            <AuthShowcase />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData, status } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  if (status === "loading") return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-1xl text-cente2 text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
    </div>
  );
};

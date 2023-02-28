import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { api } from "~/utils/api";
import type { UserMessage } from "~/server/api/routers/chat";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { authOptions } from "~/server/auth";
import { getServerSession } from "next-auth";

type User = {
  id: string;
} & {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
};

const formateDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/signin",
      },
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
}

const Chat = ({
  user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const msgsRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState<UserMessage[]>([]);

  const messagesQuery = api.chat.getAll.useQuery(
    undefined, // no input
    {
      enabled: !!user,
      onSuccess(data) {
        setMessages(data);
      },
    }
  );

  const sendMsgMutation = api.chat.sendMsg.useMutation({
    onSuccess(newMsg) {
      setMsg("");
      setMessages((current) => [...current, newMsg]);
    },
  });

  const handleSendMsg = () => {
    if (!msg || msg.trim() === "") return;
    sendMsgMutation.mutate({
      body: msg,
    });
  };

  useLayoutEffect(() => {
    const container = msgsRef?.current;
    if (container) {
      container?.scrollTo(0, container.scrollHeight);
    }
  }, [messages]);

  return (
    <div className="rounded-0 flex h-full flex-col overflow-hidden bg-slate-800 shadow-md md:m-auto md:h-4/5 md:w-2/4 lg:w-1/3 lg:rounded-md">
      <div className="mb-1 flex h-16 w-full items-center justify-between bg-slate-700 px-2 shadow-sm">
        <p className="text-lg text-cyan-500">{user.email}</p>
        <div className="online avatar">
          <div className="w-10 rounded-full">
            <Image
              alt="user profile picture"
              src={user.image as string}
              width={40}
              height={40}
            />
          </div>
        </div>
      </div>
      <div
        ref={msgsRef}
        className="max-h-[calc(100%-112px)] w-full flex-1 overflow-auto px-2 pb-8"
      >
        {messagesQuery.isLoading ? (
          <p className="mt-auto text-center font-semibold text-slate-100 opacity-10">
            Loading chat ...
          </p>
        ) : messages.length ? (
          messages?.map((msg) => <Message key={msg.id} msg={msg} user={user} />)
        ) : (
          <p className="mt-auto text-center font-semibold text-slate-100 opacity-10">
            Chat is empty
          </p>
        )}
      </div>
      <div
        className="flex h-12 w-full"
        onKeyDown={(e) =>
          e.key === "Enter" && !sendMsgMutation.isLoading && handleSendMsg()
        }
      >
        <input
          className="flex-1 bg-slate-300 px-2 text-lg text-black"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button
          onClick={handleSendMsg}
          className="btn w-24 rounded-none"
          disabled={sendMsgMutation.isLoading}
        >
          {sendMsgMutation.isLoading ? "sending..." : "send"}
        </button>
      </div>
    </div>
  );
};

const Message = ({ msg, user }: { msg: UserMessage; user: User }) => {
  if (!user) return null;
  return (
    <>
      {user.id === msg.userId ? (
        <div className="chat chat-end">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <Image
                alt="user profile picture"
                src={msg.User.image as string}
                width={40}
                height={40}
              />
            </div>
          </div>
          <div className="chat-bubble break-all">{msg.body}</div>
          <div className="chat-footer opacity-50">
            <time className="text-xs opacity-50">
              {formateDate(msg.createdAt)}
            </time>
          </div>
        </div>
      ) : (
        <div className="chat chat-start">
          <div className="chat-image avatar">
            <div className="w-10 rounded-full">
              <Image
                alt="user profile picture"
                src={msg.User.image as string}
                width={40}
                height={40}
              />
            </div>
          </div>
          <div className="chat-header opacity-50">{msg.User.name}</div>
          <div className="chat-bubble break-all">{msg.body}</div>
          <div className="chat-footer opacity-50">
            {formateDate(msg.createdAt)}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;

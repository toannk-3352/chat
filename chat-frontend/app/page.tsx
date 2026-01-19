import ChatList from "@/components/ChatList";
import CreateChatForm from "@/components/CreateChatForm";
import Header from "@/components/Header";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Header user={session?.user} />

      <main className="flex flex-1 items-center justify-center">
        <div className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              {session
                ? `Welcome back, ${session.user.name}!`
                : "Welcome to Chat App"}
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {session
                ? "You are logged in. Start chatting with your friends!"
                : "Please login to start chatting."}
            </p>
            {session ? <CreateChatForm /> : null}
            {session ? <ChatList /> : null}
          </div>
        </div>
      </main>
    </div>
  );
}

import ChatList from "@/components/ChatList";
import CreateChatForm from "@/components/CreateChatForm";
import Header from "@/components/Header";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="chat-shell flex flex-col">
      <Header user={session?.user} />

      {session ? (
        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pb-8 pt-6">
          <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <ChatList />

            <main className="min-h-[70vh] overflow-y-auto">
              <div className="flex h-full items-center justify-center p-6">
                <CreateChatForm />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
          <div className="chat-panel w-full max-w-3xl rounded-3xl px-10 py-14 sm:px-12">
            <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Real-time Workspace
              </span>
              <h1 className="max-w-md text-4xl font-semibold leading-[1.1] tracking-tight">
                Welcome to your chat workspace
              </h1>
              <p className="max-w-lg text-lg leading-8 text-muted-foreground">
                Sign in to create new conversations, see active rooms, and keep your team in sync.
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

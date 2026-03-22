import ChatDetails from "@/components/ChatDetails";
import ChatList from "@/components/ChatList";
import Header from "@/components/Header";
import { getSession } from "@/lib/session";
import { decodeJwt } from "jose";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  const { id: chatId } = await params;
  const fallbackUserId = session?.accessToken
    ? Number(decodeJwt(session.accessToken).sub ?? NaN)
    : null;

  return (
    <div className="chat-shell flex flex-col">
      <Header user={session?.user} />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pb-8 pt-6">
        <div className="grid flex-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ChatList />

          <main className="min-h-[70vh] overflow-hidden">
            <ChatDetails
              chatId={chatId}
              currentUserId={session?.user?.id ?? fallbackUserId ?? null}
              accessToken={session?.accessToken ?? null}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

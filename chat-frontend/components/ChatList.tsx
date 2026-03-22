"use client";

import { useEffect, useState } from "react";
import { getChatsAction } from "@/lib/actions/chat";
import { useRouter, useParams } from "next/navigation";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

type Participant = {
  id: number;
  name: string;
  email: string;
};

type Message = {
  sender: number;
  content: string;
  timestamp: Date | string;
};

type Chat = {
  _id: string;
  title?: string;
  participants: Participant[];
  messages: Message[];
  createdAt?: string;
};

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const params = useParams();
  const activeChatId = params.id as string;

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChatsAction();
      console.log("Chats data:", data);
      setChats(data || []);
    } catch (err) {
      setError("Failed to load chats");
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getChatTitle = (participants: Participant[]) => {
    if (participants.length === 0) return "Unknown Chat";
    if (participants.length === 1) return participants[0].name;
    return participants.map(p => p.name).join(", ");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const filteredChats = chats.filter((chat) => {
    const chatTitle = chat.title || getChatTitle(chat.participants);
    return chatTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="chat-panel flex items-center justify-center rounded-3xl p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-panel rounded-3xl p-4 text-destructive">
        {error}
        <button
          onClick={loadChats}
          className="ml-4 text-sm underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="chat-panel flex h-full flex-col items-center justify-center rounded-3xl p-8 text-center text-muted-foreground">
        <p className="text-lg font-medium">No chats yet</p>
        <p className="text-sm mt-2">Start a conversation to see it here</p>
      </div>
    );
  }

  return (
    <div className="chat-panel flex h-full w-full flex-col rounded-3xl">
      <div className="border-b border-white/60 px-5 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Inbox</h2>
            <p className="text-xs text-muted-foreground">
              {filteredChats.length} active {filteredChats.length === 1 ? "room" : "rooms"}
            </p>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Live
          </div>
        </div>
        <div className="mt-4">
          <InputGroup className="bg-white/70">
            <InputGroupAddon align="inline-start">
              <Search className="w-4 h-4" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 pt-2">
        {filteredChats.map((chat) => {
          const otherParticipants = chat.participants;
          const chatTitle = chat.title || getChatTitle(otherParticipants);
          const lastMessage =
            chat.messages && chat.messages.length > 0
              ? chat.messages[chat.messages.length - 1]
              : null;

          return (
            <div
              key={chat._id}
              onClick={() => handleChatClick(chat._id)}
              className={`mx-2 mb-2 flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-all hover:-translate-y-0.5 hover:bg-white/80 ${
                activeChatId === chat._id ? "bg-white/90 shadow-sm" : "bg-white/40"
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {otherParticipants.length === 1 ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold shadow-sm">
                    {getInitials(otherParticipants[0].name)}
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-primary-foreground font-semibold text-sm">
                    {otherParticipants.length}
                  </div>
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-0.5">
                  <h3 className="text-sm font-semibold truncate text-foreground">{chatTitle}</h3>
                  {lastMessage && (
                    <span className="text-[11px] text-muted-foreground ml-2 flex-shrink-0">
                      {new Date(lastMessage.timestamp).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                  )}
                </div>

                {/* Last message preview */}
                {lastMessage ? (
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic truncate">
                    No messages yet
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getChatsAction } from "@/lib/actions/chat";

type Participant = {
  id: number;
  name: string;
  email: string;
};

type Chat = {
  _id: string;
  participants: Participant[];
  messages: any[];
  createdAt?: string;
};

export default function ChatList() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChatsAction();
      console.log("Chats data:", data);
      setChats(data);
    } catch (err) {
      setError("Failed to load chats");
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipants = (participants: Participant[], currentUserId?: number) => {
    return participants.filter(p => p.id !== currentUserId);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
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
      <div className="p-8 text-center text-gray-500">
        <p className="text-lg font-medium">No chats yet</p>
        <p className="text-sm mt-2">Start a conversation to see it here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-bold text-gray-900">Chats</h2>
        <p className="text-sm text-gray-500">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {chats.map((chat) => {
          const otherParticipants = chat.participants;
          const chatTitle = getChatTitle(otherParticipants);
          const lastMessage = chat.messages && chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1] 
            : null;

          return (
            <div
              key={chat._id}
              className="p-4 border-b bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {otherParticipants.length === 1 ? (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                      {getInitials(otherParticipants[0].name)}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-semibold text-xs">
                      {otherParticipants.length}+
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chatTitle}
                    </h3>
                    {lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {new Date(lastMessage.timestamp).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  {/* Participants emails */}
                  <p className="text-sm text-gray-500 truncate">
                    {otherParticipants.map(p => p.email).join(", ")}
                  </p>

                  {/* Last message preview */}
                  {lastMessage ? (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic mt-1">
                      No messages yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

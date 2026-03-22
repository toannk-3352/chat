"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getChatDetailsAction } from "@/lib/actions/chat";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Loader2, Send, Smile, Image as ImageIcon, Phone, Video, Info } from "lucide-react";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";

type User = {
  id: number;
  name: string;
  email: string;
};

type Message = {
  _id?: string;
  sender: User;
  content: string;
  timestamp: Date | string;
};

type ChatDetails = {
  _id: string;
  title?: string;
  participants: User[];
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
};

export default function ChatDetails({ 
  chatId, 
  currentUserId,
  accessToken,
}: { 
  chatId: string;
  currentUserId: number | null;
  accessToken: string | null;
}) {
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const participantsRef = useRef<User[]>([]);

  useEffect(() => {
    loadChatDetails();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getChatDetailsAction(chatId);
      console.log("Chat details:", data);
      setChat(data);
      participantsRef.current = data?.participants || [];
    } catch (err) {
      setError("Failed to load chat details");
      console.error("Error loading chat details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketRef.current?.emit("typing", { chatId, isTyping: false });
    socketRef.current?.emit("sendMessage", {
      chatId,
      content: messageInput.trim(),
    });
    setMessageInput("");
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== "string") return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getChatTitle = (participants: User[]) => {
    if (participants.length === 0) return "Unknown Chat";
    if (participants.length === 1) return participants[0].name;
    return participants.map((p) => p.name).join(", ");
  };

  const isMyMessage = (senderId: number) => {
    return currentUserId === senderId;
  };

  const getSender = (senderId: number) => {
    return participantsRef.current.find((participant) => participant.id === senderId);
  };

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("joinChat", { chatId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("newMessage", (payload: { chatId: string; message: { sender: number; content: string; timestamp: string } }) => {
      if (payload.chatId !== chatId) return;
      const sender = getSender(payload.message.sender);
      setChat((prev) => {
        if (!prev) return prev;
        const nextMessage: Message = {
          sender: sender || { id: payload.message.sender, name: "Unknown", email: "" },
          content: payload.message.content,
          timestamp: payload.message.timestamp,
        };
        return {
          ...prev,
          messages: [...prev.messages, nextMessage],
        };
      });
    });

    socket.on("userTyping", (payload: { chatId: string; userId: number; isTyping: boolean }) => {
      if (payload.chatId !== chatId || payload.userId === currentUserId) return;
      setTypingUsers((prev) => {
        if (payload.isTyping) {
          return prev.includes(payload.userId) ? prev : [...prev, payload.userId];
        }
        return prev.filter((id) => id !== payload.userId);
      });
    });

    return () => {
      socket.emit("leaveChat", { chatId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, chatId, currentUserId]);

  const handleTyping = (value: string) => {
    setMessageInput(value);
    if (!socketRef.current) return;
    socketRef.current.emit("typing", { chatId, isTyping: true });
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("typing", { chatId, isTyping: false });
    }, 800);
  };

  if (loading) {
    return (
      <div className="chat-panel flex h-full items-center justify-center rounded-3xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !chat) {
    return (
      <div className="chat-panel flex h-full items-center justify-center rounded-3xl">
        <Card className="p-8 text-center">
          <p className="font-medium text-destructive">{error || "Chat not found"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-panel flex h-full flex-col overflow-hidden rounded-3xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-white/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {getInitials(getChatTitle(chat.participants))}
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {chat.title || getChatTitle(chat.participants)}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" : "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]"}`}
              />
              {isConnected ? "Live now" : "Connecting"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/70 hover:bg-white">
            <Phone className="h-4 w-4 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/70 hover:bg-white">
            <Video className="h-4 w-4 text-primary" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-white/70 hover:bg-white">
            <Info className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <h3 className="mb-1 text-lg font-bold">{getChatTitle(chat.participants)}</h3>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-5">
            {chat.messages.map((message, index) => {
              const isMine = isMyMessage(message.sender.id);
              const showAvatar = index === 0 || 
                chat.messages[index - 1].sender.id !== message.sender.id;
              
              return (
                <div
                  key={message._id || index}
                  className={`flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!isMine && (
                    <div className="flex-shrink-0">
                      {showAvatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {getInitials(message.sender.name)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>
                  )}
                  
                  <div className={`flex max-w-[72%] flex-col ${isMine ? "items-end" : "items-start"}`}>
                    {showAvatar && !isMine && (
                      <span className="mb-1 px-3 text-xs text-muted-foreground">
                        {message.sender.name}
                      </span>
                    )}
                    <div
                      className={`rounded-3xl px-4 py-2.5 text-sm shadow-sm ${
                        isMine
                          ? "bg-gradient-to-br from-primary via-teal-500 to-emerald-500 text-primary-foreground"
                          : "bg-white/90 text-foreground ring-1 ring-white/70"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <span className="mt-1 px-3 text-[11px] text-muted-foreground">
                      {new Date(message.timestamp).toLocaleString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.7)]" />
                {typingUsers
                  .map((id) => getSender(id)?.name || "Someone")
                  .join(", ")}{" "}
                typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-white/60 px-5 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/70 text-primary hover:bg-white"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full bg-white/70 text-primary hover:bg-white"
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Input
            type="text"
            placeholder="Send a message..."
            value={messageInput}
            onChange={(e) => handleTyping(e.target.value)}
            className="flex-1 rounded-full border border-white/70 bg-white/70 px-4"
          />

          <Button
            type="submit"
            size="icon"
            disabled={!messageInput.trim()}
            className="h-9 w-9 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

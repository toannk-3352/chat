"use server";

import { getSession } from "../session";
import { createChat, getChats } from "./../api/api";

export async function createChatAction(participants: string[]) {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const data = await createChat(session.accessToken, participants);
    console.log("data", data);
    return data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

export async function getChatsAction() {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const data = await getChats(session.accessToken);
    console.log("first", data);
    return data;
  } catch (error) {
    console.error("Get chats error:", error);
    throw error;
  }
}

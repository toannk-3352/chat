import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:3002";

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
};

export const register = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    console.log("Attempting registration with:", { name, email });

    const response = await axios.post(
      `${API_URL}/auth/register`,
      {
        name,
        email,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Registration error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      return {
        error: error.response?.data?.message || "Registration failed",
      };
    }
    console.error("Unexpected error:", error);
    return { error: "Registration failed" };
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get user profile error:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  token: string,
  data: { name?: string; password?: string }
) => {
  try {
    const response = await axios.patch(`${API_URL}/users/me`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Update user profile error:", error);
    throw error;
  }
};

export const createChat = async (token: string, participants: string[]) => {
  try {
    console.log("first");
    const response = await axios.post(
      `${API_URL}/chat`,
      { participants: participants },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Create chat error:", error);
    throw error;
  }
};

export const getChats = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getChatDetails = async (token: string, chatId: string) => {
  try {
    const response = await axios.get(`${API_URL}/chat/${chatId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get chat details error:", error);
    throw error;
  }
};

export const searchUsers = async (token: string, query: string) => {
  try {
    const response = await axios.get(`${API_URL}/users/search`, {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Search users error:", error);
    throw error;
  }
};

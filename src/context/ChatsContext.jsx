import { createContext, useContext, useState, useCallback } from "react";
import { chatsAPI } from "../api/api";

const ChatsContext = createContext(null);

export const ChatsProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await chatsAPI.getConversations();
      setConversations(res.data.data ?? []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const startConversation = useCallback(async (targetUserId) => {
    const res = await chatsAPI.getOrCreateConversation(targetUserId);
    const conversation = res.data.data;
    setConversations((prev) => {
      const exists = prev.find((c) => c.conversation_id === conversation.id);
      if (exists) return prev;
      return [{ conversation_id: conversation.id, ...conversation }, ...prev];
    });
    return conversation;
  }, []);

  return (
    <ChatsContext.Provider
      value={{
        conversations,
        loadingConversations,
        fetchConversations,
        startConversation,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = () => {
  const context = useContext(ChatsContext);
  if (!context) throw new Error("useChats must be used within a ChatsProvider");
  return context;
};

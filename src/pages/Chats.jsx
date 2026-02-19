import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatDetailComponent from "../components/ChatDetailComponent";
import { useChats } from "../context/ChatsContext";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  } else {
    return date.toLocaleDateString([], { day: "2-digit", month: "short" });
  }
}

export default function Chats() {
  const { conversations, loadingConversations, fetchConversations } =
    useChats();
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [selectedConvId, setSelectedConvId] = useState(conversationId || null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Sync selectedConvId with URL params
  useEffect(() => {
    setSelectedConvId(conversationId || null);
  }, [conversationId]);

  const handleSelectConversation = (convId) => {
    navigate(`/chats/${convId}`);
  };

  const handleCloseChat = () => {
    navigate("/chats");
  };

  return (
    <section className="h-screen bg-gray-950 flex overflow-hidden">
      {/* Sidebar */}
      <div className="max-md:hidden max-lg:w-16 w-1/6 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Conversations List */}
      <div
        className={`flex flex-col ${selectedConvId ? "max-lg:hidden" : ""} w-full max-w-xl border-x border-gray-700 flex-shrink-0`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-3">
          <i className="fa-solid fa-message text-white text-xl"></i>
          <h1 className="text-white text-xl font-semibold">Messages</h1>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loadingConversations ? (
            <div className="flex justify-center items-center mt-16">
              <i className="fa-solid fa-spinner fa-spin text-gray-400 text-2xl"></i>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-24 text-gray-500 gap-3">
              <i className="fa-regular fa-comment-dots text-5xl"></i>
              <p className="text-lg">No conversations yet</p>
              <p className="text-sm text-gray-600">
                Go to a user's profile to start chatting
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.conversation_id}
                onClick={() => handleSelectConversation(conv.conversation_id)}
                className={`w-full flex items-center gap-4 px-5 py-4 transition-colors border-b border-gray-800 text-left ${
                  selectedConvId === conv.conversation_id
                    ? "bg-gray-800"
                    : "hover:bg-gray-900"
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {conv.other_user_avatar ? (
                    <img
                      src={conv.other_user_avatar}
                      alt={conv.other_user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-lg">
                      {conv.other_user_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-medium truncate">
                      {conv.other_user_name}
                    </p>
                    <span className="text-gray-500 text-xs flex-shrink-0 ml-2">
                      {formatTime(conv.last_message_at)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate mt-0.5">
                    {conv.last_message ?? (
                      <span className="italic text-gray-600">
                        No messages yet
                      </span>
                    )}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Detail Component */}
      {selectedConvId && (
        <ChatDetailComponent
          conversationId={selectedConvId}
          onClose={handleCloseChat}
        />
      )}

      {/* Right placeholder for large screens */}
      {!selectedConvId && (
        <div className="flex-1 hidden lg:flex items-center justify-center text-gray-700">
          <div className="flex flex-col items-center gap-3">
            <i className="fa-regular fa-comment-dots text-6xl"></i>
            <p className="text-lg">Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </section>
  );
}

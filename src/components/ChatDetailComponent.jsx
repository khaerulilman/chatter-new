import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useChats } from "../context/ChatsContext";
import { chatsAPI } from "../api/api";

export default function ChatDetailComponent({ conversationId, onClose }) {
  const { user } = useAuth();
  const { conversations } = useChats();

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // Find current conversation info (other user) from context
  const currentConv = conversations.find(
    (c) => c.conversation_id === conversationId,
  );

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    try {
      const res = await chatsAPI.getMessages(conversationId);
      setMessages(res.data.data ?? []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages load/change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setSending(true);
    try {
      const formData = new FormData();
      if (content.trim()) formData.append("content", content.trim());
      if (mediaFile) formData.append("media", mediaFile);

      const res = await chatsAPI.sendMessage(conversationId, formData);
      const newMsg = res.data.data;

      setMessages((prev) => [...prev, newMsg]);
      setContent("");
      clearMedia();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateSeparator = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const day = new Date(msg.created_at).toDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex flex-col flex-1 border-x border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-700 bg-gray-950 flex-shrink-0">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors lg:hidden"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>

        {currentConv?.other_user_avatar ? (
          <img
            src={currentConv.other_user_avatar}
            alt={currentConv.other_user_name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
            {currentConv?.other_user_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}

        <div>
          <p className="text-white font-semibold leading-tight">
            {currentConv?.other_user_name ?? "Loading..."}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-1">
        {loadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <i className="fa-solid fa-spinner fa-spin text-gray-400 text-2xl"></i>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
            <i className="fa-regular fa-comment-dots text-5xl"></i>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([day, dayMsgs]) => (
            <div key={day}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-800"></div>
                <span className="text-gray-500 text-xs">
                  {formatDateSeparator(dayMsgs[0].created_at)}
                </span>
                <div className="flex-1 h-px bg-gray-800"></div>
              </div>

              {dayMsgs.map((msg, idx) => {
                const isMe = msg.sender_id === user?.id;
                const prevMsg = idx > 0 ? dayMsgs[idx - 1] : null;
                const showAvatar =
                  !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 mb-1 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {/* Other user avatar */}
                    {!isMe && (
                      <div className="w-7 h-7 flex-shrink-0 mb-1">
                        {showAvatar ? (
                          msg.sender_avatar ? (
                            <img
                              src={msg.sender_avatar}
                              alt={msg.sender_name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                              {msg.sender_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          )
                        ) : null}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-xs lg:max-w-md space-y-1 ${isMe ? "items-end" : "items-start"} flex flex-col`}
                    >
                      {msg.media_url && (
                        <img
                          src={msg.media_url}
                          alt="media"
                          className={`rounded-xl max-w-xs object-cover cursor-pointer ${
                            isMe ? "rounded-br-sm" : "rounded-bl-sm"
                          }`}
                          onClick={() => window.open(msg.media_url, "_blank")}
                        />
                      )}
                      {msg.content && (
                        <div
                          className={`px-4 py-2 rounded-2xl text-sm break-words ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-gray-800 text-gray-100 rounded-bl-sm"
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}
                      <span className="text-gray-600 text-xs px-1">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Media preview */}
      {mediaPreview && (
        <div className="px-4 py-2 border-t border-gray-700 flex items-center gap-3">
          <div className="relative inline-block">
            <img
              src={mediaPreview}
              alt="preview"
              className="h-20 w-20 object-cover rounded-xl"
            />
            <button
              onClick={clearMedia}
              className="absolute -top-2 -right-2 bg-gray-700 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-4 py-3 border-t border-gray-700 bg-gray-950 flex-shrink-0"
      >
        {/* Image upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
        >
          <i className="fa-solid fa-image text-xl"></i>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          className="flex-1 bg-gray-800 text-white rounded-2xl px-4 py-2.5 text-sm resize-none outline-none placeholder-gray-500 max-h-32 overflow-y-auto scrollbar-hide"
        />

        {/* Send button */}
        <button
          type="submit"
          disabled={sending || (!content.trim() && !mediaFile)}
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
        >
          {sending ? (
            <i className="fa-solid fa-spinner fa-spin text-sm"></i>
          ) : (
            <i className="fa-solid fa-paper-plane text-sm"></i>
          )}
        </button>
      </form>
    </div>
  );
}

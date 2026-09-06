import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";

export const useChatConversation = (docId) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const fetchChatHistory = useCallback(async () => {
    if (!docId) return;

    setIsLoadingHistory(true);

    try {
      const response = await api.get(`/chat/${docId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch history", error);
      toast.error("Failed to load chat history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, [docId]);

  useEffect(() => {
    void Promise.resolve().then(() => fetchChatHistory());
  }, [fetchChatHistory]);

  const handleSend = useCallback(
    async (event) => {
      event.preventDefault();

      if (!input.trim() || isTyping) return;

      const userMessage = { role: "user", content: input };
      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setInput("");
      setIsTyping(true);

      try {
        const response = await api.post("/chat", {
          message: userMessage.content,
          docId,
        });

        const aiMessage = {
          role: "ai",
          content: response.data.reply,
          context: response.data.context,
        };

        setMessages((currentMessages) => [...currentMessages, aiMessage]);
      } catch (error) {
        console.error("Chat error", error);
        toast.error(
          error.response?.data?.message ||
            "Failed to get a response. Please try again.",
        );
        setMessages((currentMessages) => [
          ...currentMessages,
          {
            role: "ai",
            content:
              "Sorry, I encountered an error. Please try sending your message again.",
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [docId, input, isTyping],
  );

  return {
    messages,
    input,
    setInput,
    isTyping,
    isLoadingHistory,
    messagesEndRef,
    handleSend,
  };
};

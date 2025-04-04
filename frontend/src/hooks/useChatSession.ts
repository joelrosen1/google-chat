import { useState, useEffect, useCallback, useRef } from "react";

import { SearchResult } from "@/components/chat/Chat";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  results?: SearchResult;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

// Utility functions
const generateId = (): string => Math.random().toString(36).substring(2, 10);

const getChatTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find((m) => m.role === "user");
  if (firstUserMessage) {
    const title = firstUserMessage.content.slice(0, 30);
    return title.length < firstUserMessage.content.length ? `${title}...` : title;
  }
  return "New Chat";
};

export const useChatSessions = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [updatingTitleId, setUpdatingTitleId] = useState<string | null>(null);
  const [typingTitle, setTypingTitle] = useState<string>("");

  // Refs for managing typing animation timers
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleans up any typing animation timers and resets title states.
  const cleanupTypingAnimation = useCallback((): void => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    setTypingTitle("");
    setUpdatingTitleId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupTypingAnimation();
    };
  }, [cleanupTypingAnimation]);

  // Create a new chat session
  const createNewSession = useCallback((): void => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
  }, []);

  // Load sessions from localStorage when component mounts
  useEffect(() => {
    const savedSessions = localStorage.getItem("chat-sessions");
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions) as ChatSession[];
      setSessions(parsedSessions);
      if (parsedSessions.length > 0) {
        const [mostRecent] = parsedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
        setActiveSessionId(mostRecent.id);
        setMessages(mostRecent.messages);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, [createNewSession]);

  // Save sessions to localStorage whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("chat-sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  // Update the active session when messages change
  useEffect(() => {
    if (activeSessionId && messages.length > 0) {
      updateSession(activeSessionId, messages);
    }
  }, [messages, activeSessionId]);

  // Updates the session with new messages and handles title updates with animation.
  const updateSession = (sessionId: string, newMessages: ChatMessage[]): void => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === sessionId) {
          const shouldUpdateTitle = session.title === "New Chat" && newMessages.length > 0;
          if (shouldUpdateTitle) {
            // Clean up any existing typing animation
            cleanupTypingAnimation();

            const newTitle = getChatTitle(newMessages);
            setUpdatingTitleId(sessionId);
            setTypingTitle("");

            // Animate typing the title
            let currentIndex = 0;
            typingIntervalRef.current = setInterval(() => {
              if (currentIndex < newTitle.length) {
                setTypingTitle((prev) => prev + newTitle[currentIndex]);
                currentIndex++;
              } else {
                clearInterval(typingIntervalRef.current!);
                typingIntervalRef.current = null;
                typingTimeoutRef.current = setTimeout(() => {
                  cleanupTypingAnimation();
                }, 500);
              }
            }, 50);
          }
          return {
            ...session,
            title: shouldUpdateTitle ? getChatTitle(newMessages) : session.title,
            messages: newMessages,
            updatedAt: Date.now(),
          };
        }
        return session;
      })
    );
  };

  // Switch to a different chat session.
  const switchSession = (sessionId: string): void => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setActiveSessionId(sessionId);
      setMessages(session.messages);
    }
  };

  // Delete a session and update active session accordingly.
  const deleteSession = (sessionId: string): void => {
    setSessions((prevSessions) => {
      const remainingSessions = prevSessions.filter((s) => s.id !== sessionId);
      if (sessionId === activeSessionId) {
        if (remainingSessions.length > 0) {
          const [nextSession] = remainingSessions;
          setActiveSessionId(nextSession.id);
          setMessages(nextSession.messages);
        } else {
          createNewSession();
        }
      }
      return remainingSessions;
    });
  };

  // Handle sending a message and fetching search results with retries.
  const handleSendMessage = async (query: string): Promise<void> => {
    // Ensure there's an active session
    if (sessions.length === 0) {
      createNewSession();
    }
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setIsLoading(true);

    const maxRetries = 3;
    let retryCount = 0;
    let success = false;

    while (retryCount < maxRetries && !success) {
      try {
        const response = await fetch(
          `https://${process.env.NEXT_PUBLIC_API_URL}/api/v1/search?query=${encodeURIComponent(query)}`
        );
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();

        const safeData = {
          organic_results: Array.isArray(data.organic_results) ? data.organic_results : [],
          knowledge_graph: data.knowledge_graph || null,
          related_questions: Array.isArray(data.related_questions) ? data.related_questions : [],
          related_searches: Array.isArray(data.related_searches) ? data.related_searches : [],
          ai_response:
            data.ai_response || `I searched for "${query}" but couldn't generate a good summary.`,
          local_results: Array.isArray(data.local_results) ? data.local_results : [],
        };

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: safeData.ai_response, results: safeData },
        ]);
        success = true;
      } catch (error) {
        retryCount++;
        console.error(`Search attempt ${retryCount} failed:`, error);
        if (retryCount >= maxRetries) {
          console.error("All retry attempts failed:", error);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "I'm having trouble connecting to the search service. This might be due to rate limiting or a temporary issue. Please try again in a moment.",
            },
          ]);
        } else {
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } finally {
        if (success || retryCount >= maxRetries) {
          setIsLoading(false);
        }
      }
    }
  };

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    createNewSession,
    switchSession,
    deleteSession,
    handleSendMessage,
    setMessages,
    updatingTitleId,
    typingTitle,
  };
};

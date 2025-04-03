import { User } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AssistantMessage } from "@/components/chat/AssistantMessage";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "../ui/input";

export interface SearchResult {
  organic_results: {
    title: string;
    link: string;
    snippet: string;
  }[];
  knowledge_graph: {
    title: string;
    description: string;
    image?: string;
    images?: {
      original: string;
      thumbnail: string;
      title?: string;
      source?: string;
    }[];
  } | null;
  related_questions: { question: string }[];
  related_searches: { query: string }[];
  local_results?: {
    title: string;
    address: string;
    rating: number;
    reviews: number;
    gps_coordinates: {
      latitude: number;
      longitude: number;
    };
  }[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  results?: SearchResult;
}

interface ChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export function Chat({ messages, isLoading, onSendMessage }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageIndex, setLastMessageIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState<string>("");

  const scrollToLatestMessage = useCallback(() => {
    const messageElements = document.querySelectorAll("[data-message-item]");
    if (messageElements.length > 0) {
      const lastAssistantMessageIndex = messages.length - 1;
      const userMessageIndex =
        lastAssistantMessageIndex > 0 ? lastAssistantMessageIndex - 1 : 0;

      if (
        messages[lastAssistantMessageIndex]?.role === "assistant" &&
        messages[userMessageIndex]?.role === "user" &&
        messageElements[userMessageIndex]
      ) {
        messageElements[userMessageIndex].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        const lastMessage = messageElements[messageElements.length - 1];
        lastMessage.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > lastMessageIndex) {
      setLastMessageIndex(messages.length);
      setTimeout(scrollToLatestMessage, 100);
    }
  }, [messages, lastMessageIndex, scrollToLatestMessage]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const message = formData.get("message") as string;
      if (message.trim()) {
        onSendMessage(message);
        e.currentTarget.reset();
        setInputValue("");
      }
    },
    [onSendMessage]
  );

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 pb-6 max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-500">
                <h3 className="text-xl font-medium mb-2">
                  Start a new conversation
                </h3>
                <p className="text-sm">Ask anything about any topic...</p>
              </div>
            </div>
          ) : (
            messages.map((message, i) => (
              <div
                key={i}
                className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500"
                data-message-item
              >
                <div className="flex items-start gap-3 mb-2">
                  {message.role === "assistant" ? (
                    <Avatar>
                      <AvatarImage src="https://www.stack-ai.com/_next/static/media/social-media-avatar.bb2bc4ea.png" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex-shrink-0 bg-gray-200 p-2 rounded-full">
                      <User size={16} />
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="font-medium">
                      {message.role === "user" ? "You" : "Assistant"}
                    </div>
                    {message.role === "assistant" && message.results ? (
                      <AssistantMessage
                        message={message}
                        onRelatedClick={onSendMessage}
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {message.content.includes(
                          "I'm having trouble connecting"
                        ) ? (
                          <div className="bg-red-50 p-3 rounded-2xl border border-red-200">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 text-red-500">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-red-700">
                                  {message.content}
                                </p>
                                <div className="mt-2 text-xs text-red-600">
                                  <p>Possible causes:</p>
                                  <ul className="mt-1 list-disc list-inside">
                                    <li>
                                      The search API might be experiencing high traffic
                                    </li>
                                    <li>
                                      Rate limits on the search service may have been reached
                                    </li>
                                    <li>
                                      There could be network connectivity issues
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Avatar>
                <AvatarImage src="https://www.stack-ai.com/_next/static/media/social-media-avatar.bb2bc4ea.png" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">Assistant</div>
                <div className="animate-pulse mt-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="px-4 pb-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 space-x-2 max-w-3xl mx-auto">
            <Input
              name="message"
              placeholder="Write a message..."
              className="flex-1 text-sm border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className={`p-2 border border-gray-300 rounded-full transition-colors ${
                inputValue.trim()
                  ? "bg-black hover:bg-black/90 text-white"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              aria-label="Send Message"
              disabled={isLoading || !inputValue.trim()}
            >
              <svg
                xmlns="http://www.w3.org/3000/svg"
                className="w-4 h-4 transform rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m0 0l-6-6m6 6l6-6"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

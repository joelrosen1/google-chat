"use client";

import { Trash, Edit } from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { Chat } from "@/components/chat/Chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatSessions } from "@/hooks/useChatSession";

export default function Home() {
  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    createNewSession,
    switchSession,
    deleteSession,
    handleSendMessage,
    updatingTitleId,
    typingTitle,
  } = useChatSessions();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Toggle the sidebar collapsed state
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <main className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-0'} border-r bg-white flex flex-col transition-all duration-300 ease-in-out`}>
        <div className={`${sidebarOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <ScrollArea className="flex-1">
            <div className="p-1 space-y-1">
              {/* Render each session */}
              {sessions.map((session) => (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => switchSession(session.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    switchSession(session.id);
                  }
                }}
                className={`relative flex items-center w-full cursor-pointer rounded px-2 py-1 transition-colors ${
                  session.id === activeSessionId ? "bg-secondary" : "hover:bg-muted"
                }`}
              >
                <span className="absolute left-0 top-0 bottom-0 right-10 flex items-center text-sm truncate pointer-events-none pl-4">
                  {session.id === updatingTitleId ? (
                    <>
                      {typingTitle}
                      <span className="inline-block animate-blink">|</span>
                    </>
                  ) : (
                    session.title
                  )}
                </span>
                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    aria-label="Delete chat"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-white p-2 flex items-center shadow-sm">
          <div className="flex items-center gap-2">
            
            {/* Sidebar toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <div className="w-4 space-y-1">
                <span className="block w-full h-0.5 bg-current"></span>
                <span className="block w-full h-0.5 bg-current"></span>
                <span className="block w-full h-0.5 bg-current"></span>
              </div>
            </Button>
            {/* Writing icon */}
            <Button
              variant="ghost"
              size="icon"
              onClick={createNewSession}
              aria-label="New Chat"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {/* Title */}
            <h1 className="text-lg font-bold">Google Chat</h1>
            
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden pt-2">
          <Chat
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
          <div ref={chatEndRef} />
        </div>
      </div>
    </main>
  );
}

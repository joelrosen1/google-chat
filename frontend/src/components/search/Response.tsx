import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ResponseProps {
  content: string;
  className?: string;
}

export const Response: React.FC<ResponseProps> = ({
  content,
  className = "",
}) => {
  return (
    <div
      className={`prose prose-sm max-w-none prose-ul:list-disc prose-ul:pl-4 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ className, children, ...props }) => (
            <a
              {...props}
              className={cn(
                "text-blue-600 hover:text-blue-800 transition-colors",
                className
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default Response;

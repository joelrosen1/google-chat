import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import ImageGallery from "@/components/search/ImageGallery";
import LocalResults from "@/components/search/LocalResults";
import RelatedQuestions from "@/components/search/RelatedQuestions";
import RelatedSearches from "@/components/search/RelatedSearches";
import { Response } from "@/components/search/Response";
import Sources from "@/components/search/Sources";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

import { ChatMessage } from "./Chat";

interface AssistantMessageProps {
  message: ChatMessage;
  onRelatedClick: (query: string) => void;
}

export function AssistantMessage({ message, onRelatedClick }: AssistantMessageProps) {
  const results = message.results;
  const isGoogleMapsLoaded = useGoogleMaps(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "");

  // Memoize the sources
  const sources = useMemo(() => {
    return results?.organic_results?.map((result) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
    })) || [];
  }, [results?.organic_results]);

  return (
    <div className="space-y-4">
      <Response content={message.content} />

      {results?.knowledge_graph?.images && results.knowledge_graph.images.length > 0 && (
        <ImageGallery images={results.knowledge_graph.images} title={results.knowledge_graph?.title} />
      )}

      {results?.local_results && results.local_results.length > 0 && (
        <LocalResults 
          localResults={results.local_results} 
          isGoogleMapsLoaded={isGoogleMapsLoaded} 
          content={message.content} 
        />
      )}

      {sources.length > 0 && <Sources sources={sources} />}

      {results && results.related_questions && results.related_questions.length > 0 && (
        <RelatedQuestions 
          relatedQuestions={results.related_questions} 
          onQuestionClick={onRelatedClick} 
        />
      )}

      {results && results.related_searches && results.related_searches.length > 0 && (
        <RelatedSearches 
          relatedSearches={results.related_searches} 
          onSearchClick={onRelatedClick} 
        />
      )}
    </div>
  );
}

import { ExternalLink } from "lucide-react";
import React from "react";

import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Source {
  title: string;
  link: string;
  snippet: string;
}

interface SourcesProps {
  sources: Source[];
}

const Sources: React.FC<SourcesProps> = ({ sources }) => {
  const [open, setOpen] = React.useState(false);

  if (!sources?.length) return null;

  const visibleSources = sources.slice(0, 3);
  const collapsedSources = sources.slice(3);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Results</h3>
      <div className="space-y-2">
        {visibleSources.map((source, index) => (
          <Card key={index} className="p-3 text-sm rounded-3xl">
            <a
              href={source.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex-shrink-0 mt-1">
                <ExternalLink size={12} />
              </div>
              <div>
                <div className="font-medium text-blue-600">{source.title}</div>
                <div className="text-gray-600 line-clamp-2 text-xs mt-1">
                  {source.snippet}
                </div>
              </div>
            </a>
          </Card>
        ))}

        {collapsedSources.length > 0 && (
          <Collapsible open={open} onOpenChange={setOpen}>
            {!open && (
              <CollapsibleTrigger asChild>
                <button className="text-sm font-medium text-blue-600">
                  Show {collapsedSources.length} more
                </button>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down">
              <div className="space-y-2 mt-2">
                {collapsedSources.map((source, index) => (
                  <Card key={index + 3} className="p-3 text-sm rounded-3xl">
                    <a
                      href={source.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <ExternalLink size={12} />
                      </div>
                      <div>
                        <div className="font-medium text-blue-600">{source.title}</div>
                        <div className="text-gray-600 line-clamp-2 text-xs mt-1">
                          {source.snippet}
                        </div>
                      </div>
                    </a>
                  </Card>
                ))}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-blue-600"
                >
                  Show less
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
};

export default Sources;

import React from "react";

interface RelatedSearch {
  query: string;
}

interface RelatedSearchesProps {
  relatedSearches: RelatedSearch[];
  onSearchClick: (query: string) => void;
}

const RelatedSearches: React.FC<RelatedSearchesProps> = ({ relatedSearches, onSearchClick }) => {
  const validRelatedSearches = relatedSearches.filter(item => item && item.query);
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Related Searches</h3>
      <div className="flex flex-wrap gap-2">
        {validRelatedSearches.map((item, index) => (
          <button
            key={index}
            onClick={() => onSearchClick(item.query)}
            className="px-3 py-1 text-sm bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
          >
            {item.query}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatedSearches;

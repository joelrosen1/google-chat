import React from "react";

interface RelatedQuestion {
  question: string;
}

interface RelatedQuestionsProps {
  relatedQuestions: RelatedQuestion[];
  onQuestionClick: (question: string) => void;
}

const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({ relatedQuestions, onQuestionClick }) => {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">People Also Ask</h3>
      <div className="space-y-2">
        {relatedQuestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(item.question)}
            className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            {item.question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelatedQuestions;

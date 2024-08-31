// app/technical/components/TechContentToggle.tsx
import React from 'react';

type TechContentType = 'projects' | 'blog';

interface TechContentToggleProps {
  activeContent: TechContentType;
  setActiveContent: (content: TechContentType) => void;
}

const TechContentToggle: React.FC<TechContentToggleProps> = ({ activeContent, setActiveContent }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-800 p-1 rounded-lg">
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeContent === 'projects' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => setActiveContent('projects')}
        >
          Projects
        </button>
        <button
          className={`px-4 py-2 rounded-md transition-colors ${
            activeContent === 'blog' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
          }`}
          onClick={() => setActiveContent('blog')}
        >
          Blog
        </button>
      </div>
    </div>
  );
};

export default TechContentToggle;
import React from 'react';
import Link from 'next/link';
import { FaExternalLinkAlt, FaYoutube } from 'react-icons/fa';

const ExternalLinksSection = () => {
  return (
    <div className="bg-amber-100 rounded-lg p-6 shadow-md my-8">
      <h2 className="text-2xl font-bold mb-4 text-amber-800">Connect With Me</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <FaExternalLinkAlt className="text-amber-600 mr-2" />
          <p className="text-lg">
            Visit my dedicated site at{' '}
            <Link 
              href="https://etmcollins.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              etmcollins.com
            </Link>
          </p>
        </div>
        <div className="flex items-center">
          <FaYoutube className="text-red-600 mr-2 text-xl" />
          <p className="text-lg">
            Check out my creative YouTube channel,{' '}
            <Link 
              href="https://www.youtube.com/channel/UCma7zuZag1X1u1m0Qd3deNw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ETM_Writes
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExternalLinksSection;
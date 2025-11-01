// app/creative/fiction/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import ReactMarkdown from 'react-markdown';
import { FaArrowLeft } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
type FictionPiece = {
  id: string;
  title: string;
  date: string;
  content: string;
  thumbnail?: string | null;
};
import { usePostContext } from '../PostContext';

const FictionPage: React.FC = () => {
  const [fictionPieces, setFictionPieces] = useState<FictionPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<FictionPiece | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();
  const { setIsPostOpen } = usePostContext();

  useEffect(() => {
    const fetchFictionPieces = async () => {
      try {
        const response = await fetch('/api/fictionPieces');
        if (!response.ok) {
          throw new Error('Failed to fetch fiction pieces');
        }
        const data: FictionPiece[] = await response.json();
        setFictionPieces(data);

        const pieceId = searchParams?.get('pieceId');
        if (pieceId) {
          const piece = data.find(p => p.id === pieceId);
          if (piece) {
            setSelectedPiece(piece);
          }
        }
      } catch (error) {
        console.error('Error fetching fiction pieces:', error);
      }
    };
    fetchFictionPieces();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams]);

  const openPiece = (piece: FictionPiece) => {
    setSelectedPiece(piece);
  };

  const closePiece = () => {
    setSelectedPiece(null);
  };
  

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Fiction</h1>
      <Masonry
        breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {fictionPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="bg-amber-50 rounded-lg shadow-md overflow-hidden m-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => openPiece(piece)}
          >
            {piece.thumbnail && (
              <img src={piece.thumbnail} alt={piece.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{piece.title}</h2>
              <p className="text-sm text-gray-500 mb-2">{piece.date}</p>
              <p className="text-gray-600 line-clamp-3">{piece.content.substring(0, 150)}...</p>
            </div>
          </motion.div>
        ))}
      </Masonry>

      <AnimatePresence>
        {selectedPiece && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"
            onClick={closePiece}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`bg-amber-50 rounded-lg p-8 overflow-y-auto ${
                isMobile ? 'w-full h-full' : 'w-2/3 max-h-[90vh]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {isMobile && (
                <button
                  onClick={closePiece}
                  className="mb-4 text-2xl"
                  aria-label="Close"
                >
                  <FaArrowLeft />
                </button>
              )}
              <h2 className="text-3xl font-bold mb-2">{selectedPiece.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedPiece.date}</p>
              <ReactMarkdown className="prose prose-lg max-w-none">
                {selectedPiece.content}
              </ReactMarkdown>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FictionPage;

// app/creative/art/page.tsx
"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { ArtPiece } from '../../api/artPieces/route';

const ArtPage: React.FC = () => {
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([]);
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);
  const [showTimelapse, setShowTimelapse] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchArtPieces = async () => {
      try {
        const response = await fetch('/api/artPieces');
        if (!response.ok) {
          throw new Error('Failed to fetch art pieces');
        }
        const data: ArtPiece[] = await response.json();
        setArtPieces(data);

        const pieceId = searchParams?.get('pieceId');
        if (pieceId) {
          const piece = data.find(p => p.id === pieceId);
          if (piece) {
            setSelectedPiece(piece);
          }
        }
      } catch (error) {
        console.error('Error fetching art pieces:', error);
      }
    };
    fetchArtPieces();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [searchParams]);

  const openPiece = (piece: ArtPiece) => {
    setSelectedPiece(piece);
    setShowTimelapse(false);
  };

  const closePiece = () => {
    setSelectedPiece(null);
    setShowTimelapse(false);
  };

  const toggleTimelapse = () => {
    setShowTimelapse(!showTimelapse);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Art Gallery</h1>
      <Masonry
        breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {artPieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="bg-amber-50 rounded-lg shadow-md overflow-hidden m-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => openPiece(piece)}
          >
            {piece.thumbnail && (
              <Image
                src={piece.thumbnail}
                alt={piece.title}
                width={300}
                height={300}
                layout="responsive"
                objectFit="cover"
                className="w-full h-64 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{piece.title}</h2>
              <p className="text-sm text-gray-500 mb-2">{piece.date}</p>
              <p className="text-gray-600 line-clamp-3">{piece.description}</p>
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
              <div className="mb-4">
                {showTimelapse && selectedPiece.timelapse ? (
                  selectedPiece.timelapse.endsWith('.gif') ? (
                    <Image
                      src={selectedPiece.timelapse}
                      alt={`${selectedPiece.title} timelapse`}
                      width={600}
                      height={400}
                      layout="responsive"
                      objectFit="contain"
                      className="rounded-lg"
                    />
                  ) : (
                    <video
                      src={selectedPiece.timelapse}
                      controls
                      className="w-full rounded-lg"
                    />
                  )
                ) : selectedPiece.artwork ? (
                  <Image
                    src={selectedPiece.artwork}
                    alt={selectedPiece.title}
                    width={600}
                    height={400}
                    layout="responsive"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                ) : null}
              </div>
              <p className="text-gray-700 mb-4">{selectedPiece.description}</p>
              {selectedPiece.timelapse && (
                <button
                  onClick={toggleTimelapse}
                  className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors flex items-center"
                >
                  <FaPlay className="mr-2" />
                  {showTimelapse ? 'View Artwork' : 'View Process Timelapse'}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtPage;
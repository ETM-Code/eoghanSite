// app/creative/art/page.tsx
"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';

// Mock data for art pieces
const artPieces = [
  { id: 1, title: 'Artwork 1', image: '/path-to-image1.jpg', timelapse: '/path-to-timelapse1.gif' },
  { id: 2, title: 'Artwork 2', image: '/path-to-image2.jpg', timelapse: '/path-to-timelapse2.gif' },
  // Add more art pieces here
];

const ArtPage = () => {
  const [selectedArt, setSelectedArt] = useState(null);
  const [showTimelapse, setShowTimelapse] = useState(false);

  const openArt = (art) => {
    setSelectedArt(art);
    setShowTimelapse(false);
  };

  const closeArt = () => {
    setSelectedArt(null);
    setShowTimelapse(false);
  };

  const toggleTimelapse = () => {
    setShowTimelapse(!showTimelapse);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Art Gallery</h1>
      <Masonry
        breakpointCols={{ default: 3, 1100: 2, 700: 1 }}
        className="flex w-auto"
        columnClassName="bg-clip-padding"
      >
        {artPieces.map((art) => (
          <motion.div
            key={art.id}
            className="bg-white rounded-lg shadow-md overflow-hidden m-4 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => openArt(art)}
          >
            <Image src={art.image} alt={art.title} width={300} height={300} className="w-full h-64 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{art.title}</h2>
            </div>
          </motion.div>
        ))}
      </Masonry>

      <AnimatePresence>
        {selectedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={closeArt}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-4">{selectedArt.title}</h2>
              <div className="relative aspect-square mb-4">
                <Image
                  src={showTimelapse ? selectedArt.timelapse : selectedArt.image}
                  alt={selectedArt.title}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
              <button
                onClick={toggleTimelapse}
                className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600 transition-colors"
              >
                {showTimelapse ? 'View Artwork' : 'View Process Timelapse'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtPage;
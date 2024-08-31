"use client";

import { useState, useEffect } from 'react';
import TechPage from './components/TechPage';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';


export default function Tech() {
  return (
    <div>
      <Link href="/" className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-full shadow-md">
        <FaArrowLeft className="text-xl text-white" />
        <span className="text-white font-medium">Back to Main</span>
      </Link>
      <TechPage />
    </div>
  );
}
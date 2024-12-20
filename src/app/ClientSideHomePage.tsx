"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import debounce from 'lodash/debounce';
import './cssEffects/decodeText/decodeTextCSS.css';
import './cssEffects/neon2/neonImage.css'
import Typewriter from './cssEffects/typewriter/typewriter';
import { decodeText } from "./cssEffects/decodeText/decodeTextTS";
import './cssEffects/noiseGround/noiseGround.css'
import { noise } from "./cssEffects/noiseGround/noiseGround"
import { FaYoutube, FaExternalLinkAlt, FaLinkedin } from 'react-icons/fa';
import BlogPostCard, { BlogPost } from './creative/components/BlogPostCard';

export default function ClientSideHomePage() {
  const neonImagesRef = useRef<HTMLDivElement>(null);
  const [activeIcon, setActiveIcon] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  const handleScroll = useCallback(() => {
    if (neonImagesRef.current && isMobile) {
      const neonImages = Array.from(neonImagesRef.current.children) as HTMLElement[];
      const headerHeight = 150;
      const screenCenter = window.innerHeight / 2;

      let closestIcon = null;
      let minDistance = Infinity;

      neonImages.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const iconCenter = (rect.top + rect.bottom) / 2;
        const distance = Math.abs(iconCenter - screenCenter);

        if (distance < minDistance && rect.top >= headerHeight && rect.bottom <= window.innerHeight) {
          minDistance = distance;
          closestIcon = index;
        }
      });

      setActiveIcon(closestIcon);
    }
  }, [isMobile]);

  useEffect(() => {
    setIsClient(true);
    decodeText();
    noise();

    handleResize();
    const debouncedHandleResize = debounce(handleResize, 100);
    const debouncedHandleScroll = debounce(handleScroll, 100);

    window.addEventListener('resize', debouncedHandleResize);
    window.addEventListener('scroll', debouncedHandleScroll);
    handleScroll();

    // Fetch recent blog posts
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch('/api/recentPosts');
        if (response.ok) {
          const data = await response.json();
          setRecentPosts(data);
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };
    fetchRecentPosts();

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [handleResize, handleScroll]);

  if (!isClient) {
    return null;
  }

  return (
    <main className={`flex flex-col min-h-screen w-full ${isMobile ? 'mobile-view' : ''}`}>
      <img src="/wall.jpg" alt="background image" className="fixed inset-0 w-full h-full object-cover -z-10 filter brightness-50" />
      <canvas id="noise" className="noise fixed inset-0 -z-5"></canvas>

      <header className="fixed top-0 left-0 right-0 z-10 p-4 header-gradient backdrop-filter">
        <div className="decode-text">
          <div className="decode-text-row">
            <div className="text-animation">E</div>
            <div className="text-animation">o</div>
            <div className="text-animation">g</div>
            <div className="text-animation">h</div>
            <div className="text-animation">a</div>
            <div className="text-animation">n</div>
          </div>
          <div className="space"></div>
          <div className="decode-text-row">
            <div className="text-animation">C</div>
            <div className="text-animation">o</div>
            <div className="text-animation">l</div>
            <div className="text-animation">l</div>
            <div className="text-animation">i</div>
            <div className="text-animation">n</div>
            <div className="text-animation">s</div>
          </div>
        </div>
      </header>
      <div className="flex-grow flex flex-col items-center justify-start p-4 mt-[800px] lg:mt-[0px]">
        <div className="flex flex-wrap justify-center gap-8 mb-8">
        <Link href="https://www.linkedin.com/in/eoghan-timothy-collins" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-gray-300 transition-colors">
            <FaLinkedin className="mr-2 text-2xl" />
            <span className="text-lg">LinkedIn</span>
          </Link>
          <Link href="https://www.youtube.com/channel/UCma7zuZag1X1u1m0Qd3deNw" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-gray-300 transition-colors">
            <FaYoutube className="mr-2 text-2xl" />
            <span className="text-lg">ETM_Writes</span>
          </Link>
          <Link href="https://www.youtube.com/@EoghanTheDev" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-gray-300 transition-colors">
            <FaYoutube className="mr-2 text-2xl" />
            <span className="text-lg">EoghanTheDev</span>
          </Link>
          <Link href="https://etmcollins.com" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-gray-300 transition-colors">
            <FaExternalLinkAlt className="mr-2 text-2xl" />
            <span className="text-lg">Creative Blog</span>
          </Link>
        </div>
      </div>
      <div className="flex-grow flex flex-col items-left justify-start p-4 mt-[0px] lg:mt-[0px] md:justify-center">
        <div className="text-white mb-10">
          <Typewriter text="Engineer. Programmer. Artist. Inventor." />
        </div>



        <div ref={neonImagesRef} className="neon-image-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          {['technical', 'creative', 'cv', 'contact'].map((item, index) => (
            <a 
              href={item === 'cv' ? '/cv.pdf' : `/${item}`} 
              key={item}
              target={item === 'cv' ? '_blank' : '_self'}
              rel={item === 'cv' ? 'noopener noreferrer' : ''}
            > 
              <div 
                className={`neon-image-wrapper aspect-square ${isMobile && activeIcon === index ? 'active' : ''}`}
              >
                <Image
                  src={`/neoni/${item}.svg`}
                  alt={`${item} icon`}
                  width={300}
                  height={300}
                  layout="responsive"
                  className="neon-image"
                />
              </div>
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}
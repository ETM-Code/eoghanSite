'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import { VideoRenderer } from '../utils/videoRenderer';
import { AudioRenderer } from '../utils/audioRenderer';
import { HtmlRenderer } from '../utils/htmlRenderer';
import { PdfRenderer } from '../utils/pdfRenderer';
import { getYoutubeVideoId } from '../utils/renderer';
import sources from '../utils/sources.json';
import '../styles/studyPage.css';
import 'react-resizable/css/styles.css';

const renderers = [
  new VideoRenderer(),
  new AudioRenderer(),
  new HtmlRenderer(),
  new PdfRenderer(),
];

interface BackgroundVideo {
  url: string;
  category: string;
  isVertical: boolean;
  size: number;
  aspectRatio?: number;
  position?: { x: number; y: number };
}

const MIN_VIDEO_SIZE = 25; // percentage of container width
const MAX_VIDEO_SIZE = 45; // percentage of container width
const MIN_VIDEOS = 12;
const FILL_TIMEOUT = 7000; // 7 seconds

const StudyPage: React.FC = () => {
  const [content, setContent] = useState<File | string | null>(null);
  const [renderedContent, setRenderedContent] = useState<React.ReactElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundVideos, setBackgroundVideos] = useState<BackgroundVideo[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [usedVideos, setUsedVideos] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videosContainerRef = useRef<HTMLDivElement>(null);
  const [mainContainerSize, setMainContainerSize] = useState({ width: 800, height: 450 });
  const [mainContainerPosition, setMainContainerPosition] = useState({ x: 0, y: 0 });
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement }>({});

  const handleContentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setContent(file);
  }, []);

  const handleUrlSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = new FormData(event.currentTarget).get('url') as string;
    if (url) setContent(url);
  }, []);

  const toggleMute = useCallback(() => {
    // Send mute/unmute command to all iframes using YouTube Player API
    Object.values(iframeRefs.current).forEach(iframe => {
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: isMuted ? 'unMute' : 'mute'
        }), '*');
      }
    });
    setIsMuted(!isMuted);
  }, [isMuted]);

  const getRandomSize = () => {
    // Weighted random to favor larger sizes
    const variance = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    const baseSize = MIN_VIDEO_SIZE + Math.random() * (MAX_VIDEO_SIZE - MIN_VIDEO_SIZE);
    return baseSize * variance;
  };

  const checkVideoMetadata = async (url: string): Promise<{ isVertical: boolean; aspectRatio: number }> => {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return { isVertical: false, aspectRatio: 16/9 };

    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const data = await response.json();
      const aspectRatio = data.width / data.height;
      return {
        isVertical: data.height > data.width,
        aspectRatio: aspectRatio
      };
    } catch {
      return { isVertical: false, aspectRatio: 16/9 };
    }
  };

  const isSpaceFilled = (container: HTMLElement, videos: Element[]) => {
    const containerRect = container.getBoundingClientRect();
    const totalArea = containerRect.width * containerRect.height;
    let coveredArea = 0;

    videos.forEach(video => {
      const rect = video.getBoundingClientRect();
      coveredArea += rect.width * rect.height;
    });

    return (coveredArea / totalArea) > 0.85; // Consider space filled if 85% is covered
  };

  const fillAvailableSpace = useCallback(async () => {
    if (!videosContainerRef.current) return;

    const container = videosContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const availableVideos = Object.values(sources).flat();
    
    // Only add new videos if we don't have any or have less than minimum
    if (backgroundVideos.length < MIN_VIDEOS) {
      const startTime = Date.now();
      let isTimeout = false;

      const addMoreVideos = async () => {
        if (Date.now() - startTime > FILL_TIMEOUT) {
          isTimeout = true;
          return;
        }

        // Add a batch of videos
        const batchSize = 4; // Add 4 videos at a time
        const newVideoPromises = Array(batchSize).fill(null).map(async () => {
          const randomUrl = availableVideos[Math.floor(Math.random() * availableVideos.length)];
          const metadata = await checkVideoMetadata(randomUrl);
          const size = getRandomSize();
          
          return {
            url: randomUrl,
            category: 'dynamic',
            isVertical: metadata.isVertical,
            aspectRatio: metadata.aspectRatio,
            size
          };
        });

        const newVideos = await Promise.all(newVideoPromises);
        setBackgroundVideos(prevVideos => [...prevVideos, ...newVideos]);

        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if space is filled
        const videoElements = container.getElementsByClassName('brainrot-video');
        if (!isSpaceFilled(container, Array.from(videoElements)) && !isTimeout) {
          await addMoreVideos();
        }
      };

      // Start with initial batch if we have no videos
      if (backgroundVideos.length === 0) {
        const initialBatchSize = Math.max(MIN_VIDEOS, 
          Math.floor((containerRect.width * containerRect.height) / (containerRect.width * 0.3 * containerRect.width * 0.3)));
        
        const initialVideoPromises = Array(initialBatchSize).fill(null).map(async () => {
          const randomUrl = availableVideos[Math.floor(Math.random() * availableVideos.length)];
          const metadata = await checkVideoMetadata(randomUrl);
          const size = getRandomSize();
          
          return {
            url: randomUrl,
            category: 'dynamic',
            isVertical: metadata.isVertical,
            aspectRatio: metadata.aspectRatio,
            size
          };
        });

        const initialVideos = await Promise.all(initialVideoPromises);
        setBackgroundVideos(initialVideos);

        // Wait for initial batch to render
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if we need more videos
        const videoElements = container.getElementsByClassName('brainrot-video');
        if (!isSpaceFilled(container, Array.from(videoElements))) {
          await addMoreVideos();
        }
      }
    }
  }, [backgroundVideos.length]);

  const toggleFullscreen = useCallback(async () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        fillAvailableSpace();
      }
    } else {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setBackgroundVideos([]);
        setUsedVideos(new Set());
      }
    }
  }, [isFullscreen, fillAvailableSpace]);

  useEffect(() => {
    const handleResize = () => {
      if (isFullscreen) {
        fillAvailableSpace();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, fillAvailableSpace]);

  useEffect(() => {
    const renderContent = async () => {
      if (!content) {
        setRenderedContent(null);
        return;
      }
      
      const renderer = renderers.find(r => r.canRender(content));
      if (!renderer) {
        setRenderedContent(<div>Unsupported content type</div>);
        return;
      }
      
      try {
        const rendered = await renderer.render(content);
        setRenderedContent(rendered);
      } catch (error) {
        console.error('Error rendering content:', error);
        setRenderedContent(<div>Error rendering content</div>);
      }
    };

    renderContent();
  }, [content]);

  const handleResize = useCallback((e: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
    e.stopPropagation();
    setMainContainerSize(size);
  }, []);

  const handleDrag = useCallback((e: any, data: { x: number; y: number }) => {
    setMainContainerPosition(data);
  }, []);

  const getRandomVideo = useCallback(async () => {
    const availableVideos = Object.values(sources).flat();
    let unusedVideos = availableVideos.filter(url => !usedVideos.has(url));
    
    // If all videos have been used, reset the used videos tracking
    if (unusedVideos.length === 0) {
      setUsedVideos(new Set());
      unusedVideos = availableVideos;
    }
    
    const randomUrl = unusedVideos[Math.floor(Math.random() * unusedVideos.length)];
    const metadata = await checkVideoMetadata(randomUrl);
    const size = getRandomSize();
    
    // Add the selected video to used videos
    setUsedVideos(prev => new Set([...Array.from(prev), randomUrl]));
    
    return {
      url: randomUrl,
      category: 'dynamic',
      isVertical: metadata.isVertical,
      aspectRatio: metadata.aspectRatio,
      size
    };
  }, [usedVideos]);

  const handleVideoEnded = useCallback(async (index: number) => {
    const newVideo = await getRandomVideo();
    setBackgroundVideos(prevVideos => {
      const newVideos = [...prevVideos];
      newVideos[index] = newVideo;
      return newVideos;
    });
  }, [getRandomVideo]);

  return (
    <div ref={containerRef} className="study-container">
      {!isFullscreen ? (
        <div className="upload-section">
          <form onSubmit={handleUrlSubmit} className="url-form">
            <input
              type="url"
              name="url"
              placeholder="Enter URL to study..."
              className="url-input"
            />
            <button type="submit" className="button button-primary">
              Load URL
            </button>
          </form>

          <div className="file-input-container">
            <input
              type="file"
              onChange={handleContentUpload}
              accept=".pdf,.mp4,.mp3,.wav"
              className="file-input"
              id="file-input"
            />
            <label htmlFor="file-input" className="file-input-label">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Drop files here or click to upload
            </label>
          </div>

          {content && (
            <button
              onClick={toggleFullscreen}
              className="button button-secondary"
            >
              Enter Study Mode
            </button>
          )}

          <div className="main-content">
            {renderedContent}
          </div>
        </div>
      ) : (
        <div className="fullscreen-grid">
          <div className="main-content-wrapper">
            <Draggable
              handle=".drag-handle"
              position={mainContainerPosition}
              onDrag={handleDrag}
              bounds="parent"
              cancel=".react-resizable-handle"
            >
              <div className="draggable-wrapper">
                <Resizable
                  width={mainContainerSize.width}
                  height={mainContainerSize.height}
                  onResize={handleResize}
                  minConstraints={[400, 225]}
                  maxConstraints={[1600, 900]}
                  resizeHandles={['se', 'sw', 'ne', 'nw']}
                  handle={(h, ref) => (
                    <div className={`custom-handle custom-handle-${h}`} ref={ref} />
                  )}
                >
                  <div
                    ref={mainContainerRef}
                    className="main-video-container"
                    style={{
                      width: `${mainContainerSize.width}px`,
                      height: `${mainContainerSize.height}px`
                    }}
                  >
                    <div className="drag-handle" />
                    {renderedContent}
                  </div>
                </Resizable>
              </div>
            </Draggable>
          </div>

          <div ref={videosContainerRef} className="brainrot-videos-container">
            {backgroundVideos.map((video, index) => {
              const videoId = getYoutubeVideoId(video.url);
              if (!videoId) return null;
              
              // Calculate width and height based on aspect ratio and container size
              const containerWidth = videosContainerRef.current?.clientWidth || 1000;
              const baseWidth = (video.size / 100) * containerWidth;
              const baseHeight = baseWidth / (video.aspectRatio || (video.isVertical ? 9/16 : 16/9));
              
              const style: React.CSSProperties = {
                width: `${baseWidth}px`,
                height: `${baseHeight}px`,
                margin: `${Math.random() * 0.25 + 0.125}rem`,
                position: 'relative',
                zIndex: Math.floor(Math.random() * 10)
              };
              
              return (
                <div 
                  key={`${videoId}-${index}`}
                  className={`brainrot-video ${video.isVertical ? 'vertical' : 'horizontal'}`}
                  style={style}
                >
                  <iframe
                    ref={el => {
                      if (el) {
                        iframeRefs.current[`${videoId}-${index}`] = el;
                      }
                    }}
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&enablejsapi=1&playsinline=1&loop=0&origin=${window.location.origin}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={(e) => {
                      const iframe = e.target as HTMLIFrameElement;
                      // Add event listener for video end using YouTube Player API
                      if (iframe.contentWindow) {
                        // Initialize with correct mute state
                        iframe.contentWindow.postMessage(JSON.stringify({
                          event: 'command',
                          func: isMuted ? 'mute' : 'unMute'
                        }), '*');

                        window.addEventListener('message', async (event) => {
                          if (event.source === iframe.contentWindow) {
                            try {
                              const data = JSON.parse(event.data);
                              if (data.event === 'onStateChange' && data.info === 0) { // 0 means ended
                                await handleVideoEnded(index);
                              }
                            } catch (e) {
                              // Ignore parsing errors from other messages
                            }
                          }
                        });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="controls-overlay">
            <button onClick={toggleFullscreen} className="button button-secondary">
              Exit Study Mode
            </button>
            <button onClick={toggleMute} className="mute-button">
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
              {isMuted ? 'Unmute All' : 'Mute All'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPage;

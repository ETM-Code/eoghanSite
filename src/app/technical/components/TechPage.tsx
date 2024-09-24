import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGithub, FaYoutube, FaExternalLinkAlt, FaChevronLeft, FaChevronRight, FaNpm, FaBook, FaGoogleDrive, FaArrowLeft } from 'react-icons/fa';
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiRuby, SiPhp, SiGo, SiRust, SiSwift, SiKotlin, SiCsharp, SiScala, SiDart, SiLua, SiReact, SiNextdotjs, SiC, SiCss3, SiArduino, SiMysql, SiElectron } from 'react-icons/si';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useSwipeable } from 'react-swipeable';
import Masonry from 'react-masonry-css';
import { Project, Media, LinkWithLabel } from '../utils/projectUtils';
import TechBlog from './TechBlog';
import TechContentToggle from './TechContentToggle';


interface LanguageIcon {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
}
  
  const languageIcons: { [key: string]: LanguageIcon } = {
    JavaScript: { icon: SiJavascript, color: '#F7DF1E' },
    TypeScript: { icon: SiTypescript, color: '#3178C6' },
    Electron: {icon: SiElectron, color: '#61DAFB' },
    Python: { icon: SiPython, color: '#3776AB' },
    'C++': { icon: SiCplusplus, color: '#00599C' },
    Ruby: { icon: SiRuby, color: '#CC342D' },
    PHP: { icon: SiPhp, color: '#777BB4' },
    Go: { icon: SiGo, color: '#00ADD8' },
    Rust: { icon: SiRust, color: '#000000' },
    Swift: { icon: SiSwift, color: '#FA7343' },
    Kotlin: { icon: SiKotlin, color: '#7F52FF' },
    'C#': { icon: SiCsharp, color: '#239120' },
    Scala: { icon: SiScala, color: '#DC322F' },
    Dart: { icon: SiDart, color: '#0175C2' },
    Lua: { icon: SiLua, color: '#2C2D72' },
    React: { icon: SiReact, color: '#61DAFB' },
    'React Native': { icon: SiReact, color: '#61DAFB' },
    'Next.js': { icon: SiNextdotjs, color: '#000000' },
    C: { icon: SiC, color: '#A8B9CC' },
    CSS: { icon: SiCss3, color: '#1572B6' },
    Arduino: { icon: SiArduino, color: '#00979D' },
    SQL: { icon: SiMysql, color: '#4479A1' },
  };
  
const TechPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [randomProjectIndex, setRandomProjectIndex] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeContent, setActiveContent] = useState<'projects' | 'blog'>('projects');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const projectsData: Project[] = await response.json();
        setProjects(projectsData);

        const languages = Array.from(new Set(projectsData.flatMap(p => p.languages)));
        setAllLanguages(languages);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProject]);

  useEffect(() => {
    if (!animationPlayed && projects.length > 0) {
      timeoutRef.current = setTimeout(() => {
        const visibleProjects = projects.filter(project => {
          const element = document.getElementById(`project-${project.id}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
          }
          return false;
        });

        if (visibleProjects.length > 0) {
          const randomIndex = Math.floor(Math.random() * visibleProjects.length);
          setRandomProjectIndex(projects.findIndex(p => p.id === visibleProjects[randomIndex].id));
          setTimeout(() => setRandomProjectIndex(null), 3000); // Hide after 3 seconds
        }
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projects, animationPlayed]);

  const filteredProjects = projects.filter(project => 
    selectedLanguages.length === 0 || project.languages.some(lang => selectedLanguages.includes(lang))
  );

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]
    );
  };

  const handlePrevMedia = () => {
    if (selectedProject) {
      setCurrentMediaIndex((prev) => 
        prev === 0 ? selectedProject.media.length - 1 : prev - 1
      );
    }
  };

  const handleNextMedia = () => {
    if (selectedProject) {
      setCurrentMediaIndex((prev) => 
        prev === selectedProject.media.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: handleNextMedia,
    onSwipedRight: handlePrevMedia,
    trackMouse: true
  });

  const renderMedia = (media: Media) => {
    if (media.type === 'image') {
      return (
        <div className="w-full h-full relative">
          <Image
            src={media.src}
            alt="Project media"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
      );
    } else if (media.type === 'video') {
      return (
        <div className="w-full h-full relative">
          <iframe
            src={`https://www.youtube.com/embed/${media.src}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          ></iframe>
        </div>
      );
    }
  };

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 2
  };

  const MarkdownComponents = {
    h1: (props: any) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: (props: any) => <h2 className="text-xl font-semibold my-3" {...props} />,
    h3: (props: any) => <h3 className="text-lg font-medium my-2" {...props} />,
    p: (props: any) => <p className="my-2" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside my-2" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside my-2" {...props} />,
    li: (props: any) => <li className="my-1" {...props} />,
    a: (props: any) => <a className="text-blue-400 hover:underline" {...props} />,
    code: (props: any) => <code className="bg-gray-700 rounded px-1" {...props} />,
    pre: (props: any) => <pre className="bg-gray-700 rounded p-2 my-2 overflow-x-auto" {...props} />,
  };

  const renderLinkItem = (url: string, Icon: React.ComponentType<{ size: number; className: string }>, label?: string, colorClass: string = "text-white") => (
    <Link href={url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-80 transition-opacity">
      <span className="mr-2">
        <Icon size={24} className={colorClass} />
      </span>
      {label && <span className="text-white">{label}</span>}
    </Link>
  );

  const renderLinkGroup = (
    link: string | LinkWithLabel[] | undefined,
    Icon: React.ComponentType<{ size: number; className: string }>,
    defaultLabel: string,
    colorClass: string
  ) => {
    if (!link) return null;
    if (typeof link === 'string') {
      return renderLinkItem(link, Icon, defaultLabel, colorClass);
    }
    if (Array.isArray(link)) {
      return link.map((item, index) => (
        <React.Fragment key={index}>
          {renderLinkItem(item.url, Icon, item.label, colorClass)}
        </React.Fragment>
      ));
    }
    return null;
  };

  const renderLinks = (links: Project['links']) => (
    <div className="mt-6 flex flex-wrap gap-4">
      {renderLinkGroup(links.github, FaGithub, "GitHub", "text-gray-300")}
      {links.youtube && renderLinkItem(links.youtube, FaYoutube, "YouTube", "text-red-500")}
      {links.external && renderLinkItem(links.external, FaExternalLinkAlt, "External Link", "text-blue-400")}
      {links.npm && renderLinkItem(links.npm, FaNpm, "NPM", "text-green-400")}
      {links.documentation && renderLinkItem(links.documentation, FaBook, "Documentation", "text-yellow-400")}
      {renderLinkGroup(links.googleDrive, FaGoogleDrive, "Google Drive", "text-blue-300")}
    </div>
  );

  const renderLanguageButton = (lang: string) => {
    const { icon: Icon, color } = languageIcons[lang] || { icon: null, color: '#FFFFFF' };
    return (
      <button
        key={lang}
        onClick={() => toggleLanguage(lang)}
        className={`px-3 py-1 rounded flex items-center ${
          selectedLanguages.includes(lang) ? 'bg-blue-500' : 'bg-gray-700'
        } hover:bg-opacity-80 transition-colors duration-200`}
      >
        {Icon && <Icon className="mr-2" style={{ color }} />}
        <span>{lang}</span>
      </button>
    );
  };

  const stripMarkdown = (text: string) => {
    return text
      .replace(/#{1,6}\s?/g, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '$1')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '');
  };

  const handleModalClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedProject(null);
    }
  };

  

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 w-full pt-20">
      {(!isMobile || !selectedProject) && (
        <Link href="/" className="fixed top-4 left-4 z-50 flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-full shadow-md">
          <FaArrowLeft className="text-xl text-white" />
          <span className="text-white font-medium">Back to Main</span>
        </Link>
      )}
      {isMobile && selectedProject && (
        <button
          onClick={() => setSelectedProject(null)}
          className="fixed top-4 right-4 z-50 flex items-center space-x-2 bg-gray-800 px-3 py-2 rounded-full shadow-md"
        >
          <FaArrowLeft className="text-xl text-white" />
          <span className="text-white font-medium">Back</span>
        </button>
      )}
      <h1 className="text-4xl font-bold mb-8">Technical Portfolio</h1>
      <TechContentToggle activeContent={activeContent} setActiveContent={setActiveContent} />
      {activeContent === 'projects' && (
        <>
      {/* Language filter buttons */}
      <div className="mb-8">
        <h2 className="text-2xl mb-4">Filter by Technology:</h2>
        <div className="flex flex-wrap gap-2">
          {allLanguages.map(renderLanguageButton)}
        </div>
      </div>

          {/* Project masonry grid */}
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layoutId={`project-${project.id}`}
                id={`project-${project.id}`}
                onClick={() => {
                  setSelectedProject(project);
                  setCurrentMediaIndex(0);
                  setAnimationPlayed(true);
                }}
                className="cursor-pointer bg-gray-800 rounded-lg overflow-hidden mb-4 relative group"
              >
                <div className="relative">
                  <Image
                    src={project.image}
                    alt={project.title}
                    width={400}
                    height={300}
                    layout="responsive"
                    objectFit="cover"
                    className="rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">View Project</span>
                  </div>
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
                  <p className="text-gray-400 text-sm mb-2">{project.languages.join(', ')}</p>
                  <p className="text-gray-300 text-sm line-clamp-3">{stripMarkdown(project.description)}</p>
                </div>
                {randomProjectIndex === index && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 animate-pulse">
                    <span className="text-white text-2xl font-bold">Click Me!</span>
                  </div>
                )}
              </motion.div>
            ))}
          </Masonry>

          {/* Project modal */}
          <AnimatePresence mode="wait">
            {selectedProject && (
              <motion.div
                key="modal-background"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
                onClick={handleModalClose}
              >
                <motion.div
                  key="modal-content"
                  layoutId={`project-${selectedProject.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 rounded-lg max-w-4xl w-full h-[90vh] md:h-auto flex flex-col md:flex-row overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-full md:w-1/2 h-[50vh] md:h-full relative overflow-y-auto" {...handlers}>
                    {selectedProject.media.length > 0 && (
                      <div className="absolute inset-0">
                        {renderMedia(selectedProject.media[currentMediaIndex])}
                      </div>
                    )}
                    {selectedProject.media.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevMedia}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
                        >
                          <FaChevronLeft className="text-white" />
                        </button>
                        <button
                          onClick={handleNextMedia}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-all z-10"
                        >
                          <FaChevronRight className="text-white" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="w-full md:w-1/2 h-[40vh] md:h-full overflow-y-auto p-8">
                    <h2 className="text-3xl font-bold mb-4">{selectedProject.title}</h2>
                    <p className="text-gray-400 text-sm mb-4">{selectedProject.languages.join(', ')}</p>
                    <ReactMarkdown 
                      className="prose prose-invert max-w-none"
                      components={MarkdownComponents}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {selectedProject.description}
                    </ReactMarkdown>
                    {renderLinks(selectedProject.links)}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {activeContent === 'blog' && <TechBlog />}
    </div>
  );
};

export default TechPage;
import { useEffect, useState } from 'react';
import './typewriter.css';

export default function Typewriter({ text }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const randomSpeed = Math.random() * (200 - 50) + 50; // Random speed between 50ms and 200ms
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, randomSpeed);

      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <div className="typewriter">
      {displayedText}
      <span className="cursor">|</span>
    </div>
  );
}

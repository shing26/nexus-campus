import { useState, useEffect, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}

const CHARS = '!<>-_\\/[]{}—=+*^?#$%&@';

export default function DecryptedText({ text, className = '', speed = 30, delay = 0 }: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / (text.length * speed), 1);
        const revealCount = Math.floor(progress * text.length);

        let result = '';
        for (let i = 0; i < text.length; i++) {
          if (i < revealCount) {
            result += text[i];
          } else if (text[i] === ' ') {
            result += ' ';
          } else {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        }
        setDisplayText(result);

        if (revealCount >= text.length && intervalRef.current) {
          clearInterval(intervalRef.current);
          setDisplayText(text);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, delay]);

  return <span className={className}>{displayText || text}</span>;
}

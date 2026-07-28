import React, { useState, useEffect } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  className?: string;
}

const CHARS = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz23456789#@$%&*';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  className = '',
}) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={`font-mono ${className}`}>{displayText}</span>;
};

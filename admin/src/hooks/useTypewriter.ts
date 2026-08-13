import { useEffect, useState } from 'react';

const TYPE_SPEED_MS = 100;
const DELETE_SPEED_MS = 55;
const HOLD_AFTER_TYPE_MS = 1500;
const HOLD_AFTER_DELETE_MS = 250;

/**
 * Cycles through `words` with a type -> hold -> delete -> next loop.
 * When `paused` is true the current word/phase freezes in place (rather than
 * resetting) so the animation can resume exactly where it left off.
 */
export function useTypewriter(words: string[], paused = false) {
  const [wordIndex, setWordIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'deleting'>('typing');

  // Keep the index in range if the word list shrinks (e.g. admin disables one).
  useEffect(() => {
    if (wordIndex >= words.length) {
      setWordIndex(0);
      setCharCount(0);
      setPhase('typing');
    }
  }, [words.length, wordIndex]);

  useEffect(() => {
    if (paused || words.length === 0) return;

    const chars = Array.from(words[wordIndex] ?? '');
    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (charCount < chars.length) {
        timer = setTimeout(() => setCharCount((c) => c + 1), TYPE_SPEED_MS);
      } else {
        timer = setTimeout(() => setPhase('deleting'), HOLD_AFTER_TYPE_MS);
      }
    } else {
      if (charCount > 0) {
        timer = setTimeout(() => setCharCount((c) => c - 1), DELETE_SPEED_MS);
      } else {
        timer = setTimeout(() => {
          setWordIndex((i) => (i + 1) % words.length);
          setPhase('typing');
        }, HOLD_AFTER_DELETE_MS);
      }
    }

    return () => clearTimeout(timer);
  }, [paused, phase, charCount, wordIndex, words]);

  return Array.from(words[wordIndex] ?? '').slice(0, charCount).join('');
}

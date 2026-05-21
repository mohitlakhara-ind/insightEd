import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';

export const FALLBACK_QUOTES = [
  'The quick brown fox jumps over the lazy dog.',
  'She sells seashells by the seashore.',
  'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
  'Modern accessibility starts with thoughtful design.',
];

export async function fetchPronunciationQuotes(): Promise<string[]> {
  try {
    const snapshot = await getDocs(collection(db, 'sentences'));
    const quotes: string[] = [];
    snapshot.forEach((docSnap) => {
      Object.values(docSnap.data()).forEach((val) => {
        if (typeof val === 'string' && val.trim()) quotes.push(val.trim());
      });
    });
    return quotes.length > 0 ? quotes : FALLBACK_QUOTES;
  } catch {
    return FALLBACK_QUOTES;
  }
}

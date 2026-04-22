const API_KEY = process.env.EXPO_PUBLIC_NINJA_API_KEY ?? '';
const API_URL = 'https://api.api-ninjas.com/v1/quotes?category=happiness';

export type Quote = {
  quote: string;
  author: string;
};

const FALLBACK: Quote = {
  quote: 'Small daily improvements lead to stunning results over time.',
  author: 'Robin Sharma',
};

export async function fetchDailyQuote(): Promise<Quote> {
  if (!API_KEY) return FALLBACK;

  const response = await fetch(API_URL, {
    headers: { 'X-Api-Key': API_KEY },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const data: { quote: string; author: string }[] = await response.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response');

  return { quote: data[0].quote, author: data[0].author };
}

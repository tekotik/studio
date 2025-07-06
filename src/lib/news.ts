'use server';

import fs from 'fs/promises';
import path from 'path';

export interface NewsArticle {
  id: string;
  title: string;
  question: string;
  answer: string;
  createdAt: string;
  source: 'Анализ симптомов' | 'Советник по ТО' | 'Чат-ассистент';
}

const newsFilePath = path.join(process.cwd(), 'src', 'data', 'news.json');

async function readNewsFile(): Promise<NewsArticle[]> {
  try {
    const fileContent = await fs.readFile(newsFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (!Array.isArray(data)) {
        return [];
    }
    return data;
  } catch (error) {
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []; // File doesn't exist, which is fine on first run.
    }
    console.error('Failed to read news file:', error);
    return [];
  }
}

async function writeNewsFile(data: NewsArticle[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(newsFilePath), { recursive: true });
    await fs.writeFile(newsFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to news file:', error);
  }
}

export async function getNews(): Promise<NewsArticle[]> {
  const newsItems = await readNewsFile();
  // Sort by date, newest first
  return newsItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addNews(article: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<void> {
  const existingNews = await readNewsFile();
  
  const newArticle: NewsArticle = {
    ...article,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };

  const updatedNews = [newArticle, ...existingNews];
  
  // Limit the number of news items to prevent the file from growing indefinitely
  const limitedNews = updatedNews.slice(0, 100);

  await writeNewsFile(limitedNews);
}

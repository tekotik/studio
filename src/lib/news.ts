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

const newsFilePath = path.resolve(process.cwd(), 'src/data/news.json');

async function ensureDirectoryExists(filePath: string) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
    }
}

export async function getNews(): Promise<NewsArticle[]> {
  try {
    await ensureDirectoryExists(newsFilePath);
    const fileContent = await fs.readFile(newsFilePath, 'utf-8');
    // Handle empty file case
    if (!fileContent) {
        return [];
    }
    const news = JSON.parse(fileContent);
    return news.sort((a: NewsArticle, b: NewsArticle) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      await fs.writeFile(newsFilePath, '[]', 'utf-8');
      return [];
    }
    console.error('Failed to read news file:', error);
    return [];
  }
}

export async function addNews(article: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<void> {
  try {
    const news = await getNews();
    const newArticle: NewsArticle = {
      ...article,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };

    news.unshift(newArticle);

    await fs.writeFile(newsFilePath, JSON.stringify(news, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to news file:', error);
  }
}

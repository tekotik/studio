'use server';

import { db } from './firebase';
import type { NewsArticle } from './types';
import fs from 'fs/promises';
import path from 'path';

// A helper function to safely access the db instance
function getDb() {
    if (!db) {
        // This will be caught by the calling functions
        throw new Error("Firestore not available. Check Firebase environment variables.");
    }
    return db.collection('news');
}

const jsonFilePath = path.join(process.cwd(), 'src', 'data', 'news.json');

async function readNewsFromJson(): Promise<NewsArticle[]> {
    try {
        const jsonData = await fs.readFile(jsonFilePath, 'utf-8');
        const news: NewsArticle[] = JSON.parse(jsonData);
        // Ensure data is sorted
        news.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return news;
    } catch (e) {
        console.warn("Could not read news.json, returning empty array.", e);
        return [];
    }
}

async function writeNewsToJson(news: NewsArticle[]): Promise<void> {
    try {
        await fs.writeFile(jsonFilePath, JSON.stringify(news, null, 2), 'utf-8');
    } catch (e) {
        console.error("Could not write to news.json", e);
    }
}


export async function getNews(): Promise<NewsArticle[]> {
  try {
    const newsCollection = getDb();
    const snapshot = await newsCollection.orderBy('createdAt', 'desc').limit(50).get();

    // If firestore is available but empty, we can still show the local json data as a fallback.
    if (snapshot.empty) {
      return await readNewsFromJson();
    }
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt._seconds * 1000).toISOString();
        return {
            id: doc.id,
            title: data.title,
            question: data.question,
            answer: data.answer,
            source: data.source,
            createdAt,
        } as NewsArticle;
    });
  } catch (error) {
      // This catch block will run if getDb() throws an error.
      console.warn("Using local JSON for news feed because Firestore is not available.");
      return await readNewsFromJson();
  }
}

export async function addNews(article: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<void> {
    try {
        const newsCollection = getDb();
        const newArticle = {
            ...article,
            createdAt: new Date(), // Firestore uses its own Timestamp object
        };
        await newsCollection.add(newArticle);
    } catch (error) {
        // This catch block will run if getDb() throws an error.
        console.warn("Using local JSON for news feed because Firestore is not available.");
        const newArticleForJson: NewsArticle = {
            ...article,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
        };
        
        const currentNews = await readNewsFromJson();
        currentNews.unshift(newArticleForJson); // Add to the beginning
        await writeNewsToJson(currentNews);
    }
}

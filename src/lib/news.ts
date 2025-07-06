import { db } from './firebase';
import type { NewsArticle } from './types';

// A helper function to safely access the db instance
function getDb() {
    if (!db) {
        console.error("Firestore is not initialized. Check Firebase environment variables.");
        throw new Error("Firestore not available");
    }
    return db.collection('news');
}

export async function getNews(): Promise<NewsArticle[]> {
  try {
    const newsCollection = getDb();
    const snapshot = await newsCollection.orderBy('createdAt', 'desc').limit(50).get();
    if (snapshot.empty) {
      // Чтобы продемонстрировать функциональность, можно вернуть стартовые данные, если коллекция пуста.
      // В реальном приложении это можно убрать.
      return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        // Firestore timestamps need to be converted to a serializable format (ISO string)
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
      console.error("Error fetching news from Firestore:", error);
      // Return empty array on error to prevent page from crashing
      return [];
  }
}

export async function addNews(article: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<void> {
    try {
        const newsCollection = getDb();
        const newArticle = {
            ...article,
            createdAt: new Date(), // Firestore automatically converts this to a Timestamp
        };
        await newsCollection.add(newArticle);
    } catch (error) {
        console.error("Error adding news to Firestore:", error);
    }
}

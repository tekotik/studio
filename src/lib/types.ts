export interface NewsArticle {
  id: string;
  title: string;
  question: string;
  answer: string;
  createdAt: string; 
  source: 'Анализ симптомов' | 'Советник по ТО' | 'Чат-ассистент';
}

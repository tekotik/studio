import { Header } from "@/components/Header";
import { getNews, type NewsArticle } from "@/lib/news";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Bot, User, Wrench, Route, MessageSquare } from "lucide-react";

const SourceIcon = ({ source }: { source: NewsArticle['source'] }) => {
    switch (source) {
        case 'Анализ симптомов':
            return <Wrench className="w-4 h-4 text-muted-foreground" />;
        case 'Советник по ТО':
            return <Route className="w-4 h-4 text-muted-foreground" />;
        case 'Чат-ассистент':
            return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
        default:
            return null;
    }
}

const AnswerContent = ({ article }: { article: NewsArticle }) => {
  if (article.source === 'Анализ симптомов') {
    try {
      const diagnoses = JSON.parse(article.answer);
      return (
        <div className="space-y-3">
          {diagnoses.map((d: any, index: number) => (
            <div key={index} className="p-3 bg-muted/50 rounded-md">
              <p className="font-semibold">{d.diagnosis}</p>
              <p className="text-muted-foreground text-sm">{d.likelyCauses}</p>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <pre className="whitespace-pre-wrap font-mono text-sm bg-muted/50 p-3 rounded-md">{article.answer}</pre>;
    }
  }

  if (article.source === 'Советник по ТО') {
    const formattedSchedule = article.answer
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    return (
       <div className="space-y-2 rounded-md text-sm">
        {formattedSchedule.map((line, index) => {
          if (line.startsWith('### ')) {
            return <h3 key={index} className="font-bold text-base text-primary mt-3 mb-1">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('**') && line.endsWith('**')) {
              return <h4 key={index} className="font-semibold mt-2">{line.replace(/\*\*/g, '')}</h4>;
          }
          if (line.startsWith('* ')) {
              return <p key={index} className="flex items-start gap-2 pl-2"><span className="text-primary font-semibold">✓</span><span>{line.substring(2)}</span></p>;
          }
          return <p key={index} className="pl-2">{line}</p>;
        })}
      </div>
    )
  }

  return <p className="whitespace-pre-wrap">{article.answer}</p>;
};


export default async function NewsPage() {
  const newsItems = await getNews();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 font-headline text-center">
            Лента событий
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto text-center">
            Здесь собраны последние консультации и анализы, проведенные нашим ИИ-ассистентом в реальном времени.
          </p>
        </section>

        <div className="max-w-4xl mx-auto space-y-6">
          {newsItems.length === 0 ? (
            <Card className="text-center p-8">
              <CardTitle>Событий пока нет</CardTitle>
              <CardDescription className="mt-2">
                Начните использовать "Анализ симптомов", "Советник по ТО" или чат, и результаты появятся здесь.
              </CardDescription>
            </Card>
          ) : (
            newsItems.map((article) => (
              <Card key={article.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <SourceIcon source={article.source} />
                    <span>{article.source}</span>
                    <span>&middot;</span>
                    <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: ru })}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-md">
                    <User className="w-6 h-6 mt-1 text-muted-foreground flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-card-foreground">Запрос пользователя</h4>
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap">{article.question}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-4 p-4 border rounded-md bg-primary/5">
                    <Bot className="w-6 h-6 mt-1 text-primary flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-primary">Ответ ассистента</h4>
                       <AnswerContent article={article} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
       <footer className="py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} POCHINI. Все права защищены.</p>
      </footer>
    </div>
  );
}

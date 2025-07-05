import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { BookOpen } from 'lucide-react';

const guides = [
  {
    title: 'How to Change Your Own Oil',
    description: 'A step-by-step guide to one of the most essential DIY car maintenance tasks.',
    source: 'Popular Mechanics',
  },
  {
    title: 'Replacing Your Air Filter',
    description: "Improve your engine's performance and efficiency with this simple replacement.",
    source: 'Car and Driver',
  },
  {
    title: 'How to Jump-Start a Car',
    description: 'Learn the safe and correct way to get your car started with a dead battery.',
    source: 'The Drive',
  },
  {
    title: 'Detailing Your Car Like a Pro',
    description: 'Tips and tricks to make your car look brand new, inside and out.',
    source: 'Autoblog',
  },
];

export function DiyGuides() {
  return (
    <section className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 font-headline text-primary">DIY Guides & Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide) => (
          <Card key={guide.title} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-3">
                 <BookOpen className="w-6 h-6 text-primary" />
                 <CardTitle className="text-xl">{guide.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{guide.description}</CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Source: {guide.source}</p>
              <Button variant="outline" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">Read More</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

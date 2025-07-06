'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useFormState, useFormStatus } from 'react-dom';
import { handleChatMessage, type ChatMessage } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';

const initialState = {
  status: 'idle' as const,
  messages: [{ role: 'system', content: 'Здравствуйте! Чем могу помочь с вашим автомобилем?' }] as ChatMessage[],
  error: undefined,
};

const predefinedQuestions = [
  "Какие признаки износа тормозов?",
  "Как часто нужно менять масло?",
  "Что делать, если двигатель перегревается?",
  "Почему горит лампочка Check Engine?",
  "Как проверить уровень охлаждающей жидкости?",
  "Что такое гидроудар двигателя?",
];

function ChatSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} className="bg-primary hover:bg-primary/90 rounded-full h-10 w-10 flex-shrink-0">
      {pending ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
      ) : (
        <Send className="h-5 w-5 text-primary-foreground" />
      )}
    </Button>
  );
}

function MessageListContent({ messages }: { messages: ChatMessage[] }) {
  const { pending } = useFormStatus();
  
  return (
    <div className="space-y-4 pb-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start gap-3",
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          {msg.role === 'model' && (
            <Avatar className="w-8 h-8 border border-primary/50">
              <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
            </Avatar>
          )}
          <div
            className={cn(
              'rounded-xl px-4 py-2.5 max-w-[85%] text-sm break-words shadow-sm',
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none',
              msg.role === 'system' && 'w-full text-center bg-transparent text-muted-foreground text-xs italic shadow-none'
            )}
          >
            {msg.content}
          </div>
           {msg.role === 'user' && (
            <Avatar className="w-8 h-8 border">
              <AvatarFallback><User size={20}/></AvatarFallback>
            </Avatar>
          )}
        </div>
      ))}
      {pending && (
        <div className="flex items-start gap-3 justify-start">
          <Avatar className="w-8 h-8 border border-primary/50">
            <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
          </Avatar>
          <div className="rounded-xl px-3 py-2 max-w-[80%] text-sm bg-muted rounded-bl-none flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></span>
          </div>
        </div>
      )}
    </div>
  );
}


export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [wasDragged, setWasDragged] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [state, formAction] = useFormState(handleChatMessage, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleQuestionClick = (question: string) => {
    const formData = new FormData();
    formData.append('message', question);
    formAction(formData);
  };

  useEffect(() => {
    const setInitialPosition = () => {
      const margin = 20;
      setPosition({
        x: window.innerWidth - 64 - margin, 
        y: window.innerHeight - 64 - margin,
      });
    };
    setInitialPosition();
    window.addEventListener('resize', setInitialPosition);
    return () => window.removeEventListener('resize', setInitialPosition);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if(state.status === 'success' || state.status === 'error') {
      formRef.current?.reset();
    }
  }, [state.messages, state.status]);
  
  const handleMouseDown = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      setWasDragged(true);
      if (widgetRef.current) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        
        const widgetWidth = isOpen ? 380 : 64;
        const widgetHeight = isOpen ? 600 : 64;
        const margin = 20;
        
        newX = Math.max(margin, Math.min(newX, window.innerWidth - widgetWidth - margin));
        newY = Math.max(margin, Math.min(newY, window.innerHeight - widgetHeight - margin));

        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setTimeout(() => {
        setWasDragged(false);
    }, 0);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);


  return (
    <div
      ref={widgetRef}
      className="fixed z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging.current ? 'grabbing' : 'default',
        width: isOpen ? '380px' : '64px',
        height: isOpen ? '600px' : '64px',
      }}
    >
      <div className={cn("transition-all duration-300 origin-bottom-right w-full h-full", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
        <Card className="w-full h-full flex flex-col shadow-2xl border-primary/20 rounded-2xl">
          <form action={formAction} ref={formRef} className="flex flex-col flex-1">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
               <div className="flex items-center gap-3">
                  <span className="p-2 bg-primary/10 rounded-full">
                    <Sparkles className="text-primary w-6 h-6" />
                  </span>
                  <CardTitle className="text-lg font-semibold">Помощник POCHINI</CardTitle>
               </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
              <ScrollArea className="h-full px-4 pt-4">
                 {state.messages.length <= 1 && (
                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-3">Возможные вопросы:</p>
                      <div className="flex flex-wrap gap-2">
                        {predefinedQuestions.map((q, i) => (
                           <Button
                              key={i}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuestionClick(q)}
                              className="rounded-full h-auto py-1.5 px-3 text-sm"
                            >
                              {q}
                            </Button>
                        ))}
                      </div>
                    </div>
                 )}
                 <MessageListContent messages={state.messages} />
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-3 border-t bg-background/80">
              <div className="relative w-full flex items-center">
                 <Input name="message" placeholder="Напишите свой вопрос..." autoComplete='off' className="bg-muted focus-visible:ring-primary rounded-full pr-12 pl-4 h-12"/>
                 <div className="absolute right-1 top-1/2 -translate-y-1/2">
                   <ChatSubmitButton />
                 </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <button
        onMouseDown={handleMouseDown}
        onClick={() => { if (!wasDragged) setIsOpen(true); }}
        className={cn(
          "bg-primary hover:bg-primary/90 rounded-none w-16 h-16 shadow-lg transition-all duration-300 flex items-center justify-center absolute bottom-0 right-0",
          isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100",
          isDragging.current ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      >
        <MessageSquare className="w-8 h-8 text-primary-foreground" />
      </button>
    </div>
  );
}

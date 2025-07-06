'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
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
  messages: [{ role: 'system', content: 'Здравствуйте! Чем могу помочь?' }] as ChatMessage[],
  error: undefined,
};

function ChatSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending} variant="ghost">
      {pending ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      ) : (
        <Send className="h-5 w-5 text-primary" />
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
              'rounded-xl px-3 py-2 max-w-[80%] text-sm break-words',
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none',
              msg.role === 'system' && 'w-full text-center bg-transparent text-muted-foreground text-xs italic'
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
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const [state, formAction] = useFormState(handleChatMessage, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setInitialPosition = () => {
      setPosition({
        x: window.innerWidth - 84,
        y: window.innerHeight - 84,
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
    isDragging.current = true;
    hasDragged.current = false;
    if (widgetRef.current) {
      dragOffset.current = {
        x: e.clientX - widgetRef.current.getBoundingClientRect().left,
        y: e.clientY - widgetRef.current.getBoundingClientRect().top,
      };
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      hasDragged.current = true;
      if (widgetRef.current) {
        let newX = e.clientX - dragOffset.current.x;
        let newY = e.clientY - dragOffset.current.y;
        
        const widgetWidth = isOpen ? 350 : 64;
        const widgetHeight = isOpen ? 500 : 64;
        
        newX = Math.max(20, Math.min(newX, window.innerWidth - widgetWidth - 20));
        newY = Math.max(20, Math.min(newY, window.innerHeight - widgetHeight - 20));

        setPosition({ x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setTimeout(() => {
      hasDragged.current = false;
    }, 0);
  };
  
  const handleClick = () => {
    if (!hasDragged.current) {
      setIsOpen(!isOpen);
    }
  }

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
      }}
    >
      <div className={cn("transition-all duration-300 origin-bottom-right", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
        <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-primary/20">
          <form action={formAction} ref={formRef} className="flex flex-col flex-1">
            <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="text-primary"/>
                Чат с ассистентом
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full px-4 pt-4">
                 <MessageListContent messages={state.messages} />
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 border-t">
              <Input name="message" placeholder="Спросите что-нибудь..." autoComplete='off' className="bg-muted focus-visible:ring-primary"/>
              <ChatSubmitButton />
            </CardFooter>
          </form>
        </Card>
      </div>

      <Button
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        className={cn(
          "bg-primary hover:bg-primary/90 rounded-none w-16 h-16 shadow-lg transition-all duration-300 flex items-center justify-center",
          isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100",
          isDragging.current ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
      >
        <MessageSquare className="w-8 h-8 text-primary-foreground" />
      </Button>
    </div>
  );
}

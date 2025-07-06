'use client';

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent, useCallback } from 'react';
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
  const [buttonPosition, setButtonPosition] = useState<{ x: number, y: number } | null>(null);
  const [chatPosition, setChatPosition] = useState<{ x: number, y: number } | null>(null);
  const [wasDragged, setWasDragged] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isButtonDragging = useRef(false);
  const buttonDragOffset = useRef({ x: 0, y: 0 });

  const isChatDragging = useRef(false);
  const chatDragOffset = useRef({ x: 0, y: 0 });

  const [state, formAction] = useFormState(handleChatMessage, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleOpenChat = () => {
    if (wasDragged) return;
    setIsOpen(true);
    if (!chatPosition) {
      const chatWidth = 380;
      const chatHeight = 600;
      setChatPosition({
        x: (window.innerWidth - chatWidth) / 2,
        y: (window.innerHeight - chatHeight) / 2,
      });
    }
  };

  const handleQuestionClick = (question: string) => {
    const formData = new FormData();
    formData.append('message', question);
    formAction(formData);
  };

  const handleButtonMouseDown = useCallback((e: ReactMouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0 || !buttonRef.current) return;
    isButtonDragging.current = true;
    document.body.style.cursor = 'grabbing';
    const rect = buttonRef.current.getBoundingClientRect();
    buttonDragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleChatMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !chatPosition) return;
    isChatDragging.current = true;
    document.body.style.cursor = 'grabbing';
    chatDragOffset.current = {
        x: e.clientX - chatPosition.x,
        y: e.clientY - chatPosition.y,
    };
  }, [chatPosition]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (isButtonDragging.current && buttonRef.current) {
      setWasDragged(true);
      
      let newX = e.clientX - buttonDragOffset.current.x;
      let newY = e.clientY - buttonDragOffset.current.y;
      
      const widgetWidth = 64;
      const widgetHeight = 64;
      const margin = 20;
      
      newX = Math.max(margin, Math.min(newX, window.innerWidth - widgetWidth - margin));
      newY = Math.max(margin, Math.min(newY, window.innerHeight - widgetHeight - margin));

      setButtonPosition({ x: newX, y: newY });
    }

    if (isChatDragging.current && chatPosition) {
        let newX = e.clientX - chatDragOffset.current.x;
        let newY = e.clientY - chatDragOffset.current.y;
        
        const chatWidth = 380;
        const chatHeight = 600;
        
        newX = Math.max(0, Math.min(newX, window.innerWidth - chatWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - chatHeight));
        
        setChatPosition({ x: newX, y: newY });
    }
  }, [chatPosition, buttonPosition]);

  const handleGlobalMouseUp = useCallback(() => {
    if (isButtonDragging.current) {
        isButtonDragging.current = false;
        document.body.style.cursor = 'default';
        setTimeout(() => {
            setWasDragged(false);
        }, 0);
    }
    if (isChatDragging.current) {
        isChatDragging.current = false;
        document.body.style.cursor = 'default';
    }
  }, []);

  useEffect(() => {
    const setInitialPosition = () => {
      if (!buttonPosition) {
        const margin = 20;
        setButtonPosition({
          x: window.innerWidth - 64 - margin, 
          y: window.innerHeight - 64 - margin,
        });
      }
    };
    
    setInitialPosition();

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if(state.status === 'success' || state.status === 'error') {
      formRef.current?.reset();
    }
  }, [state.messages, state.status]);
  
  if (!buttonPosition) {
    return null;
  }

  return (
    <>
      <button
        ref={buttonRef}
        onMouseDown={handleButtonMouseDown}
        onClick={handleOpenChat}
        className={cn(
          "fixed z-40 bg-primary hover:bg-primary/90 rounded-none w-16 h-16 shadow-lg flex items-center justify-center",
          isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100",
          isButtonDragging.current ? "cursor-grabbing" : "cursor-grab",
          "transition-all duration-300"
        )}
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          transition: isButtonDragging.current ? 'none' : 'opacity 0.3s, transform 0.3s',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
        aria-label="Open Chat"
      >
        <MessageSquare className="w-8 h-8 text-primary-foreground" />
      </button>

      {isOpen && chatPosition && (
        <div
            className="fixed z-50 w-[380px] max-w-[90vw] h-[600px] max-h-[85vh] flex flex-col rounded-2xl shadow-2xl bg-card"
            style={{
                left: `${chatPosition.x}px`,
                top: `${chatPosition.y}px`,
                transition: isChatDragging.current ? 'none' : '',
            }}
        >
           <Card className="w-full h-full flex flex-col shadow-none border-none overflow-hidden rounded-2xl">
            <form action={formAction} ref={formRef} className="flex flex-col flex-1 h-full">
              <CardHeader
                onMouseDown={handleChatMouseDown}
                className="flex flex-row items-center justify-between p-4 border-b cursor-grab active:cursor-grabbing"
              >
                 <div className="flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-full">
                      <Sparkles className="text-primary w-6 h-6" />
                    </span>
                    <CardTitle className="text-lg font-semibold">Помощник POCHINI</CardTitle>
                 </div>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Закрыть чат</span>
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
      )}
    </>
  );
}

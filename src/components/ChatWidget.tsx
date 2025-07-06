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
  messages: [] as ChatMessage[],
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
            <Avatar className="w-8 h-8 border border-primary/50 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
            </Avatar>
          )}
           <div
            className={cn(
              'rounded-xl px-4 py-2.5 max-w-[85%] text-sm break-words shadow-sm min-w-0',
              msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none',
              msg.role === 'system' && 'w-full text-center bg-transparent text-muted-foreground text-xs italic shadow-none'
            )}
          >
            {msg.content}
          </div>
           {msg.role === 'user' && (
            <Avatar className="w-8 h-8 border flex-shrink-0">
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
  
  const formRef = useRef<HTMLFormElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    isDragging: false,
    element: null as 'button' | 'chat' | null,
    offset: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
  });

  const [state, formAction] = useFormState(handleChatMessage, initialState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const handleOpenChat = () => {
    if (wasDragged) return;
    setIsOpen(true);
    setChatPosition(null); 
  };

  const handleCloseChat = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen && !chatPosition && chatWindowRef.current) {
        const chatWidth = chatWindowRef.current.offsetWidth;
        const chatHeight = chatWindowRef.current.offsetHeight;
        const x = Math.max(0, (window.innerWidth - chatWidth) / 2);
        const y = Math.max(20, (window.innerHeight - chatHeight) / 2);
        setChatPosition({ x, y });
    }
  }, [isOpen, chatPosition]);

  const handleQuestionClick = (question: string) => {
    const formData = new FormData();
    formData.append('message', question);
    formAction(formData);
  };

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLElement>, element: 'button' | 'chat') => {
    // Allow clicks on buttons inside the draggable area
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, input')) {
      if (element === 'chat' && !(e.target as HTMLElement).closest('[data-drag-handle]')) {
        return;
      }
    }
    
    const targetElement = e.currentTarget;
    const rect = targetElement.getBoundingClientRect();

    dragState.current = {
        isDragging: true,
        element,
        offset: {
            x: e.clientX,
            y: e.clientY,
        },
        startPos: element === 'button' && buttonPosition ? buttonPosition : chatPosition || { x: rect.left, y: rect.top },
    };
    document.body.style.cursor = 'grabbing';
    e.preventDefault();
  }, [buttonPosition, chatPosition]);

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging) return;
    
    if (!wasDragged) {
      setWasDragged(true);
    }

    const deltaX = e.clientX - dragState.current.offset.x;
    const deltaY = e.clientY - dragState.current.offset.y;
    const startPos = dragState.current.startPos;

    if (dragState.current.element === 'button') {
        let newX = startPos.x + deltaX;
        let newY = startPos.y + deltaY;
        
        const widgetWidth = 64;
        const widgetHeight = 64;
        const margin = 20;
        
        newX = Math.max(margin, Math.min(newX, window.innerWidth - widgetWidth - margin));
        newY = Math.max(margin, Math.min(newY, window.innerHeight - widgetHeight - margin));

        setButtonPosition({ x: newX, y: newY });
    }

    if (dragState.current.element === 'chat' && chatWindowRef.current) {
        let newX = startPos.x + deltaX;
        let newY = startPos.y + deltaY;
        
        const chatWidth = chatWindowRef.current.offsetWidth;
        const chatHeight = chatWindowRef.current.offsetHeight;
        
        newX = Math.max(0, Math.min(newX, window.innerWidth - chatWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - chatHeight));
        
        setChatPosition({ x: newX, y: newY });
    }
  }, [wasDragged]);

  const handleGlobalMouseUp = useCallback(() => {
    if (dragState.current.isDragging) {
        dragState.current.isDragging = false;
        dragState.current.element = null;
        document.body.style.cursor = 'default';
        setTimeout(() => {
            setWasDragged(false);
        }, 0);
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
  }, [handleGlobalMouseMove, handleGlobalMouseUp, buttonPosition]);

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
        onMouseDown={(e) => handleMouseDown(e, 'button')}
        onClick={handleOpenChat}
        className={cn(
          "fixed z-40 bg-primary hover:bg-primary/90 rounded-full w-16 h-16 shadow-lg flex items-center justify-center animate-breathing-pulse",
          isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100",
          dragState.current.isDragging && dragState.current.element === 'button' ? "cursor-grabbing" : "cursor-grab",
          "transition-all duration-300"
        )}
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          transition: dragState.current.isDragging ? 'none' : 'opacity 0.3s, transform 0.3s',
        }}
        aria-label="Открыть чат"
      >
        <MessageSquare className="w-8 h-8 text-primary-foreground" />
      </button>

      {isOpen && (
        <div
            ref={chatWindowRef}
            className={cn(
                "fixed z-50 w-[90vw] max-w-[380px] h-auto max-h-[85vh] md:max-h-[600px] flex flex-col rounded-2xl shadow-2xl bg-card",
                !chatPosition && "opacity-0 pointer-events-none"
            )}
            style={chatPosition ? {
                left: `${chatPosition.x}px`,
                top: `${chatPosition.y}px`,
                transition: dragState.current.isDragging ? 'none' : 'opacity 0.2s',
            } : {}}
        >
           <Card className="w-full h-full flex flex-col shadow-none border-none overflow-hidden rounded-2xl">
            <form action={formAction} ref={formRef} className="flex flex-col flex-1 h-full min-h-0">
              <CardHeader
                onMouseDown={(e) => handleMouseDown(e, 'chat')}
                data-drag-handle
                className={cn(
                  "flex flex-row items-center justify-between p-4 border-b",
                  "cursor-grab active:cursor-grabbing"
                )}
              >
                 <div className="flex items-center gap-3">
                    <span className="p-2 bg-primary/10 rounded-full">
                      <Sparkles className="text-primary w-6 h-6" />
                    </span>
                    <CardTitle className="text-lg font-semibold">Помощник POCHINI</CardTitle>
                 </div>
                 <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleCloseChat}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Закрыть чат</span>
                 </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 flex flex-col min-h-0">
                <ScrollArea className="h-full px-4 pt-4">
                   {state.messages.length === 0 && (
                      <div className="space-y-6 pb-4">
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="w-8 h-8 border border-primary/50 flex-shrink-0">
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={20}/></AvatarFallback>
                            </Avatar>
                            <div className={'rounded-xl px-4 py-2.5 max-w-[85%] text-sm break-words shadow-sm bg-muted rounded-bl-none min-w-0'}>
                                Здравствуйте! Чем могу помочь с вашим автомобилем?
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-muted-foreground mb-3">Возможные вопросы:</p>
                                <div className="flex flex-wrap gap-2">
                                {predefinedQuestions.map((q, i) => (
                                    <Button
                                        key={i}
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleQuestionClick(q)}
                                        className="rounded-full h-auto py-1 px-2.5 text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        {q}
                                    </Button>
                                ))}
                                </div>
                            </div>
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

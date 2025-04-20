import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, ClipboardCopy, Sparkles, HelpCircle, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

// Nuova interfaccia per la spiegazione delle emoji
interface EmojiExplanation {
  emoji: string;
  meaning: string;
}

interface DreamEmojiTranslatorProps {
  dreamContent: string;
  emojiTranslation?: string;
  onEmojiTranslationChange: (emojiTranslation: string) => void;
}

export function DreamEmojiTranslator({
  dreamContent,
  emojiTranslation,
  onEmojiTranslationChange,
}: DreamEmojiTranslatorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [emojiExplanations, setEmojiExplanations] = useState<EmojiExplanation[]>([]);
  const [emojiMood, setEmojiMood] = useState<string>('');
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const emojiContainerRef = useRef<HTMLDivElement>(null);

  const generateEmojiTranslation = async () => {
    if (!dreamContent) {
      setError('Non c\'è alcun sogno da tradurre in emoji');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/genera-emoji', { sogno: dreamContent });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onEmojiTranslationChange(data.emojiTranslation);
      setEmojiExplanations(data.emojiExplanations || []);
      setEmojiMood(data.emojiMood || '');
      toast({
        description: 'Traduzione emoji generata con successo',
      });
    } catch (err: any) {
      setError(`Errore nella generazione delle emoji: ${err.message || 'Si è verificato un errore'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Se l'emoji viene selezionata, mostra il tooltip con la spiegazione
  const handleEmojiClick = (emoji: string) => {
    setSelectedEmoji(selectedEmoji === emoji ? null : emoji);
  };

  const copyToClipboard = () => {
    if (emojiTranslation) {
      navigator.clipboard.writeText(emojiTranslation).then(
        () => {
          toast({
            description: 'Emoji copiate negli appunti',
          });
        },
        (err) => {
          console.error('Impossibile copiare negli appunti:', err);
          toast({
            variant: 'destructive',
            description: 'Impossibile copiare negli appunti',
          });
        }
      );
    }
  };

  // Funzione per trovare la spiegazione di un'emoji
  const getEmojiExplanation = (emoji: string): string => {
    const explanation = emojiExplanations.find(e => e.emoji === emoji);
    return explanation?.meaning || 'Nessuna spiegazione disponibile';
  };

  // Componente per visualizzare le emoji con interattività
  const InteractiveEmojis = () => {
    if (!emojiTranslation) return null;

    // Dividiamo la stringa in singoli caratteri emoji
    // Nota: questo è un approccio semplificato, le emoji possono essere composte da più caratteri Unicode
    const emojiArray = Array.from(emojiTranslation);

    return (
      <div ref={emojiContainerRef} className="emoji-container flex flex-wrap gap-1 text-3xl leading-relaxed">
        {emojiArray.map((emoji, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.span
                  className="emoji-item cursor-pointer hover:scale-125 inline-block transition-transform"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1, 
                    opacity: 1,
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    duration: 0.5,
                    delay: index * 0.1,
                    y: {
                      duration: 0.5,
                      delay: index * 0.1 + 0.5,
                      ease: "easeOut"
                    }
                  }}
                  whileHover={{ 
                    scale: 1.3,
                    rotate: [-5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </motion.span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-sm">
                {getEmojiExplanation(emoji)}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  return (
    <Card className="relative overflow-hidden dark:bg-gray-800/60 light:bg-white/80 border-2 dark:border-purple-900/50 light:border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Smile className="h-5 w-5 mr-2 dark:text-yellow-400 light:text-indigo-600" />
            Traduttore Emoji del Sogno
          </div>

          {emojiTranslation && emojiExplanations.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm"
            >
              {showDetails ? 
                <X className="h-4 w-4 mr-1" /> : 
                <HelpCircle className="h-4 w-4 mr-1" />
              }
              {showDetails ? 'Nascondi dettagli' : 'Mostra dettagli'}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Traduci il tuo sogno in una sequenza di emoji per condividerlo più facilmente
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : emojiTranslation ? (
          <motion.div 
            className="relative p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InteractiveEmojis />
            
            {emojiMood && (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Badge variant="outline" className="bg-indigo-100/30 dark:bg-indigo-900/30 text-xs">
                  {emojiMood}
                </Badge>
              </motion.div>
            )}

            <AnimatePresence>
              {showDetails && (
                <motion.div 
                  className="mt-4 space-y-2 bg-white/20 dark:bg-black/20 p-3 rounded-md"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-sm font-medium">Significato delle emoji:</h4>
                  <ul className="space-y-2 text-sm">
                    {emojiExplanations.map((item, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <span className="text-xl flex-shrink-0">{item.emoji}</span>
                        <span className="text-sm">{item.meaning}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md dark:border-gray-700 light:border-gray-300">
            <Smile className="h-10 w-10 mb-3 dark:text-gray-500 light:text-gray-400" />
            <p className="text-center dark:text-gray-400 light:text-gray-500">
              Genera una traduzione emoji del tuo sogno per condividere il tuo racconto in modo divertente e visuale
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={generateEmojiTranslation}
          disabled={loading || !dreamContent}
          className="dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 light:bg-indigo-50 light:hover:bg-indigo-100"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {emojiTranslation ? 'Rigenera Emoji' : 'Genera Emoji'}
        </Button>

        {emojiTranslation && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="dark:text-purple-300 dark:hover:text-purple-200 light:text-indigo-600 light:hover:text-indigo-800"
            >
              <ClipboardCopy className="h-4 w-4 mr-2" />
              Copia Emoji
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="dark:text-purple-300 dark:hover:text-purple-200 light:text-indigo-600 light:hover:text-indigo-800"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-2">Condividi le tue emoji su:</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(emojiTranslation)}`, '_blank')}
                      className="bg-green-500 hover:bg-green-600 text-white w-full"
                    >
                      WhatsApp
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(emojiTranslation)}`, '_blank')}
                      className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                    >
                      Telegram
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
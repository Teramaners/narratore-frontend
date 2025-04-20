import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  // Funzione per tradurre il sogno in emoji
  const translateToEmoji = async () => {
    if (!dreamContent.trim()) {
      toast({
        variant: 'destructive',
        description: 'Non c\'è un sogno da tradurre. Inserisci prima un sogno.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest('POST', '/api/genera-emoji', { sogno: dreamContent });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onEmojiTranslationChange(data.emojiTranslation);
      
      toast({
        description: 'Traduzione emoji completata!',
      });
    } catch (error: any) {
      console.error('Errore nella traduzione emoji:', error);
      toast({
        variant: 'destructive',
        description: `Errore: ${error.message || 'Problema nella traduzione emoji.'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Funzione per copiare le emoji negli appunti
  const copyEmojiToClipboard = () => {
    if (!emojiTranslation) return;
    
    navigator.clipboard.writeText(emojiTranslation)
      .then(() => {
        toast({
          description: 'Emoji copiate negli appunti!',
        });
      })
      .catch((error) => {
        console.error('Errore nella copia:', error);
        toast({
          variant: 'destructive',
          description: 'Non è stato possibile copiare le emoji.',
        });
      });
  };

  return (
    <Card className="p-4 bg-white/10 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/30 rounded-lg shadow-md">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">
            Traduzione Emoji
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              onClick={translateToEmoji}
              disabled={loading || !dreamContent}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">Genera</span>
            </Button>
            {emojiTranslation && (
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                onClick={copyEmojiToClipboard}
              >
                <Copy className="h-4 w-4" />
                <span className="ml-1 text-xs">Copia</span>
              </Button>
            )}
          </div>
        </div>

        {emojiTranslation ? (
          <div className="min-h-16 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md flex items-center justify-center">
            <p className="text-2xl leading-relaxed tracking-wide text-center">
              {emojiTranslation}
            </p>
          </div>
        ) : (
          <div className="min-h-16 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-md flex items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center italic">
              {loading
                ? 'Traduzione in corso...'
                : 'Clicca su "Genera" per tradurre il tuo sogno in emoji'}
            </p>
          </div>
        )}

        {emojiTranslation && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
            Ecco la traduzione del tuo sogno in emoji! Ogni simbolo rappresenta un elemento o un'emozione del tuo sogno.
          </p>
        )}
      </div>
    </Card>
  );
}
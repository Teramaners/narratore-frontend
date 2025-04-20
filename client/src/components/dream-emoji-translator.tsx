import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, ClipboardCopy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card className="relative overflow-hidden dark:bg-gray-800/60 light:bg-white/80 border-2 dark:border-purple-900/50 light:border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Smile className="h-5 w-5 mr-2 dark:text-yellow-400 light:text-indigo-600" />
          Traduttore Emoji del Sogno
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
          </div>
        ) : emojiTranslation ? (
          <div className="relative p-4 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950 rounded-md">
            <p className="text-2xl leading-relaxed break-words">{emojiTranslation}</p>
          </div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="dark:text-purple-300 dark:hover:text-purple-200 light:text-indigo-600 light:hover:text-indigo-800"
          >
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copia Emoji
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
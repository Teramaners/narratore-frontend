import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, Download, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface DreamImageGeneratorProps {
  dreamContent: string;
  dreamStory: string;
  dreamImageUrl?: string;
  onImageUrlChange: (imageUrl: string) => void;
}

export function DreamImageGenerator({
  dreamContent,
  dreamStory,
  dreamImageUrl,
  onImageUrlChange,
}: DreamImageGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDreamImage = async () => {
    if (!dreamContent || !dreamStory) {
      setError('Per generare un\'immagine sono necessari sia il sogno che il racconto');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest('POST', '/api/genera-immagine', { 
        sogno: dreamContent,
        racconto: dreamStory
      });
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onImageUrlChange(data.imageUrl);
      toast({
        description: 'Immagine generata con successo',
      });
    } catch (err: any) {
      setError(`Errore nella generazione dell'immagine: ${err.message || 'Si è verificato un errore'}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (dreamImageUrl) {
      // Crea un elemento link temporaneo
      const downloadLink = document.createElement('a');
      downloadLink.href = dreamImageUrl;
      downloadLink.download = `sogno_illustrato_${Date.now()}.svg`;
      downloadLink.target = '_blank';
      
      // Simula un click per avviare il download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        description: 'Download immagine iniziato',
      });
    }
  };

  return (
    <Card className="relative overflow-hidden dark:bg-gray-800/60 light:bg-white/80 border-2 dark:border-purple-900/50 light:border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <ImageIcon className="h-5 w-5 mr-2 dark:text-green-400 light:text-indigo-600" />
          Illustrazione del Sogno
        </CardTitle>
        <CardDescription>
          Genera un'immagine artistica ispirata al tuo sogno e al racconto
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
            <Skeleton className="h-40 w-full" />
          </div>
        ) : dreamImageUrl ? (
          <div className="relative overflow-hidden rounded-md">
            <img 
              src={dreamImageUrl} 
              alt="Illustrazione del sogno" 
              className="w-full h-auto object-cover rounded-md border dark:border-gray-700 light:border-gray-300"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md dark:border-gray-700 light:border-gray-300">
            <ImageIcon className="h-10 w-10 mb-3 dark:text-gray-500 light:text-gray-400" />
            <p className="text-center dark:text-gray-400 light:text-gray-500">
              Genera un'immagine artistica che rappresenti visivamente il tuo sogno e il racconto generato
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={generateDreamImage}
          disabled={loading || !dreamContent || !dreamStory}
          className="dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 light:bg-indigo-50 light:hover:bg-indigo-100"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {dreamImageUrl ? 'Rigenera Immagine' : 'Genera Immagine'}
        </Button>

        {dreamImageUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadImage}
            className="dark:text-purple-300 dark:hover:text-purple-200 light:text-indigo-600 light:hover:text-indigo-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Scarica
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Heart, LineChart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Definiamo le interfacce per i dati emotivi
interface EmotionData {
  name: string;
  intensity: number;
  description: string;
  color: string;
}

interface EmotionAnalysisData {
  primaryEmotion: string;
  emotions: EmotionData[];
  analysis: string;
}

interface DreamEmotionAnalysisProps {
  dreamContent: string;
  dreamStory: string;
}

export function DreamEmotionAnalysis({ dreamContent, dreamStory }: DreamEmotionAnalysisProps) {
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<EmotionAnalysisData | null>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Mutation per analizzare le emozioni
  const emotionAnalysisMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/analizza-emozioni', {
        sogno: dreamContent,
        racconto: dreamStory,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Errore nell\'analisi delle emozioni');
      }
      
      return res.json();
    },
    onSuccess: (data: EmotionAnalysisData) => {
      setAnalysisData(data);
      toast({
        description: "Analisi delle emozioni completata con successo",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        description: `Errore: ${error.message}`,
      });
    },
  });

  // Funzione per ottenere il colore di sfondo per la barra in base all'intensità
  const getGradientStyle = (color: string, intensity: number) => {
    return {
      background: `linear-gradient(90deg, ${color} 0%, ${color}88 ${intensity * 10}%, transparent ${intensity * 10}%, transparent 100%)`,
      height: '24px',
      borderRadius: '4px',
      position: 'relative' as const,
      marginBottom: '8px',
    };
  };

  // Funzione per gestire l'avvio dell'analisi
  const handleAnalyzeEmotions = () => {
    if (!dreamContent || !dreamStory) {
      toast({
        variant: 'destructive',
        description: 'È necessario avere sia un sogno che un racconto per analizzare le emozioni',
      });
      return;
    }

    emotionAnalysisMutation.mutate();
  };

  return (
    <Card className="relative overflow-hidden dark:bg-gray-800/60 light:bg-white/80 border-2 dark:border-purple-900/50 light:border-indigo-100">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Heart className="h-5 w-5 mr-2 dark:text-pink-400 light:text-red-500" />
          Analisi Emotiva Avanzata
        </CardTitle>
        <CardDescription>
          Analizza le emozioni complesse presenti nel tuo sogno
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!analysisData && !emotionAnalysisMutation.isPending && (
          <div className="flex justify-center py-4">
            <Button 
              onClick={handleAnalyzeEmotions}
              className="dark:bg-purple-700 dark:hover:bg-purple-600 light:bg-indigo-500 light:hover:bg-indigo-400"
            >
              <LineChart className="h-4 w-4 mr-2" />
              Analizza Emozioni
            </Button>
          </div>
        )}

        {emotionAnalysisMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin dark:text-purple-400 light:text-indigo-400 mb-2" />
            <p className="text-sm dark:text-gray-400 light:text-gray-500">
              Analisi delle emozioni in corso...
            </p>
          </div>
        )}

        {analysisData && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2">Emozione Principale: <span className="font-normal">{analysisData.primaryEmotion}</span></h3>
              <p className="text-sm dark:text-gray-300 light:text-gray-600">{analysisData.analysis}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-md font-semibold">Mappa Emotiva:</h3>
              
              {analysisData.emotions.map((emotion, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{emotion.name}</span>
                    <span className="text-sm">{emotion.intensity}/10</span>
                  </div>
                  <div style={getGradientStyle(emotion.color, emotion.intensity)}>
                    <div className="absolute inset-0 flex items-center px-2">
                      <span className="text-xs font-semibold text-white drop-shadow-md">
                        {emotion.intensity >= 3 ? emotion.name : ''}
                      </span>
                    </div>
                  </div>
                  
                  {expanded && (
                    <p className="text-xs dark:text-gray-400 light:text-gray-500 mt-1 mb-3">
                      {emotion.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {analysisData && (
        <CardFooter className="pt-0 flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="text-xs dark:text-gray-400 light:text-gray-500"
          >
            {expanded ? 'Nascondi dettagli' : 'Mostra dettagli'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
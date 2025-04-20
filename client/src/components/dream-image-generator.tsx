import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon, Download, Sparkles, Paintbrush, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Tipo per lo stile artistico
interface ArtStyle {
  name: string;
  description: string;
  promptModifier: string;
}

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
  const [artStyles, setArtStyles] = useState<ArtStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("surrealista");
  const [imageDescription, setImageDescription] = useState<string>("");
  const [isDescDialogOpen, setIsDescDialogOpen] = useState(false);

  // Carica gli stili artistici disponibili all'inizializzazione del componente
  useEffect(() => {
    const fetchArtStyles = async () => {
      try {
        const response = await fetch('/api/stili-artistici');
        if (!response.ok) {
          throw new Error('Errore nel recupero degli stili artistici');
        }
        const stylesData = await response.json();
        setArtStyles(stylesData);
      } catch (err) {
        console.error('Errore nel caricamento degli stili artistici:', err);
        // Stili di fallback se non riusciamo a caricare quelli dal server
        setArtStyles([
          { name: "surrealista", description: "Stile onirico e simbolico", promptModifier: "" },
          { name: "impressionista", description: "Cattura luce e atmosfera", promptModifier: "" },
          { name: "fantasy", description: "Mondo magico e fantastico", promptModifier: "" },
          { name: "noir", description: "Contrasti drammatici", promptModifier: "" },
          { name: "minimalista", description: "Essenziale e semplice", promptModifier: "" }
        ]);
      }
    };

    fetchArtStyles();
  }, []);

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
        racconto: dreamStory,
        stileArtistico: selectedStyle
      });
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onImageUrlChange(data.imageUrl);
      
      // Salva la descrizione dell'immagine se disponibile
      if (data.description) {
        setImageDescription(data.description);
      }
      
      toast({
        description: 'Immagine generata con successo nello stile ' + selectedStyle,
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
      downloadLink.download = `sogno_illustrato_${selectedStyle}_${Date.now()}.svg`;
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

  // Traduzione italiano-inglese per i nomi degli stili
  const getStyleDisplayName = (name: string): string => {
    const styleNames: Record<string, string> = {
      "surrealista": "Surrealista",
      "impressionista": "Impressionista",
      "fantasy": "Fantasy",
      "noir": "Noir",
      "minimalista": "Minimalista"
    };
    
    return styleNames[name] || name;
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

        <div className="mb-4">
          <Label htmlFor="artStyle" className="block text-sm font-medium mb-1">
            Stile Artistico
          </Label>
          <Select 
            value={selectedStyle} 
            onValueChange={setSelectedStyle}
            disabled={loading}
          >
            <SelectTrigger id="artStyle" className="w-full">
              <SelectValue placeholder="Seleziona uno stile artistico" />
            </SelectTrigger>
            <SelectContent>
              {artStyles.map((style) => (
                <SelectItem key={style.name} value={style.name}>
                  <div className="flex flex-col">
                    <span>{getStyleDisplayName(style.name)}</span>
                    <span className="text-xs text-gray-500">{style.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : dreamImageUrl ? (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-md">
              <img 
                src={dreamImageUrl} 
                alt="Illustrazione del sogno" 
                className="w-full h-auto object-cover rounded-md border dark:border-gray-700 light:border-gray-300"
              />
            </div>
            
            {imageDescription && (
              <div className="mt-2">
                <Dialog open={isDescDialogOpen} onOpenChange={setIsDescDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizza Descrizione
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Descrizione dell'Immagine</DialogTitle>
                      <DialogDescription>
                        Ecco la descrizione dettagliata dell'immagine generata
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[50vh] overflow-y-auto">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{imageDescription}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md dark:border-gray-700 light:border-gray-300">
            <Paintbrush className="h-10 w-10 mb-3 dark:text-gray-500 light:text-gray-400" />
            <p className="text-center dark:text-gray-400 light:text-gray-500">
              Genera un'immagine artistica che rappresenti visivamente il tuo sogno nello stile selezionato
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
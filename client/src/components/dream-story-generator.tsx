import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Loader2 } from "lucide-react";

interface LiteraryStyle {
  id: string;
  name: string;
  description: string;
}

interface DreamStoryGeneratorProps {
  dreamContent: string;
  onStoryGenerated: (story: string, title?: string) => void;
}

export function DreamStoryGenerator({ dreamContent, onStoryGenerated }: DreamStoryGeneratorProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [literaryStyles, setLiteraryStyles] = useState<LiteraryStyle[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>("surrealista");
  const [selectedLength, setSelectedLength] = useState<string>("medio");
  const [selectedTone, setSelectedTone] = useState<string>("onirico");
  const [includeTitle, setIncludeTitle] = useState<boolean>(true);
  const [stylesLoading, setStylesLoading] = useState(true);

  // Carica gli stili letterari disponibili
  useEffect(() => {
    const fetchStyles = async () => {
      try {
        const response = await apiRequest("GET", "/api/stili-letterari");
        const styles = await response.json();
        setLiteraryStyles(styles);
      } catch (error) {
        console.error("Errore nel caricamento degli stili letterari:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile caricare gli stili letterari."
        });
      } finally {
        setStylesLoading(false);
      }
    };

    fetchStyles();
  }, [toast]);

  const generateStory = async () => {
    if (!dreamContent.trim()) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Inserisci il contenuto del sogno prima di generare la storia."
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("POST", "/api/genera-racconto", {
        sogno: dreamContent,
        stile: selectedStyle,
        lunghezza: selectedLength,
        tono: selectedTone,
        includiTitolo: includeTitle
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      onStoryGenerated(data.racconto, data.titolo);
      
      toast({
        title: "Storia generata",
        description: "La tua storia è stata generata con successo."
      });
    } catch (error) {
      console.error("Errore nella generazione della storia:", error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Si è verificato un errore: ${error instanceof Error ? error.message : "Problema nella generazione della storia"}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Personalizza la tua storia</CardTitle>
        <CardDescription>
          Personalizza come l'AI trasformerà il tuo sogno in un racconto letterario
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="style">Stile letterario</Label>
          <Select 
            disabled={stylesLoading || loading} 
            value={selectedStyle} 
            onValueChange={setSelectedStyle}
          >
            <SelectTrigger id="style">
              <SelectValue placeholder="Seleziona uno stile" />
            </SelectTrigger>
            <SelectContent>
              {literaryStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <span className="font-medium">{style.name}</span> - {style.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="length">Lunghezza del racconto</Label>
          <Select 
            disabled={loading} 
            value={selectedLength} 
            onValueChange={setSelectedLength}
          >
            <SelectTrigger id="length">
              <SelectValue placeholder="Seleziona la lunghezza" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breve">Breve (300-400 parole)</SelectItem>
              <SelectItem value="medio">Medio (500-600 parole)</SelectItem>
              <SelectItem value="lungo">Lungo (800-1000 parole)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tono del racconto</Label>
          <Select 
            disabled={loading} 
            value={selectedTone} 
            onValueChange={setSelectedTone}
          >
            <SelectTrigger id="tone">
              <SelectValue placeholder="Seleziona il tono" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onirico">Onirico</SelectItem>
              <SelectItem value="misterioso">Misterioso</SelectItem>
              <SelectItem value="drammatico">Drammatico</SelectItem>
              <SelectItem value="romantico">Romantico</SelectItem>
              <SelectItem value="comico">Comico</SelectItem>
              <SelectItem value="inquietante">Inquietante</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="title"
            checked={includeTitle}
            onCheckedChange={setIncludeTitle}
            disabled={loading}
          />
          <Label htmlFor="title" className="cursor-pointer">Includi titolo separato</Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={generateStory}
          disabled={loading || !dreamContent.trim()}
          className="dark:bg-purple-600 dark:hover:bg-purple-700 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando la storia...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Genera storia personalizzata
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
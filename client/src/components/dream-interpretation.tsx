import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface DreamInterpretationProps {
  dreamContent: string;
  interpretation?: string;
  symbolism?: string;
  insight?: string;
  onInterpretationChange: (interpretation: string, symbolism: string, insight: string) => void;
}

export function DreamInterpretation({ 
  dreamContent, 
  interpretation, 
  symbolism, 
  insight, 
  onInterpretationChange 
}: DreamInterpretationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("interpretazione");
  const { toast } = useToast();
  
  const hasInterpretationData = interpretation && symbolism && insight;
  
  const generateInterpretation = async () => {
    if (isLoading || !dreamContent) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/interpreta-sogno", { sogno: dreamContent });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Aggiorna l'interpretazione del sogno
      onInterpretationChange(
        data.interpretation,
        data.symbolism,
        data.insight
      );
      
      toast({
        description: "Interpretazione del sogno generata con successo!"
      });
    } catch (err: any) {
      console.error("Errore nell'interpretazione del sogno:", err);
      toast({
        variant: "destructive",
        description: `Errore: ${err.message || "Problema nell'interpretazione del sogno. Riprova più tardi."}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper per verificare se una stringa è vuota o contiene "null"/"undefined"
  const hasContent = (text?: string) => {
    if (!text) return false;
    return !["null", "undefined", ""].includes(text.trim());
  };
  
  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm mt-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-500" />
            <CardTitle className="text-lg font-semibold">Interpretazione del sogno</CardTitle>
          </div>
          
          <Button
            variant={hasInterpretationData ? "outline" : "default"}
            size="sm"
            onClick={generateInterpretation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisi in corso...
              </>
            ) : hasInterpretationData ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rigenera
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analizza il sogno
              </>
            )}
          </Button>
        </div>
        <CardDescription>
          Scopri i significati nascosti del tuo sogno con l'aiuto dell'intelligenza artificiale
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!hasInterpretationData && !isLoading && (
          <div className="text-center py-6">
            <Lightbulb className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Fai analizzare il tuo sogno dall'intelligenza artificiale per scoprire significati più profondi.
            </p>
            <Button
              className="mt-4"
              onClick={generateInterpretation}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analizza il sogno
            </Button>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 text-purple-500 animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">
              Analisi del sogno in corso...
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Stiamo esaminando i simboli e i significati nel tuo sogno
            </p>
          </div>
        )}
        
        {hasInterpretationData && !isLoading && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="interpretazione" className="flex-1">
                Interpretazione
              </TabsTrigger>
              <TabsTrigger value="simbolismo" className="flex-1">
                Simbolismo
              </TabsTrigger>
              <TabsTrigger value="approfondimento" className="flex-1">
                Approfondimento
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="interpretazione" className="p-1">
              {hasContent(interpretation) ? (
                <div className="space-y-3">
                  <Badge variant="outline" className="text-purple-500 border-purple-200 mb-2">
                    Significato generale
                  </Badge>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {interpretation}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessuna interpretazione disponibile. Prova a generarla.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="simbolismo" className="p-1">
              {hasContent(symbolism) ? (
                <div className="space-y-3">
                  <Badge variant="outline" className="text-blue-500 border-blue-200 mb-2">
                    Analisi dei simboli
                  </Badge>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {symbolism}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessuna analisi simbolica disponibile. Prova a generarla.
                </p>
              )}
            </TabsContent>
            
            <TabsContent value="approfondimento" className="p-1">
              {hasContent(insight) ? (
                <div className="space-y-3">
                  <Badge variant="outline" className="text-amber-500 border-amber-200 mb-2">
                    Approfondimento psicologico
                  </Badge>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {insight}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nessun approfondimento disponibile. Prova a generarlo.
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
        
        <p className="text-xs text-muted-foreground mt-4">
          Le interpretazioni dei sogni sono soggettive e vengono fornite solo a scopo informativo.
        </p>
      </CardContent>
    </Card>
  );
}
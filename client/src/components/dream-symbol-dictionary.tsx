import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Search, X, Book, ArrowRight, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface DreamSymbol {
  symbol: string;
  briefDescription: string;
}

interface SymbolInfo {
  symbol: string;
  meanings: {
    general: string;
    psychological: string;
    cultural: string[];
  };
  relatedSymbols: string[];
  categories: string[];
}

interface DreamSymbolDictionaryProps {
  dreamContent: string;
}

export function DreamSymbolDictionary({ dreamContent }: DreamSymbolDictionaryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [openSymbolDialog, setOpenSymbolDialog] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  // Utilizziamo categorie predefinite per motivi di semplicità e prestazioni
  // invece di chiamare l'API
  const categories = [
    "Natura",
    "Animali",
    "Persone",
    "Luoghi",
    "Oggetti",
    "Elementi",
    "Emozioni",
    "Azioni",
    "Situazioni",
    "Spirituale",
    "Mitologico",
    "Famiglia",
    "Lavoro",
    "Viaggio"
  ];
  const categoriesLoading = false;
  
  // Mutazione per estrarre simboli dal testo del sogno
  const extractSymbolsMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest("POST", "/api/simboli-sogno/estrai", { testo: text });
      return await response.json();
    },
  });
  
  // Query per ottenere informazioni dettagliate su un simbolo specifico
  const { data: symbolInfo, isLoading: symbolInfoLoading } = useQuery({
    queryKey: ["/api/simboli-sogno", selectedSymbol],
    queryFn: async () => {
      if (!selectedSymbol) return null;
      const response = await apiRequest("GET", `/api/simboli-sogno/${encodeURIComponent(selectedSymbol)}`);
      return await response.json();
    },
    enabled: !!selectedSymbol,
  });
  
  // Gestisce l'estrazione dei simboli dal sogno corrente
  const handleExtractSymbols = () => {
    if (dreamContent) {
      extractSymbolsMutation.mutate(dreamContent);
    }
  };
  
  // Gestisce la ricerca di simboli
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Gestisce il click su un simbolo per vederne i dettagli
  const handleSymbolClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setOpenSymbolDialog(true);
  };
  
  // Filtra i simboli in base al termine di ricerca o alla categoria selezionata
  const getFilteredSymbols = () => {
    if (!extractSymbolsMutation.data?.mainSymbols) return [];
    
    return extractSymbolsMutation.data.mainSymbols.filter((symbolObj: DreamSymbol) => {
      const matchesSearch = searchTerm ? 
        symbolObj.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symbolObj.briefDescription.toLowerCase().includes(searchTerm.toLowerCase()) :
        true;
        
      if (!activeCategory) return matchesSearch;
      
      // Se abbiamo i dati del simbolo, filtriamo anche per categoria
      if (symbolInfo && symbolInfo.symbol === symbolObj.symbol) {
        return matchesSearch && symbolInfo.categories.includes(activeCategory);
      }
      
      return matchesSearch;
    });
  };
  
  const filteredSymbols = getFilteredSymbols();
  
  // Componente per visualizzare le informazioni dettagliate di un simbolo
  const SymbolInfoContent = ({ info }: { info: SymbolInfo }) => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Significato Generale</h3>
        <p className="text-muted-foreground">{info.meanings.general}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Interpretazione Psicologica</h3>
        <p className="text-muted-foreground">{info.meanings.psychological}</p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Interpretazioni Culturali</h3>
        <Accordion type="single" collapsible className="w-full">
          {info.meanings.cultural.map((culture, index) => (
            <AccordionItem key={index} value={`culture-${index}`}>
              <AccordionTrigger>Cultura {index + 1}</AccordionTrigger>
              <AccordionContent>{culture}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Categorie</h3>
        <div className="flex flex-wrap gap-2">
          {info.categories.map((category, index) => (
            <Badge key={index} variant="outline">{category}</Badge>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Simboli Correlati</h3>
        <div className="flex flex-wrap gap-2">
          {info.relatedSymbols.map((symbol, index) => (
            <Button 
              key={index} 
              variant="link" 
              className="p-0 h-auto"
              onClick={() => {
                setSelectedSymbol(symbol);
              }}
            >
              {symbol}
              {index < info.relatedSymbols.length - 1 && ", "}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5" />
          Dizionario dei Simboli
        </CardTitle>
        <CardDescription>
          Esplora i simboli presenti nel tuo sogno e scopri il loro significato profondo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!dreamContent || extractSymbolsMutation.isPending}
              onClick={handleExtractSymbols}
            >
              {extractSymbolsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisi...
                </>
              ) : (
                <>
                  Analizza Simboli nel Sogno
                </>
              )}
            </Button>
          </div>
          
          {extractSymbolsMutation.data?.mainSymbols && extractSymbolsMutation.data.mainSymbols.length > 0 && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca simboli..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-9 w-9 rounded-l-none p-0"
                      onClick={() => setSearchTerm("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <Tabs defaultValue="simboli" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="simboli" className="flex-1">Simboli</TabsTrigger>
                  <TabsTrigger value="categorie" className="flex-1">Categorie</TabsTrigger>
                </TabsList>
                <TabsContent value="simboli" className="space-y-4 mt-4">
                  {filteredSymbols.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredSymbols.map((symbolObj: DreamSymbol, index: number) => (
                        <Card key={index} className="overflow-hidden">
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">{symbolObj.symbol}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground">{symbolObj.briefDescription}</p>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleSymbolClick(symbolObj.symbol)}
                            >
                              Approfondisci
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? (
                        <>Nessun simbolo trovato per "{searchTerm}"</>
                      ) : (
                        <>Nessun simbolo disponibile</>
                      )}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="categorie" className="space-y-4 mt-4">
                  {categoriesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          key="all"
                          variant={activeCategory === null ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveCategory(null)}
                        >
                          Tutte
                        </Button>
                        {categories?.map((category: string, index: number) => (
                          <Button
                            key={index}
                            variant={activeCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                      
                      {filteredSymbols.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredSymbols.map((symbolObj: DreamSymbol, index: number) => (
                            <Card key={index} className="overflow-hidden">
                              <CardHeader className="p-4">
                                <CardTitle className="text-base">{symbolObj.symbol}</CardTitle>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">{symbolObj.briefDescription}</p>
                              </CardContent>
                              <CardFooter className="p-4 pt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full"
                                  onClick={() => handleSymbolClick(symbolObj.symbol)}
                                >
                                  Approfondisci
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          {activeCategory ? (
                            <>Nessun simbolo trovato nella categoria "{activeCategory}"</>
                          ) : (
                            <>Nessun simbolo disponibile</>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          {extractSymbolsMutation.isSuccess && 
           (!extractSymbolsMutation.data?.mainSymbols || extractSymbolsMutation.data.mainSymbols.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              Nessun simbolo significativo trovato nel testo del sogno
            </div>
          )}
        </div>
      </CardContent>
      
      <Dialog open={openSymbolDialog} onOpenChange={setOpenSymbolDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSymbol}</DialogTitle>
            <DialogDescription>
              Approfondimento sul significato di questo simbolo nei sogni
            </DialogDescription>
          </DialogHeader>
          
          {symbolInfoLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : symbolInfo ? (
            <SymbolInfoContent info={symbolInfo as SymbolInfo} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Informazioni non disponibili
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
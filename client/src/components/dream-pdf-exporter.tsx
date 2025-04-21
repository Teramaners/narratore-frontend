import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, BookOpen, CheckCircle, Settings, Book } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toPng } from 'html-to-image';

interface Dream {
  id: number;
  content: string;
  story: string;
  category?: string;
  emotion?: string;
  isFavorite?: boolean;
  dreamImageUrl?: string;
  soundtrack?: string;
  emojiTranslation?: string;
  createdAt?: string;
  userId?: number;
  // Alias italiani per compatibilità
  testo?: string;
  racconto?: string;
  categoria?: string;
  emozione?: string;
  preferito?: boolean;
}

interface DreamPdfExporterProps {
  currentDream?: Dream;
  allDreams: Dream[];
}

export function DreamPdfExporter({ currentDream, allDreams }: DreamPdfExporterProps) {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState("I Miei Sogni");
  const [authorName, setAuthorName] = useState("");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeDates, setIncludeDates] = useState(true);
  const [includeCategories, setIncludeCategories] = useState(true);
  const [includeEmotions, setIncludeEmotions] = useState(true);
  const [selectedDreamIds, setSelectedDreamIds] = useState<number[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'epub'>('pdf');
  
  // Prepara i dati del sogno per l'esportazione
  const prepareDreamData = (dream: Dream) => {
    // Gestione compatibilità nomi campi italiani/inglesi
    const content = dream.content || dream.testo || '';
    const story = dream.story || dream.racconto || '';
    const category = dream.category || dream.categoria || 'non_categorizzato';
    const emotion = dream.emotion || dream.emozione || 'neutro';
    const isFavorite = dream.isFavorite !== undefined ? dream.isFavorite : 
                       dream.preferito !== undefined ? dream.preferito : false;
    
    // Converti isFavorite da numero a booleano se necessario
    const favorite = typeof isFavorite === 'number' ? isFavorite > 0 : isFavorite;
    
    return {
      id: dream.id,
      content,
      story,
      category,
      emotion,
      favorite,
      dreamImageUrl: dream.dreamImageUrl,
      emojiTranslation: dream.emojiTranslation,
      createdAt: dream.createdAt
    };
  };
  
  // Funzione per generare il PDF di un singolo sogno
  const exportSingleDreamToPdf = async () => {
    if (!currentDream) {
      toast({
        variant: "destructive",
        description: "Nessun sogno selezionato da esportare.",
      });
      return;
    }
    
    try {
      setExporting(true);
      const dream = prepareDreamData(currentDream);
      
      // Crea un nuovo documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Aggiungi intestazione con stile
      doc.setFontSize(24);
      doc.setTextColor(75, 0, 130); // Indigo
      doc.text("Narratore di Sogni", 105, 20, { align: 'center' });
      
      // Aggiungi data se richiesto
      if (includeDates && dream.createdAt) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const date = new Date(dream.createdAt);
        doc.text(`Data: ${date.toLocaleDateString('it-IT')}`, 105, 28, { align: 'center' });
      }
      
      // Titolo
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      const title = `Sogno: ${dream.content.substring(0, 40)}${dream.content.length > 40 ? '...' : ''}`;
      doc.text(title, 105, 40, { align: 'center' });
      
      // Metadati: categoria ed emozione
      if (includeCategories || includeEmotions) {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        let metadataText = '';
        
        if (includeCategories) {
          metadataText += `Categoria: ${dream.category} `;
        }
        
        if (includeEmotions) {
          metadataText += `${includeCategories ? '| ' : ''}Emozione: ${dream.emotion}`;
        }
        
        if (metadataText) {
          doc.text(metadataText, 105, 48, { align: 'center' });
        }
      }
      
      // Immagine (se disponibile e richiesto)
      if (includeImages && dream.dreamImageUrl) {
        try {
          // Ottieni l'immagine
          const response = await fetch(dream.dreamImageUrl);
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          // Aggiungi l'immagine al PDF
          const imgWidth = 80;
          const imgHeight = 80;
          const pageWidth = doc.internal.pageSize.getWidth();
          const xPos = (pageWidth - imgWidth) / 2;
          
          doc.addImage(imageUrl, 'PNG', xPos, 55, imgWidth, imgHeight);
          
          // Libera la memoria
          URL.revokeObjectURL(imageUrl);
        } catch (imgError) {
          console.error('Errore nel caricamento dell\'immagine:', imgError);
          // Continua comunque senza immagine
        }
      }
      
      // Aggiungi il testo del sogno
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const yStart = includeImages && dream.dreamImageUrl ? 145 : 60;
      
      doc.text("Il sogno:", 20, yStart);
      const contentLines = doc.splitTextToSize(dream.content || "", 170);
      doc.setFont("helvetica", 'italic');
      doc.text(contentLines, 20, yStart + 10);
      
      // Aggiungi la storia generata
      doc.setFont(undefined, 'normal');
      const storyYPos = yStart + contentLines.length * 7 + 15;
      doc.text("Storia generata:", 20, storyYPos);
      const storyLines = doc.splitTextToSize(dream.story, 170);
      doc.text(storyLines, 20, storyYPos + 10);
      
      // Aggiungi emoji translation se disponibile
      if (dream.emojiTranslation) {
        const emojiYPos = storyYPos + storyLines.length * 7 + 15;
        doc.text("Traduzione emoji:", 20, emojiYPos);
        doc.setFont(undefined, 'normal');
        doc.text(dream.emojiTranslation, 20, emojiYPos + 10);
      }
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generato con Narratore di Sogni - Pagina ${pageCount}`, 105, 287, { align: 'center' });
      
      // Salva il PDF
      doc.save(`Sogno-${dream.id}.pdf`);
      
      toast({
        description: "PDF del sogno esportato con successo!",
      });
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      toast({
        variant: "destructive",
        description: "Errore durante l'esportazione del PDF. Riprova.",
      });
    } finally {
      setExporting(false);
    }
  };
  
  // Funzione per generare il PDF della collezione di sogni
  const exportDreamCollectionToPdf = async () => {
    // Filtra i sogni in base alle selezioni
    let dreamsToExport: Dream[] = [];
    
    if (selectedDreamIds.length > 0) {
      // Usa solo i sogni selezionati
      dreamsToExport = allDreams.filter(dream => selectedDreamIds.includes(dream.id));
    } else if (onlyFavorites) {
      // Filtra solo i preferiti
      dreamsToExport = allDreams.filter(dream => {
        const isFavorite = dream.isFavorite !== undefined ? dream.isFavorite : 
                          dream.preferito !== undefined ? dream.preferito : false;
        return typeof isFavorite === 'number' ? isFavorite > 0 : isFavorite;
      });
    } else {
      // Usa tutti i sogni
      dreamsToExport = [...allDreams];
    }
    
    if (dreamsToExport.length === 0) {
      toast({
        variant: "destructive",
        description: "Nessun sogno selezionato per l'esportazione.",
      });
      return;
    }
    
    try {
      setExporting(true);
      
      // Ordina i sogni per data se disponibile
      const sortedDreams = [...dreamsToExport].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Crea un nuovo documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Copertina
      doc.setFillColor(75, 0, 130); // Indigo
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("Narratore di Sogni", 105, 25, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(22);
      doc.text(collectionTitle, 105, 70, { align: 'center' });
      
      if (authorName) {
        doc.setFontSize(14);
        doc.text(`di ${authorName}`, 105, 85, { align: 'center' });
      }
      
      // Info sulla collezione
      doc.setFontSize(12);
      doc.text(`Questa collezione contiene ${dreamsToExport.length} sogni.`, 105, 110, { align: 'center' });
      
      const today = new Date();
      doc.text(`Creato il ${today.toLocaleDateString('it-IT')}`, 105, 120, { align: 'center' });
      
      // Piè di pagina della copertina
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Generato con l\'app Narratore di Sogni', 105, 287, { align: 'center' });
      
      // Indice
      doc.addPage();
      doc.setTextColor(75, 0, 130);
      doc.setFontSize(18);
      doc.text('Indice dei Sogni', 105, 20, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      
      let yPos = 40;
      for (let i = 0; i < sortedDreams.length; i++) {
        const dream = prepareDreamData(sortedDreams[i]);
        const dreamTitle = `${i + 1}. ${dream.content.substring(0, 50)}${dream.content.length > 50 ? '...' : ''}`;
        
        doc.text(dreamTitle, 20, yPos);
        doc.setTextColor(100, 100, 100);
        
        // Aggiungi data se disponibile e richiesta
        if (includeDates && dream.createdAt) {
          const date = new Date(dream.createdAt);
          doc.text(`[${date.toLocaleDateString('it-IT')}]`, 170, yPos, { align: 'right' });
        }
        
        doc.setTextColor(0, 0, 0);
        yPos += 10;
        
        // Aggiungi una nuova pagina se necessario
        if (yPos > 270 && i < sortedDreams.length - 1) {
          doc.addPage();
          doc.setTextColor(75, 0, 130);
          doc.setFontSize(18);
          doc.text('Indice dei Sogni (continua)', 105, 20, { align: 'center' });
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(12);
          yPos = 40;
        }
      }
      
      // Contenuto dei sogni (una pagina per sogno)
      for (let i = 0; i < sortedDreams.length; i++) {
        doc.addPage();
        const dream = prepareDreamData(sortedDreams[i]);
        
        // Intestazione
        doc.setFontSize(16);
        doc.setTextColor(75, 0, 130);
        doc.text(`Sogno ${i + 1}`, 105, 20, { align: 'center' });
        
        // Aggiungi data se richiesto
        if (includeDates && dream.createdAt) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const date = new Date(dream.createdAt);
          doc.text(`Data: ${date.toLocaleDateString('it-IT')}`, 105, 28, { align: 'center' });
        }
        
        // Metadati: categoria ed emozione
        if (includeCategories || includeEmotions) {
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          let metadataText = '';
          
          if (includeCategories) {
            metadataText += `Categoria: ${dream.category} `;
          }
          
          if (includeEmotions) {
            metadataText += `${includeCategories ? '| ' : ''}Emozione: ${dream.emotion}`;
          }
          
          if (metadataText) {
            doc.text(metadataText, 105, 36, { align: 'center' });
          }
        }
        
        // Immagine (se disponibile e richiesto)
        let yStart = 45;
        if (includeImages && dream.dreamImageUrl) {
          try {
            // Ottieni l'immagine
            const response = await fetch(dream.dreamImageUrl);
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            // Aggiungi l'immagine al PDF
            const imgWidth = 70;
            const imgHeight = 70;
            const pageWidth = doc.internal.pageSize.getWidth();
            const xPos = (pageWidth - imgWidth) / 2;
            
            doc.addImage(imageUrl, 'PNG', xPos, yStart, imgWidth, imgHeight);
            
            // Aggiorna la posizione Y per il testo
            yStart = yStart + imgHeight + 10;
            
            // Libera la memoria
            URL.revokeObjectURL(imageUrl);
          } catch (imgError) {
            console.error('Errore nel caricamento dell\'immagine:', imgError);
            // Continua comunque senza immagine
          }
        }
        
        // Aggiungi il testo del sogno
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        
        doc.text("Il sogno:", 20, yStart);
        const contentLines = doc.splitTextToSize(dream.content, 170);
        doc.setFont(undefined, 'italic');
        doc.text(contentLines, 20, yStart + 10);
        
        // Aggiungi la storia generata
        doc.setFont(undefined, 'normal');
        const storyYPos = yStart + contentLines.length * 7 + 15;
        doc.text("Storia generata:", 20, storyYPos);
        const storyLines = doc.splitTextToSize(dream.story, 170);
        doc.text(storyLines, 20, storyYPos + 10);
        
        // Emoji translation se disponibile
        if (dream.emojiTranslation) {
          const emojiYPos = Math.min(storyYPos + storyLines.length * 7 + 15, 260);
          if (emojiYPos >= 260) {
            // Se non c'è abbastanza spazio, crea una nuova pagina
            doc.addPage();
            doc.text("Traduzione emoji:", 20, 20);
            doc.text(dream.emojiTranslation, 20, 30);
          } else {
            doc.text("Traduzione emoji:", 20, emojiYPos);
            doc.text(dream.emojiTranslation, 20, emojiYPos + 10);
          }
        }
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generato con Narratore di Sogni - Pagina ${i + 3}`, 105, 287, { align: 'center' });
      }
      
      // Salva il PDF
      doc.save(`${collectionTitle.replace(/\s+/g, '-')}.pdf`);
      
      toast({
        description: `Collezione di ${dreamsToExport.length} sogni esportata con successo!`,
      });
    } catch (error) {
      console.error('Errore durante l\'esportazione:', error);
      toast({
        variant: "destructive",
        description: "Errore durante l'esportazione della collezione. Riprova.",
      });
    } finally {
      setExporting(false);
    }
  };
  
  // Funzione per generare un ebook HTML con la collezione di sogni
  const exportDreamCollectionToEpub = async () => {
    // Filtra i sogni in base alle selezioni
    let dreamsToExport: Dream[] = [];
    
    if (selectedDreamIds.length > 0) {
      // Usa solo i sogni selezionati
      dreamsToExport = allDreams.filter(dream => selectedDreamIds.includes(dream.id));
    } else if (onlyFavorites) {
      // Filtra solo i preferiti
      dreamsToExport = allDreams.filter(dream => {
        const isFavorite = dream.isFavorite !== undefined ? dream.isFavorite : 
                          dream.preferito !== undefined ? dream.preferito : false;
        return typeof isFavorite === 'number' ? isFavorite > 0 : isFavorite;
      });
    } else {
      // Usa tutti i sogni
      dreamsToExport = [...allDreams];
    }
    
    if (dreamsToExport.length === 0) {
      toast({
        variant: "destructive",
        description: "Nessun sogno selezionato per l'esportazione.",
      });
      return;
    }
    
    try {
      setExporting(true);
      
      // Ordina i sogni per data se disponibile
      const sortedDreams = [...dreamsToExport].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      // Prepara i dati per il backend
      const requestData = {
        sogni: sortedDreams.map(dream => prepareDreamData(dream)),
        titolo: collectionTitle,
        autore: authorName,
      };
      
      // Effettua la richiesta e ottieni il blob HTML
      const response = await fetch('/api/genera-ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione dell\'ebook');
      }
      
      // Ottieni il contenuto HTML come stringa
      const htmlContent = await response.text();
      
      // Crea un nuovo documento in una nuova finestra
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        throw new Error('Il browser ha bloccato l\'apertura della nuova finestra. Controlla le impostazioni del browser.');
      }
      
      // Scrivi l'HTML nella nuova finestra
      newWindow.document.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
      toast({
        description: `Ebook HTML con ${dreamsToExport.length} sogni generato con successo!`,
      });
    } catch (error: any) {
      console.error('Errore durante l\'esportazione dell\'ebook:', error);
      toast({
        variant: "destructive",
        description: error.message || "Errore durante l'esportazione dell'ebook. Riprova.",
      });
    } finally {
      setExporting(false);
    }
  };
  
  // Funzione per esportare un singolo sogno in formato HTML
  const exportSingleDreamToEpub = async () => {
    if (!currentDream) {
      toast({
        variant: "destructive",
        description: "Nessun sogno selezionato da esportare.",
      });
      return;
    }
    
    try {
      setExporting(true);
      const dream = prepareDreamData(currentDream);
      
      // Prepara i dati per il backend
      const requestData = {
        sogni: [dream],
        titolo: `Sogno: ${dream.content.substring(0, 30)}${dream.content.length > 30 ? '...' : ''}`,
        autore: authorName || "Narratore di Sogni",
      };
      
      // Effettua la richiesta e ottieni il blob HTML
      const response = await fetch('/api/genera-ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione dell\'ebook');
      }
      
      // Ottieni il contenuto HTML come stringa
      const htmlContent = await response.text();
      
      // Crea un nuovo documento in una nuova finestra
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        throw new Error('Il browser ha bloccato l\'apertura della nuova finestra. Controlla le impostazioni del browser.');
      }
      
      // Scrivi l'HTML nella nuova finestra
      newWindow.document.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      
      toast({
        description: "Ebook HTML del sogno generato con successo!",
      });
    } catch (error: any) {
      console.error('Errore durante l\'esportazione dell\'ebook:', error);
      toast({
        variant: "destructive",
        description: error.message || "Errore durante l'esportazione dell'ebook. Riprova.",
      });
    } finally {
      setExporting(false);
    }
  };
  
  // Funzione principale per l'esportazione in base al formato selezionato
  const exportSingleDream = () => {
    if (exportFormat === 'pdf') {
      exportSingleDreamToPdf();
    } else {
      exportSingleDreamToEpub();
    }
  };
  
  // Funzione principale per l'esportazione della collezione in base al formato selezionato
  const exportDreamCollection = () => {
    if (exportFormat === 'pdf') {
      exportDreamCollectionToPdf();
    } else {
      exportDreamCollectionToEpub();
    }
  };
  
  // Gestisce il toggle della selezione di un sogno
  const toggleDreamSelection = (dreamId: number) => {
    setSelectedDreamIds(prev => 
      prev.includes(dreamId) 
        ? prev.filter(id => id !== dreamId) 
        : [...prev, dreamId]
    );
  };
  
  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Esporta in PDF/eBook
        </CardTitle>
        <CardDescription>
          Trasforma i tuoi sogni in documenti da conservare e condividere
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="single" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="single">Sogno singolo</TabsTrigger>
            <TabsTrigger value="collection">Collezione</TabsTrigger>
          </TabsList>
          
          {/* Esportazione del sogno singolo */}
          <TabsContent value="single" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Esporta il sogno corrente come documento PDF o ebook HTML facilmente condivisibile.
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium mb-2 block">Formato di esportazione:</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant={exportFormat === 'epub' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setExportFormat('epub')}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    HTML
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-images-single" 
                    checked={includeImages}
                    onCheckedChange={setIncludeImages}
                  />
                  <Label htmlFor="include-images-single">Includi immagine</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-categories-single" 
                    checked={includeCategories}
                    onCheckedChange={setIncludeCategories}
                  />
                  <Label htmlFor="include-categories-single">Includi categoria</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-emotions-single" 
                    checked={includeEmotions}
                    onCheckedChange={setIncludeEmotions}
                  />
                  <Label htmlFor="include-emotions-single">Includi emozione</Label>
                </div>
              </div>
              
              <Button 
                onClick={exportSingleDream} 
                disabled={!currentDream || exporting}
                className="w-full"
              >
                {exporting ? (
                  <>Esportazione in corso...</>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Esporta sogno corrente in {exportFormat === 'pdf' ? 'PDF' : 'HTML'}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          {/* Esportazione della collezione */}
          <TabsContent value="collection" className="space-y-4">
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Crea un eBook PDF o HTML con una collezione dei tuoi sogni preferiti o selezionati.
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="collection-title">Titolo della collezione</Label>
                <Input
                  id="collection-title"
                  placeholder="I Miei Sogni"
                  value={collectionTitle}
                  onChange={(e) => setCollectionTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author-name">Nome dell'autore (opzionale)</Label>
                <Input
                  id="author-name"
                  placeholder="Il tuo nome"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Sogni da includere:</h4>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="only-favorites" 
                    checked={onlyFavorites}
                    disabled={selectedDreamIds.length > 0}
                    onCheckedChange={setOnlyFavorites}
                  />
                  <Label htmlFor="only-favorites">Solo sogni preferiti</Label>
                </div>
                
                <div className="mt-2">
                  <Label className="mb-2 block">Oppure seleziona sogni specifici:</Label>
                  <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                    {allDreams.length > 0 ? (
                      allDreams.map(dream => {
                        const content = dream.content || dream.testo || '';
                        return (
                          <div key={dream.id} className="flex items-center space-x-2 py-1">
                            <Checkbox 
                              id={`dream-${dream.id}`}
                              checked={selectedDreamIds.includes(dream.id)}
                              onCheckedChange={() => {
                                toggleDreamSelection(dream.id);
                                if (onlyFavorites) setOnlyFavorites(false);
                              }}
                            />
                            <Label htmlFor={`dream-${dream.id}`} className="cursor-pointer text-sm">
                              {content.substring(0, 40)}{content.length > 40 ? '...' : ''}
                            </Label>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-2">
                        Nessun sogno disponibile
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Formato di esportazione:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    variant={exportFormat === 'pdf' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setExportFormat('pdf')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant={exportFormat === 'epub' ? 'default' : 'outline'} 
                    className="flex-1"
                    onClick={() => setExportFormat('epub')}
                  >
                    <Book className="h-4 w-4 mr-2" />
                    HTML
                  </Button>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Opzioni di formattazione:</h4>
                
                <div className="space-y-2 grid grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-images-collection" 
                      checked={includeImages}
                      onCheckedChange={setIncludeImages}
                    />
                    <Label htmlFor="include-images-collection">Includi immagini</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-dates" 
                      checked={includeDates}
                      onCheckedChange={setIncludeDates}
                    />
                    <Label htmlFor="include-dates">Includi date</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-categories-collection" 
                      checked={includeCategories}
                      onCheckedChange={setIncludeCategories}
                    />
                    <Label htmlFor="include-categories-collection">Includi categorie</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="include-emotions-collection" 
                      checked={includeEmotions}
                      onCheckedChange={setIncludeEmotions}
                    />
                    <Label htmlFor="include-emotions-collection">Includi emozioni</Label>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={exportDreamCollection} 
                disabled={exporting || (allDreams.length === 0 && selectedDreamIds.length === 0 && !onlyFavorites)}
                className="w-full"
              >
                {exporting ? (
                  <>Creazione eBook in corso...</>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Crea eBook {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
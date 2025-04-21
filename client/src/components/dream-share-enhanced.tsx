import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Share2, 
  Copy, 
  Check, 
  Mail, 
  Image, 
  ImageOff, 
  MessageSquare, 
  Link,
  Eye,
  Download
} from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  RedditShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon,
  LinkedinIcon,
  PinterestIcon,
  RedditIcon
} from "react-share";
import { useToast } from '@/hooks/use-toast';

interface DreamShareEnhancedProps {
  dreamContent: string;
  dreamStory: string;
  category: string;
  emotion: string;
  dreamImageUrl?: string;
  dreamTitle?: string;
}

export function DreamShareEnhanced({ 
  dreamContent, 
  dreamStory, 
  category, 
  emotion, 
  dreamImageUrl,
  dreamTitle
}: DreamShareEnhancedProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [includeImage, setIncludeImage] = useState(true);
  const [includeStory, setIncludeStory] = useState(true);
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const { toast } = useToast();
  
  // Crea titolo automatico o usa quello generato
  const dreamTitleText = dreamTitle || 
    `Ho sognato ${dreamContent.substring(0, 30)}${dreamContent.length > 30 ? '...' : ''}`;
  
  // Genera gli hashtag in base alla categoria e all'emozione
  const getHashtags = () => {
    const tags = ['NarratoreDiSogni', 'Sogni'];
    
    // Aggiungi tag basati sulla categoria
    if (category && category !== 'non_categorizzato') {
      tags.push(`Sogno${category.charAt(0).toUpperCase() + category.slice(1)}`);
    }
    
    // Aggiungi tag basati sull'emozione
    if (emotion && emotion !== 'neutro') {
      tags.push(`${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`);
    }
    
    return tags;
  };
  
  // Formatta hashtag come stringa
  const getHashtagsString = () => {
    return getHashtags().map(tag => `#${tag}`).join(' ');
  };
  
  // Crea i dati di condivisione in base alle preferenze dell'utente
  const getShareData = () => {
    // Titolo base
    let title = dreamTitleText;
    
    // Testo di base per la condivisione
    let text = customMessage || `"${dreamContent.substring(0, 100)}${dreamContent.length > 100 ? '...' : ''}"`;
    
    // Aggiungi la storia se richiesto
    if (includeStory && dreamStory) {
      text += `\n\nEcco la storia generata dall'IA:\n"${dreamStory.substring(0, 200)}${dreamStory.length > 200 ? '...' : ''}"`;
    }
    
    // Informazioni aggiuntive
    text += `\n\nCategoria: ${category}`;
    text += `\nEmozione: ${emotion}`;
    
    // Aggiungi hashtag se richiesto
    if (includeHashtags) {
      text += `\n\n${getHashtagsString()}`;
    }
    
    // Firma
    text += `\n\nGenerato con Narratore di Sogni 🌙✨`;
    
    return {
      title,
      text,
      url: window.location.href,
      hashtags: getHashtags(),
      image: includeImage && dreamImageUrl ? dreamImageUrl : undefined
    };
  };
  
  // Ottiene il testo completo per la condivisione
  const getFullShareText = () => {
    return getShareData().text;
  };
  
  // Gestisce la copia del testo negli appunti
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getFullShareText());
      setIsCopied(true);
      
      toast({
        description: "Testo copiato negli appunti!",
      });
      
      // Ripristina l'icona dopo 2 secondi
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Errore durante la copia:', err);
      toast({
        variant: "destructive",
        description: "Impossibile copiare il testo. Prova a selezionarlo manualmente.",
      });
    }
  };
  
  // Scarica l'immagine (se disponibile)
  const handleDownloadImage = async () => {
    if (!dreamImageUrl) {
      toast({
        variant: "destructive",
        description: "Nessuna immagine disponibile da scaricare.",
      });
      return;
    }
    
    try {
      // Crea un link temporaneo per il download
      const link = document.createElement('a');
      link.href = dreamImageUrl;
      link.download = `sogno-${new Date().toISOString().substring(0, 10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsDownloaded(true);
      toast({
        description: "Immagine scaricata!",
      });
      
      // Ripristina l'icona dopo 2 secondi
      setTimeout(() => {
        setIsDownloaded(false);
      }, 2000);
    } catch (err) {
      console.error('Errore durante il download:', err);
      toast({
        variant: "destructive",
        description: "Impossibile scaricare l'immagine.",
      });
    }
  };
  
  // Gestisce la condivisione nativa se supportata dal browser
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        const shareData = getShareData();
        const dataToShare: any = {
          title: shareData.title,
          text: shareData.text,
          url: shareData.url
        };
        
        // Se c'è un'immagine e l'utente vuole includerla, prova a condividerla
        if (includeImage && dreamImageUrl) {
          try {
            // Scarica l'immagine come blob
            const response = await fetch(dreamImageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'sogno.png', { type: 'image/png' });
            
            // Aggiungi l'immagine ai dati di condivisione (se il browser lo supporta)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              dataToShare.files = [file];
            }
          } catch (imgError) {
            console.error('Errore nel caricamento dell\'immagine per la condivisione:', imgError);
            // Continua comunque con la condivisione del testo
          }
        }
        
        await navigator.share(dataToShare);
        toast({
          description: "Grazie per aver condiviso il tuo sogno!",
        });
      } else {
        throw new Error('Web Share API non supportata');
      }
    } catch (err) {
      console.error('Errore durante la condivisione:', err);
      // Fallback al menu di condivisione personalizzato
      toast({
        variant: "default",
        description: "Usa le opzioni social qui sotto per condividere.",
      });
    }
  };
  
  // Genera un'anteprima del contenuto da condividere
  const SharePreview = () => (
    <div className="rounded-md border p-4 mt-4 max-h-48 overflow-y-auto text-sm">
      <h4 className="font-medium mb-2">{dreamTitleText}</h4>
      
      <p className="text-muted-foreground whitespace-pre-line">
        {customMessage || `"${dreamContent.substring(0, 100)}${dreamContent.length > 100 ? '...' : ''}"`}
        
        {includeStory && dreamStory && (
          `\n\nEcco la storia generata dall'IA:
"${dreamStory.substring(0, 150)}${dreamStory.length > 150 ? '...' : ''}"`
        )}
        
        {`\n\nCategoria: ${category}`}
        {`\nEmozione: ${emotion}`}
        
        {includeHashtags && `\n\n${getHashtagsString()}`}
        
        {`\n\nGenerato con Narratore di Sogni 🌙✨`}
      </p>
      
      {includeImage && dreamImageUrl && (
        <div className="mt-2 border rounded overflow-hidden w-16 h-16 flex-shrink-0">
          <img 
            src={dreamImageUrl} 
            alt="Immagine del sogno" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
  
  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Condividi il tuo sogno
        </CardTitle>
        <CardDescription>
          Personalizza e condividi la tua esperienza onirica con amici e follower
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="share" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="share">Condividi</TabsTrigger>
            <TabsTrigger value="customize">Personalizza</TabsTrigger>
          </TabsList>
          
          {/* Scheda di condivisione */}
          <TabsContent value="share" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {/* Condivisione nativa (mobile) */}
              {'share' in navigator && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi
                </Button>
              )}
              
              {/* Copia negli appunti */}
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyToClipboard}
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Copiato
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copia testo
                  </>
                )}
              </Button>
              
              {/* Download immagine */}
              {dreamImageUrl && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDownloadImage}
                  disabled={!dreamImageUrl}
                >
                  {isDownloaded ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Scaricata
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Scarica immagine
                    </>
                  )}
                </Button>
              )}
            </div>
            
            {/* Anteprima */}
            <div className="pt-2">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Eye className="h-4 w-4 mr-1" />
                <span>Anteprima della condivisione</span>
              </div>
              <SharePreview />
            </div>
            
            {/* Menu condivisione social */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Condividi sui social</div>
              <div className="flex flex-wrap gap-3 justify-center">
                {/* Twitter/X */}
                <TwitterShareButton
                  url={getShareData().url}
                  title={getShareData().text.substring(0, 280)}
                  hashtags={getShareData().hashtags}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <TwitterIcon size={36} round />
                  </div>
                </TwitterShareButton>
                
                {/* Facebook */}
                <FacebookShareButton
                  url={getShareData().url}
                  hashtag={getShareData().hashtags[0] ? `#${getShareData().hashtags[0]}` : undefined}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <FacebookIcon size={36} round />
                  </div>
                </FacebookShareButton>
                
                {/* WhatsApp */}
                <WhatsappShareButton
                  url={getShareData().url}
                  title={getShareData().text}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <WhatsappIcon size={36} round />
                  </div>
                </WhatsappShareButton>
                
                {/* Telegram */}
                <TelegramShareButton
                  url={getShareData().url}
                  title={getShareData().text}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <TelegramIcon size={36} round />
                  </div>
                </TelegramShareButton>
                
                {/* Email */}
                <EmailShareButton
                  url={getShareData().url}
                  subject={getShareData().title}
                  body={getShareData().text}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <EmailIcon size={36} round />
                  </div>
                </EmailShareButton>
                
                {/* LinkedIn */}
                <LinkedinShareButton
                  url={getShareData().url}
                  title={getShareData().title}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <LinkedinIcon size={36} round />
                  </div>
                </LinkedinShareButton>
                
                {/* Pinterest (solo con immagine) */}
                {dreamImageUrl && (
                  <PinterestShareButton
                    url={getShareData().url}
                    media={dreamImageUrl}
                    description={getShareData().text.substring(0, 500)}
                    className="!p-0"
                  >
                    <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <PinterestIcon size={36} round />
                    </div>
                  </PinterestShareButton>
                )}
                
                {/* Reddit */}
                <RedditShareButton
                  url={getShareData().url}
                  title={getShareData().title}
                  className="!p-0"
                >
                  <div className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <RedditIcon size={36} round />
                  </div>
                </RedditShareButton>
              </div>
            </div>
          </TabsContent>
          
          {/* Scheda di personalizzazione */}
          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-4">
              {/* Messaggio personalizzato */}
              <div className="space-y-2">
                <Label htmlFor="custom-message" className="text-sm flex gap-2 items-center">
                  <MessageSquare className="h-4 w-4" />
                  Messaggio personalizzato
                </Label>
                <Textarea
                  id="custom-message"
                  placeholder="Aggiungi un messaggio personalizzato per introdurre il tuo sogno..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="min-h-[80px] resize-y"
                />
              </div>
              
              {/* Opzioni di inclusione */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium mb-2">Includi nel messaggio:</h4>
                
                {/* Opzione per l'immagine */}
                {dreamImageUrl && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include-image"
                      checked={includeImage}
                      onCheckedChange={setIncludeImage}
                    />
                    <Label htmlFor="include-image" className="flex items-center gap-2 cursor-pointer">
                      {includeImage ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <ImageOff className="h-4 w-4" />
                      )}
                      <span>Immagine del sogno</span>
                    </Label>
                  </div>
                )}
                
                {/* Opzione per la storia */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-story"
                    checked={includeStory}
                    onCheckedChange={setIncludeStory}
                  />
                  <Label htmlFor="include-story" className="flex items-center gap-2 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    <span>Storia generata</span>
                  </Label>
                </div>
                
                {/* Opzione per gli hashtag */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                  <Label htmlFor="include-hashtags" className="flex items-center gap-2 cursor-pointer">
                    <Link className="h-4 w-4" />
                    <span>Hashtag ({getHashtags().length})</span>
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <p className="text-xs text-muted-foreground mt-4">
          Condividendo, accetti che il contenuto del tuo sogno, della storia generata e delle immagini sia visibile ad altre persone.
        </p>
      </CardContent>
    </Card>
  );
}
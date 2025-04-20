import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Share2, Copy, Check, Mail } from "lucide-react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon
} from "react-share";
import { useToast } from '@/hooks/use-toast';

interface DreamShareProps {
  dreamContent: string;
  dreamStory: string;
  category: string;
}

export function DreamShare({ dreamContent, dreamStory, category }: DreamShareProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  // Crea l'oggetto di condivisione con le informazioni del sogno
  const shareData = {
    title: `Ho sognato di ${dreamContent.substring(0, 30)}...`,
    text: `"${dreamContent.substring(0, 100)}..." - Ecco come l'intelligenza artificiale ha trasformato il mio sogno in una storia!`,
    url: window.location.href,
  };
  
  // Crea il testo completo per la condivisione
  const getFullShareText = () => {
    return `"${dreamContent.substring(0, 100)}..."\n\nEcco la storia generata dall'IA:\n"${dreamStory.substring(0, 200)}..."\n\nCategoria: ${category}\n\nGenerato con Narratore di Sogni 🌙✨`;
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
  
  // Gestisce la condivisione nativa se supportata dal browser
  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          description: "Grazie per aver condiviso il tuo sogno!",
        });
      } else {
        throw new Error('Web Share API non supportata');
      }
    } catch (err) {
      console.error('Errore durante la condivisione:', err);
      // Fallback al menu di condivisione personalizzato
    }
  };
  
  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Share2 className="h-5 w-5 mr-2" />
          Condividi il tuo sogno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Condividi la tua esperienza onirica con gli amici sui social network.
          </p>
          
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
            
            {/* Menu condivisione social */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Social
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="center">
                <div className="flex gap-2 flex-wrap">
                  {/* Twitter/X */}
                  <TwitterShareButton
                    url={shareData.url}
                    title={shareData.text}
                    className="!p-0"
                  >
                    <div className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <TwitterIcon size={24} round />
                    </div>
                  </TwitterShareButton>
                  
                  {/* Facebook */}
                  <FacebookShareButton
                    url={shareData.url}
                    className="!p-0"
                  >
                    <div className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <FacebookIcon size={24} round />
                    </div>
                  </FacebookShareButton>
                  
                  {/* WhatsApp */}
                  <WhatsappShareButton
                    url={shareData.url}
                    title={shareData.text}
                    className="!p-0"
                  >
                    <div className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <WhatsappIcon size={24} round />
                    </div>
                  </WhatsappShareButton>
                  
                  {/* Telegram */}
                  <TelegramShareButton
                    url={shareData.url}
                    title={shareData.text}
                    className="!p-0"
                  >
                    <div className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <TelegramIcon size={24} round />
                    </div>
                  </TelegramShareButton>
                  
                  {/* Email */}
                  <EmailShareButton
                    url={shareData.url}
                    subject={shareData.title}
                    body={getFullShareText()}
                    className="!p-0"
                  >
                    <div className="rounded-md p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
                      <EmailIcon size={24} round />
                    </div>
                  </EmailShareButton>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Condividendo, accetti che il contenuto del tuo sogno e della storia generata sia visibile ad altre persone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
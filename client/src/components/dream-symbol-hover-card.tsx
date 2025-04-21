import { useState, ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Sparkles } from "lucide-react";

interface DreamSymbolHoverCardProps {
  symbol: string;
  briefDescription: string;
  children: ReactNode;
  onSymbolClick?: (symbol: string) => void;
  className?: string;
  categories?: string[];
  relatedSymbols?: string[];
  generalMeaning?: string;
}

export function DreamSymbolHoverCard({
  symbol,
  briefDescription,
  children,
  onSymbolClick,
  className = "",
  categories = [],
  relatedSymbols = [],
  generalMeaning = ""
}: DreamSymbolHoverCardProps) {
  // Stato per tracciare l'evidenziazione al passaggio del mouse
  const [isHovered, setIsHovered] = useState(false);

  // Anteprima più breve del significato generale
  const shortMeaning = generalMeaning 
    ? generalMeaning.length > 120 
      ? generalMeaning.substring(0, 120) + "..." 
      : generalMeaning
    : briefDescription;

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span
          className={`relative cursor-pointer ${className} ${
            isHovered ? "text-primary font-medium" : ""
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => onSymbolClick && onSymbolClick(symbol)}
        >
          {children}
          {isHovered && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-pulse" />
          )}
        </span>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 p-0 overflow-hidden"
        side="top"
        align="center"
      >
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-base">{symbol}</h4>
            </div>
            {categories.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {categories[0]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{shortMeaning}</p>
        </div>
        
        {(relatedSymbols.length > 0 || categories.length > 1) && (
          <div className="p-3 text-xs border-t border-muted/30">
            {relatedSymbols.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-muted-foreground mr-1">Correlati:</span>
                {relatedSymbols.slice(0, 3).map((relSym, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="text-xs px-1.5 py-0 h-5"
                    onClick={() => onSymbolClick && onSymbolClick(relSym)}
                  >
                    {relSym}
                  </Badge>
                ))}
                {relatedSymbols.length > 3 && (
                  <span className="text-muted-foreground">+{relatedSymbols.length - 3}</span>
                )}
              </div>
            )}
            
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-muted-foreground mr-1">Categorie:</span>
                {categories.slice(0, 3).map((cat, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs px-1.5 py-0 h-5"
                  >
                    {cat}
                  </Badge>
                ))}
                {categories.length > 3 && (
                  <span className="text-muted-foreground">+{categories.length - 3}</span>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="p-3 pt-2 border-t border-muted/30">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs h-8"
            onClick={() => onSymbolClick && onSymbolClick(symbol)}
          >
            <span>Approfondisci</span>
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
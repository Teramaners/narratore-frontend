import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Tag, Star, StarOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Categorie predefinite di sogni
const CATEGORIES = [
  { value: "avventura", label: "Avventura" },
  { value: "romantico", label: "Romantico" },
  { value: "pauroso", label: "Pauroso" },
  { value: "fantastico", label: "Fantastico" },
  { value: "surreale", label: "Surreale" },
  { value: "onirico", label: "Onirico" },
  { value: "profetico", label: "Profetico" },
  { value: "non_categorizzato", label: "Non Categorizzato" },
];

// Emozioni predefinite
const EMOTIONS = [
  { value: "felicità", label: "Felicità" },
  { value: "tristezza", label: "Tristezza" },
  { value: "paura", label: "Paura" },
  { value: "sorpresa", label: "Sorpresa" },
  { value: "rabbia", label: "Rabbia" },
  { value: "disgusto", label: "Disgusto" },
  { value: "confusione", label: "Confusione" },
  { value: "neutro", label: "Neutro" },
];

interface DreamCategoryProps {
  category: string;
  emotion: string;
  tags: string[];
  isFavorite: boolean;
  onCategoryChange: (category: string) => void;
  onEmotionChange: (emotion: string) => void;
  onTagsChange: (tags: string[]) => void;
  onFavoriteChange: (isFavorite: boolean) => void;
}

export function DreamCategory({
  category = "non_categorizzato",
  emotion = "neutro",
  tags = [],
  isFavorite = false,
  onCategoryChange,
  onEmotionChange,
  onTagsChange,
  onFavoriteChange,
}: DreamCategoryProps) {
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  // Gestisce l'aggiunta di un nuovo tag
  const addTag = () => {
    if (!newTag.trim()) return;
    
    // Controlla se il tag esiste già
    if (tags.includes(newTag.trim())) {
      toast({
        variant: "destructive",
        description: "Questo tag esiste già",
      });
      return;
    }
    
    // Aggiunge il nuovo tag
    const updatedTags = [...tags, newTag.trim()];
    onTagsChange(updatedTags);
    setNewTag("");
  };

  // Gestisce la rimozione di un tag
  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    onTagsChange(updatedTags);
  };

  // Gestisce la pressione del tasto Invio nel campo tag
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Cambia lo stato preferito
  const toggleFavorite = () => {
    onFavoriteChange(!isFavorite);
  };

  return (
    <Card className="w-full mt-4 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex justify-between items-center">
          <span>Categorie e Tag</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFavorite}
            className={`p-0 h-8 w-8 ${isFavorite ? 'text-yellow-500' : ''}`}
            aria-label={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          >
            {isFavorite ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selezione Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select 
            value={category} 
            onValueChange={onCategoryChange}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Seleziona una categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selezione Emozione */}
        <div className="space-y-2">
          <Label htmlFor="emotion">Emozione</Label>
          <Select 
            value={emotion} 
            onValueChange={onEmotionChange}
          >
            <SelectTrigger id="emotion">
              <SelectValue placeholder="Seleziona un'emozione" />
            </SelectTrigger>
            <SelectContent>
              {EMOTIONS.map((emo) => (
                <SelectItem key={emo.value} value={emo.value}>
                  {emo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Input e lista tag */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tag</Label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Aggiungi un tag e premi Invio"
                className="pl-8"
              />
            </div>
            <Button 
              onClick={addTag} 
              size="icon" 
              type="button"
              variant="outline"
              aria-label="Aggiungi tag"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Visualizzazione dei tag */}
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-0.5">
                {tag}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTag(tag)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  aria-label={`Rimuovi tag ${tag}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
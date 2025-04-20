import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmotionGradient } from './emotion-gradient';
import { emotionToEnglish } from '@/lib/emotions';

interface DreamCategoryProps {
  category: string;
  emotion: string;
  isFavorite: boolean;
  onCategoryChange: (category: string) => void;
  onEmotionChange: (emotion: string) => void;
  onFavoriteChange: (isFavorite: boolean) => void;
}

export function DreamCategory({
  category,
  emotion,
  isFavorite,
  onCategoryChange,
  onEmotionChange,
  onFavoriteChange,
}: DreamCategoryProps) {
  const [tagInput, setTagInput] = React.useState('');

  // Categorie di sogni predefinite
  const categorieSogni = [
    { value: "non_categorizzato", label: "Non categorizzato" },
    { value: "spaventoso", label: "Spaventoso" },
    { value: "avventura", label: "Avventura" },
    { value: "romantico", label: "Romantico" },
    { value: "fantastico", label: "Fantastico" },
    { value: "supereroi", label: "Supereroi" },
    { value: "surreale", label: "Surreale" },
    { value: "famiglia", label: "Famiglia" },
    { value: "lavoro", label: "Lavoro" },
    { value: "infanzia", label: "Infanzia" },
  ];

  // Emozioni predefinite
  const emozioniSogni = [
    { value: "neutro", label: "Neutro" },
    { value: "felice", label: "Felice" },
    { value: "triste", label: "Triste" },
    { value: "spaventato", label: "Spaventato" },
    { value: "ansioso", label: "Ansioso" },
    { value: "confuso", label: "Confuso" },
    { value: "arrabbiato", label: "Arrabbiato" },
    { value: "nostalgico", label: "Nostalgico" },
    { value: "eccitato", label: "Eccitato" },
    { value: "pacifico", label: "Pacifico" },
  ];

  return (
    <div className="space-y-4 p-4 rounded-lg dark:bg-purple-950/50 light:bg-indigo-50 border dark:border-purple-800 light:border-indigo-200 mb-6">
      <h3 className="text-lg font-medium dark:text-white light:text-indigo-900">Categorizzazione del Sogno</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selezione categoria */}
        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Seleziona una categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorieSogni.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selezione emozione */}
        <div className="space-y-2">
          <Label htmlFor="emozione">Emozione principale</Label>
          <Select value={emotion} onValueChange={onEmotionChange}>
            <SelectTrigger id="emozione">
              <SelectValue placeholder="Seleziona un'emozione" />
            </SelectTrigger>
            <SelectContent>
              {emozioniSogni.map((emoz) => (
                <SelectItem key={emoz.value} value={emoz.value}>{emoz.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Visualizzazione gradiente emozione */}
      <div className="mt-4">
        <Label className="block mb-2">Visualizzazione emotiva</Label>
        <div className="flex justify-start">
          <EmotionGradient 
            emotion={emotionToEnglish(emotion)}
            className="h-8 w-full rounded-md"
          />
        </div>
      </div>

      {/* Preferito */}
      <div className="flex items-center space-x-2">
        <Switch 
          id="preferito" 
          checked={isFavorite} 
          onCheckedChange={onFavoriteChange} 
        />
        <Label htmlFor="preferito" className="flex items-center gap-1">
          <Heart className={`h-4 w-4 ${isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
          Sogno preferito
        </Label>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, Heart, Tag } from "lucide-react";
import { SavedDream } from "@/lib/localStorage";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface DreamListProps {
  dreams: any[];
  onDreamSelect: (dream: any) => void;
  onDreamDelete: (id: number) => void;
}

export function DreamList({ dreams, onDreamSelect, onDreamDelete }: DreamListProps) {
  // Assicuriamoci che dreams sia un array valido
  const dreamsList = Array.isArray(dreams) ? dreams : [];
  
  // Helper per ottenere il testo del sogno
  const getDreamText = (dream: any) => {
    if (!dream) return '';
    return dream.testo || dream.content || '';
  };
  
  // Helper per ottenere la data del sogno
  const getDreamDate = (dream: any) => {
    if (!dream) return new Date();
    return new Date(dream.data || dream.createdAt);
  };
  
  // Helper per ottenere la categoria del sogno
  const getDreamCategory = (dream: any) => {
    if (!dream) return 'non_categorizzato';
    return dream.categoria || dream.category || 'non_categorizzato';
  };
  
  // Helper per ottenere l'emozione del sogno
  const getDreamEmotion = (dream: any) => {
    if (!dream) return 'neutro';
    return dream.emozione || dream.emotion || 'neutro';
  };
  
  // Helper per ottenere lo stato preferito
  const getDreamFavorite = (dream: any) => {
    if (!dream) return false;
    if (dream.preferito !== undefined) return dream.preferito;
    if (dream.isFavorite !== undefined) {
      // Gestire sia booleani che numeri (0/1)
      return typeof dream.isFavorite === 'number'
        ? dream.isFavorite > 0
        : dream.isFavorite;
    }
    return false;
  };
  
  if (!dreamsList.length) {
    return (
      <Card className="w-full mt-6 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">I tuoi sogni</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            Non hai ancora salvato nessun sogno.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mt-6 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">I tuoi sogni</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dreamsList.map((dream) => {
            const text = getDreamText(dream);
            const date = getDreamDate(dream);
            const category = getDreamCategory(dream);
            const emotion = getDreamEmotion(dream);
            const isFavorite = getDreamFavorite(dream);
            
            // Funzione per ottenere l'etichetta da visualizzare della categoria
            const getCategoryLabel = (categoryValue: string) => {
              switch(categoryValue) {
                case 'spaventoso': return 'Spaventoso';
                case 'avventura': return 'Avventura';
                case 'romantico': return 'Romantico';
                case 'fantastico': return 'Fantastico';
                case 'supereroi': return 'Supereroi';
                case 'surreale': return 'Surreale';
                case 'famiglia': return 'Famiglia';
                case 'lavoro': return 'Lavoro';
                case 'infanzia': return 'Infanzia';
                default: return 'Non categorizzato';
              }
            };
            
            // Funzione per ottenere l'etichetta da visualizzare dell'emozione
            const getEmotionLabel = (emotionValue: string) => {
              switch(emotionValue) {
                case 'felice': return 'Felice';
                case 'triste': return 'Triste';
                case 'spaventato': return 'Spaventato';
                case 'ansioso': return 'Ansioso';
                case 'confuso': return 'Confuso';
                case 'arrabbiato': return 'Arrabbiato';
                case 'nostalgico': return 'Nostalgico';
                case 'eccitato': return 'Eccitato';
                case 'pacifico': return 'Pacifico';
                default: return 'Neutro';
              }
            };
            
            return (
              <div
                key={dream.id}
                className="p-3 rounded-lg dark:bg-slate-800/70 light:bg-white/70 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium truncate flex-1">
                    {text.length > 60 ? text.substring(0, 60) + "..." : text}
                  </h3>
                  
                  {isFavorite && (
                    <Heart className="h-4 w-4 text-red-500 fill-red-500 ml-2 flex-shrink-0" />
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {category !== 'non_categorizzato' && (
                    <Badge variant="outline" className="flex items-center gap-1 text-xs dark:bg-purple-950/80 dark:text-purple-200 light:bg-indigo-50 light:text-indigo-700">
                      <Tag className="h-3 w-3" />
                      {getCategoryLabel(category)}
                    </Badge>
                  )}
                  
                  {emotion !== 'neutro' && (
                    <Badge variant="outline" className="text-xs dark:bg-blue-950/80 dark:text-blue-200 light:bg-blue-50 light:text-blue-700">
                      {getEmotionLabel(emotion)}
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(date, {
                      addSuffix: true,
                      locale: it,
                    })}
                  </p>
                  
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-purple-500"
                      onClick={() => onDreamSelect(dream)}
                      aria-label="Modifica sogno"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => onDreamDelete(dream.id)}
                      aria-label="Elimina sogno"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
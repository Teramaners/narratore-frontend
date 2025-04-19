import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3 } from "lucide-react";
import { SavedDream } from "@/lib/localStorage";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface DreamListProps {
  dreams: SavedDream[];
  onDreamSelect: (dream: SavedDream) => void;
  onDreamDelete: (id: number) => void;
}

export function DreamList({ dreams, onDreamSelect, onDreamDelete }: DreamListProps) {
  if (!dreams.length) {
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
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="p-3 rounded-lg dark:bg-slate-800/70 light:bg-white/70 flex flex-col sm:flex-row justify-between"
            >
              <div className="flex-1">
                <h3 className="font-medium truncate mb-1">
                  {dream.testo.length > 60
                    ? dream.testo.substring(0, 60) + "..."
                    : dream.testo}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(dream.data), {
                    addSuffix: true,
                    locale: it,
                  })}
                </p>
              </div>
              <div className="flex items-center mt-2 sm:mt-0">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
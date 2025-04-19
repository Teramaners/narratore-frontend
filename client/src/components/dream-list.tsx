import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { SavedDream } from '@/lib/localStorage';

interface DreamListProps {
  dreams: SavedDream[];
  onDreamSelect: (dream: SavedDream) => void;
  onDreamDelete: (id: number) => void;
}

export function DreamList({ dreams, onDreamSelect, onDreamDelete }: DreamListProps) {
  if (dreams.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 bg-indigo-800 bg-opacity-50 dark:bg-indigo-800 dark:bg-opacity-50 light:bg-white border-none shadow-lg">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-purple-200 light:text-indigo-700">
          <BookOpen className="h-5 w-5 mr-2" />
          Sogni recenti
        </h2>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {dreams.map((dream) => (
            <div
              key={dream.id}
              className="p-3 rounded flex justify-between items-center cursor-pointer dark:bg-indigo-900 dark:hover:bg-indigo-950 light:bg-indigo-50 light:hover:bg-indigo-100 transition-colors"
              onClick={() => onDreamSelect(dream)}
            >
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate dark:text-purple-200 light:text-indigo-700">
                  {dream.testo.substring(0, 50)}
                  {dream.testo.length > 50 ? "..." : ""}
                </p>
                <p className="text-xs dark:text-purple-300 light:text-indigo-500">
                  {dream.data}
                </p>
              </div>
              <button
                className="p-1 rounded-full dark:hover:bg-indigo-800 dark:text-purple-300 light:hover:bg-indigo-200 light:text-indigo-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDreamDelete(dream.id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

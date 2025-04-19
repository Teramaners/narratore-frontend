import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Send } from 'lucide-react';

interface DreamInputProps {
  onSubmit: (dream: string) => Promise<void>;
  onReset: () => void;
  loading: boolean;
  error: string;
  currentDream: string;
  setCurrentDream: (dream: string) => void;
}

export function DreamInput({
  onSubmit,
  onReset,
  loading,
  error,
  currentDream,
  setCurrentDream
}: DreamInputProps) {
  const handleSubmit = async () => {
    await onSubmit(currentDream);
  };

  return (
    <Card className="bg-indigo-800 bg-opacity-50 dark:bg-indigo-800 dark:bg-opacity-50 light:bg-white border-none shadow-lg">
      <CardContent className="p-4 md:p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-200 dark:text-purple-200 light:text-indigo-700 flex items-center">
          <Send className="h-5 w-5 mr-2" />
          Racconta il tuo sogno
        </h2>
        
        <Textarea
          placeholder="Descrivimi il tuo sogno nei dettagli..."
          className="w-full h-40 p-3 rounded border dark:bg-indigo-900 dark:border-purple-700 dark:text-purple-100 dark:focus:ring dark:focus:ring-opacity-50 dark:focus:ring-purple-500 light:bg-indigo-50 light:border-indigo-200 light:text-gray-800"
          value={currentDream}
          onChange={(e) => setCurrentDream(e.target.value)}
        />
        
        {error && (
          <div className="mt-2 text-red-400 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded flex items-center justify-center dark:bg-purple-600 dark:hover:bg-purple-700 light:bg-indigo-600 light:hover:bg-indigo-700 text-white flex-grow transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Elaborazione...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Elabora il sogno
              </>
            )}
          </Button>
          
          <Button
            onClick={onReset}
            disabled={loading}
            className="px-4 py-2 rounded dark:bg-indigo-700 dark:text-purple-200 light:bg-gray-200 light:text-gray-700 hover:opacity-80 transition-opacity"
            variant="secondary"
          >
            Cancella
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

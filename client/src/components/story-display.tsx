import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StoryDisplayProps {
  story: string;
}

export function StoryDisplay({ story }: StoryDisplayProps) {
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = () => {
    if (!story) return;
    
    navigator.clipboard.writeText(story)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy text:', err));
  };
  
  if (!story) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed dark:border-indigo-700 dark:text-purple-300 light:border-indigo-200 light:text-indigo-400">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="h-16 w-16 mb-4 opacity-50"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
        <p className="text-center">
          Inserisci il tuo sogno e clicca "Elabora" per vedere il racconto generato da Claude
        </p>
      </div>
    );
  }
  
  return (
    <Card className="h-full dark:bg-indigo-800 dark:bg-opacity-50 dark:border-l-4 dark:border-purple-500 light:bg-white light:border-l-4 light:border-indigo-500 border-none shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold dark:text-purple-200 light:text-indigo-700">
            Il Tuo Racconto
          </h2>
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            className="flex items-center px-3 py-1 rounded text-sm dark:bg-purple-700 dark:text-purple-200 light:bg-indigo-100 light:text-indigo-700 hover:opacity-80 transition-opacity"
          >
            {isCopied ? (
              "Copiato!"
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copia
              </>
            )}
          </Button>
        </div>
        
        <div className="prose dark:prose-invert light:prose max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed dark:text-purple-100 light:text-gray-700 font-serif">
            {story}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

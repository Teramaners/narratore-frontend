import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StoryDisplayProps {
  story: string;
}

export function StoryDisplay({ story }: StoryDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      toast({
        description: "Storia copiata negli appunti",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Impossibile copiare il testo",
      });
    }
  };

  if (!story) {
    return null;
  }

  return (
    <Card className="w-full mt-6 dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">
          La tua storia
        </CardTitle>
        <Button
          onClick={copyToClipboard}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          aria-label="Copia negli appunti"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          {story.split('\n').map((paragraph, i) => (
            paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Undo2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  setCurrentDream,
}: DreamInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentDream.trim()) {
      onSubmit(currentDream);
    }
  };

  return (
    <Card className="w-full dark:bg-slate-900/60 light:bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Racconta il tuo sogno
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="Descrivi il tuo sogno in dettaglio..."
            className="min-h-[120px] dark:bg-slate-800/70 light:bg-white/70"
            value={currentDream}
            onChange={(e) => setCurrentDream(e.target.value)}
            disabled={loading}
          />
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={loading || !currentDream}
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Cancella
          </Button>
          <Button
            type="submit"
            className="dark:bg-purple-600 dark:hover:bg-purple-700"
            disabled={loading || !currentDream.trim()}
          >
            {loading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                Generando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Genera storia
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
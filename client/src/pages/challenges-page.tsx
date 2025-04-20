import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Moon, 
  LogOut, 
  Home, 
  Calendar, 
  Trophy, 
  Plus, 
  Heart, 
  MessageCircle, 
  Sparkles,
  Loader2,
  History,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingOverlay } from '@/components/loading-overlay';

// Formato della data in italiano
const formatDate = (date: Date) => {
  return format(date, 'PPP', { locale: it });
};

// Schema validazione per la creazione di una nuova sfida
const createChallengeSchema = z.object({
  title: z.string().min(5, "Il titolo deve essere di almeno 5 caratteri").max(100),
  description: z.string().min(20, "La descrizione deve essere di almeno 20 caratteri"),
  theme: z.string().min(3, "Il tema deve essere di almeno 3 caratteri"),
  banner_image_url: z.string().optional(),
  start_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Data di inizio non valida",
  }),
  end_date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Data di fine non valida",
  }),
  points_reward: z.number().int().min(5).max(100).default(10),
});

// Schema validazione per la partecipazione a una sfida
const participateSchema = z.object({
  challenge_id: z.number(),
  dream_content: z.string().min(10, "Il contenuto del sogno deve essere di almeno 10 caratteri"),
});

// Componente per creare una nuova sfida
function NewChallengeForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof createChallengeSchema>>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      theme: "",
      banner_image_url: "",
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // +7 giorni di default
      points_reward: 10,
    },
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createChallengeSchema>) => {
      const response = await apiRequest('POST', '/api/sfide', {
        ...values,
        start_date: new Date(values.start_date).toISOString(),
        end_date: new Date(values.end_date).toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sfide'] });
      toast({
        description: "Sfida creata con successo!",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Non è stato possibile creare la sfida: ${error.message}`,
      });
    },
  });

  function onSubmit(values: z.infer<typeof createChallengeSchema>) {
    createChallengeMutation.mutate(values);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Crea Nuova Sfida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Crea una nuova sfida di sogni</DialogTitle>
          <DialogDescription>
            Invita la community a sognare su un tema specifico e condividere le proprie esperienze oniriche.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input placeholder="Inserisci un titolo accattivante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema</FormLabel>
                  <FormControl>
                    <Input placeholder="Es. foresta incantata, viaggi nel tempo, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrivi la sfida e cosa devono fare i partecipanti..." 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data inizio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data fine</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="banner_image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Immagine banner (opzionale)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL dell'immagine banner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="points_reward"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Punti premio</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={5} 
                      max={100} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={createChallengeMutation.isPending}>
                {createChallengeMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crea Sfida
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Componente per partecipare a una sfida
function ParticipateInChallengeDialog({ 
  challenge,
  onParticipate,
}: { 
  challenge: any,
  onParticipate: () => void,
}) {
  const { toast } = useToast();
  const { data: dreams = [] } = useQuery({
    queryKey: ['/api/sogni'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sogni');
      return response.json();
    },
  });
  
  const [dreamContent, setDreamContent] = useState("");
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  
  // Generare un prompt basato sul tema della sfida
  const generatePromptMutation = useMutation({
    mutationFn: async (theme: string) => {
      const response = await apiRequest('POST', '/api/sfide/genera-prompt', { theme });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedPrompt(data.prompt);
      toast({
        description: "Prompt generato con successo!",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Non è stato possibile generare il prompt: ${error.message}`,
      });
    },
  });
  
  const handleGeneratePrompt = () => {
    setGeneratingPrompt(true);
    generatePromptMutation.mutate(challenge.theme);
  };
  
  // Partecipare alla sfida
  const participateMutation = useMutation({
    mutationFn: async (data: { challenge_id: number, dream_content: string }) => {
      const response = await apiRequest('POST', '/api/sfide/partecipa', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sfide'] });
      toast({
        description: "Hai partecipato alla sfida con successo!",
      });
      onParticipate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: `Non è stato possibile partecipare alla sfida: ${error.message}`,
      });
    },
  });
  
  const handleParticipate = () => {
    if (dreamContent.length < 10) {
      toast({
        variant: "destructive",
        description: "Il contenuto del sogno deve essere di almeno 10 caratteri",
      });
      return;
    }
    
    participateMutation.mutate({
      challenge_id: challenge.id,
      dream_content: dreamContent
    });
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles size={16} />
          Partecipa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Partecipa alla sfida: {challenge.title}</DialogTitle>
          <DialogDescription>
            Tema: <span className="font-medium">{challenge.theme}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!generatedPrompt && (
            <div className="bg-secondary p-4 rounded-md">
              <p className="text-sm">
                Hai bisogno di ispirazione? Genera un prompt per aiutarti a sognare sul tema di questa sfida!
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleGeneratePrompt}
                disabled={generatePromptMutation.isPending}
              >
                {generatePromptMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generazione...
                  </>
                ) : "Genera prompt di ispirazione"}
              </Button>
            </div>
          )}
          
          {generatedPrompt && (
            <div className="bg-secondary p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Prompt di ispirazione:</p>
              <p className="text-sm italic">{generatedPrompt}</p>
            </div>
          )}
          
          <div>
            <Textarea
              placeholder="Descrivi il tuo sogno correlato a questa sfida..."
              rows={6}
              value={dreamContent}
              onChange={(e) => setDreamContent(e.target.value)}
              className="w-full"
            />
            {dreamContent.length < 10 && dreamContent.length > 0 && (
              <p className="text-red-500 text-xs mt-1">
                Il contenuto del sogno deve essere di almeno 10 caratteri
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleParticipate}
            disabled={participateMutation.isPending || dreamContent.length < 10}
          >
            {participateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Invia Partecipazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Card per visualizzare una sfida
function ChallengeCard({ challenge }: { challenge: any }) {
  const { user } = useAuth();
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const now = new Date();
  
  const isActive = now >= startDate && now <= endDate;
  const isFuture = now < startDate;
  const isPast = now > endDate;
  
  const hasParticipated = challenge.participations?.some(
    (p: any) => p.user_id === user?.id
  );
  
  const [hasRefreshed, setHasRefreshed] = useState(false);
  
  const handleParticipate = () => {
    setHasRefreshed(true);
  };
  
  return (
    <Card className="overflow-hidden">
      {challenge.banner_image_url ? (
        <div 
          className="h-40 bg-cover bg-center" 
          style={{ backgroundImage: `url(${challenge.banner_image_url})` }}
        />
      ) : (
        <div className="h-40 bg-gradient-to-r from-purple-400 to-indigo-500 flex items-center justify-center">
          <Trophy className="h-12 w-12 text-white" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{challenge.title}</CardTitle>
            <CardDescription>Tema: {challenge.theme}</CardDescription>
          </div>
          
          <Badge 
            variant={isActive ? "default" : (isFuture ? "outline" : "secondary")}
          >
            {isActive ? "Attiva" : (isFuture ? "Futura" : "Conclusa")}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm">{challenge.description}</p>
        
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Inizio</p>
            <p>{formatDate(startDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fine</p>
            <p>{formatDate(endDate)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-sm">
          <Badge variant="outline" className="rounded-full px-2 py-0">
            {challenge.participant_count || 0} partecipanti
          </Badge>
          <Badge variant="outline" className="rounded-full px-2 py-0">
            {challenge.points_reward} punti premio
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{challenge.creator?.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {challenge.creator?.username || 'Utente'}
          </span>
        </div>
        
        {isActive && !hasParticipated && !hasRefreshed && (
          <ParticipateInChallengeDialog 
            challenge={challenge} 
            onParticipate={handleParticipate}
          />
        )}
        
        {isActive && (hasParticipated || hasRefreshed) && (
          <Badge variant="outline" className="gap-1">
            <Check size={14} /> Hai partecipato
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}

// Nessuna importazione separata necessaria

// Pagina principale delle sfide
export default function ChallengesPage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
  // Query per ottenere tutte le sfide
  const {
    data: challenges = [],
    isLoading: isLoadingChallenges,
    refetch: refetchChallenges,
  } = useQuery({
    queryKey: ['/api/sfide'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/sfide');
      return response.json();
    },
  });
  
  // Filtrare le sfide per stato
  const activeChallenges = challenges.filter((challenge: any) => {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);
    return now >= startDate && now <= endDate;
  });
  
  const futureChallenges = challenges.filter((challenge: any) => {
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    return now < startDate;
  });
  
  const pastChallenges = challenges.filter((challenge: any) => {
    const now = new Date();
    const endDate = new Date(challenge.end_date);
    return now > endDate;
  });
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 dark:from-indigo-900 dark:to-purple-900 light:from-blue-100 light:to-purple-100 p-4 md:p-6 transition-colors duration-500">
      <LoadingOverlay isVisible={isLoadingChallenges} />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mr-2 dark:text-yellow-200 light:text-indigo-600" />
            <h1 className="text-2xl md:text-3xl font-bold dark:text-white light:text-gray-800">Sfide dei Sogni</h1>
            <span className="hidden sm:inline-block ml-2 px-2 py-1 rounded text-xs dark:bg-purple-700 dark:text-purple-200 light:bg-indigo-100 light:text-indigo-600">
              Community
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center mr-2">
                <span className="text-sm dark:text-purple-200 light:text-indigo-700">
                  Ciao, {user.username}
                </span>
                <Button
                  variant="ghost"
                  className="ml-2 dark:text-purple-200 light:text-indigo-700"
                  onClick={() => window.location.href = "/"}
                >
                  <Home className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
        
        {/* Intestazione della pagina */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1 dark:text-white light:text-gray-800">
              Esplora e partecipa alle sfide di sogni
            </h2>
            <p className="text-sm dark:text-purple-200 light:text-indigo-700">
              Scegli una sfida, lasciati ispirare e condividi i tuoi sogni con la community
            </p>
          </div>
          
          <NewChallengeForm />
        </div>
        
        {/* Tabs per le sfide */}
        <Tabs defaultValue="active" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="active" className="gap-2">
              <Sparkles size={14} />
              Attive ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="future" className="gap-2">
              <Calendar size={14} />
              Future ({futureChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <History size={14} />
              Concluse ({pastChallenges.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeChallenges.length === 0 ? (
              <div className="text-center p-8 bg-secondary rounded-lg">
                <p className="text-lg mb-2">Nessuna sfida attiva al momento</p>
                <p className="text-sm text-muted-foreground">
                  Crea la prima sfida o torna più tardi per vedere le nuove sfide!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {activeChallenges.map((challenge: any) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="future">
            {futureChallenges.length === 0 ? (
              <div className="text-center p-8 bg-secondary rounded-lg">
                <p className="text-lg mb-2">Nessuna sfida futura in programma</p>
                <p className="text-sm text-muted-foreground">
                  Crea una nuova sfida per il futuro!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {futureChallenges.map((challenge: any) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastChallenges.length === 0 ? (
              <div className="text-center p-8 bg-secondary rounded-lg">
                <p className="text-lg mb-2">Nessuna sfida conclusa</p>
                <p className="text-sm text-muted-foreground">
                  Le sfide completate appariranno qui!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pastChallenges.map((challenge: any) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
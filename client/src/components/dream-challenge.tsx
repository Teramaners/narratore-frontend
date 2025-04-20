import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trophy, Users } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Funzione di aiuto per formattare le date
const formatDate = (date: Date) => {
  return format(date, "dd/MM/yyyy");
};

// Schema di validazione per la creazione di una sfida
const createChallengeSchema = z.object({
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri"),
  description: z.string().min(10, "La descrizione deve avere almeno 10 caratteri"),
  theme: z.string().min(2, "Il tema deve avere almeno 2 caratteri"),
  promptTemplate: z.string().optional(),
  bannerImageUrl: z.string().optional(),
  startDate: z.date({
    required_error: "Si prega di selezionare una data di inizio",
  }),
  endDate: z.date({
    required_error: "Si prega di selezionare una data di fine",
  }),
  pointsReward: z.coerce.number().min(1).default(10),
}).refine(data => data.endDate > data.startDate, {
  message: "La data di fine deve essere successiva alla data di inizio",
  path: ["endDate"],
});

// Tipo per i temi predefiniti
const predefinedThemes = [
  "Viaggi", 
  "Natura", 
  "Avventura", 
  "Paura", 
  "Mistero", 
  "Animali", 
  "Acqua", 
  "Volo", 
  "Memoria", 
  "Futuro"
];

// Componente per creare una nuova sfida
function NewChallengeForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof createChallengeSchema>>({
    resolver: zodResolver(createChallengeSchema),
    defaultValues: {
      title: "",
      description: "",
      theme: "",
      promptTemplate: "",
      bannerImageUrl: "",
      pointsReward: 10,
    },
  });
  
  const createChallengeMutation = useMutation({
    mutationFn: async (values: z.infer<typeof createChallengeSchema>) => {
      const response = await apiRequest("POST", "/api/sfide", values);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sfida creata con successo",
        description: "La tua sfida è stata creata e pubblicata",
      });
      form.reset();
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/sfide"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nella creazione della sfida",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: z.infer<typeof createChallengeSchema>) {
    createChallengeMutation.mutate(values);
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} /> Nuova Sfida
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crea una nuova sfida di ispirazione</DialogTitle>
          <DialogDescription>
            Crea una sfida che ispirerà gli altri a esplorare nuovi temi nei loro sogni.
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
                    <Input placeholder="Un titolo accattivante per la tua sfida" {...field} />
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
                      placeholder="Descrivi la sfida e ciò che vuoi che le persone esplorino nei loro sogni" 
                      className="min-h-[100px]"
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
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona un tema" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {predefinedThemes.map((theme) => (
                          <SelectItem key={theme} value={theme}>
                            {theme}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Tema personalizzato</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {field.value === "custom" && (
                      <Input 
                        placeholder="Inserisci il tuo tema personalizzato" 
                        onChange={(e) => form.setValue("theme", e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pointsReward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Punti ricompensa</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1} 
                        {...field}
                        onChange={(e) => form.setValue("pointsReward", parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Punti che gli utenti ottengono partecipando
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data di inizio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Seleziona la data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data di fine</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              formatDate(field.value)
                            ) : (
                              <span>Seleziona la data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("startDate");
                            return date < new Date() || (startDate && date <= startDate);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="promptTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Prompt Template (opzionale)
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Lascia vuoto per generare automaticamente un prompt ispirato al tema" 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Sarà mostrato come spunto per ispirare i partecipanti
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={createChallengeMutation.isPending}>
                {createChallengeMutation.isPending ? "Creazione in corso..." : "Crea Sfida"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Componente per la partecipazione alla sfida
function ParticipateInChallengeDialog({ 
  challengeId, 
  challenge,
  onSuccess 
}: { 
  challengeId: number, 
  challenge: any, 
  onSuccess?: () => void 
}) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  
  // Ottieni i sogni dell'utente
  const { data: dreams, isLoading: isLoadingDreams } = useQuery({
    queryKey: ["/api/sogni"],
    enabled: open && !!user,
  });
  
  // Ottieni il prompt di ispirazione
  const { data: promptData, isLoading: isLoadingPrompt } = useQuery({
    queryKey: ["/api/sfide", challengeId, "prompt"],
    queryFn: async () => {
      const response = await fetch(`/api/sfide/${challengeId}/prompt`);
      if (!response.ok) throw new Error("Failed to fetch challenge prompt");
      return response.json();
    },
    enabled: open,
  });
  
  const participateMutation = useMutation({
    mutationFn: async (dreamId: number) => {
      const response = await apiRequest("POST", `/api/sfide/${challengeId}/partecipa`, { dreamId });
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Partecipazione registrata con successo",
        description: `Hai guadagnato ${data.pointsEarned} punti di ispirazione!`,
      });
      setOpen(false);
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({ queryKey: ["/api/sfide"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sfide", challengeId, "partecipazioni"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sogni"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Errore nella partecipazione",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [selectedDreamId, setSelectedDreamId] = useState<number | null>(null);
  
  const handlePartecipate = () => {
    if (selectedDreamId) {
      participateMutation.mutate(selectedDreamId);
    } else {
      toast({
        title: "Nessun sogno selezionato",
        description: "Seleziona un sogno per partecipare alla sfida",
        variant: "destructive",
      });
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          Partecipa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Partecipa alla sfida</DialogTitle>
          <DialogDescription>
            Scegli un tuo sogno da condividere per questa sfida: "{challenge?.title}"
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingPrompt ? (
          <div className="text-center py-4">Caricamento prompt di ispirazione...</div>
        ) : promptData?.prompt ? (
          <Card className="bg-muted/40 my-4">
            <CardContent className="p-4 italic text-muted-foreground">
              "{promptData.prompt}"
            </CardContent>
          </Card>
        ) : null}
        
        <div className="space-y-4 py-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Seleziona un sogno da condividere:</h4>
            {isLoadingDreams ? (
              <div className="text-center py-4">Caricamento sogni...</div>
            ) : dreams && Array.isArray(dreams) && dreams.length > 0 ? (
              <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                {dreams.map((dream: any) => (
                  <div
                    key={dream.id}
                    className={cn(
                      "border p-3 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
                      selectedDreamId === dream.id && "bg-primary/10 border-primary"
                    )}
                    onClick={() => setSelectedDreamId(dream.id)}
                  >
                    <div className="font-medium truncate">{dream.content}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {formatDate(new Date(dream.createdAt))}
                    </div>
                    {dream.category && (
                      <Badge variant="outline" className="mt-2">
                        {dream.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Non hai ancora registrato sogni. Registra un sogno prima di partecipare alla sfida.
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handlePartecipate} 
            disabled={!selectedDreamId || participateMutation.isPending}
          >
            {participateMutation.isPending ? "Invio in corso..." : "Condividi Sogno"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Componente per visualizzare una singola sfida
function ChallengeCard({ challenge }: { challenge: any }) {
  const isActive = new Date() >= new Date(challenge.startDate) && new Date() <= new Date(challenge.endDate);
  const isUpcoming = new Date() < new Date(challenge.startDate);
  const isEnded = new Date() > new Date(challenge.endDate);
  
  // Ottieni le partecipazioni alla sfida
  const { data: participations } = useQuery({
    queryKey: ["/api/sfide", challenge.id, "partecipazioni"],
    queryFn: async () => {
      const response = await fetch(`/api/sfide/${challenge.id}/partecipazioni`);
      if (!response.ok) throw new Error("Failed to fetch challenge participations");
      return response.json();
    },
  });
  
  const statusBadge = () => {
    if (isActive) return <Badge variant="default" className="bg-green-500">Attiva</Badge>;
    if (isUpcoming) return <Badge variant="outline" className="border-blue-500 text-blue-500">In arrivo</Badge>;
    if (isEnded) return <Badge variant="outline" className="border-gray-500 text-gray-500">Conclusa</Badge>;
    return null;
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{challenge.title}</CardTitle>
          {statusBadge()}
        </div>
        <CardDescription>
          Tema: {challenge.theme}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground">{challenge.description}</p>
        <div className="flex items-center mt-4 space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{challenge.participantCount} partecipanti</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy size={16} />
            <span>{challenge.pointsReward} punti</span>
          </div>
        </div>
        <div className="mt-4 text-sm">
          <div>Dal {formatDate(new Date(challenge.startDate))}</div>
          <div>Al {formatDate(new Date(challenge.endDate))}</div>
        </div>
      </CardContent>
      <CardFooter>
        {isActive && (
          <ParticipateInChallengeDialog 
            challengeId={challenge.id} 
            challenge={challenge}
          />
        )}
        {participations && Array.isArray(participations) && participations.length > 0 && (
          <div className="mt-2 flex -space-x-2 overflow-hidden">
            {participations.slice(0, 5).map((p: any, i: number) => (
              <Avatar key={i} className="inline-block ring-2 ring-background w-8 h-8">
                {p.user.profileImage ? (
                  <AvatarImage src={p.user.profileImage} alt={p.user.username} />
                ) : (
                  <AvatarFallback>{p.user.username[0]}</AvatarFallback>
                )}
              </Avatar>
            ))}
            {participations.length > 5 && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-xs">
                +{participations.length - 5}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Componente principale per le sfide dei sogni
export default function DreamChallenges() {
  const [tab, setTab] = useState("active");
  
  // Ottieni tutte le sfide
  const { data: challenges, isLoading } = useQuery({
    queryKey: ["/api/sfide"],
    queryFn: async () => {
      const response = await fetch("/api/sfide");
      if (!response.ok) throw new Error("Failed to fetch challenges");
      return response.json();
    },
  });
  
  // Filtra le sfide in base al tab selezionato
  const filteredChallenges = React.useMemo(() => {
    if (!challenges) return [];
    
    const now = new Date();
    
    if (tab === "active") {
      return challenges.filter((c: any) => {
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        return startDate <= now && endDate >= now && c.isActive;
      });
    }
    
    if (tab === "upcoming") {
      return challenges.filter((c: any) => {
        const startDate = new Date(c.startDate);
        return startDate > now && c.isActive;
      });
    }
    
    if (tab === "ended") {
      return challenges.filter((c: any) => {
        const endDate = new Date(c.endDate);
        return endDate < now || !c.isActive;
      });
    }
    
    return challenges;
  }, [challenges, tab]);
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sfide di Ispirazione</h1>
        <NewChallengeForm />
      </div>
      
      <Tabs defaultValue="active" value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Sfide Attive</TabsTrigger>
          <TabsTrigger value="upcoming">In Arrivo</TabsTrigger>
          <TabsTrigger value="ended">Concluse</TabsTrigger>
          <TabsTrigger value="all">Tutte</TabsTrigger>
        </TabsList>
        
        <TabsContent value={tab}>
          {isLoading ? (
            <div className="text-center py-12">Caricamento sfide...</div>
          ) : filteredChallenges.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredChallenges.map((challenge: any) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {tab === "active" && "Non ci sono sfide attive al momento."}
              {tab === "upcoming" && "Non ci sono sfide in programma."}
              {tab === "ended" && "Non ci sono sfide concluse."}
              {tab === "all" && "Non ci sono sfide disponibili."}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePolls } from '@/hooks/usePolls';
import { Vote, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const PollWidget = () => {
  const { getActivePoll, getPollOptions, votePoll, hasVoted } = usePolls();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [userHasVoted, setUserHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  const activePoll = getActivePoll();
  const pollOptions = activePoll ? getPollOptions(activePoll.id) : [];

  useEffect(() => {
    if (activePoll) {
      hasVoted(activePoll.id).then(setUserHasVoted);
    }
  }, [activePoll, hasVoted]);

  if (!activePoll) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Vote className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma enquete ativa no momento</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = pollOptions.reduce((sum, option) => sum + option.vote_count, 0);

  const handleVote = async () => {
    if (!selectedOption || isVoting) return;
    
    setIsVoting(true);
    const success = await votePoll(activePoll.id, selectedOption);
    
    if (success) {
      setUserHasVoted(true);
    }
    setIsVoting(false);
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Enquete
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Ativa
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold text-base mb-2">{activePoll.title}</h3>
          {activePoll.description && (
            <p className="text-sm text-muted-foreground mb-4">
              {activePoll.description}
            </p>
          )}
        </div>

        {userHasVoted ? (
          // Resultados
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Resultados ({totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}):
            </p>
            {pollOptions.map(option => (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{option.option_text}</span>
                  <span className="text-sm font-medium">
                    {getPercentage(option.vote_count)}%
                  </span>
                </div>
                <Progress 
                  value={getPercentage(option.vote_count)} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {option.vote_count} {option.vote_count === 1 ? 'voto' : 'votos'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Formulário de votação
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {pollOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.option_text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button 
              onClick={handleVote}
              disabled={!selectedOption || isVoting}
              className="w-full"
            >
              {isVoting ? 'Votando...' : 'Votar'}
            </Button>
          </div>
        )}

        {activePoll.end_date && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="w-3 h-3" />
            <span>
              Encerra em {format(new Date(activePoll.end_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
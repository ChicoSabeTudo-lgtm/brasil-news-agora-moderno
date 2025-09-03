import React, { Component, ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackUrl?: string;
  fallbackText?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class EmbedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Embed Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full max-w-lg mx-auto p-6 text-center">
          <div className="space-y-4">
            <AlertTriangle className="h-8 w-8 text-warning mx-auto" />
            <p className="text-muted-foreground">
              {this.props.fallbackText || 'Erro ao carregar conteúdo'}
            </p>
            {this.props.fallbackUrl && (
              <Button variant="outline" asChild>
                <a href={this.props.fallbackUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver conteúdo original
                </a>
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Tentar novamente
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
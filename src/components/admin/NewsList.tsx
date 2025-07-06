import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';

// Mock data - em produção viria do Supabase
const mockNews = [
  {
    id: 1,
    title: "Congresso Nacional aprova reforma tributária em votação histórica",
    category: "Política",
    status: "published",
    author: "Ana Silva",
    publishedAt: "2024-01-06T10:00:00Z",
    views: 1250,
    isBreaking: true
  },
  {
    id: 2,
    title: "Banco Central mantém Selic em 10,75% e sinaliza cautela para 2024",
    category: "Economia",
    status: "published",
    author: "Carlos Santos",
    publishedAt: "2024-01-06T08:30:00Z",
    views: 890,
    isBreaking: false
  },
  {
    id: 3,
    title: "Brasil estreia na Copa América com vitória sobre a Argentina",
    category: "Esportes",
    status: "draft",
    author: "Maria Oliveira",
    publishedAt: null,
    views: 0,
    isBreaking: false
  },
  {
    id: 4,
    title: "OpenAI lança nova versão do ChatGPT com recursos avançados",
    category: "Tecnologia",
    status: "published",
    author: "João Tech",
    publishedAt: "2024-01-05T16:20:00Z",
    views: 2340,
    isBreaking: false
  }
];

export const NewsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const categories = ['Política', 'Economia', 'Esportes', 'Tecnologia', 'Internacional', 'Nacional'];

  const filteredNews = mockNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || news.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || news.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (id: number) => {
    console.log('Edit news:', id);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta notícia?')) {
      console.log('Delete news:', id);
    }
  };

  const handleToggleStatus = (id: number) => {
    console.log('Toggle status:', id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Publicado</Badge>;
      case 'draft':
        return <Badge variant="secondary">Rascunho</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não publicado';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Notícias</CardTitle>
        <CardDescription>
          Gerencie todas as notícias do portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar notícias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="published">Publicados</SelectItem>
              <SelectItem value="draft">Rascunhos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Publicado em</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.map((news) => (
                <TableRow key={news.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {news.isBreaking && (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="line-clamp-2">{news.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{news.category}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(news.status)}</TableCell>
                  <TableCell>{news.author}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(news.publishedAt)}
                  </TableCell>
                  <TableCell>{news.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(news.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(news.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Nenhuma notícia encontrada com os filtros aplicados.'
                : 'Nenhuma notícia cadastrada ainda.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
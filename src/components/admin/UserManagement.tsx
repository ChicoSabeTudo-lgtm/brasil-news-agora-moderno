import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, UserPlus, Shield, User, Check, X, UserCheck, UserX } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  created_at: string;
  is_approved: boolean;
  access_revoked: boolean;
  approved_at: string | null;
  revoked_at: string | null;
  user_roles: { role: string }[];
  news_count?: number;
  last_news_date?: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'redator' | 'gestor'>('redator');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'redator' | 'gestor'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => 
        user.user_roles.some(role => role.role === filterRole)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending') {
        filtered = filtered.filter(user => !user.is_approved);
      } else if (filterStatus === 'approved') {
        filtered = filtered.filter(user => user.is_approved && !user.access_revoked);
      } else if (filterStatus === 'revoked') {
        filtered = filtered.filter(user => user.access_revoked);
      }
    }

    setFilteredUsers(filtered);
  }, [users, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, created_at, is_approved, access_revoked, approved_at, revoked_at');

      if (profilesError) throw profilesError;

      // Then get roles and news count for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [rolesResult, newsResult] = await Promise.all([
            supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', profile.user_id),
            supabase
              .from('news')
              .select('id, created_at')
              .eq('author_id', profile.user_id)
              .order('created_at', { ascending: false })
          ]);

          const newsCount = newsResult.data?.length || 0;
          const lastNewsDate = newsResult.data?.[0]?.created_at;

          return {
            ...profile,
            user_roles: rolesResult.data || [],
            news_count: newsCount,
            last_news_date: lastNewsDate
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'redator' | 'gestor') => {
    try {
      // Use secure edge function for role updates
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'update_role',
          target_user_id: userId,
          new_role: role,
          reason: 'Role updated via admin panel'
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Perfil do usuário atualizado com sucesso.",
      });

      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil do usuário.",
        variant: "destructive",
      });
    }
  };

  const approveUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'approve_user',
          target_user_id: userId,
          reason: 'User access approved via admin panel'
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário aprovado com sucesso.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o usuário.",
        variant: "destructive",
      });
    }
  };

  const revokeUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso deste usuário?')) return;

    try {
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'revoke_user',
          target_user_id: userId,
          reason: 'User access revoked via admin panel'
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Acesso do usuário revogado com sucesso.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error revoking user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível revogar o acesso do usuário.",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    try {
      // Use secure edge function for user deletion
      const { data, error } = await supabase.functions.invoke('admin-user-management', {
        body: {
          action: 'delete_user',
          target_user_id: userId,
          reason: 'User deleted via admin panel'
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário removido com sucesso.",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o usuário.",
        variant: "destructive",
      });
    }
  };

  if (userRole !== 'admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Acesso restrito a administradores.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="sr-only">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários do Sistema</CardTitle>
        <CardDescription>
          Gerencie os usuários e suas permissões
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="role-filter">Filtrar por Perfil</Label>
            <Select value={filterRole} onValueChange={(value: 'all' | 'admin' | 'redator' | 'gestor') => setFilterRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os perfis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os perfis</SelectItem>
                <SelectItem value="admin">Administradores</SelectItem>
                <SelectItem value="redator">Redatores</SelectItem>
                <SelectItem value="gestor">Gestores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="status-filter">Filtrar por Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="revoked">Revogados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">Total de Usuários</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.is_approved && !u.access_revoked).length}
              </div>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => !u.is_approved).length}
              </div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.user_roles.some(r => r.role === 'redator')).length}
              </div>
              <p className="text-xs text-muted-foreground">Redatores</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.user_roles.some(r => r.role === 'gestor')).length}
              </div>
              <p className="text-xs text-muted-foreground">Gestores</p>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notícias</TableHead>
              <TableHead>Última Atividade</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || 'Sem nome'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.user_roles[0]?.role === 'admin'
                        ? 'default'
                        : user.user_roles[0]?.role === 'gestor'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {user.user_roles[0]?.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Administrador
                      </>
                    ) : user.user_roles[0]?.role === 'gestor' ? (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Gestor
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Redator
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {!user.is_approved ? (
                    <Badge variant="destructive">
                      <X className="w-3 h-3 mr-1" />
                      Pendente Aprovação
                    </Badge>
                  ) : user.access_revoked ? (
                    <Badge variant="destructive">
                      <UserX className="w-3 h-3 mr-1" />
                      Acesso Revogado
                    </Badge>
                  ) : (
                    <Badge variant="default">
                      <Check className="w-3 h-3 mr-1" />
                      Aprovado
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {user.news_count || 0} notícias
                    </Badge>
                    {user.news_count && user.news_count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {user.news_count >= 50 ? '⭐' : user.news_count >= 10 ? '🔥' : '📝'}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {user.last_news_date ? (
                    <div className="text-sm">
                      <div>{new Date(user.last_news_date).toLocaleDateString('pt-BR')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.last_news_date).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Nunca</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!user.is_approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveUser(user.user_id)}
                        className="text-green-600 hover:text-green-600"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {user.is_approved && !user.access_revoked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeUser(user.user_id)}
                        className="text-orange-600 hover:text-orange-600"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {user.access_revoked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => approveUser(user.user_id)}
                        className="text-green-600 hover:text-green-600"
                      >
                        <UserCheck className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setNewRole((user.user_roles[0]?.role as 'admin' | 'redator' | 'gestor') || 'redator');
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Editar Usuário</DialogTitle>
                          <DialogDescription>
                            Altere o perfil do usuário {user.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="role">Perfil</Label>
                            <Select value={newRole} onValueChange={(value: 'admin' | 'redator' | 'gestor') => setNewRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="redator">Redator</SelectItem>
                                <SelectItem value="gestor">Gestor</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button 
                              onClick={() => updateUserRole(user.user_id, newRole)}
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.user_id)}
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

        {users.length === 0 && (
          <div className="text-center py-8">
            <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum usuário encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

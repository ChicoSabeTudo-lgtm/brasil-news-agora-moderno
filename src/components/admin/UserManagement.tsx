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
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const { userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First get profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, created_at, is_approved, access_revoked, approved_at, revoked_at');

      if (profilesError) throw profilesError;

      // Then get roles for each user
      const usersWithRoles = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.user_id);

          return {
            ...profile,
            user_roles: rolesData || []
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

  const updateUserRole = async (userId: string, role: 'admin' | 'redator') => {
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.full_name || 'Sem nome'}
                </TableCell>
                <TableCell>
                  <Badge variant={user.user_roles[0]?.role === 'admin' ? 'default' : 'secondary'}>
                    {user.user_roles[0]?.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        Administrador
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
                            setNewRole(user.user_roles[0]?.role || 'redator');
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
                            <Select value={newRole} onValueChange={setNewRole}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="redator">Redator</SelectItem>
                                <SelectItem value="admin">Administrador</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button 
                              onClick={() => updateUserRole(user.user_id, newRole as 'admin' | 'redator')}
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

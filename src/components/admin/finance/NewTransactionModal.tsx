import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { TxStatus, TxType, FinanceTransaction, FinanceProject, FinanceCategory } from '@/hooks/useFinance';
import { Plus } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinance';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: FinanceProject[];
  categories: FinanceCategory[];
  createTransaction: (payload: Omit<FinanceTransaction, 'id'>) => Promise<FinanceTransaction>;
  onCreated?: (tx: FinanceTransaction) => void;
};

export function NewTransactionModal({ open, onOpenChange, projects, categories, createTransaction, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const { createCategory, contacts, createContact } = useFinanceData();
  const [form, setForm] = useState<{
    type: TxType;
    description: string;
    value: number;
    due_date: string;
    pay_date: string;
    status: TxStatus;
    supplier: string;
    project_id: string;
    method: string;
    category_id: string;
    receipt_url: string;
    contact_id: string;
  }>({
    type: 'receita',
    description: '',
    value: 0,
    due_date: '',
    pay_date: '',
    status: 'Pendente',
    supplier: '',
    project_id: '',
    method: '',
    category_id: '',
    receipt_url: '',
    contact_id: '',
  });

  const reset = () => {
    setFiles([]);
    setForm({ type: 'receita', description: '', value: 0, due_date: '', pay_date: '', status: 'Pendente', supplier: '', project_id: '', method: '', category_id: '', receipt_url: '', contact_id: '' });
  };

  const handleCreate = async () => {
    if (!form.description || !form.due_date) return;
    setSaving(true);
    try {
      const tx = await createTransaction({ ...form, pay_date: form.pay_date || null } as any);

      // Upload attachments (if any)
      for (const file of files.slice(0, 5)) {
        const path = `tx/${tx.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('finance-attachments').upload(path, file, { upsert: false });
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('finance-attachments').getPublicUrl(path);
          await supabase.from('finance_attachments').insert({ transaction_id: tx.id, url: publicUrl, path, name: file.name, mime_type: file.type, size_bytes: file.size });
        }
      }

      onCreated?.(tx);
      reset();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 flex gap-2">
            <Button variant={form.type === 'receita' ? 'default' : 'outline'} onClick={() => setForm((f) => ({ ...f, type: 'receita' }))} className="flex-1">$ Receita</Button>
            <Button variant={form.type === 'despesa' ? 'destructive' : 'outline'} onClick={() => setForm((f) => ({ ...f, type: 'despesa' }))} className="flex-1">$ Despesa</Button>
          </div>

          <div className="col-span-2">
            <Label>Descrição</Label>
            <Input placeholder="Descrição da transação" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>

          <div>
            <Label>Valor</Label>
            <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Data de Vencimento</Label>
            <Input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          </div>

          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v: TxStatus) => setForm((f) => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Pago">Pago</SelectItem>
                <SelectItem value="Atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data de Pagamento</Label>
            <Input type="date" value={form.pay_date} onChange={(e) => setForm((f) => ({ ...f, pay_date: e.target.value }))} />
          </div>

          <div>
            <Label>Fornecedor/Despesa</Label>
            <Input value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))} />
          </div>
          <div>
            <Label>Projeto</Label>
            <div className="flex gap-2">
              <Select value={form.project_id} onValueChange={(v) => setForm((f) => ({ ...f, project_id: v === 'none' ? '' : v }))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar projeto" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {projects.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={async () => {
                const name = prompt('Nome do novo projeto');
                if (name) {
                  // Criação rápida de projeto via Supabase
                  const { data, error } = await supabase.from('finance_projects').insert({ name }).select('id,name').single();
                  if (!error && data) {
                    setForm((f) => ({ ...f, project_id: data.id }));
                  }
                }
              }}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <div>
            <Label>Método de Pagamento</Label>
            <Select value={form.method} onValueChange={(v) => setForm((f) => ({ ...f, method: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecionar método" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Categoria</Label>
            <div className="flex gap-2">
              <Select value={form.category_id} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v }))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.type === form.type).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={async () => {
                const name = prompt('Nome da nova categoria');
                if (name) {
                  const cat = await createCategory(name, form.type);
                  setForm((f) => ({ ...f, category_id: cat.id }));
                }
              }}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <div>
            <Label>{form.type === 'receita' ? 'Cliente' : 'Fornecedor'}</Label>
            <div className="flex gap-2">
              <Select value={form.contact_id} onValueChange={(v) => setForm((f) => ({ ...f, contact_id: v }))}>
                <SelectTrigger className="flex-1"><SelectValue placeholder={form.type === 'receita' ? 'Selecionar cliente' : 'Selecionar fornecedor'} /></SelectTrigger>
                <SelectContent>
                  {contacts.filter(c => (form.type === 'receita' ? c.type==='cliente' : c.type==='fornecedor')).map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={async () => {
                const name = prompt(`Nome do ${form.type === 'receita' ? 'cliente' : 'fornecedor'}`);
                if (name) {
                  const cont = await createContact(name, form.type === 'receita' ? 'cliente' : 'fornecedor');
                  setForm((f) => ({ ...f, contact_id: cont.id }));
                }
              }}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="col-span-2">
            <Label>Comprovantes e Documentos</Label>
            <div className="mt-2 rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Clique para selecionar ou arraste arquivos aqui (máx. 5 / 10MB)
              <Input type="file" multiple accept="image/*,application/pdf,.doc,.docx,.txt,.xls,.xlsx" className="mt-3" onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))} />
            </div>
            {files.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">Selecionados: {files.map(f => f.name).join(', ')}</div>
            )}
          </div>

          <div className="col-span-2">
            <Label>URL do Comprovante (opcional)</Label>
            <Input placeholder="https://exemplo.com/comprovante.pdf" value={form.receipt_url} onChange={(e) => setForm((f) => ({ ...f, receipt_url: e.target.value }))} />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving}>Criar Transação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewTransactionModal;

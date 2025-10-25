import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FacebookScheduleModal } from './FacebookScheduleModal';

export const FacebookModalTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Teste do Modal Facebook</h2>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsModalOpen(true)}>
            Testar Modal Facebook
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Pauta Facebook</DialogTitle>
          </DialogHeader>
          <FacebookScheduleModal 
            schedule={null}
            onClose={handleCloseModal}
          />
        </DialogContent>
      </Dialog>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Instruções de Teste:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Clique em "Testar Modal Facebook"</li>
          <li>Preencha o formulário com dados válidos</li>
          <li>Clique em "Criar Pauta"</li>
          <li>Verifique se aparece mensagem de sucesso</li>
          <li>Verifique se o modal fecha</li>
          <li>Verifique se a pauta aparece na lista</li>
        </ol>
      </div>
    </div>
  );
};

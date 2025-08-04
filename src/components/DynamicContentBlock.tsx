import { LiveVideo } from '@/components/LiveVideo';
import { PollWidget } from '@/components/PollWidget';
import { useBlocksConfig } from '@/hooks/useBlocksConfig';

export const DynamicContentBlock = () => {
  const { config, isLoading } = useBlocksConfig();

  if (isLoading) {
    return null; // Não renderizar nada enquanto carrega
  }

  // Se nenhum bloco está ativo, não renderizar nada
  if (!config.live_stream_block_enabled && !config.poll_block_enabled) {
    return null;
  }

  // Renderizar apenas o bloco que está ativo
  // Prioridade: Live Stream > Poll
  if (config.live_stream_block_enabled) {
    return <LiveVideo />;
  }

  if (config.poll_block_enabled) {
    return <PollWidget />;
  }

  return null;
};
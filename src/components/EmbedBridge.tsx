import { useEffect, useState } from 'react';
import { IntelligentEmbedModal } from './IntelligentEmbedModal';

export const EmbedBridge = () => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    embedUrl: string;
    embedCode?: string;
  }>({
    isOpen: false,
    embedUrl: '',
    embedCode: undefined
  });

  useEffect(() => {
    const handleEmbedClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const embedButton = target.closest('[data-embed-url]') as HTMLElement;
      
      if (!embedButton) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const embedUrl = embedButton.getAttribute('data-embed-url');
      const embedCode = embedButton.getAttribute('data-embed-code');
      
      if (embedUrl) {
        setModalState({
          isOpen: true,
          embedUrl,
          embedCode: embedCode || undefined
        });
      }
    };

    // Add event listener to document
    document.addEventListener('click', handleEmbedClick);

    return () => {
      document.removeEventListener('click', handleEmbedClick);
    };
  }, []);

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      embedUrl: '',
      embedCode: undefined
    });
  };

  return (
    <IntelligentEmbedModal
      isOpen={modalState.isOpen}
      onClose={handleCloseModal}
      embedUrl={modalState.embedUrl}
      embedCode={modalState.embedCode}
    />
  );
};
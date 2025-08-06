import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import InstagramVisualEditor from './InstagramVisualEditor';
import InstagramPostFinisher from './InstagramPostFinisher';

interface VisualData {
  title: string;
  backgroundImage: string | null;
  imageZoom: number;
  imagePosition: { x: number; y: number };
  textSize: number;
  textAlign: 'left' | 'center' | 'right';
  textPosition: { y: number };
  generatedImageUrl: string;
}

type FlowStep = 'visual-editor' | 'post-finisher';

export default function NewInstagramFlow() {
  const [currentStep, setCurrentStep] = useState<FlowStep>('visual-editor');
  const [visualData, setVisualData] = useState<VisualData | null>(null);

  const handleContinueToFinisher = (data: VisualData) => {
    setVisualData(data);
    setCurrentStep('post-finisher');
  };

  const handleBackToEditor = () => {
    // Manter os dados visuais quando voltar ao editor
    setCurrentStep('visual-editor');
  };

  const handleComplete = () => {
    // Reset the flow
    setCurrentStep('visual-editor');
    setVisualData(null);
  };

  return (
    <ProtectedRoute requiredRole="redator">
      {currentStep === 'visual-editor' && (
        <InstagramVisualEditor 
          onContinue={handleContinueToFinisher} 
          initialData={visualData} 
        />
      )}
      
      {currentStep === 'post-finisher' && visualData && (
        <InstagramPostFinisher 
          visualData={visualData}
          onBack={handleBackToEditor}
          onComplete={handleComplete}
        />
      )}
    </ProtectedRoute>
  );
}
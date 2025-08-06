import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import InstagramEditor from './InstagramEditor';
import InstagramFinalize from './InstagramFinalize';

export interface ImageState {
  file: File | null;
  url: string | null;
  zoom: number;
  positionX: number;
  positionY: number;
}

export interface TextState {
  title: string;
  fontSize: number;
  verticalPosition: number;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
  color: string;
}

export interface PostData {
  image: ImageState;
  text: TextState;
  canvasDataUrl: string | null;
}

type Step = 'editor' | 'finalize';

export default function InstagramPostGenerator() {
  const [currentStep, setCurrentStep] = useState<Step>('editor');
  const [postData, setPostData] = useState<PostData | null>(null);

  const handleContinue = (data: PostData) => {
    setPostData(data);
    setCurrentStep('finalize');
  };

  const handleBack = () => {
    setCurrentStep('editor');
  };

  const handleComplete = () => {
    setCurrentStep('editor');
    setPostData(null);
  };

  return (
    <ProtectedRoute requiredRole="redator">
      <div className="min-h-screen bg-background">
        {currentStep === 'editor' && (
          <InstagramEditor 
            onContinue={handleContinue}
            initialData={postData}
          />
        )}
        
        {currentStep === 'finalize' && postData && (
          <InstagramFinalize 
            postData={postData}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
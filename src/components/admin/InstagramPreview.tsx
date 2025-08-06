import { useState, useEffect, useRef } from 'react';
import { useInstagramMockup } from '@/hooks/useInstagramMockup';

interface InstagramPreviewProps {
  canvasDataUrl: string;
  caption?: string;
  isScheduled?: boolean;
  selectedDate?: Date;
  selectedTime?: string;
}

export default function InstagramPreview({ 
  canvasDataUrl, 
  caption, 
  isScheduled, 
  selectedDate, 
  selectedTime 
}: InstagramPreviewProps) {
  const { mockupUrl } = useInstagramMockup();
  const [mockupLoaded, setMockupLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const mockupRef = useRef<HTMLImageElement>(null);

  // Define the safe area (content window) for Instagram posts
  // These values represent the typical safe zone in Instagram mockups
  const SAFE_AREA = {
    topOffset: 15, // Percentage from top where content starts (below header)
    bottomOffset: 15, // Percentage from bottom where content ends (above controls)
    leftOffset: 0, // No side offset for Instagram posts
    rightOffset: 0, // No side offset for Instagram posts
  };

  useEffect(() => {
    if (mockupUrl) {
      const img = new Image();
      img.onload = () => setMockupLoaded(true);
      img.onerror = () => setMockupLoaded(false);
      img.src = mockupUrl;
    }
  }, [mockupUrl]);

  const calculateSafeArea = () => {
    if (!containerRef.current) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const width = containerRect.width;
    const height = containerRect.height;
    
    return {
      top: (height * SAFE_AREA.topOffset) / 100,
      bottom: height - (height * SAFE_AREA.bottomOffset) / 100,
      left: (width * SAFE_AREA.leftOffset) / 100,
      right: width - (width * SAFE_AREA.rightOffset) / 100,
      width: width - (width * (SAFE_AREA.leftOffset + SAFE_AREA.rightOffset)) / 100,
      height: height - (height * (SAFE_AREA.topOffset + SAFE_AREA.bottomOffset)) / 100,
    };
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Container for the preview */}
      <div 
        ref={containerRef}
        className="relative aspect-[9/16] bg-black rounded-[2.5rem] overflow-hidden shadow-2xl"
        style={{ maxHeight: '600px' }}
      >
        {/* Safe area guide (subtle overlay) */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div 
            className="absolute border border-green-400/30 bg-green-400/5"
            style={{
              top: `${SAFE_AREA.topOffset}%`,
              bottom: `${SAFE_AREA.bottomOffset}%`,
              left: `${SAFE_AREA.leftOffset}%`,
              right: `${SAFE_AREA.rightOffset}%`,
            }}
          />
        </div>

        {/* User's post image - positioned within safe area */}
        <div 
          className="absolute"
          style={{
            top: `${SAFE_AREA.topOffset}%`,
            bottom: `${SAFE_AREA.bottomOffset}%`,
            left: `${SAFE_AREA.leftOffset}%`,
            right: `${SAFE_AREA.rightOffset}%`,
          }}
        >
          {canvasDataUrl && (
            <img
              ref={imageRef}
              src={canvasDataUrl}
              alt="Instagram post content"
              className="w-full h-full object-contain"
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          )}
        </div>

        {/* Instagram mockup overlay - always on top */}
        {mockupUrl && (
          <img
            ref={mockupRef}
            src={mockupUrl}
            alt="Instagram mockup frame"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
            style={{
              imageRendering: 'crisp-edges',
              transform: 'translateZ(0)', // Force hardware acceleration
            }}
            onLoad={() => setMockupLoaded(true)}
            onError={() => setMockupLoaded(false)}
          />
        )}

        {/* Fallback Instagram UI when no mockup is available */}
        {!mockupUrl && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white flex items-center px-4 border-b">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span className="ml-3 font-semibold text-sm">portalchicosabetudo</span>
              <div className="ml-auto">
                <div className="w-6 h-6 flex items-center justify-center">
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full mx-1"></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t">
              <div className="flex items-center justify-between px-4 h-full">
                <div className="flex space-x-4">
                  <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                  <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                  <div className="w-6 h-6 border-2 border-black rounded-full"></div>
                </div>
                <div className="w-6 h-6 border-2 border-black rounded-sm"></div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {mockupUrl && !mockupLoaded && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-30">
            <div className="text-sm text-gray-500">Carregando mockup...</div>
          </div>
        )}
      </div>

      {/* Caption preview below the phone */}
      {caption && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm">
            <span className="font-semibold">portalchicosabetudo</span>{' '}
            {caption.length > 150 ? caption.substring(0, 150) + '...' : caption}
          </p>
          
          {isScheduled && selectedDate && (
            <p className="text-xs text-gray-500 mt-2">
              📅 Agendado para {selectedDate.toLocaleDateString()} às {selectedTime}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
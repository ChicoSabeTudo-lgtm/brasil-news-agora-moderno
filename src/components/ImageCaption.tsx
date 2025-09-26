import { Camera } from 'lucide-react';

interface ImageCaptionProps {
  caption: string;
}

export function ImageCaption({ caption }: ImageCaptionProps) {
  const parseCaption = (raw?: string) => {
    if (!raw) return { text: '' };
    const parts = raw.split('|');
    if (parts.length < 2) return { text: raw.trim() };
    const credit = parts.pop();
    const text = parts.join('|');
    return { text: text.trim(), credit: credit?.trim() };
  };

  const { text, credit } = parseCaption(caption);

  return (
    <div className="bg-white px-3 pt-1 border-t border-gray-200">
      <p 
        className="text-gray-700 leading-none m-0 p-0 flex items-center gap-2" 
        style={{ fontSize: '12px', lineHeight: '1' }}
      >
        <span className="italic">{text}</span>
        {credit && (
          <span className="text-gray-500 flex items-center gap-1 not-italic">
            |
            <Camera className="w-3 h-3" />
            <span>{credit}</span>
          </span>
        )}
      </p>
    </div>
  );
}

interface ImageCaptionProps {
  caption: string;
}

export function ImageCaption({ caption }: ImageCaptionProps) {
  return (
    <div className="bg-white px-3 py-2 border-t border-gray-200">
      <p 
        className="text-gray-700 leading-tight m-0" 
        style={{ fontSize: '11px' }}
      >
        {caption}
      </p>
    </div>
  );
}
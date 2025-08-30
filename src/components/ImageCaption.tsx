interface ImageCaptionProps {
  caption: string;
}

export function ImageCaption({ caption }: ImageCaptionProps) {
  return (
    <div className="bg-white px-3 py-1 border-t border-gray-200">
      <p 
        className="text-gray-700 leading-none m-0 p-0" 
        style={{ fontSize: '11px', lineHeight: '1.2' }}
      >
        {caption}
      </p>
    </div>
  );
}
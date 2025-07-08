import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// Lazy load ReactQuill to avoid SSR issues
let ReactQuill: any = null;

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const RichTextEditor = ({
  value,
  onChange,
  placeholder = "Digite o conteúdo...",
  className,
  readOnly = false
}: RichTextEditorProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    const loadQuill = async () => {
      if (typeof window !== 'undefined') {
        if (!ReactQuill) {
          const { default: RQ } = await import('react-quill');
          ReactQuill = RQ;
          
          // Import Quill CSS
          await import('react-quill/dist/quill.snow.css');
        }
        setIsLoaded(true);
      }
    };

    loadQuill();
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color', 'background',
    'align', 'code-block'
  ];

  if (!isLoaded || !ReactQuill) {
    return (
      <div className={cn(
        "min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "flex items-center justify-center text-muted-foreground",
        className
      )}>
        Carregando editor...
      </div>
    );
  }

  return (
    <div className={cn("rich-text-editor", className)}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
};
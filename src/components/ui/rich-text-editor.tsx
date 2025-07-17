import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  // Function to process pasted content and add proper spacing
  const processPastedContent = useCallback((html: string) => {
    // Remove extra whitespace and normalize line breaks
    let processed = html.replace(/\s+/g, ' ').trim();
    
    // Convert different paragraph separators to proper <p> tags
    processed = processed.replace(/\n\s*\n/g, '</p><p>');
    processed = processed.replace(/\r\n\s*\r\n/g, '</p><p>');
    
    // Ensure content starts and ends with <p> tags if it doesn't already
    if (!processed.startsWith('<p>')) {
      processed = '<p>' + processed;
    }
    if (!processed.endsWith('</p>')) {
      processed = processed + '</p>';
    }
    
    // Fix any double paragraph tags
    processed = processed.replace(/<\/p><p>/g, '</p>\n<p>');
    
    // Remove empty paragraphs
    processed = processed.replace(/<p>\s*<\/p>/g, '');
    
    return processed;
  }, []);

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

  // Set up paste handler when Quill is ready
  useEffect(() => {
    if (quillRef.current && isLoaded) {
      const quill = quillRef.current.getEditor();
      
      const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        
        const clipboardData = e.clipboardData;
        if (!clipboardData) return;
        
        // Get pasted content
        const pastedHTML = clipboardData.getData('text/html');
        const pastedText = clipboardData.getData('text/plain');
        
        let processedContent = '';
        
        if (pastedHTML) {
          processedContent = processPastedContent(pastedHTML);
        } else if (pastedText) {
          // Convert plain text to HTML with proper paragraph breaks
          const textLines = pastedText.split(/\n\s*\n/);
          processedContent = textLines
            .map(line => `<p>${line.replace(/\n/g, '<br>')}</p>`)
            .join('\n');
        }
        
        if (processedContent) {
          // Get current selection
          const selection = quill.getSelection();
          if (selection) {
            // Insert the processed content at cursor position
            quill.clipboard.dangerouslyPasteHTML(selection.index, processedContent);
          }
        }
      };
      
      // Add paste event listener
      const editor = quill.root;
      editor.addEventListener('paste', handlePaste);
      
      // Cleanup
      return () => {
        editor.removeEventListener('paste', handlePaste);
      };
    }
  }, [isLoaded, processPastedContent]);

  // Quill modules configuration - memoized to prevent unnecessary re-renders
  const modules = useMemo(() => ({
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
      matchers: [
        // Custom matcher to process pasted content
        ['*', function(node: any, delta: any) {
          return delta;
        }]
      ]
    }
  }), []);

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color', 'background',
    'align', 'code-block'
  ], []);

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
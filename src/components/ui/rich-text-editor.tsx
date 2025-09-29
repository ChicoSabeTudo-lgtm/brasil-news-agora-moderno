import { useState, useEffect, useRef, useMemo } from 'react';
// Import Quill Snow theme CSS to ensure proper toolbar/icon rendering
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';
import { EmbedModal } from './embed-modal';

// Lazy load ReactQuill to avoid SSR issues
let ReactQuill: any = null;
let QuillRef: any = null;

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
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [savedRange, setSavedRange] = useState<any>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    const loadQuill = async () => {
      if (typeof window !== 'undefined') {
        if (!ReactQuill) {
          const { default: RQ } = await import('react-quill');
          ReactQuill = RQ;
          
          // CSS do Quill removido do bundle para evitar pré-carregamento do chunk do editor
          // A estilização necessária já está coberta em `src/index.css` (classes .ql-*)
          
          // Registrar blot personalizado para embeds
          const Quill = RQ.Quill;
          QuillRef = Quill;
          const BlockEmbed = Quill.import('blots/block/embed');
          
          class VideoBlot extends BlockEmbed {
            static create(value: string) {
              const node = super.create();
              node.innerHTML = value;
              node.setAttribute('contenteditable', false);
              node.classList.add('embed-container');
              return node;
            }
            
            static value(node: HTMLElement) {
              return node.innerHTML;
            }
          }
          
          VideoBlot.blotName = 'video';
          VideoBlot.tagName = 'div';
          Quill.register(VideoBlot);
          
          // Adicionar ícone personalizado para o botão embed
          const icons = Quill.import('ui/icons');
          icons['embed-button'] = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';
        }
        setIsLoaded(true);
      }
    };

    loadQuill();
  }, []);

  // Função para inserir embed na posição do cursor
  const insertEmbed = (embedCode: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // Usar a posição salva ou o final do texto como fallback
      const index = savedRange ? savedRange.index : quill.getLength();
      
      // Inserir uma linha em branco antes e depois do embed
      quill.insertText(index, '\n');
      quill.insertEmbed(index + 1, 'video', embedCode);
      quill.insertText(index + 2, '\n');
      
      // Posicionar cursor após o embed
      quill.setSelection(index + 3);
      
      // Limpar a posição salva
      setSavedRange(null);
    }
  };

  // Quill modules configuration - with clipboard support for formatting and custom embed button
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'blockquote', 'code-block'],
        ['embed-button'], // Botão personalizado para embeds
        ['clean']
      ],
      handlers: {
        'embed-button': () => {
          // Salvar a posição atual do cursor antes de abrir o modal
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            setSavedRange(range);
          }
          setShowEmbedModal(true);
        }
      }
    },
    clipboard: {
      // Configurações de colagem: tente preservar aparência sem adicionar espaços extras
      matchVisual: true,
      // Matchers para limpar estilos indesejados e remover parágrafos vazios
      matchers: QuillRef ? [
        // Remover atributos/estilos de spans colados (mantém apenas o texto)
        ['span', (node: any, delta: any) => {
          const Delta = QuillRef.import('delta');
          const clean = new Delta();
          (delta.ops || []).forEach((op: any) => {
            clean.insert(op.insert); // descarta attributes vindos de SPAN
          });
          return clean;
        }],
        // Remover iframes colados (evita criar blots de vídeo automáticos)
        ['iframe', () => {
          const Delta = QuillRef.import('delta');
          return new Delta();
        }],
        // Remover scripts/estilos/noscript
        ['script', () => {
          const Delta = QuillRef.import('delta');
          return new Delta();
        }],
        ['style', () => {
          const Delta = QuillRef.import('delta');
          return new Delta();
        }],
        ['noscript', () => {
          const Delta = QuillRef.import('delta');
          return new Delta();
        }],
        // Remover blocos de compartilhamento/redes sociais comuns ao colar
        ['div', (node: HTMLElement, delta: any) => {
          const className = (node.getAttribute('class') || '').toLowerCase();
          const id = (node.getAttribute('id') || '').toLowerCase();
          const text = (node.textContent || '').trim().toLowerCase();
          const looksLikeShare = /share|social|compartilh|wp-block-embed|instagram|twitter|facebook|tiktok|player|youtube/.test(className + ' ' + id);
          const containsIframe = !!node.querySelector?.('iframe');
          const isShareHeading = ['compartilhar', 'compartilhe'].includes(text);
          if (looksLikeShare || containsIframe || isShareHeading) {
            const Delta = QuillRef.import('delta');
            return new Delta();
          }
          return delta;
        }],
        // Remover parágrafos completamente vazios
        ['p', (node: HTMLElement, delta: any) => {
          const html = node.innerHTML || '';
          const isEmpty = html
            .replace(/<br\s*\/?>/gi, '')
            .replace(/&nbsp;/gi, '')
            .replace(/\s+/g, '')
            .length === 0;
          if (isEmpty) {
            const Delta = QuillRef.import('delta');
            return new Delta();
          }
          return delta;
        }],
        // Normalizar elementos DIV como simples blocos sem estilos
        ['div', (node: any, delta: any) => {
          const Delta = QuillRef.import('delta');
          const clean = new Delta();
          (delta.ops || []).forEach((op: any) => {
            clean.insert(op.insert, op.attributes);
          });
          return clean;
        }],
        // Limpar classes/estilos genéricos de elementos (mantém links)
        ['font', (node: any, delta: any) => {
          const Delta = QuillRef.import('delta');
          const clean = new Delta();
          (delta.ops || []).forEach((op: any) => clean.insert(op.insert));
          return clean;
        }],
        ['section', (node: any, delta: any) => {
          const Delta = QuillRef.import('delta');
          const clean = new Delta();
          (delta.ops || []).forEach((op: any) => clean.insert(op.insert, op.attributes));
          return clean;
        }],
        ['article', (node: any, delta: any) => {
          const Delta = QuillRef.import('delta');
          const clean = new Delta();
          (delta.ops || []).forEach((op: any) => clean.insert(op.insert, op.attributes));
          return clean;
        }]
      ] : []
    },
    keyboard: {
      bindings: {
        // Enable Ctrl+V paste
        paste: {
          key: 'V',
          ctrlKey: true,
          handler: function(range: any, context: any) {
            return true; // Allow default paste behavior
          }
        }
      }
    }
  }), [isLoaded]);

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'color', 'background',
    'align', 'code-block', 'video'
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
      
      <EmbedModal
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        onInsert={insertEmbed}
      />
    </div>
  );
};

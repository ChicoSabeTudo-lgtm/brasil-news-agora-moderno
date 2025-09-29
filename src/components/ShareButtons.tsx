import { Facebook, MessageCircle, Printer, Twitter, Linkedin, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  description: string;
  url: string;
}

export const ShareButtons = ({ title, description, url }: ShareButtonsProps) => {
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedUrl = encodeURIComponent(url);

  // Build public Edge Function URL for crawlers (must be absolute)
  const functionsBase = "https://spgusjrjrhfychhdwixn.functions.supabase.co";

  const withUTM = (targetUrl: string, source: string) => {
    try {
      const u = new URL(targetUrl);
      u.searchParams.set('utm_source', source);
      u.searchParams.set('utm_medium', 'social');
      u.searchParams.set('utm_campaign', 'share');
      return u.toString();
    } catch {
      return targetUrl;
    }
  };

  const previewUrl = `${functionsBase}/share-preview?url=${encodeURIComponent(url)}`;
  const sharePreview = {
    facebook: withUTM(previewUrl, 'facebook'),
    twitter: withUTM(previewUrl, 'twitter'),
    // Para WhatsApp, priorizamos mostrar a URL canônica visível ao usuário
    whatsapp: withUTM(url, 'whatsapp'),
    linkedin: withUTM(previewUrl, 'linkedin'),
    telegram: withUTM(previewUrl, 'telegram'),
  };
  const encodedPreview = Object.fromEntries(
    Object.entries(sharePreview).map(([k, v]) => [k, encodeURIComponent(v)])
  ) as Record<string, string>;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedPreview.facebook}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedPreview.twitter}&via=chicosabetudo`,
    // WhatsApp usa o texto; aqui mostramos o link canônico (mais "bonito")
    whatsapp: `https://wa.me/?text=${encodedTitle}%0A${encodeURIComponent(sharePreview.whatsapp)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPreview.linkedin}`,
    telegram: `https://t.me/share/url?url=${encodedPreview.telegram}&text=${encodedTitle}`,
  };

  const handleShare = (platform: string) => {
    if (platform === 'print') {
      window.print();
      return;
    }

    const shareUrl = shareLinks[platform as keyof typeof shareLinks];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          // No compartilhamento nativo, use a URL canônica (melhor UX)
          url,
        });
      } catch (error) {
        // Se o compartilhamento nativo falhar, copia o link
        navigator.clipboard.writeText(url);
        alert('Link copiado para a área de transferência!');
      }
    } else {
      // Fallback: copia o link
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-1 shadow-sm hover:shadow transition"
        >
          <Share2 className="w-4 h-4" />
          <span>Compartilhar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleShare('facebook')} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')} className="cursor-pointer">
          <Twitter className="w-4 h-4 mr-2 text-black" />
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')} className="cursor-pointer">
          <Linkedin className="w-4 h-4 mr-2 text-[#0A66C2]" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('telegram')} className="cursor-pointer">
          <Send className="w-4 h-4 mr-2 text-[#0088cc]" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(url); }} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copiar link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('print')} className="cursor-pointer">
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
          <Share2 className="w-4 h-4 mr-2" />
          Mais opções
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

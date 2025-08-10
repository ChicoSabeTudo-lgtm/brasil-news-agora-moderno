import { Facebook, MessageCircle, Printer, Twitter } from "lucide-react";
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
  const previewUrl = `${functionsBase}/share-preview?url=${encodeURIComponent(url)}`;
  const encodedPreviewUrl = encodeURIComponent(previewUrl);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedPreviewUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedPreviewUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedPreviewUrl}`,
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
          className="flex items-center space-x-1"
        >
          <Share2 className="w-4 h-4" />
          <span>Compartilhar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="w-4 h-4 mr-2" />
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="w-4 h-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('print')}>
          <Printer className="w-4 h-4 mr-2" />
          Imprimir
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNativeShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Mais opções
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
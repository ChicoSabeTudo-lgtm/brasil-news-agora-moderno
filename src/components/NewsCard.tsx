import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface NewsCardProps {
  id?: string;
  title: string;
  metaDescription: string;
  imageUrl: string;
  category: string;
  author: string;
  publishedAt: string;
  isBreaking?: boolean;
  size?: "small" | "medium" | "large";
  slug?: string;
  categorySlug?: string;
  categoryColor?: string;
}

export const NewsCard = ({
  id,
  title,
  metaDescription,
  imageUrl,
  category,
  author,
  publishedAt,
  isBreaking = false,
  size = "medium",
  slug,
  categorySlug,
  categoryColor,
}: NewsCardProps) => {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "aspect-[16/9] h-48";
      case "large":
        return "aspect-[16/10] h-80";
      default:
        return "aspect-[16/9] h-56";
    }
  };

  // Gerar link no formato: /categoria/titulo-da-noticia
  const newsLink = slug && categorySlug ? `/${categorySlug}/${slug}` : (id ? `/noticia/${id}` : '#');

  const cardContent = (
    <>
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className={`w-full object-cover transition-transform duration-300 ${getSizeClasses()}`}
        />
        

        {/* Breaking News Badge */}
        {isBreaking && (
          <div className="absolute top-3 right-3">
            <span className="bg-news-breaking text-white px-2 py-1 text-xs font-bold uppercase tracking-wide animate-pulse">
              URGENTE
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="p-4">
        <h3 className={`font-bold text-foreground transition-colors line-clamp-2 mb-2 ${
          size === "large" ? "text-xl" : size === "small" ? "text-sm" : "text-base"
        }`}
        onMouseEnter={(e) => categoryColor && (e.currentTarget.style.color = categoryColor)}
        onMouseLeave={(e) => e.currentTarget.style.color = ''}>
          {title}
        </h3>
        
        <p className={`text-muted-foreground line-clamp-3 mb-3 ${
          size === "large" ? "text-base" : "text-sm"
        }`}>
          {metaDescription}
        </p>

        <div className="flex items-center text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{publishedAt}</span>
          </div>
        </div>
      </div>
    </>
  );

  if (newsLink !== '#') {
    return (
      <Link to={newsLink}>
        <Card className="group overflow-hidden hover:shadow-card hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up news-card-hover">
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-card hover:scale-105 transition-all duration-300 cursor-pointer animate-slide-up news-card-hover">
      {cardContent}
    </Card>
  );
};

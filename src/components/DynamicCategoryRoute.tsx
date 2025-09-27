import { useParams, Navigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { CategoryPage } from "@/components/CategoryPage";

const DynamicCategoryRoute = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  const category = categories.find(cat => cat.slug === categorySlug);

  if (!category) {
    return <Navigate to="/404" replace />;
  }

  return (
    <CategoryPage 
      category={category.name}
      categoryColor={category.color || "#0066cc"}
      description={category.description}
    />
  );
};

export default DynamicCategoryRoute;

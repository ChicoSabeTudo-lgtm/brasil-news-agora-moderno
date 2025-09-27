import { useParams, Navigate } from "react-router-dom";
import { useCategories } from "@/hooks/useCategories";
import { CategoryPage } from "@/components/CategoryPage";

const DynamicCategoryRoute = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { categories, loading } = useCategories();

  if (loading) {
    return <div>Carregando...</div>;
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
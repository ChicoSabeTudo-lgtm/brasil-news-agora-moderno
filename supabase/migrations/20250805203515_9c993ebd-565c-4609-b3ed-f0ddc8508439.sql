-- Limpar registros duplicados, mantendo apenas o mais recente
DELETE FROM site_configurations 
WHERE id NOT IN (
  SELECT id 
  FROM site_configurations 
  ORDER BY updated_at DESC 
  LIMIT 1
);
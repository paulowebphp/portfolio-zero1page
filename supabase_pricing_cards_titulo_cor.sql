-- =============================================================================
-- Título: cor branca (padrão) ou amarela
-- =============================================================================
-- Rode no SQL Editor do Supabase (Run without RLS se pedir).
-- =============================================================================

ALTER TABLE pricing_card_templates
  ADD COLUMN IF NOT EXISTS titulo_cor TEXT NOT NULL DEFAULT 'branco';

ALTER TABLE propostas_pricing_cards
  ADD COLUMN IF NOT EXISTS titulo_cor TEXT NOT NULL DEFAULT 'branco';

-- Restringe valores permitidos (ignora se a constraint já existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pricing_card_templates_titulo_cor_check'
  ) THEN
    ALTER TABLE pricing_card_templates
      ADD CONSTRAINT pricing_card_templates_titulo_cor_check
      CHECK (titulo_cor IN ('branco', 'amarelo'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'propostas_pricing_cards_titulo_cor_check'
  ) THEN
    ALTER TABLE propostas_pricing_cards
      ADD CONSTRAINT propostas_pricing_cards_titulo_cor_check
      CHECK (titulo_cor IN ('branco', 'amarelo'));
  END IF;
END $$;

-- Seed: Autoridade Digital PR usa título amarelo
UPDATE pricing_card_templates
SET titulo_cor = 'amarelo'
WHERE chave = 'authority';

UPDATE propostas_pricing_cards
SET titulo_cor = 'amarelo'
WHERE titulo ILIKE '%Autoridade%Digital PR%'
   OR titulo ILIKE '%Expansão de Autoridade%';

-- Verificação
SELECT 'templates' AS origem, chave, titulo, titulo_cor
FROM pricing_card_templates
ORDER BY ordem;

SELECT 'propostas' AS origem, proposta_slug, titulo, titulo_cor
FROM propostas_pricing_cards
ORDER BY proposta_slug, ordem;

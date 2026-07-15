-- =============================================================================
-- Fase 2 (opcional) — Backfill: copiar templates para propostas JÁ existentes
-- =============================================================================
-- Novas propostas já recebem os cards automaticamente pelo front (ProposalNew).
-- Rode isto no SQL Editor se quiser popular propostas antigas (ex: wcenter).
-- Só preenche propostas que ainda NÃO têm nenhum card.
-- =============================================================================

INSERT INTO propostas_pricing_cards (
  proposta_slug,
  template_id,
  sobretitulo,
  titulo,
  paragrafos,
  valor,
  sub_valor,
  is_highlight,
  titulo_cor,
  ordem,
  ativo
)
SELECT
  p.slug,
  t.id,
  t.sobretitulo,
  t.titulo,
  t.paragrafos,
  t.valor,
  t.sub_valor,
  t.is_highlight,
  COALESCE(t.titulo_cor, 'branco'),
  t.ordem,
  true
FROM propostas p
CROSS JOIN pricing_card_templates t
WHERE t.ativo = true
  AND NOT EXISTS (
    SELECT 1
    FROM propostas_pricing_cards c
    WHERE c.proposta_slug = p.slug
  );

-- Verificação: quantos cards por proposta
SELECT proposta_slug, COUNT(*) AS qtd_cards
FROM propostas_pricing_cards
GROUP BY proposta_slug
ORDER BY proposta_slug;

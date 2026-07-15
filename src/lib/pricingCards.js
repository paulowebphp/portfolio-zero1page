import { supabase } from './supabase';

/**
 * Copia os templates ativos de pricing_card_templates
 * para propostas_pricing_cards da proposta informada.
 * Idempotente: se a proposta já tem cards, não faz nada.
 */
export async function seedPricingCardsFromTemplates(propostaSlug) {
  if (!propostaSlug) throw new Error('propostaSlug é obrigatório');

  const { count, error: countError } = await supabase
    .from('propostas_pricing_cards')
    .select('*', { count: 'exact', head: true })
    .eq('proposta_slug', propostaSlug);

  if (countError) throw countError;
  if (count && count > 0) {
    return { seeded: false, reason: 'already_exists', count };
  }

  const { data: templates, error: templatesError } = await supabase
    .from('pricing_card_templates')
    .select('*')
    .eq('ativo', true)
    .order('ordem');

  if (templatesError) throw templatesError;
  if (!templates?.length) {
    return { seeded: false, reason: 'no_templates', count: 0 };
  }

  const rows = templates.map((t) => ({
    proposta_slug: propostaSlug,
    template_id: t.id,
    sobretitulo: t.sobretitulo,
    titulo: t.titulo,
    paragrafos: t.paragrafos ?? [],
    valor: t.valor,
    sub_valor: t.sub_valor,
    is_highlight: t.is_highlight ?? false,
    titulo_cor: t.titulo_cor || 'branco',
    ordem: t.ordem,
    ativo: true,
  }));

  const { error: insertError } = await supabase
    .from('propostas_pricing_cards')
    .insert(rows);

  if (insertError) throw insertError;

  return { seeded: true, count: rows.length };
}

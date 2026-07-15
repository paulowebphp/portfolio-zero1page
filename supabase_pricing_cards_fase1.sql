-- =============================================================================
-- Fase 1 — Cards de Investimento & Estratégia
-- =============================================================================
-- IMPORTANTE: rode o arquivo INTEIRO no SQL Editor do Supabase (não só o SELECT).
--
-- 1) pricing_card_templates  → padrões universais (seed = 6 cards atuais)
-- 2) propostas_pricing_cards → cópia editável por proposta (Fases 2–4)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Templates (padrões universais)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pricing_card_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave         TEXT UNIQUE,
  sobretitulo   TEXT,
  titulo        TEXT NOT NULL,
  paragrafos    TEXT[] NOT NULL DEFAULT '{}',
  valor         TEXT,
  sub_valor     TEXT,
  is_highlight  BOOLEAN NOT NULL DEFAULT false,
  titulo_cor    TEXT NOT NULL DEFAULT 'branco',
  ordem         INTEGER NOT NULL DEFAULT 1,
  ativo         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pricing_card_templates_ordem
  ON pricing_card_templates (ordem);

-- ---------------------------------------------------------------------------
-- 2. Cards por proposta
-- proposta_slug sem FK (mesmo padrão de propostas_cases / propostas_sections)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS propostas_pricing_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposta_slug   TEXT NOT NULL,
  template_id     UUID REFERENCES pricing_card_templates(id) ON DELETE SET NULL,
  sobretitulo     TEXT,
  titulo          TEXT NOT NULL,
  paragrafos      TEXT[] NOT NULL DEFAULT '{}',
  valor           TEXT,
  sub_valor       TEXT,
  is_highlight    BOOLEAN NOT NULL DEFAULT false,
  titulo_cor      TEXT NOT NULL DEFAULT 'branco',
  ordem           INTEGER NOT NULL DEFAULT 1,
  ativo           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_propostas_pricing_cards_slug
  ON propostas_pricing_cards (proposta_slug);

CREATE INDEX IF NOT EXISTS idx_propostas_pricing_cards_slug_ordem
  ON propostas_pricing_cards (proposta_slug, ordem);

-- ---------------------------------------------------------------------------
-- 3. Seed dos 6 cards padrões
-- ---------------------------------------------------------------------------
DELETE FROM pricing_card_templates;

INSERT INTO pricing_card_templates
  (chave, sobretitulo, titulo, paragrafos, valor, sub_valor, is_highlight, titulo_cor, ordem)
VALUES
  (
    'investment',
    NULL,
    'M.O.V.A - Máquina Orgânica de Vendas Automáticas',
    ARRAY[
      'Investimento inicial para desenvolvimento, setup e ativação de toda a estrutura estratégica.'
    ],
    'R$ 24K',
    'R$ 22K à vista',
    true,
    'branco',
    1
  ),
  (
    'implementation',
    'Cronograma de 4 meses',
    'Implementação & Crédito Inteligente',
    ARRAY[
      'Desenvolvimento e implementação completa da estrutura estratégica. O valor investido nessa etapa pode ser convertido em crédito para o modelo de aluguel, caso não seja totalmente utilizado, garantindo que o investimento inicial seja direcionado integralmente para evolução operacional e crescimento sustentável.'
    ],
    NULL,
    NULL,
    false,
    'branco',
    2
  ),
  (
    'rental',
    'Foco em ROI',
    'Modelo de Aluguel por Performance',
    ARRAY[
      'Modelo de investimento ajustado ao desempenho real da operação. A fórmula (Ticket Médio x Leads Fechados) / 6 permite que o custo acompanhe o crescimento do faturamento, mantendo previsibilidade financeira e alinhamento entre tecnologia e resultado.'
    ],
    'R$ 2K a 15K /mês',
    NULL,
    false,
    'branco',
    3
  ),
  (
    'authority',
    '4º ao 6º mês',
    'Expansão de Autoridade (Digital PR)',
    ARRAY[
      'Estratégia estruturada de Digital PR para ampliação de backlinks relevantes e fortalecimento de autoridade digital com garantia de 60 backlinks por inserção via disparo nacional para mailings específicos:',
      'O Globo • Valor Econômico • Folhapress • IG • Terra • Agência o Globo • Mundo do Marketing • Rede de Blogs e Sites • Mailing de Jornalistas'
    ],
    NULL,
    NULL,
    false,
    'amarelo',
    4
  ),
  (
    'paid-traffic',
    NULL,
    'Tráfego Pago',
    ARRAY[
      'Gestão estratégica de anúncios em Meta Ads e Google Ads para acelerar a captação de leads e potencializar o alcance imediato da operação. Investimento de R$ 2.500 para orçamentos de até R$ 15.000 — para valores superiores, taxa de gerenciamento de 20% sobre o investimento total.'
    ],
    'R$ 2.500 /mês',
    NULL,
    true,
    'branco',
    5
  ),
  (
    'automation-sdr',
    NULL,
    'Automação para atendimento',
    ARRAY[
      'SDR suporte para CRM — automação inteligente para triagem, qualificação e suporte direto no seu fluxo de atendimento e gestão de clientes.'
    ],
    'R$ 2.500 (Setup)',
    '+ R$ 1.000 /mês',
    true,
    'branco',
    6
  );

-- ---------------------------------------------------------------------------
-- Verificação (deve retornar 6 linhas)
-- ---------------------------------------------------------------------------
SELECT chave, titulo, ordem
FROM pricing_card_templates
ORDER BY ordem;

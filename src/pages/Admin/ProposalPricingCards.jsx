import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { seedPricingCardsFromTemplates } from '../../lib/pricingCards';
import {
  Loader2, CheckCircle, AlertCircle, ChevronUp, ChevronDown,
  Save, Plus, Trash2, GripVertical, Eye, EyeOff, Layers,
} from 'lucide-react';

const emptyCard = (ordem = 1) => ({
  _tempId: `new_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  id: null,
  template_id: null,
  sobretitulo: '',
  titulo: 'Novo Card',
  paragrafos: [''],
  valor: '',
  sub_valor: '',
  is_highlight: false,
  titulo_cor: 'branco',
  ordem,
  ativo: true,
});

const cardKey = (c) => c.id || c._tempId;

const ProposalPricingCards = () => {
  const { slug } = useParams();
  const [cards, setCards] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [dirty, setDirty] = useState(false);
  const dragId = useRef(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('propostas_pricing_cards')
        .select('*')
        .eq('proposta_slug', slug)
        .order('ordem');

      if (error) throw error;

      if (!data?.length) {
        await seedPricingCardsFromTemplates(slug);
        const res = await supabase
          .from('propostas_pricing_cards')
          .select('*')
          .eq('proposta_slug', slug)
          .order('ordem');
        data = res.data || [];
      }

      setCards((data || []).map((c) => ({
        ...c,
        paragrafos: Array.isArray(c.paragrafos) && c.paragrafos.length ? c.paragrafos : [''],
        sobretitulo: c.sobretitulo || '',
        valor: c.valor || '',
        sub_valor: c.sub_valor || '',
        titulo_cor: c.titulo_cor === 'amarelo' ? 'amarelo' : 'branco',
      })));
      setDirty(false);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const markDirty = () => setDirty(true);

  const updateCard = (key, patch) => {
    setCards((prev) => prev.map((c) => (cardKey(c) === key ? { ...c, ...patch } : c)));
    markDirty();
  };

  const updateParagrafo = (key, idx, value) => {
    setCards((prev) => prev.map((c) => {
      if (cardKey(c) !== key) return c;
      const paragrafos = [...(c.paragrafos || [''])];
      paragrafos[idx] = value;
      return { ...c, paragrafos };
    }));
    markDirty();
  };

  const addParagrafo = (key) => {
    setCards((prev) => prev.map((c) => {
      if (cardKey(c) !== key) return c;
      return { ...c, paragrafos: [...(c.paragrafos || []), ''] };
    }));
    markDirty();
  };

  const removeParagrafo = (key, idx) => {
    setCards((prev) => prev.map((c) => {
      if (cardKey(c) !== key) return c;
      const paragrafos = (c.paragrafos || []).filter((_, i) => i !== idx);
      return { ...c, paragrafos: paragrafos.length ? paragrafos : [''] };
    }));
    markDirty();
  };

  const addCard = () => {
    const maxOrdem = Math.max(0, ...cards.map((c) => c.ordem || 0));
    const novo = emptyCard(maxOrdem + 1);
    setCards((prev) => [...prev, novo]);
    setExpanded((prev) => ({ ...prev, [novo._tempId]: true }));
    markDirty();
  };

  const removeCard = (key) => {
    if (!window.confirm('Remover este card da proposta?')) return;
    setCards((prev) => prev
      .filter((c) => cardKey(c) !== key)
      .map((c, i) => ({ ...c, ordem: i + 1 }))
    );
    markDirty();
  };

  const move = (key, dir) => {
    setCards((prev) => {
      const sorted = [...prev].sort((a, b) => a.ordem - b.ordem);
      const idx = sorted.findIndex((c) => cardKey(c) === key);
      const swapIdx = idx + dir;
      if (idx < 0 || swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const next = [...sorted];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((c, i) => ({ ...c, ordem: i + 1 }));
    });
    markDirty();
  };

  const handleDragStart = (e, key) => {
    dragId.current = key;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, targetKey) => {
    e.preventDefault();
    const fromKey = dragId.current;
    if (!fromKey || fromKey === targetKey) return;
    setCards((prev) => {
      const sorted = [...prev].sort((a, b) => a.ordem - b.ordem);
      const fromIdx = sorted.findIndex((c) => cardKey(c) === fromKey);
      const toIdx = sorted.findIndex((c) => cardKey(c) === targetKey);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...sorted];
      const [pulled] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, pulled);
      return next.map((c, i) => ({ ...c, ordem: i + 1 }));
    });
    dragId.current = null;
    markDirty();
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await supabase.from('propostas_pricing_cards').delete().eq('proposta_slug', slug);

      const payload = cards
        .sort((a, b) => a.ordem - b.ordem)
        .map((c, i) => ({
          proposta_slug: slug,
          template_id: c.template_id || null,
          sobretitulo: c.sobretitulo?.trim() || null,
          titulo: (c.titulo || 'Sem título').trim(),
          paragrafos: (c.paragrafos || [])
            .map((p) => String(p).trim())
            .filter(Boolean),
          valor: c.valor?.trim() || null,
          sub_valor: c.sub_valor?.trim() || null,
          is_highlight: !!c.is_highlight,
          titulo_cor: c.titulo_cor === 'amarelo' ? 'amarelo' : 'branco',
          ordem: i + 1,
          ativo: c.ativo !== false,
        }));

      if (payload.length) {
        const { error } = await supabase.from('propostas_pricing_cards').insert(payload);
        if (error) throw error;
      }

      setStatus('success');
      setDirty(false);
      setTimeout(() => setStatus(null), 3000);
      await fetchCards();
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center p-20">
        <Loader2 className="animate-spin text-accent" size={40} />
      </div>
    );
  }

  const sorted = [...cards].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="admin-page" style={{ padding: 0 }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1>Cards de <span>Investimento</span></h1>
          <p>Edite títulos, textos e valores desta proposta. Arraste para reordenar.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {dirty && <span style={{ fontSize: '0.8rem', color: '#f59e0b' }}>Alterações não salvas</span>}
          {status === 'success' && (
            <span className="status-msg success" style={{ margin: 0, padding: '6px 12px' }}>
              <CheckCircle size={16} /> Salvo!
            </span>
          )}
          {status === 'error' && (
            <span className="status-msg error" style={{ margin: 0, padding: '6px 12px' }}>
              <AlertCircle size={16} /> Erro ao salvar
            </span>
          )}
          <button type="button" className="btn-cancel" onClick={addCard}>
            <Plus size={16} /> Novo Card
          </button>
          <button type="button" className="btn-save" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Salvando...' : 'Salvar Cards'}</span>
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.length === 0 && (
          <div className="admin-form shadow-premium" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <Layers size={32} style={{ opacity: 0.4, marginBottom: '12px' }} />
            <p>Nenhum card. Clique em &quot;Novo Card&quot; ou salve após recarregar os padrões.</p>
          </div>
        )}

        {sorted.map((card, idx) => {
          const key = cardKey(card);
          const isExp = !!expanded[key];

          return (
            <div
              key={key}
              className="admin-form shadow-premium"
              style={{
                padding: 0,
                overflow: 'hidden',
                opacity: card.ativo ? 1 : 0.55,
                borderColor: isExp ? 'var(--accent-color)' : undefined,
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, key)}
            >
              {/* Header row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 16px',
                  cursor: 'grab',
                  borderBottom: isExp ? '1px solid var(--glass-border)' : 'none',
                  background: isExp ? 'rgba(0,112,243,0.06)' : 'transparent',
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                onClick={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
              >
                <GripVertical size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '24px' }}>
                  #{idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {card.titulo || 'Sem título'}
                  </div>
                  {card.sobretitulo && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {card.sobretitulo}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <button type="button" className="btn-icon" onClick={() => move(key, -1)} disabled={idx === 0} title="Subir">
                    <ChevronUp size={15} />
                  </button>
                  <button type="button" className="btn-icon" onClick={() => move(key, 1)} disabled={idx === sorted.length - 1} title="Descer">
                    <ChevronDown size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-icon"
                    title={card.ativo ? 'Ocultar no site' : 'Exibir no site'}
                    onClick={() => updateCard(key, { ativo: !card.ativo })}
                  >
                    {card.ativo ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button type="button" className="btn-icon delete" title="Remover" onClick={() => removeCard(key)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Editor */}
              {isExp && (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }} onClick={(e) => e.stopPropagation()}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Sobretítulo <span className="text-muted">(opcional)</span></label>
                    <input
                      value={card.sobretitulo}
                      placeholder="Ex: Foco em ROI"
                      onChange={(e) => updateCard(key, { sobretitulo: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'end' }}>
                    <div className="form-group" style={{ margin: 0, flex: '1 1 220px', minWidth: 0 }}>
                      <label>Título</label>
                      <input
                        value={card.titulo}
                        placeholder="Título do card"
                        onChange={(e) => updateCard(key, { titulo: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0, flex: '0 0 150px' }}>
                      <label style={{ fontSize: '0.78rem' }}>Cor do título</label>
                      <select
                        value={card.titulo_cor === 'amarelo' ? 'amarelo' : 'branco'}
                        onChange={(e) => updateCard(key, { titulo_cor: e.target.value })}
                        style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                      >
                        <option value="branco">Branco</option>
                        <option value="amarelo">Amarelo</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Parágrafos de texto</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(card.paragrafos || ['']).map((p, pi) => (
                        <div key={pi} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <textarea
                            value={p}
                            rows={3}
                            placeholder={`Parágrafo ${pi + 1}`}
                            onChange={(e) => updateParagrafo(key, pi, e.target.value)}
                            style={{ flex: 1, resize: 'vertical' }}
                          />
                          <button
                            type="button"
                            className="btn-icon delete"
                            title="Remover parágrafo"
                            onClick={() => removeParagrafo(key, pi)}
                            disabled={(card.paragrafos || []).length <= 1}
                            style={{ marginTop: '8px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="btn-cancel" style={{ alignSelf: 'flex-start' }} onClick={() => addParagrafo(key)}>
                        <Plus size={14} /> Adicionar parágrafo
                      </button>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Valor principal <span className="text-muted">(opcional)</span></label>
                      <input
                        value={card.valor}
                        placeholder="Ex: R$ 2.500 /mês"
                        onChange={(e) => updateCard(key, { valor: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Sub-valor <span className="text-muted">(verde, opcional)</span></label>
                      <input
                        value={card.sub_valor}
                        placeholder="Ex: + R$ 1.000 /mês"
                        onChange={(e) => updateCard(key, { sub_valor: e.target.value })}
                      />
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={!!card.is_highlight}
                      onChange={(e) => updateCard(key, { is_highlight: e.target.checked })}
                    />
                    Destacar visualmente (highlight)
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProposalPricingCards;

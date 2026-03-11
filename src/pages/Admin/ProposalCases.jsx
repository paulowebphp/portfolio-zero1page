import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Loader2, CheckCircle, AlertCircle, GripVertical,
  ChevronUp, ChevronDown, RotateCcw, Save
} from 'lucide-react';

const TIPO_LABELS = { project: 'Case', conceptual: 'Demonstrativo', fullstack: 'Full Stack' };
const TIPO_COLORS = {
  project:    { bg: 'rgba(0,200,83,0.1)',      color: '#00c853' },
  conceptual: { bg: 'rgba(0,112,243,0.1)',     color: 'var(--accent-color)' },
  fullstack:  { bg: 'rgba(130,80,255,0.15)',   color: '#a78bfa' },
};

const ProposalCases = () => {
  const { slug } = useParams();
  const [allCases, setAllCases]     = useState([]);   // biblioteca global
  const [propCases, setPropCases]   = useState([]);   // seleção desta proposta
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [status, setStatus]         = useState(null); // 'success' | 'error'
  const [dirty, setDirty]           = useState(false);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Busca biblioteca global de cases ativos
      const { data: casesData, error: e1 } = await supabase
        .from('cases')
        .select('id, slug, tipo, title, ativo')
        .eq('ativo', true)
        .order('tipo').order('ordem');
      if (e1) throw e1;

      // Busca seleção desta proposta
      const { data: propData, error: e2 } = await supabase
        .from('propostas_cases')
        .select('*, cases(id, slug, tipo, title)')
        .eq('proposta_slug', slug)
        .order('ordem');
      if (e2) throw e2;

      setAllCases(casesData || []);

      if (propData?.length) {
        // Já tem configuração salva — usa ela
        setPropCases(propData.map(pc => ({
          id: pc.id,
          case_id: pc.case_id,
          tipo: pc.cases?.tipo,
          title: pc.cases?.title,
          slug: pc.cases?.slug,
          ativo: pc.ativo,
          ordem: pc.ordem,
          isNew: false,
        })));
      } else {
        // Primeira vez — pré-popula com todos os cases ativos, todos ativados
        setPropCases((casesData || []).map((c, i) => ({
          id: null,
          case_id: c.id,
          tipo: c.tipo,
          title: c.title,
          slug: c.slug,
          ativo: true,
          ordem: i + 1,
          isNew: true,
        })));
        setDirty(true); // já começa "sujo" para forçar salvar
      }
    } catch (err) {
      console.error('Erro ao carregar cases da proposta:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── toggle ativo ── */
  const toggleAtivo = (idx) => {
    setPropCases(prev => prev.map((pc, i) => i === idx ? { ...pc, ativo: !pc.ativo } : pc));
    setDirty(true);
  };

  /* ── reordenar ── */
  const move = (idx, dir) => {
    setPropCases(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr.map((pc, i) => ({ ...pc, ordem: i + 1 }));
    });
    setDirty(true);
  };

  /* ── adicionar case da biblioteca ── */
  const addCase = (c) => {
    if (propCases.find(pc => pc.case_id === c.id)) return; // já está
    setPropCases(prev => [...prev, {
      id: null, case_id: c.id, tipo: c.tipo, title: c.title,
      slug: c.slug, ativo: true, ordem: prev.length + 1, isNew: true,
    }]);
    setDirty(true);
  };

  /* ── remover ── */
  const removeCase = (idx) => {
    setPropCases(prev => prev.filter((_, i) => i !== idx).map((pc, i) => ({ ...pc, ordem: i + 1 })));
    setDirty(true);
  };

  /* ── salvar ── */
  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      // Deleta tudo desta proposta e re-insere (simples e seguro)
      await supabase.from('propostas_cases').delete().eq('proposta_slug', slug);

      const payload = propCases.map((pc, i) => ({
        proposta_slug: slug,
        case_id: pc.case_id,
        ativo: pc.ativo,
        ordem: i + 1,
      }));

      if (payload.length) {
        const { error } = await supabase.from('propostas_cases').insert(payload);
        if (error) throw error;
      }

      setStatus('success');
      setDirty(false);
      await fetchData();
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar cases da proposta:', err);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  /* ── cases da biblioteca que ainda não estão na proposta ── */
  const casesDisponiveis = allCases.filter(c => !propCases.find(pc => pc.case_id === c.id));

  if (loading) {
    return (
      <div className="flex-center p-12">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* Header com ação de salvar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            Cases desta Proposta
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Ative/desative e reordene quais cases aparecem nesta proposta.
            {dirty && <span style={{ color: '#f59e0b', marginLeft: '8px' }}>● Alterações não salvas</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-cancel" onClick={fetchData} title="Descartar alterações" disabled={saving}>
            <RotateCcw size={16} />
          </button>
          <button className="btn-save" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{saving ? 'Salvando...' : 'Salvar Ordem'}</span>
          </button>
        </div>
      </div>

      {status === 'success' && (
        <div className="status-msg success" style={{ marginBottom: '16px' }}>
          <CheckCircle size={18} /><span>Configuração salva com sucesso!</span>
        </div>
      )}
      {status === 'error' && (
        <div className="status-msg error" style={{ marginBottom: '16px' }}>
          <AlertCircle size={18} /><span>Erro ao salvar. Tente novamente.</span>
        </div>
      )}

      {/* Lista de cases desta proposta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        {propCases.length === 0 && (
          <div className="admin-form" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Nenhum case selecionado. Adicione da biblioteca abaixo.
          </div>
        )}
        {propCases.map((pc, idx) => {
          const tc = TIPO_COLORS[pc.tipo] || TIPO_COLORS.project;
          return (
            <div key={pc.case_id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px',
              background: pc.ativo ? 'var(--card-bg)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${pc.ativo ? 'var(--glass-border)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: '10px',
              opacity: pc.ativo ? 1 : 0.5,
              transition: 'all 0.2s ease',
            }}>
              {/* Drag handle / ordem */}
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'monospace', minWidth: '20px', textAlign: 'center' }}>
                {idx + 1}
              </span>
              <GripVertical size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />

              {/* Tipo badge */}
              <span className="badge-user" style={{ background: tc.bg, color: tc.color, flexShrink: 0, fontSize: '0.75rem' }}>
                {TIPO_LABELS[pc.tipo]}
              </span>

              {/* Título */}
              <span style={{ flex: 1, fontSize: '0.9rem', color: pc.ativo ? '#fff' : 'var(--text-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pc.title}
              </span>

              {/* Controles */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button className="btn-icon" onClick={() => move(idx, -1)} disabled={idx === 0} title="Mover para cima">
                  <ChevronUp size={15} />
                </button>
                <button className="btn-icon" onClick={() => move(idx, 1)} disabled={idx === propCases.length - 1} title="Mover para baixo">
                  <ChevronDown size={15} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => toggleAtivo(idx)}
                  title={pc.ativo ? 'Ocultar nesta proposta' : 'Exibir nesta proposta'}
                  style={{ minWidth: '36px', fontSize: '0.95rem' }}>
                  {pc.ativo ? '✅' : '⬜'}
                </button>
                <button className="btn-icon delete" onClick={() => removeCase(idx)} title="Remover da proposta">
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Biblioteca de cases disponíveis */}
      {casesDisponiveis.length > 0 && (
        <div>
          <h3 className="section-title" style={{ marginBottom: '14px', fontSize: '0.9rem' }}>
            + Adicionar da biblioteca ({casesDisponiveis.length} disponíveis)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {casesDisponiveis.map(c => {
              const tc = TIPO_COLORS[c.tipo] || TIPO_COLORS.project;
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed var(--glass-border)',
                  borderRadius: '8px',
                }}>
                  <span className="badge-user" style={{ background: tc.bg, color: tc.color, fontSize: '0.72rem', flexShrink: 0 }}>
                    {TIPO_LABELS[c.tipo]}
                  </span>
                  <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-secondary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.title}
                  </span>
                  <button className="btn-cancel" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => addCase(c)}>
                    + Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalCases;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Loader2, CheckCircle, AlertCircle, ChevronUp, ChevronDown,
  RotateCcw, Save, Database, Layout, Zap, Globe, Users,
  Eye, EyeOff, Plus, Trash2, GripVertical,
} from 'lucide-react';

/* ─── Configuração das seções ─── */
const SECTIONS = [
  { tipo: 'project',     label: 'Cases de Sucesso', icon: Database, color: '#00c853' },
  { tipo: 'conceptual',  label: 'Conceituais',       icon: Layout,   color: '#0070f3' },
  { tipo: 'fullstack',   label: 'Full Stack',        icon: Zap,      color: '#a78bfa' },
  { tipo: 'traffic',     label: 'Tráfego Pago',      icon: Globe,    color: '#f59e0b' },
  { tipo: 'automation',  label: 'Automação',         icon: Zap,      color: '#06b6d4' },
  { tipo: 'depoimentos', label: 'Depoimentos',       icon: Users,    color: '#f472b6' },
];

const ProposalCases = () => {
  const { slug } = useParams();

  const [allCases,      setAllCases]      = useState([]); // biblioteca global
  const [propCases,     setPropCases]     = useState([]); // seleção desta proposta
  const [sectionConfig, setSectionConfig] = useState({}); // { tipo: ativo }
  const [activeTab,     setActiveTab]     = useState('project');
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [status,        setStatus]        = useState(null);
  const [dirty,         setDirty]         = useState(false);
  const dragId = useRef(null); // case_id sendo arrastado

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Biblioteca global
      const { data: casesData } = await supabase
        .from('cases').select('id, slug, tipo, title, ativo')
        .eq('ativo', true).order('tipo').order('ordem');

      // Seleção desta proposta
      const { data: propData } = await supabase
        .from('propostas_cases')
        .select('*, cases(id, slug, tipo, title)')
        .eq('proposta_slug', slug).order('ordem');

      // Config de seções
      const { data: secData } = await supabase
        .from('propostas_sections')
        .select('tipo, ativo')
        .eq('proposta_slug', slug);

      setAllCases(casesData || []);

      if (propData?.length) {
        setPropCases(propData.map(pc => ({
          id: pc.id,
          case_id: pc.case_id,
          tipo: pc.cases?.tipo,
          title: pc.cases?.title,
          slug: pc.cases?.slug,
          ativo: pc.ativo,
          ordem: pc.ordem,
        })));
      } else {
        // Primeira vez — pré-popula com todos da biblioteca
        setPropCases((casesData || []).map((c, i) => ({
          id: null, case_id: c.id, tipo: c.tipo,
          title: c.title, slug: c.slug, ativo: true, ordem: i + 1,
        })));
        setDirty(true);
      }

      // Monta config de seções (default: todas ativas)
      const config = {};
      SECTIONS.forEach(s => { config[s.tipo] = true; });
      (secData || []).forEach(r => { config[r.tipo] = r.ativo; });
      setSectionConfig(config);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Tab items (apenas do tipo ativo) ── */
  const tabItems = propCases
    .filter(pc => pc.tipo === activeTab)
    .sort((a, b) => a.ordem - b.ordem);

  const availableForTab = allCases.filter(c =>
    c.tipo === activeTab && !propCases.find(pc => pc.case_id === c.id)
  );

  /* ── Toggle item ativo ── */
  const toggleItemAtivo = (caseId) => {
    setPropCases(prev => prev.map(pc =>
      pc.case_id === caseId ? { ...pc, ativo: !pc.ativo } : pc
    ));
    setDirty(true);
  };

  /* ── Toggle seção inteira ── */
  const toggleSection = (tipo) => {
    setSectionConfig(prev => ({ ...prev, [tipo]: !prev[tipo] }));
    setDirty(true);
  };

  /* ── Reordenar DENTRO da seção ── */
  const move = (caseId, dir) => {
    setPropCases(prev => {
      const sorted = prev.filter(x => x.tipo === activeTab).sort((a,b) => a.ordem - b.ordem);
      const idx = sorted.findIndex(x => x.case_id === caseId);
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev;
      const a = sorted[idx];
      const b = sorted[swapIdx];
      return prev.map(x => {
        if (x.case_id === a.case_id) return { ...x, ordem: b.ordem };
        if (x.case_id === b.case_id) return { ...x, ordem: a.ordem };
        return x;
      });
    });
    setDirty(true);
  };

  /* ── Drag and Drop (intra-seção) ── */
  const handleDragStart = (e, caseId) => {
    dragId.current = caseId;
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e, targetCaseId) => {
    e.preventDefault();
    const fromId = dragId.current;
    if (!fromId || fromId === targetCaseId) return;
    setPropCases(prev => {
      const sorted = prev.filter(x => x.tipo === activeTab).sort((a,b) => a.ordem - b.ordem);
      const fromIdx = sorted.findIndex(x => x.case_id === fromId);
      const toIdx   = sorted.findIndex(x => x.case_id === targetCaseId);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const reordered = [...sorted];
      const [pulled] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, pulled);
      // Reatribui ordens sequenciais mantenendo outros tipos intocados
      const others = prev.filter(x => x.tipo !== activeTab);
      return [...others, ...reordered.map((x, i) => ({ ...x, ordem: i + 1 }))];
    });
    dragId.current = null;
    setDirty(true);
  };

  /* ── Adicionar da biblioteca ── */
  const addCase = (c) => {
    const maxOrdem = Math.max(0, ...propCases.filter(x => x.tipo === c.tipo).map(x => x.ordem));
    setPropCases(prev => [...prev, {
      id: null, case_id: c.id, tipo: c.tipo,
      title: c.title, slug: c.slug, ativo: true, ordem: maxOrdem + 1,
    }]);
    setDirty(true);
  };

  /* ── Remover ── */
  const removeCase = (caseId) => {
    setPropCases(prev => prev.filter(x => x.case_id !== caseId));
    setDirty(true);
  };

  /* ── Salvar ── */
  const handleSave = async () => {
    setSaving(true); setStatus(null);
    try {
      // Salva cases
      await supabase.from('propostas_cases').delete().eq('proposta_slug', slug);
      if (propCases.length) {
        const { error } = await supabase.from('propostas_cases').insert(
          propCases.map(pc => ({
            proposta_slug: slug, case_id: pc.case_id, ativo: pc.ativo, ordem: pc.ordem,
          }))
        );
        if (error) throw error;
      }

      // Salva config de seções
      await supabase.from('propostas_sections').delete().eq('proposta_slug', slug);
      const secPayload = SECTIONS.map(s => ({
        proposta_slug: slug, tipo: s.tipo, ativo: sectionConfig[s.tipo] !== false,
      }));
      await supabase.from('propostas_sections').insert(secPayload);

      setStatus('success'); setDirty(false);
      setTimeout(() => setStatus(null), 3000);
      await fetchData();
    } catch (err) {
      console.error(err); setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex-center p-12"><Loader2 className="animate-spin text-accent" size={32} /></div>
  );

  const activeSection = SECTIONS.find(s => s.tipo === activeTab);
  const activeColor   = activeSection?.color || '#0070f3';
  const sectionIsOn   = sectionConfig[activeTab] !== false;

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <div>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'#fff', marginBottom:'4px' }}>Cases desta Proposta</h2>
          <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>
            Ative/desative seções e itens, reordene dentro de cada seção.
            {dirty && <span style={{ color:'#f59e0b', marginLeft:'8px' }}>● Não salvo</span>}
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn-cancel" onClick={fetchData} disabled={saving} title="Descartar"><RotateCcw size={16}/></button>
          <button className="btn-save" onClick={handleSave} disabled={saving || !dirty}>
            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
            <span>{saving ? 'Salvando...' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {status === 'success' && <div className="status-msg success" style={{ marginBottom:'16px' }}><CheckCircle size={18}/><span>Salvo!</span></div>}
      {status === 'error'   && <div className="status-msg error"   style={{ marginBottom:'16px' }}><AlertCircle size={18}/><span>Erro ao salvar.</span></div>}

      {/* Tabs por seção */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {SECTIONS.map(s => {
          const Icon    = s.icon;
          const isActive = activeTab === s.tipo;
          const isOn     = sectionConfig[s.tipo] !== false;
          const count    = propCases.filter(pc => pc.tipo === s.tipo).length;
          return (
            <button key={s.tipo} onClick={() => setActiveTab(s.tipo)} style={{
              display:'flex', alignItems:'center', gap:'7px',
              padding:'9px 16px',
              background: isActive ? `${s.color}18` : 'rgba(255,255,255,0.04)',
              border:`1px solid ${isActive ? s.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius:'10px',
              color: isActive ? s.color : isOn ? 'var(--text-secondary)' : 'rgba(255,255,255,0.25)',
              fontWeight: isActive ? 700 : 500, fontSize:'0.85rem',
              cursor:'pointer', transition:'all 0.2s ease',
              textDecoration: !isOn ? 'line-through' : 'none',
            }}>
              <Icon size={14}/>
              {s.label}
              <span style={{ background: isActive ? s.color : 'rgba(255,255,255,0.08)', color: isActive ? '#000' : 'var(--text-secondary)', borderRadius:'20px', padding:'1px 7px', fontSize:'0.7rem', fontWeight:700 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Painel da aba ativa */}
      <div className="admin-form shadow-premium" style={{ padding:0, overflow:'hidden' }}>

        {/* Aba header com toggle de seção */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid var(--glass-border)', background:`linear-gradient(135deg, ${activeColor}08, transparent)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {activeSection && <activeSection.icon size={18} style={{ color: activeColor }}/>}
            <div>
              <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#fff', margin:0 }}>{activeSection?.label}</h3>
              <p style={{ fontSize:'0.75rem', color:'var(--text-secondary)', margin:0 }}>{tabItems.length} item(s) nesta seção</p>
            </div>
          </div>

          {/* Toggle seção inteira */}
          <button
            onClick={() => toggleSection(activeTab)}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 14px', background: sectionIsOn ? `${activeColor}15` : 'rgba(255,255,255,0.04)', border:`1px solid ${sectionIsOn ? activeColor : 'rgba(255,255,255,0.1)'}`, borderRadius:'8px', color: sectionIsOn ? activeColor : 'var(--text-secondary)', fontWeight:600, fontSize:'0.82rem', cursor:'pointer' }}
          >
            {sectionIsOn ? <Eye size={14}/> : <EyeOff size={14}/>}
            {sectionIsOn ? 'Seção ativa' : 'Seção oculta'}
          </button>
        </div>

        {/* Items da aba */}
        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {tabItems.length === 0 && (
            <div style={{ textAlign:'center', padding:'32px', color:'var(--text-secondary)', fontSize:'0.88rem' }}>
              Nenhum item nesta seção. Adicione da biblioteca abaixo.
            </div>
          )}

          {tabItems.map((pc, idx) => (
            <div
              key={pc.case_id}
              draggable
              onDragStart={e => handleDragStart(e, pc.case_id)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, pc.case_id)}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', background: pc.ativo ? 'var(--card-bg)' : 'rgba(255,255,255,0.02)', border:`1px solid ${pc.ativo ? 'var(--glass-border)' : 'rgba(255,255,255,0.04)'}`, borderRadius:'10px', opacity: pc.ativo ? 1 : 0.5, transition:'all 0.2s ease', cursor:'grab' }}
            >
              <GripVertical size={15} style={{ color:'var(--text-secondary)', flexShrink:0 }}/>
              <span style={{ color:'var(--text-secondary)', fontSize:'0.75rem', fontFamily:'monospace', minWidth:'20px', textAlign:'center' }}>{idx + 1}</span>
              <span style={{ flex:1, fontSize:'0.9rem', color: pc.ativo ? '#fff' : 'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pc.title}</span>
              <div style={{ display:'flex', gap:'4px', flexShrink:0, alignItems:'center' }}>
                <button className="btn-icon" onClick={e => { e.stopPropagation(); move(pc.case_id, -1); }} disabled={idx === 0} title="Subir"><ChevronUp size={15}/></button>
                <button className="btn-icon" onClick={e => { e.stopPropagation(); move(pc.case_id, 1); }} disabled={idx === tabItems.length - 1} title="Descer"><ChevronDown size={15}/></button>
                <button
                  onClick={e => { e.stopPropagation(); toggleItemAtivo(pc.case_id); }}
                  title={pc.ativo ? 'Ocultar' : 'Exibir'}
                  style={{ fontSize:'1.1rem', background:'none', border:'none', cursor:'pointer', padding:'2px 6px', lineHeight:1 }}
                >
                  {pc.ativo ? '✅' : '⬜'}
                </button>
                <button className="btn-icon delete" onClick={e => { e.stopPropagation(); removeCase(pc.case_id); }} title="Remover"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>

        {/* Biblioteca disponível para esta aba */}
        {availableForTab.length > 0 && (
          <div style={{ padding:'0 20px 20px' }}>
            <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginBottom:'8px', fontWeight:600 }}>+ Adicionar da biblioteca:</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {availableForTab.map(c => (
                <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', background:'rgba(255,255,255,0.02)', border:'1px dashed var(--glass-border)', borderRadius:'8px' }}>
                  <span style={{ flex:1, fontSize:'0.85rem', color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.title}</span>
                  <button className="btn-cancel" style={{ padding:'5px 12px', fontSize:'0.78rem', flexShrink:0 }} onClick={() => addCase(c)}>
                    <Plus size={12}/> Adicionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCases;

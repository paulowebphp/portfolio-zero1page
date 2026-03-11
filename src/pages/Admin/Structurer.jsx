import React, { useState } from 'react';
import { Save, Plus, Trash2, Layout, Database, Zap, Globe, Image, Tag, ChevronDown, ChevronRight, Loader2, CheckCircle } from 'lucide-react';
import globalAuthorityData from '../../data/global_authority.json';

const TABS = [
  { key: 'projects',    label: 'Cases de Sucesso',  icon: Database, color: '#00c853' },
  { key: 'conceptual',  label: 'Conceituais',        icon: Layout,   color: '#0070f3' },
  { key: 'fullstack',   label: 'Full Stack',         icon: Zap,      color: '#a78bfa' },
  { key: 'traffic',     label: 'Tráfego Pago',       icon: Globe,    color: '#f59e0b' },
  { key: 'automation',  label: 'Automação',          icon: Zap,      color: '#06b6d4' },
  { key: 'depoimentos', label: 'Depoimentos',        icon: Tag,      color: '#f472b6' },
];

/* ── Sub-item editor (images within a Case) ── */
const SubItemEditor = ({ items = [], onChange, accentColor }) => {
  const addSubItem = () => onChange([...items, { url: '', title: '', description: '' }]);
  const removeSubItem = (i) => onChange(items.filter((_, idx) => idx !== i));
  const updateSubItem = (i, field, value) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [field]: value };
    onChange(copy);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Image size={12} /> Imagens do Case <span style={{ background: `${accentColor}20`, color: accentColor, borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{items.length}</span>
        </label>
        <button
          onClick={addSubItem}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px',
            background: `${accentColor}15`, border: `1px solid ${accentColor}50`,
            borderRadius: '6px', color: accentColor,
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          <Plus size={12} /> Adicionar Imagem
        </button>
      </div>

      {items.map((sub, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderLeft: `3px solid ${accentColor}60`,
          borderRadius: '8px',
          padding: '12px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: accentColor, fontWeight: 700, fontFamily: 'monospace' }}>IMG {i + 1}</span>
            <button onClick={() => removeSubItem(i)} style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '5px', color: '#ef4444', padding: '3px 6px', cursor: 'pointer', display: 'flex',
            }}>
              <Trash2 size={12} />
            </button>
          </div>

          <input
            type="text"
            value={sub.url || ''}
            placeholder="/projects/imagem.jpg  ou  https://..."
            onChange={e => updateSubItem(i, 'url', e.target.value)}
            style={{ margin: 0, fontSize: '0.82rem', padding: '8px 10px' }}
          />

          {/* Preview */}
          {sub.url && (
            <img
              src={sub.url}
              alt="preview"
              style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--glass-border)' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}

          <input
            type="text"
            value={sub.title || ''}
            placeholder="Título da imagem (ex: SEO & Performance)"
            onChange={e => updateSubItem(i, 'title', e.target.value)}
            style={{ margin: 0, fontSize: '0.82rem', padding: '8px 10px' }}
          />
          <textarea
            value={sub.description || ''}
            placeholder="Descrição desta imagem..."
            rows={2}
            onChange={e => updateSubItem(i, 'description', e.target.value)}
            style={{ resize: 'vertical', margin: 0, fontSize: '0.82rem', padding: '8px 10px' }}
          />
        </div>
      ))}

      {items.length === 0 && (
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '12px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '8px' }}>
          Nenhuma imagem. Clique em "Adicionar Imagem".
        </p>
      )}
    </div>
  );
};

/* ── Main Structurer ── */
const Structurer = () => {
  const [data, setData] = useState(globalAuthorityData);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [expandedCards, setExpandedCards] = useState({});

  const tab = TABS.find(t => t.key === activeTab);
  const activeColor = tab?.color || '#0070f3';
  const currentItems = data[activeTab] || [];

  const toggleCard = (id) => setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const addItem = () => {
    const newItem = activeTab === 'projects'
      ? { id: Date.now().toString(), title: 'Novo Case', tags: [], intro: '', items: [] }
      : { id: Date.now().toString(), title: 'Novo Item', image: '', description: '' };
    setData(prev => ({ ...prev, [activeTab]: [newItem, ...prev[activeTab]] }));
    setExpandedCards(prev => ({ ...prev, [Date.now().toString()]: true }));
  };

  const removeItem = (id) => setData(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(item => item.id !== id) }));

  const updateField = (index, field, value) => {
    setData(prev => {
      const updated = [...prev[activeTab]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [activeTab]: updated };
    });
  };

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Painel <span>Estruturador Visual</span></h1>
        <p>Gerencie o conteúdo de autoridade exibido em todas as propostas.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              background: isActive ? `${t.color}18` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isActive ? t.color : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '10px',
              color: isActive ? t.color : 'var(--text-secondary)',
              fontWeight: isActive ? 700 : 500, fontSize: '0.88rem',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}>
              <Icon size={15} />
              {t.label}
              <span style={{
                background: isActive ? t.color : 'rgba(255,255,255,0.08)',
                color: isActive ? '#000' : 'var(--text-secondary)',
                borderRadius: '20px', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 700,
              }}>
                {(data[t.key] || []).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="admin-form shadow-premium" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid var(--glass-border)',
          background: `linear-gradient(135deg, ${activeColor}08 0%, transparent 100%)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {tab && <tab.icon size={20} style={{ color: activeColor }} />}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{tab?.label}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                {currentItems.length} {currentItems.length === 1 ? 'item' : 'itens'}
              </p>
            </div>
          </div>
          <button onClick={addItem} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '9px 18px',
            background: `${activeColor}18`, border: `1px solid ${activeColor}`,
            borderRadius: '8px', color: activeColor,
            fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer',
          }}>
            <Plus size={16} /> Adicionar Item
          </button>
        </div>

        {/* Items */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Plus size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Nenhum item. Clique em "Adicionar Item".</p>
            </div>
          )}

          {currentItems.map((item, index) => {
            const isExpanded = expandedCards[item.id] ?? false;
            return (
              <div key={item.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${isExpanded ? activeColor + '40' : 'var(--glass-border)'}`,
                borderRadius: '12px', overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}>
                {/* Card header — always visible, click to expand */}
                <div
                  onClick={() => toggleCard(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '13px 16px',
                    cursor: 'pointer',
                    background: isExpanded ? `${activeColor}08` : 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    background: `${activeColor}20`, color: activeColor,
                    borderRadius: '6px', padding: '3px 10px',
                    fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace', flexShrink: 0,
                  }}>
                    #{String(index + 1).padStart(2, '0')}
                  </span>

                  <span style={{ flex: 1, fontSize: '0.92rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title || 'Sem título'}
                  </span>

                  {activeTab === 'projects' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                      {(item.items || []).length} imgs
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: '6px', color: '#ef4444', padding: '5px 7px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                      }}
                      title="Remover"
                    >
                      <Trash2 size={13} />
                    </button>
                    {isExpanded ? <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div style={{ padding: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem' }}>Título</label>
                      <input
                        type="text"
                        value={item.title || ''}
                        placeholder="Título do item"
                        onChange={e => updateField(index, 'title', e.target.value)}
                        style={{ margin: 0 }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.78rem' }}>{activeTab === 'projects' ? 'Intro' : 'Descrição'}</label>
                      <textarea
                        value={activeTab === 'projects' ? (item.intro || '') : (item.description || '')}
                        placeholder="Descrição / introdução..."
                        rows={3}
                        onChange={e => updateField(index, activeTab === 'projects' ? 'intro' : 'description', e.target.value)}
                        style={{ resize: 'vertical', margin: 0 }}
                      />
                    </div>

                    {/* Tags (apenas Projects) */}
                    {activeTab === 'projects' && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Tag size={12} /> Tags <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(separadas por vírgula)</span>
                        </label>
                        <input
                          type="text"
                          value={(item.tags || []).join(', ')}
                          placeholder="WordPress, SEO, UX/UI"
                          onChange={e => updateField(index, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                          style={{ margin: 0 }}
                        />
                        {(item.tags || []).length > 0 && (
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {item.tags.map((tag, ti) => (
                              <span key={ti} style={{
                                background: `${activeColor}18`, border: `1px solid ${activeColor}40`,
                                color: activeColor, borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600,
                              }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Imagem única (Conceituais, Full Stack, Traffic, Automation) */}
                    {activeTab !== 'projects' && (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Image size={12} /> URL da Imagem
                        </label>
                        <input
                          type="text"
                          value={item.image || ''}
                          placeholder="/projects/imagem.jpg  ou  https://..."
                          onChange={e => updateField(index, 'image', e.target.value)}
                          style={{ margin: 0 }}
                        />
                        {item.image && (
                          <img
                            src={item.image}
                            alt="preview"
                            style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--glass-border)', marginTop: '8px' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        )}
                      </div>
                    )}

                    {/* Sub-items (imagens) — apenas Projects */}
                    {activeTab === 'projects' && (
                      <SubItemEditor
                        items={item.items || []}
                        accentColor={activeColor}
                        onChange={newItems => updateField(index, 'items', newItems)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px',
          padding: '16px 24px', borderTop: '1px solid var(--glass-border)',
          background: 'rgba(255,255,255,0.01)',
        }}>
          {saved && (
            <div className="status-msg success" style={{ margin: 0, padding: '8px 14px' }}>
              <CheckCircle size={16} /><span>Estrutura salva!</span>
            </div>
          )}
          <button onClick={handleSave} className="btn-save" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{loading ? 'Salvando...' : 'Salvar Estrutura Global'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Structurer;

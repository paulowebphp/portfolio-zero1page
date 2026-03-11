import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save, Plus, Trash2, Layout, Database, Zap, Globe, Image,
  Tag, Users, ChevronDown, ChevronRight, Loader2, CheckCircle,
  AlertCircle, RefreshCw, Upload, X
} from 'lucide-react';

/* ─── Configuração das abas ─── */
const TABS = [
  { key: 'project',     label: 'Cases de Sucesso', icon: Database, color: '#00c853', subItems: true  },
  { key: 'conceptual',  label: 'Conceituais',       icon: Layout,   color: '#0070f3', subItems: false },
  { key: 'fullstack',   label: 'Full Stack',        icon: Zap,      color: '#a78bfa', subItems: false },
  { key: 'traffic',     label: 'Tráfego Pago',      icon: Globe,    color: '#f59e0b', subItems: false },
  { key: 'automation',  label: 'Automação',         icon: Zap,      color: '#06b6d4', subItems: false },
  { key: 'depoimentos', label: 'Depoimentos',       icon: Users,    color: '#f472b6', subItems: false },
];

/* ─── Slugify ─── */
const slugify = (str) =>
  str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `item-${Date.now()}`;

/* ─── Otimização de Imagem (Redimensionamento e Compressão) ─── */
const optimizeImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxW = 1200;

        if (width > maxW) {
          height = (maxW / width) * height;
          width = maxW;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
            resolve(optimizedFile);
          } else {
            reject(new Error('Falha na conversão'));
          }
        }, 'image/jpeg', 0.82); // Qualidade 82%
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

/* ─── Editor de sub-imagens (apenas para Cases de Sucesso) ─── */
const SubItemEditor = ({ items = [], onChange, color }) => {
  const [uploading, setUploading] = useState({}); // { [index]: true }

  // Garantir que sempre existam 2 slots para Cases
  const slots = [0, 1];
  const currentItems = [...items];
  while (currentItems.length < 2) currentItems.push({ url: '', title: '', description: '' });

  const update = (i, f, v) => { 
    const c = [...currentItems]; 
    c[i] = { ...c[i], [f]: v }; 
    onChange(c); 
  };

  const handleUpload = async (i, file) => {
    if (!file) return;
    setUploading(prev => ({ ...prev, [i]: true }));
    try {
      const optimizedFile = await optimizeImage(file);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
      const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, optimizedFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(fileName);
      update(i, 'url', publicUrl);
    } catch (err) {
      alert('Erro no upload: ' + err.message);
    } finally {
      setUploading(prev => ({ ...prev, [i]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, marginBottom: '4px' }}>
        <Image size={14} /> Imagens do Case <span style={{ color, fontWeight: 700 }}>(Máx 2)</span>
      </label>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {slots.map((i) => {
          const sub = currentItems[i];
          return (
            <div key={i} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `4px solid ${color}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.72rem', color, fontWeight: 800, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px' }}>Imagem {i + 1}</span>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <input 
                  value={sub.url || ''} 
                  placeholder="URL ou Upload..." 
                  onChange={e => update(i,'url', e.target.value)} 
                  style={{ 
                    flex: 1, 
                    margin: 0, 
                    fontSize: '1rem', 
                    padding: '12px 16px', 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid var(--glass-border)', 
                    color: '#fff',
                    borderRadius: '8px'
                  }} 
                />
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: uploading[i] ? color : 'var(--text-secondary)' }}>
                  {uploading[i] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  <input type="file" accept="image/*" hidden onChange={e => handleUpload(i, e.target.files[0])} disabled={uploading[i]} />
                </label>
              </div>

              {sub.url && (
                <div style={{ position: 'relative' }}>
                  <img src={sub.url} alt="" style={{ width:'100%', height:'80px', objectFit:'cover', borderRadius:'4px', border:'1px solid var(--glass-border)' }} />
                  <button onClick={() => update(i, 'url', '')} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', padding: '3px', cursor: 'pointer', display: 'flex' }}><X size={10} /></button>
                </div>
              )}
              
              <input 
                value={sub.title || ''} 
                placeholder="Título" 
                onChange={e => update(i,'title', e.target.value)} 
                style={{ 
                  margin: 0, 
                  fontSize: '1rem', 
                  padding: '12px 16px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--glass-border)', 
                  color: '#fff',
                  borderRadius: '10px'
                }} 
              />
              <textarea 
                value={sub.description || ''} 
                placeholder="Descrição..." 
                rows={3} 
                onChange={e => update(i,'description', e.target.value)} 
                style={{ 
                  resize: 'vertical', 
                  margin: 0, 
                  fontSize: '1rem', 
                  padding: '12px 16px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid var(--glass-border)', 
                  color: '#fff',
                  borderRadius: '8px',
                  lineHeight: '1.5'
                }} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Componente principal ─── */
const Structurer = () => {
  const [items,     setItems]     = useState([]);
  const [counts,    setCounts]    = useState({});   // badge counts por aba
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState({});
  const [saving,    setSaving]    = useState({});   // { [id]: true }
  const [deleting,  setDeleting]  = useState({});
  const [feedback,  setFeedback]  = useState({});   // { [id]: 'ok' | 'error' }
  const [activeTab, setActiveTab] = useState('project');
  const [uploadingSingle, setUploadingSingle] = useState({}); // { [itemId]: true }

  const tab   = TABS.find(t => t.key === activeTab);
  const color = tab?.color || '#0070f3';

  /* ── Carrega items da aba ── */
  const loadTab = useCallback(async (tipo) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*, case_images(*), case_tags(*)')
        .eq('tipo', tipo)
        .order('ordem');
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Carrega contagens de todos os tipos para os badges ── */
  const loadCounts = useCallback(async () => {
    const { data } = await supabase.from('cases').select('tipo');
    if (data) {
      const c = {};
      data.forEach(r => { c[r.tipo] = (c[r.tipo] || 0) + 1; });
      setCounts(c);
    }
  }, []);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  /* ── Adicionar novo item (local, salvo depois) ── */
  const addItem = () => {
    const tempId = `new_${Date.now()}`;
    const isProject = activeTab === 'project';
    setItems(prev => [
      {
        _new: true,
        id: tempId,
        slug: '',
        tipo: activeTab,
        title: '',
        intro: '',
        ativo: true,
        ordem: prev.length + 1,
        case_images: isProject 
          ? [{ url: '', title: '', description: '' }, { url: '', title: '', description: '' }] 
          : [{ url: '', title: '', description: '' }],
        case_tags: isProject ? [] : undefined,
      },
      ...prev,
    ]);
    setExpanded(prev => ({ ...prev, [tempId]: true }));
  };

  /* ── Atualiza campo de um item localmente ── */
  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  /* ── Salvar item individual ── */
  const saveItem = async (item) => {
    setSaving(prev => ({ ...prev, [item.id]: true }));
    setFeedback(prev => ({ ...prev, [item.id]: null }));
    try {
      const isProject = activeTab === 'project';
      const slug = item._new
        ? slugify(item.title || 'item') + '-' + Date.now()
        : item.slug;

      let caseId = item._new ? null : item.id;

      if (item._new) {
        // INSERT
        const { data, error } = await supabase
          .from('cases')
          .insert({ slug, tipo: activeTab, title: item.title, intro: item.intro || '', ordem: item.ordem, ativo: item.ativo !== false })
          .select('id, slug')
          .single();
        if (error) throw error;
        caseId = data.id;
      } else {
        // UPDATE
        const { error } = await supabase
          .from('cases')
          .update({ title: item.title, intro: item.intro || '', ativo: item.ativo !== false })
          .eq('id', caseId);
        if (error) throw error;
      }

      // Imagens — apaga e recria
      await supabase.from('case_images').delete().eq('case_id', caseId);
      const images = isProject ? (item.case_images || []) : (item.case_images?.[0] ? [item.case_images[0]] : []);
      const imagesToSave = images.filter(img => img.url);
      if (imagesToSave.length) {
        await supabase.from('case_images').insert(
          imagesToSave.map((img, i) => ({ case_id: caseId, url: img.url, title: img.title || '', description: img.description || '', ordem: i + 1 }))
        );
      }

      // Tags — apaga e recria (apenas projects)
      if (isProject) {
        await supabase.from('case_tags').delete().eq('case_id', caseId);
        const tags = item.case_tags || [];
        if (tags.length) {
          await supabase.from('case_tags').insert(
            tags.map((t, i) => ({ case_id: caseId, tag: typeof t === 'string' ? t : t.tag, ordem: i + 1 }))
          );
        }
      }

      setFeedback(prev => ({ ...prev, [item.id]: 'ok' }));
      setTimeout(() => setFeedback(prev => ({ ...prev, [item.id]: null })), 3000);
      loadTab(activeTab);
      loadCounts();
    } catch (err) {
      setFeedback(prev => ({ ...prev, [item.id]: 'error:' + err.message }));
    } finally {
      setSaving(prev => ({ ...prev, [item.id]: false }));
    }
  };

  /* ── Deletar item ── */
  const deleteItem = async (item) => {
    if (item._new) {
      setItems(prev => prev.filter(x => x.id !== item.id));
      return;
    }
    if (!window.confirm(`Remover "${item.title}"?`)) return;
    setDeleting(prev => ({ ...prev, [item.id]: true }));
    try {
      const { error } = await supabase.from('cases').delete().eq('id', item.id);
      if (error) throw error;
      setItems(prev => prev.filter(x => x.id !== item.id));
      loadCounts();
    } catch (err) {
      alert('Erro ao remover: ' + err.message);
    } finally {
      setDeleting(prev => ({ ...prev, [item.id]: false }));
    }
  };


  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>Painel <span>Estruturador Visual</span></h1>
        <p>Gerencie o conteúdo de autoridade exibido em todas as propostas.</p>
      </header>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', background: isActive ? `${t.color}18` : 'rgba(255,255,255,0.04)', border:`1px solid ${isActive ? t.color : 'rgba(255,255,255,0.08)'}`, borderRadius:'10px', color: isActive ? t.color : 'var(--text-secondary)', fontWeight: isActive ? 700 : 500, fontSize:'0.88rem', cursor:'pointer', transition:'all 0.2s ease' }}>
              <Icon size={15} />
              {t.label}
              <span style={{ background: isActive ? t.color : 'rgba(255,255,255,0.08)', color: isActive ? '#000' : 'var(--text-secondary)', borderRadius:'20px', padding:'1px 8px', fontSize:'0.72rem', fontWeight:700 }}>
                {counts[t.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="admin-form shadow-premium" style={{ padding:0, overflow:'hidden' }}>

        {/* Panel header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--glass-border)', background:`linear-gradient(135deg, ${color}08 0%, transparent 100%)` }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            {tab && <tab.icon size={20} style={{ color }} />}
            <div>
              <h3 style={{ fontSize:'1rem', fontWeight:700, color:'#fff', margin:0 }}>{tab?.label}</h3>
              <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', margin:0 }}>{loading ? 'Carregando...' : `${items.length} ${items.length === 1 ? 'item' : 'itens'}`}</p>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={() => loadTab(activeTab)} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'var(--text-secondary)', fontSize:'0.85rem', cursor:'pointer' }}>
              <RefreshCw size={15} />
            </button>
            <button onClick={addItem} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 18px', background:`${color}18`, border:`1px solid ${color}`, borderRadius:'8px', color, fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>
              <Plus size={16} /> Adicionar Item
            </button>
          </div>
        </div>

        {/* Items */}
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'10px', minHeight:'120px' }}>
          {loading && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', padding:'40px', color:'var(--text-secondary)' }}>
              <Loader2 size={22} className="animate-spin" /><span>Carregando...</span>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px', color:'var(--text-secondary)' }}>
              <Plus size={32} style={{ opacity:0.3, marginBottom:'12px', display:'block', margin:'0 auto 12px' }} />
              <p>Nenhum item. Clique em "Adicionar Item".</p>
            </div>
          )}

          {!loading && items.map((item, index) => {
            const isExp  = !!expanded[item.id];
            const isSaving  = !!saving[item.id];
            const isDeleting = !!deleting[item.id];
            const fb = feedback[item.id];
            const isProject = activeTab === 'project';
            const imgList = item.case_images || [];
            const tagList = isProject ? (item.case_tags || []).map(t => typeof t === 'string' ? t : t.tag) : [];

            return (
              <div key={item.id} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${isExp ? color + '40' : 'var(--glass-border)'}`, borderRadius:'12px', overflow:'hidden', transition:'border-color 0.2s' }}>

                {/* Collapsed row */}
                <div onClick={() => setExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'13px 16px', cursor:'pointer', background: isExp ? `${color}08` : 'transparent', transition:'background 0.2s' }}>
                  <span style={{ background:`${color}20`, color, borderRadius:'6px', padding:'3px 10px', fontSize:'0.72rem', fontWeight:700, fontFamily:'monospace', flexShrink:0 }}>
                    {item._new ? 'NEW' : `#${String(index+1).padStart(2,'0')}`}
                  </span>
                  {!isProject && imgList[0]?.url && <img src={imgList[0].url} alt="" style={{ width:32, height:32, objectFit:'cover', borderRadius:'4px', flexShrink:0 }} onError={e=>e.target.style.display='none'} />}
                  <span style={{ flex:1, fontSize:'0.92rem', fontWeight:600, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.title || 'Sem título'}</span>
                  {isProject && <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)', flexShrink:0 }}>{imgList.length} imgs</span>}


                  <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                    <button onClick={e => { e.stopPropagation(); deleteItem(item); }} disabled={isDeleting} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'6px', color:'#ef4444', padding:'5px 7px', cursor:'pointer', display:'flex', alignItems:'center' }}>
                      {isDeleting ? <Loader2 size={13} className="animate-spin"/> : <Trash2 size={13}/>}
                    </button>
                    {isExp ? <ChevronDown size={16} style={{ color:'var(--text-secondary)' }}/> : <ChevronRight size={16} style={{ color:'var(--text-secondary)' }}/>}
                  </div>
                </div>

                {/* Expanded */}
                {isExp && (
                  <div style={{ padding:'16px', borderTop:'1px solid var(--glass-border)', display:'flex', flexDirection:'column', gap:'14px' }}>

                    <div className="form-group" style={{ margin:0 }}>
                      <label style={{ fontSize:'0.9rem', marginBottom: '8px', display: 'block', fontWeight: 600 }}>Título</label>
                      <input value={item.title||''} placeholder="Título" onChange={e => updateItem(item.id,'title',e.target.value)} style={{ margin:0, padding: '14px 18px', fontSize: '1.05rem' }}/>
                    </div>

                    <div className="form-group" style={{ margin:0 }}>
                      <label style={{ fontSize:'0.9rem', marginBottom: '8px', display: 'block', fontWeight: 600 }}>{isProject ? 'Intro' : 'Descrição'}</label>
                      <textarea value={item.intro||''} placeholder="Descrição..." rows={3} onChange={e => updateItem(item.id,'intro',e.target.value)} style={{ resize:'vertical', margin:0, padding: '14px 18px', fontSize: '1.05rem', lineHeight: '1.6' }}/>
                    </div>

                    {/* Tags — apenas projects */}
                    {isProject && (
                      <div className="form-group" style={{ margin:0 }}>
                        <label style={{ fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px', fontWeight: 600, marginBottom: '8px' }}><Tag size={14}/> Tags <span style={{ color:'var(--text-secondary)', fontWeight:400, marginLeft: '4px' }}>(separadas por vírgula)</span></label>
                        <input value={tagList.join(', ')} placeholder="WordPress, SEO, UX/UI" onChange={e => updateItem(item.id,'case_tags', e.target.value.split(',').map(t=>t.trim()).filter(Boolean))} style={{ margin:0, padding: '14px 18px', fontSize: '1.05rem' }}/>
                        {tagList.length > 0 && (
                          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'8px' }}>
                            {tagList.map((tag,ti) => <span key={ti} style={{ background:`${color}18`, border:`1px solid ${color}40`, color, borderRadius:'20px', padding:'2px 10px', fontSize:'0.75rem', fontWeight:600 }}>{tag}</span>)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Imagem única — abas simples */}
                    {!isProject && (
                      <div className="form-group" style={{ margin:0 }}>
                        <label style={{ fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'8px', fontWeight: 600, marginBottom: '8px' }}><Image size={14}/> Imagem</label>
                        <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                          <input 
                            value={imgList[0]?.url||''} 
                            placeholder="/projects/img.jpg ou https://..." 
                            onChange={e => updateItem(item.id,'case_images',[{ ...(imgList[0]||{}), url:e.target.value }])} 
                            style={{ 
                              margin: 0, 
                              flex: 1,
                              fontSize: '1rem', 
                              padding: '14px 18px', 
                              background: 'rgba(255, 255, 255, 0.05)', 
                              border: '1px solid var(--glass-border)', 
                              color: '#fff',
                              borderRadius: '10px'
                            }}
                          />
                          <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: uploadingSingle[item.id] ? color : 'var(--text-secondary)' }}>
                            {uploadingSingle[item.id] ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                            <input 
                              type="file" 
                              accept="image/*" 
                              hidden 
                              disabled={uploadingSingle[item.id]}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setUploadingSingle(prev => ({ ...prev, [item.id]: true }));
                                try {
                                  const optimizedFile = await optimizeImage(file);
                                  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
                                  const { error: uploadError } = await supabase.storage.from('portfolio').upload(fileName, optimizedFile);
                                  if (uploadError) throw uploadError;
                                  const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(fileName);
                                  updateItem(item.id, 'case_images', [{ ...(imgList[0]||{}), url: publicUrl }]);
                                } catch (err) {
                                  alert('Erro no upload: ' + err.message);
                                } finally {
                                  setUploadingSingle(prev => ({ ...prev, [item.id]: false }));
                                }
                              }} 
                            />
                          </label>
                        </div>

                        {imgList[0]?.url && (
                          <div style={{ position: 'relative', marginBottom: '8px' }}>
                            <img src={imgList[0].url} alt="preview" style={{ width:'100%', maxHeight:'140px', objectFit:'cover', borderRadius:'8px', border:'1px solid var(--glass-border)' }} onError={e=>e.target.style.display='none'}/>
                            <button 
                              onClick={() => updateItem(item.id, 'case_images', [{ ...(imgList[0]||{}), url: '' }])}
                              style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', padding: '4px', cursor: 'pointer', display: 'flex' }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}

                        <input 
                          value={imgList[0]?.title||''} 
                          placeholder="Título da imagem" 
                          onChange={e => updateItem(item.id,'case_images',[{ ...(imgList[0]||{}), title:e.target.value }])} 
                          style={{ 
                            margin: '8px 0', 
                            fontSize: '1rem', 
                            padding: '14px 18px', 
                            background: 'rgba(255, 255, 255, 0.05)', 
                            border: '1px solid var(--glass-border)', 
                            color: '#fff',
                            borderRadius: '10px'
                          }}
                        />
                        <textarea 
                          value={imgList[0]?.description||''} 
                          placeholder="Descrição da imagem..." 
                          rows={3} 
                          onChange={e => updateItem(item.id,'case_images',[{ ...(imgList[0]||{}), description:e.target.value }])} 
                          style={{ 
                            resize: 'vertical', 
                            margin: 0,
                            fontSize: '1rem', 
                            padding: '14px 18px', 
                            background: 'rgba(255, 255, 255, 0.05)', 
                            border: '1px solid var(--glass-border)', 
                            color: '#fff',
                            borderRadius: '10px',
                            lineHeight: '1.6'
                          }}
                        />
                      </div>
                    )}

                    {/* Multi-imagens — projects */}
                    {isProject && (
                      <SubItemEditor items={imgList} color={color} onChange={imgs => updateItem(item.id,'case_images',imgs)}/>
                    )}

                    {/* Save button por item */}
                    <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:'10px', paddingTop:'8px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      {fb === 'ok' && <span style={{ display:'flex', alignItems:'center', gap:'6px', color:'#00c853', fontSize:'0.82rem' }}><CheckCircle size={14}/>Salvo!</span>}
                      {fb?.startsWith('error') && <span style={{ color:'#ef4444', fontSize:'0.82rem' }}>{fb.replace('error:','')}</span>}
                      <button onClick={() => saveItem(item)} disabled={isSaving} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 18px', background:`${color}18`, border:`1px solid ${color}`, borderRadius:'8px', color, fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Structurer;

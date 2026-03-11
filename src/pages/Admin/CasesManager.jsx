import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Plus, Trash2, Edit, Save, X, Loader2, CheckCircle,
  AlertCircle, Image, Tag, ChevronUp, ChevronDown
} from 'lucide-react';

const TIPOS = ['project', 'conceptual', 'fullstack'];
const TIPO_LABELS = { project: 'Case de Sucesso', conceptual: 'Demonstrativo', fullstack: 'Full Stack' };

const emptyCase = { slug: '', tipo: 'project', title: '', intro: '', ordem: 0, ativo: true };
const emptyImage = { url: '', title: '', description: '', ordem: 1 };

/* ──────────────────────────────── helpers ──────────────────────────────── */
const toSlug = (text) =>
  text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

/* ─────────────────────────────────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────────────────────────────────── */
const CasesManager = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);   // UUID do case em edição
  const [creating, setCreating] = useState(false);     // Formulário de novo case
  const [formData, setFormData] = useState(emptyCase);
  const [images, setImages] = useState([emptyImage]);  // Imagens do case em edição
  const [tags, setTags] = useState(['']);               // Tags (apenas projects)
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [filterTipo, setFilterTipo] = useState('all');

  useEffect(() => { fetchCases(); }, []);

  /* ── fetch ── */
  const fetchCases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*, case_images(*), case_tags(*)')
        .order('tipo').order('ordem');
      if (error) throw error;
      setCases(data || []);
    } catch (err) {
      console.error('Erro ao buscar cases:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ── abrir edição ── */
  const openEdit = (c) => {
    setCreating(false);
    setEditingId(c.id);
    setFormData({ slug: c.slug, tipo: c.tipo, title: c.title, intro: c.intro || '', ordem: c.ordem, ativo: c.ativo });
    setImages(c.case_images?.length ? [...c.case_images].sort((a, b) => a.ordem - b.ordem) : [emptyImage]);
    setTags(c.case_tags?.length ? c.case_tags.map(t => t.tag) : ['']);
    setStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCreate = () => {
    setEditingId(null);
    setCreating(true);
    setFormData({ ...emptyCase, ordem: cases.length + 1 });
    setImages([emptyImage]);
    setTags(['']);
    setStatus(null);
  };

  const closeForm = () => { setEditingId(null); setCreating(false); setStatus(null); };

  /* ── handle field changes ── */
  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, title: value, slug: creating ? toSlug(value) : prev.slug }));
  };

  /* ── imagens ── */
  const handleImageField = (idx, field, value) =>
    setImages(prev => prev.map((img, i) => i === idx ? { ...img, [field]: value } : img));

  const addImage = () => setImages(prev => [...prev, { ...emptyImage, ordem: prev.length + 1 }]);
  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));
  const moveImage = (idx, dir) => {
    setImages(prev => {
      const arr = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= arr.length) return arr;
      [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
      return arr.map((img, i) => ({ ...img, ordem: i + 1 }));
    });
  };

  /* ── tags ── */
  const handleTag = (idx, value) => setTags(prev => prev.map((t, i) => i === idx ? value : t));
  const addTag = () => setTags(prev => [...prev, '']);
  const removeTag = (idx) => setTags(prev => prev.filter((_, i) => i !== idx));

  /* ── salvar ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      let caseId;

      if (creating) {
        const { data, error } = await supabase.from('cases').insert([{
          slug: formData.slug,
          tipo: formData.tipo,
          title: formData.title,
          intro: formData.intro,
          ordem: Number(formData.ordem),
          ativo: formData.ativo,
        }]).select().single();
        if (error) throw error;
        caseId = data.id;
      } else {
        const { error } = await supabase.from('cases').update({
          title: formData.title,
          intro: formData.intro,
          ordem: Number(formData.ordem),
          ativo: formData.ativo,
        }).eq('id', editingId);
        if (error) throw error;
        caseId = editingId;
      }

      // Imagens — deleta e re-insere
      await supabase.from('case_images').delete().eq('case_id', caseId);
      const imgPayload = images.filter(img => img.url).map((img, i) => ({
        case_id: caseId, url: img.url, title: img.title, description: img.description, ordem: i + 1,
      }));
      if (imgPayload.length) {
        const { error } = await supabase.from('case_images').insert(imgPayload);
        if (error) throw error;
      }

      // Tags — deleta e re-insere (apenas projects)
      await supabase.from('case_tags').delete().eq('case_id', caseId);
      if (formData.tipo === 'project') {
        const tagPayload = tags.filter(t => t.trim()).map((tag, i) => ({
          case_id: caseId, tag: tag.trim(), ordem: i + 1,
        }));
        if (tagPayload.length) {
          const { error } = await supabase.from('case_tags').insert(tagPayload);
          if (error) throw error;
        }
      }

      setStatus('success');
      await fetchCases();
      setTimeout(() => { closeForm(); setStatus(null); }, 800);
    } catch (err) {
      console.error('Erro ao salvar case:', err);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  /* ── excluir ── */
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Excluir o case "${title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const { error } = await supabase.from('cases').delete().eq('id', id);
      if (error) throw error;
      setCases(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Erro ao excluir case.');
    }
  };

  /* ── toggle ativo ── */
  const toggleAtivo = async (c) => {
    try {
      await supabase.from('cases').update({ ativo: !c.ativo }).eq('id', c.id);
      setCases(prev => prev.map(x => x.id === c.id ? { ...x, ativo: !x.ativo } : x));
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  /* ── filtered ── */
  const filtered = filterTipo === 'all' ? cases : cases.filter(c => c.tipo === filterTipo);

  /* ────────────────────────── RENDER ────────────────────────── */
  return (
    <div className="admin-page">
      <header className="page-header">
        <div>
          <h1>Biblioteca de <span>Cases</span></h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Gerencie o portfólio de forma centralizada — alterações refletem em todas as propostas.
          </p>
        </div>
        <button className="btn-save" onClick={openCreate}>
          <Plus size={18} /><span>Novo Case</span>
        </button>
      </header>

      {/* ── Formulário (criar / editar) ── */}
      {(creating || editingId) && (
        <form onSubmit={handleSave} className="admin-form shadow-premium" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>
              {creating ? <><Plus size={18} /> Novo Case</> : <><Edit size={18} /> Editar Case</>}
            </h3>
            <button type="button" className="btn-icon" onClick={closeForm} title="Cancelar">
              <X size={18} />
            </button>
          </div>

          {/* Campos base */}
          <div className="form-grid">
            <div className="form-group">
              <label>Título</label>
              <input name="title" value={formData.title} onChange={handleTitleChange} placeholder="Nome do case" required />
            </div>
            <div className="form-group">
              <label>Slug <span className="text-muted">(gerado automaticamente)</span></label>
              <input name="slug" value={formData.slug}
                onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))}
                placeholder="nome-do-case" required disabled={!!editingId}
                style={editingId ? { opacity: 0.6, cursor: 'not-allowed' } : {}} />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select name="tipo" value={formData.tipo} onChange={handleField} disabled={!!editingId}>
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Ordem de exibição</label>
              <input type="number" name="ordem" value={formData.ordem} onChange={handleField} min="1" />
            </div>
            <div className="form-group full-width">
              <label>Descrição / Intro</label>
              <textarea name="intro" value={formData.intro} onChange={handleField} rows="4"
                placeholder="Texto principal do case — aparece na vitrine pública." />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleField}
                  style={{ width: '18px', height: '18px' }} />
                Visível no site
              </label>
            </div>
          </div>

          {/* Tags (apenas projects) */}
          {formData.tipo === 'project' && (
            <div style={{ marginTop: '24px' }}>
              <h4 className="section-title"><Tag size={16} /> Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                {tags.map((tag, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input value={tag} onChange={e => handleTag(idx, e.target.value)}
                      placeholder={`Tag ${idx + 1}`}
                      style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', width: '140px' }} />
                    <button type="button" className="btn-icon delete" onClick={() => removeTag(idx)}><X size={14} /></button>
                  </div>
                ))}
                <button type="button" className="btn-cancel" style={{ padding: '8px 14px' }} onClick={addTag}>
                  <Plus size={14} /> Tag
                </button>
              </div>
            </div>
          )}

          {/* Imagens */}
          <div style={{ marginTop: '28px' }}>
            <h4 className="section-title"><Image size={16} /> Imagens</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '16px' }}>
              Adicione 1 ou mais imagens. O path deve começar com <code>/projects/</code>.
            </p>
            {images.map((img, idx) => (
              <div key={idx} className="admin-form shadow-premium" style={{ marginBottom: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Imagem #{idx + 1}</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button type="button" className="btn-icon" onClick={() => moveImage(idx, -1)} disabled={idx === 0} title="Mover para cima"><ChevronUp size={16} /></button>
                    <button type="button" className="btn-icon" onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1} title="Mover para baixo"><ChevronDown size={16} /></button>
                    <button type="button" className="btn-icon delete" onClick={() => removeImage(idx)} disabled={images.length === 1}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>URL da Imagem</label>
                    <input value={img.url} onChange={e => handleImageField(idx, 'url', e.target.value)}
                      placeholder="/projects/nome-do-arquivo.jpg" required />
                  </div>
                  <div className="form-group">
                    <label>Título da Imagem</label>
                    <input value={img.title || ''} onChange={e => handleImageField(idx, 'title', e.target.value)}
                      placeholder="Título opcional" />
                  </div>
                  <div className="form-group full-width">
                    <label>Descrição da Imagem</label>
                    <textarea value={img.description || ''} onChange={e => handleImageField(idx, 'description', e.target.value)}
                      rows="2" placeholder="Contexto ou legenda da imagem" />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="btn-cancel" onClick={addImage}>
              <Plus size={16} /> Adicionar Imagem
            </button>
          </div>

          {/* Actions */}
          <div className="form-actions mt-8" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
            <button type="button" className="btn-cancel" onClick={closeForm}>Cancelar</button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              <span>{saving ? 'Salvando...' : 'Salvar Case'}</span>
            </button>
          </div>

          {status === 'success' && <div className="status-msg success mt-6"><CheckCircle size={20} /><span>Case salvo com sucesso!</span></div>}
          {status === 'error' && <div className="status-msg error mt-6"><AlertCircle size={20} /><span>Erro ao salvar. Tente novamente.</span></div>}
        </form>
      )}

      {/* ── Filtros ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', ...TIPOS].map(t => (
          <button key={t} onClick={() => setFilterTipo(t)}
            className={filterTipo === t ? 'btn-save' : 'btn-cancel'}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            {t === 'all' ? 'Todos' : TIPO_LABELS[t]} {t !== 'all' && `(${cases.filter(c => c.tipo === t).length})`}
          </button>
        ))}
      </div>

      {/* ── Tabela ── */}
      {loading ? (
        <div className="flex-center p-12"><Loader2 className="animate-spin text-accent" size={32} /></div>
      ) : (
        <div className="admin-table-wrapper shadow-premium">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Título</th>
                <th>Imagens</th>
                <th>Visível</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="text-muted" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.ordem}</td>
                  <td>
                    <span className="badge-user" style={{
                      background: c.tipo === 'project' ? 'rgba(0,200,83,0.1)' : c.tipo === 'fullstack' ? 'rgba(130,80,255,0.15)' : 'rgba(0,112,243,0.1)',
                      color: c.tipo === 'project' ? '#00c853' : c.tipo === 'fullstack' ? '#a78bfa' : 'var(--accent-color)',
                    }}>
                      {TIPO_LABELS[c.tipo]}
                    </span>
                  </td>
                  <td>
                    <div className="truncate-text" title={c.title} style={{ maxWidth: '280px' }}>{c.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>/{c.slug}</div>
                  </td>
                  <td className="text-muted">{c.case_images?.length ?? 0} img</td>
                  <td>
                    <button onClick={() => toggleAtivo(c)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                      title={c.ativo ? 'Clique para ocultar' : 'Clique para exibir'}>
                      {c.ativo ? '✅' : '⬜'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon edit" onClick={() => openEdit(c)} title="Editar"><Edit size={16} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(c.id, c.title)} title="Excluir"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center p-8 text-muted">Nenhum case encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CasesManager;

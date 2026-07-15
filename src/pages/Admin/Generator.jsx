import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, CheckCircle, AlertCircle, Info, Calendar, ExternalLink, Phone, RefreshCw } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const emptyForm = {
    slug: '',
    titulo_proposta: '',
    prazo_tipo: 'static',
    prazo_dias: 7,
    prazo_inicio: new Date().toISOString(),
    contato_id: '',
};

const pickFormFields = (proposal) => ({
    slug: proposal.slug || '',
    titulo_proposta: proposal.titulo_proposta || '',
    prazo_tipo: proposal.prazo_tipo || 'static',
    prazo_dias: proposal.prazo_dias ?? 7,
    prazo_inicio: proposal.prazo_inicio || new Date().toISOString(),
    contato_id: proposal.contato_id || '',
});

const Generator = () => {
    const { slug: editSlug } = useParams();

    const [formData, setFormData] = useState(emptyForm);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [originalPrazoInicio, setOriginalPrazoInicio] = useState(null);
    const [dateChanged, setDateChanged] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setInitialLoading(true);
            try {
                const { data: contactsData } = await supabase
                    .from('whatsapp_contatos')
                    .select('*')
                    .order('nome');
                setContacts(contactsData || []);

                if (editSlug) {
                    const { data: proposal, error } = await supabase
                        .from('propostas')
                        .select('slug, titulo_proposta, prazo_tipo, prazo_dias, prazo_inicio, contato_id')
                        .eq('slug', editSlug)
                        .single();

                    if (error) throw error;
                    if (proposal) {
                        setFormData(pickFormFields(proposal));
                        setOriginalPrazoInicio(proposal.prazo_inicio);
                    }
                }
            } catch (err) {
                console.error('Erro ao inicializar dados:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        loadInitialData();
    }, [editSlug]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        const datePart = e.target.value;
        setDateChanged(true);
        setFormData((prev) => {
            const [y, m, d] = datePart.split('-').map(Number);
            const date = new Date(y, m - 1, d, 0, 0, 0);
            return { ...prev, prazo_inicio: date.toISOString() };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const finalData = { ...formData };

            if (formData.prazo_tipo === 'countdown') {
                const { data: currentDb } = await supabase
                    .from('propostas')
                    .select('prazo_tipo, prazo_inicio')
                    .eq('slug', editSlug)
                    .single();

                if (currentDb?.prazo_tipo !== 'countdown') {
                    finalData.prazo_inicio = new Date().toISOString();
                } else if (!dateChanged) {
                    finalData.prazo_inicio = originalPrazoInicio;
                }
            }

            const { error } = await supabase
                .from('propostas')
                .update({
                    titulo_proposta: finalData.titulo_proposta,
                    prazo_tipo: finalData.prazo_tipo,
                    prazo_dias: Number(finalData.prazo_dias) || 0,
                    prazo_inicio: finalData.prazo_inicio,
                    contato_id: finalData.contato_id || null,
                })
                .eq('slug', editSlug);

            if (error) throw error;

            setOriginalPrazoInicio(finalData.prazo_inicio);
            setDateChanged(false);
            setFormData(finalData);
            setStatus('success');
        } catch (err) {
            console.error('Erro ao salvar proposta:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleResetTimer = async () => {
        if (!window.confirm('Deseja resetar as horas/minutos do cronômetro para o horário de agora? (O dia do calendário será mantido)')) return;

        setLoading(true);
        try {
            const now = new Date();
            const baseDate = formData.prazo_inicio ? new Date(formData.prazo_inicio) : new Date();
            baseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            const newStart = baseDate.toISOString();

            const { error } = await supabase
                .from('propostas')
                .update({ prazo_inicio: newStart })
                .eq('slug', editSlug);

            if (error) throw error;

            setOriginalPrazoInicio(newStart);
            setDateChanged(false);
            setFormData((prev) => ({ ...prev, prazo_inicio: newStart }));
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Erro ao resetar contador:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex-center p-20">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Dados & <span>Valores</span></h1>
                <p>Identificação, prazo de expiração e contato WhatsApp. Os cards comerciais ficam na aba Investimento.</p>
            </header>

            <form onSubmit={handleSubmit} className="admin-form shadow-premium">
                <section className="form-section">
                    <h3 className="section-title"><Info size={18} /> Identificação</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Slug (URL da proposta)</label>
                            <div className="slug-preview-wrapper">
                                <span className="slug-prefix">portfolio-zero1page.vercel.app/</span>
                                <input name="slug" value={formData.slug} readOnly disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                <a href={`/${formData.slug}`} target="_blank" rel="noreferrer" className="slug-ext-link" title="Ver página pública">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Título da Proposta (H1)</label>
                            <input
                                name="titulo_proposta"
                                value={formData.titulo_proposta}
                                onChange={handleChange}
                                placeholder="Ex: Máquina de Vendas para João"
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section mt-8">
                    <h3 className="section-title"><Calendar size={18} /> Prazo e Expiração</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tipo de Expiração</label>
                            <select name="prazo_tipo" value={formData.prazo_tipo || 'static'} onChange={handleChange}>
                                <option value="static">Texto Estático (ex: 7 dias)</option>
                                <option value="countdown">Countdown (Cronômetro)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Total de Dias</label>
                            <input type="number" name="prazo_dias" value={formData.prazo_dias ?? 7} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Data de Início</label>
                            <input
                                type="date"
                                name="prazo_inicio"
                                value={formData.prazo_inicio ? new Date(formData.prazo_inicio).toLocaleDateString('en-CA') : ''}
                                onChange={handleDateChange}
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section mt-8">
                    <h3 className="section-title"><Phone size={18} /> Contato WhatsApp</h3>
                    <div className="form-group">
                        <label>Responsável pelo Atendimento</label>
                        <select
                            name="contato_id"
                            value={formData.contato_id || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione um contato...</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nome} ({c.numero})
                                </option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Gerencie estes contatos na aba <Link to="/admin/whatsapp" style={{ color: 'var(--accent-color)' }}>WhatsApp</Link> do menu lateral.
                        </p>
                    </div>
                </section>

                <div className="form-actions mt-10" style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="btn-save" disabled={loading} style={{ flex: 1 }}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>{loading ? 'Salvando...' : 'Salvar Proposta'}</span>
                    </button>

                    {formData.prazo_tipo === 'countdown' && editSlug && (
                        <button
                            type="button"
                            onClick={handleResetTimer}
                            className="btn-save"
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                borderColor: '#f59e0b',
                                flex: 1,
                            }}
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            <span>Resetar Tempo</span>
                        </button>
                    )}
                </div>

                {status === 'success' && (
                    <div className="status-msg success mt-6">
                        <CheckCircle size={20} />
                        <span>Proposta salva com sucesso!</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="status-msg error mt-6">
                        <AlertCircle size={20} />
                        <span>Erro ao salvar proposta.</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default Generator;

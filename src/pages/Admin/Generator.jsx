import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, CheckCircle, AlertCircle, Info, Calendar, ExternalLink, Phone } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const Generator = () => {
    const { slug: editSlug } = useParams();

    const [formData, setFormData] = useState({
        slug: '',
        titulo_proposta: '',
        mova_principal: '24K',
        mova_avista: '22K',
        performance_range: '2K a 15K',
        trafego_mensal: '2.500',
        automacao_setup: '2.500',
        automacao_mensal: '1.000',
        prazo_tipo: 'static',
        prazo_dias: 7,
        prazo_inicio: new Date().toISOString().split('T')[0],
        contato_id: ''
    });

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setInitialLoading(true);
            try {
                // Load contacts filtrados por esta proposta
                const { data: contactsData } = await supabase
                    .from('whatsapp_contatos')
                    .select('*')
                    .eq('proposta_slug', editSlug)
                    .order('nome');
                setContacts(contactsData || []);

                // If editing, load proposal
                if (editSlug) {
                    const { data: proposal, error } = await supabase
                        .from('propostas')
                        .select('*')
                        .eq('slug', editSlug)
                        .single();

                    if (proposal) {
                        setFormData({
                            ...proposal,
                            prazo_inicio: proposal.prazo_inicio ? new Date(proposal.prazo_inicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        });
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('propostas')
                .upsert(formData, { onConflict: 'slug' });

            if (error) throw error;
            setStatus('success');
        } catch (err) {
            console.error('Erro ao salvar proposta:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="flex-center p-20"><Loader2 className="animate-spin" size={40} /></div>;

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Painel <span>Gerador de Propostas</span></h1>
                <p>Configure a proposta comercial específica para o cliente.</p>
            </header>

            <form onSubmit={handleSubmit} className="admin-form shadow-premium">
                <section className="form-section">
                    <h3 className="section-title"><Info size={18} /> Identificação</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Slug (URL da proposta)</label>
                            <div className="slug-preview-wrapper">
                                <span className="slug-prefix">site.com/</span>
                                <input name="slug" value={formData.slug} readOnly disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
                                <a href={`/${formData.slug}`} target="_blank" rel="noreferrer" className="slug-ext-link" title="Ver página pública">
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Título da Proposta (H1)</label>
                            <input name="titulo_proposta" value={formData.titulo_proposta} onChange={handleChange} placeholder="Ex: Máquina de Vendas para João" required />
                        </div>
                        <div className="form-group full-width">
                            <label>Atendente WhatsApp (Responsável)</label>
                            {contacts.length === 0 ? (
                                <div className="status-msg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                                    <Phone size={16} />
                                    <span>
                                        Nenhum contato cadastrado para esta proposta.{' '}
                                        <Link to={`/admin/proposals/${editSlug}/whatsapp`} style={{ color: '#f59e0b', fontWeight: 700, textDecoration: 'underline' }}>
                                            Cadastrar na aba WhatsApp →
                                        </Link>
                                    </span>
                                </div>
                            ) : (
                                <select name="contato_id" value={formData.contato_id} onChange={handleChange}>
                                    <option value="">Selecione um contato...</option>
                                    {contacts.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.numero})</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                </section>

                <section className="form-section mt-8">
                    <h3 className="section-title">💰 Valores Comerciais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>M.O.V.A — Principal</label>
                            <div className="input-prefix-wrapper">
                                <span className="input-prefix">R$</span>
                                <input name="mova_principal" value={formData.mova_principal} onChange={handleChange} placeholder="24K" />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>M.O.V.A — À Vista</label>
                            <div className="input-prefix-wrapper">
                                <span className="input-prefix">R$</span>
                                <input name="mova_avista" value={formData.mova_avista} onChange={handleChange} placeholder="22K" />
                                <span className="input-suffix">à vista</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Performance (Range)</label>
                            <div className="input-prefix-wrapper">
                                <span className="input-prefix">R$</span>
                                <input name="performance_range" value={formData.performance_range} onChange={handleChange} placeholder="2K a 15K" />
                                <span className="input-suffix">/mês</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tráfego Pago (Mensal)</label>
                            <div className="input-prefix-wrapper">
                                <span className="input-prefix">R$</span>
                                <input name="trafego_mensal" value={formData.trafego_mensal} onChange={handleChange} placeholder="2.500" />
                                <span className="input-suffix">/mês</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Automação (Setup)</label>
                            <div className="input-prefix-wrapper">
                                <span className="input-prefix">R$</span>
                                <input name="automacao_setup" value={formData.automacao_setup} onChange={handleChange} placeholder="2.500" />
                                <span className="input-suffix">(Setup)</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Automação (Mensal)</label>
                            <div className="input-prefix-wrapper">
                                <span className="input-prefix">+ R$</span>
                                <input name="automacao_mensal" value={formData.automacao_mensal} onChange={handleChange} placeholder="1.000" />
                                <span className="input-suffix">/mês</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="form-section mt-8">
                    <h3 className="section-title"><Calendar size={18} /> Prazo e Expiração</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tipo de Expiração</label>
                            <select name="prazo_tipo" value={formData.prazo_tipo} onChange={handleChange}>
                                <option value="static">Texto Estático (ex: 7 dias)</option>
                                <option value="countdown">Countdown (Cronômetro)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Total de Dias</label>
                            <input type="number" name="prazo_dias" value={formData.prazo_dias} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Data de Início</label>
                            <input type="date" name="prazo_inicio" value={formData.prazo_inicio} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <div className="form-actions mt-10">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>{loading ? 'Salvando...' : 'Salvar Proposta'}</span>
                    </button>
                </div>

                {status === 'success' && <div className="status-msg success mt-6"><CheckCircle size={20} /><span>Proposta salva com sucesso!</span></div>}
                {status === 'error' && <div className="status-msg error mt-6"><AlertCircle size={20} /><span>Erro ao salvar proposta.</span></div>}
            </form>
        </div>
    );
};

export default Generator;

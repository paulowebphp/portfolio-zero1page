import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, CheckCircle, AlertCircle, Info, Calendar, ExternalLink, Phone, RefreshCw } from 'lucide-react';
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
        prazo_inicio: new Date().toISOString(),
        contato_id: ''
    });

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
                // Load contacts globais (sem filtro por proposta)
                const { data: contactsData } = await supabase
                    .from('whatsapp_contatos')
                    .select('*')
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
                        setFormData(proposal);
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
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e) => {
        const datePart = e.target.value;
        setDateChanged(true);
        setFormData(prev => {
            // Criar data baseada na entrada local e converter para ISO
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
            
            // Lógica inteligente de Deadline:
            // Só iniciamos o cronômetro (setamos o 'now') se:
            // 1. O tipo for countdown
            // 2. O valor original no banco NÃO era countdown (ou seja, está ativando agora)
            // OU se a data de início estava nula/padrão e é o primeiro save.
            
            if (formData.prazo_tipo === 'countdown') {
                const { data: currentDb } = await supabase
                    .from('propostas')
                    .select('prazo_tipo, prazo_inicio')
                    .eq('slug', editSlug)
                    .single();

                if (currentDb?.prazo_tipo !== 'countdown') {
                    // Ativando o cronômetro pela primeira vez: Play!
                    finalData.prazo_inicio = new Date().toISOString();
                } else if (!dateChanged) {
                    // Já estava ativo e o usuário não mexeu no calendário: Preserva o tempo que já estava correndo
                    finalData.prazo_inicio = originalPrazoInicio;
                }
            }

            const { error } = await supabase
                .from('propostas')
                .upsert(finalData, { onConflict: 'slug' });

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
        if (!window.confirm("Deseja resetar as horas/minutos do cronômetro para o horário de agora? (O dia do calendário será mantido)")) return;
        
        setLoading(true);
        try {
            const now = new Date();
            // Pegamos a data que está no formulário (calendário)
            const baseDate = formData.prazo_inicio ? new Date(formData.prazo_inicio) : new Date();
            
            // Resetamos apenas as horas, minutos e segundos para o "agora"
            baseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
            
            const newStart = baseDate.toISOString();

            const { error } = await supabase
                .from('propostas')
                .update({ prazo_inicio: newStart })
                .eq('slug', editSlug);

            if (error) throw error;
            
            setOriginalPrazoInicio(newStart);
            setDateChanged(false);
            setFormData(prev => ({ ...prev, prazo_inicio: newStart }));
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Erro ao resetar contador:', err);
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
                            {contacts.map(c => (
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
                                flex: 1
                            }}
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                            <span>Resetar Tempo</span>
                        </button>
                    )}
                </div>

                {status === 'success' && <div className="status-msg success mt-6"><CheckCircle size={20} /><span>Proposta salva com sucesso!</span></div>}
                {status === 'error' && <div className="status-msg error mt-6"><AlertCircle size={20} /><span>Erro ao salvar proposta.</span></div>}
            </form>
        </div>
    );
};

export default Generator;

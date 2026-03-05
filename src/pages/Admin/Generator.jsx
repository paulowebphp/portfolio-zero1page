import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, CheckCircle, AlertCircle, Info, Calendar } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Generator = () => {
    const [searchParams] = useSearchParams();
    const editSlug = searchParams.get('edit');

    const [formData, setFormData] = useState({
        slug: '',
        titulo_proposta: '',
        mova_principal: 'R$ 24K',
        mova_avista: 'R$ 22K à vista',
        performance_range: 'R$ 2K a 15K /mês',
        trafego_mensal: 'R$ 2.500 /mês',
        automacao_setup: 'R$ 2.500 (Setup)',
        automacao_mensal: 'R$ 1.000 /mês',
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
                // Load contacts
                const { data: contactsData } = await supabase.from('whatsapp_contatos').select('*').order('nome');
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
                            <label>Slug (URL Final: site.com/slug)</label>
                            <input name="slug" value={formData.slug} onChange={handleChange} placeholder="ex: cliente-advocacia" required disabled={!!editSlug} />
                        </div>
                        <div className="form-group">
                            <label>Título da Proposta (H1)</label>
                            <input name="titulo_proposta" value={formData.titulo_proposta} onChange={handleChange} placeholder="Ex: Máquina de Vendas para João" required />
                        </div>
                        <div className="form-group full-width">
                            <label>Atendente WhatsApp (Responsável)</label>
                            <select name="contato_id" value={formData.contato_id} onChange={handleChange} required>
                                <option value="">Selecione um contato...</option>
                                {contacts.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.numero})</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                <section className="form-section mt-8">
                    <h3 className="section-title">💰 Valores Comerciais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>M.O.V.A - Principal</label>
                            <input name="mova_principal" value={formData.mova_principal} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>M.O.V.A - À Vista</label>
                            <input name="mova_avista" value={formData.mova_avista} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Performance (Range)</label>
                            <input name="performance_range" value={formData.performance_range} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Tráfego Pago (Mensal)</label>
                            <input name="trafego_mensal" value={formData.trafego_mensal} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Automação (Setup)</label>
                            <input name="automacao_setup" value={formData.automacao_setup} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Automação (Mensal)</label>
                            <input name="automacao_mensal" value={formData.automacao_mensal} onChange={handleChange} />
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

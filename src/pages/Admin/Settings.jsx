import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Globe, MessageSquare, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

// ID fixo da linha de configuração central (singleton no banco)
const CONFIG_ID = 1;

const Settings = () => {
    const [settings, setSettings] = useState({
        global_whatsapp_number: '5521989248813',
        global_whatsapp_message: 'Quero saber mais sobre a proposta!',
        site_title: 'Portfolio Zero 1 Page',
        site_meta_description: 'Estrategistas em desenvolvimento web e performance.',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error'

    // Carrega configurações do Supabase
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data, error } = await supabase
                    .from('config')
                    .select('*')
                    .eq('id', CONFIG_ID)
                    .single();

                if (data && !error) {
                    setSettings({
                        global_whatsapp_number: data.global_whatsapp_number || settings.global_whatsapp_number,
                        global_whatsapp_message: data.global_whatsapp_message || settings.global_whatsapp_message,
                        site_title: data.site_title || settings.site_title,
                        site_meta_description: data.site_meta_description || settings.site_meta_description,
                    });
                }
                // Se não encontrar linha, mantém os defaults (será criada no primeiro save)
            } catch (err) {
                console.warn('Config não encontrada, usando defaults:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('config')
                .upsert({ id: CONFIG_ID, ...settings }, { onConflict: 'id' });

            if (error) throw error;
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        } catch (err) {
            console.error('Erro ao salvar configurações:', err);
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

    return (
        <div className="admin-page">
            <header className="page-header">
                <div>
                    <h1>Configurações <span>Centrais</span></h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Dados globais persistidos no Supabase — disponíveis em qualquer dispositivo.
                    </p>
                </div>
            </header>

            <form onSubmit={handleSave} className="admin-form shadow-premium" style={{ maxWidth: '640px' }}>

                <section className="settings-section">
                    <h3 className="section-title"><MessageSquare size={18} /> WhatsApp Padrão</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                        Usado como valor inicial ao criar novos contatos. O número exibido em cada proposta vem do contato vinculado a ela.
                    </p>
                    <div className="form-group">
                        <label>Número com DDD</label>
                        <input
                            type="text"
                            name="global_whatsapp_number"
                            value={settings.global_whatsapp_number}
                            onChange={handleChange}
                            placeholder="Ex: 5521989248813"
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label>Mensagem Padrão</label>
                        <input
                            type="text"
                            name="global_whatsapp_message"
                            value={settings.global_whatsapp_message}
                            onChange={handleChange}
                            placeholder="Ex: Quero saber mais sobre a proposta!"
                        />
                    </div>
                </section>

                <section className="settings-section" style={{ marginTop: '32px' }}>
                    <h3 className="section-title"><Globe size={18} /> SEO Global</h3>
                    <div className="form-group">
                        <label>Título do Site</label>
                        <input
                            type="text"
                            name="site_title"
                            value={settings.site_title}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label>Meta Description</label>
                        <textarea
                            name="site_meta_description"
                            value={settings.site_meta_description}
                            onChange={handleChange}
                            rows="3"
                        />
                    </div>
                </section>

                <div className="form-actions mt-8" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
                    <button type="submit" className="btn-save" disabled={saving}>
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>{saving ? 'Salvando no Supabase...' : 'Salvar Configurações'}</span>
                    </button>
                </div>

                {status === 'success' && (
                    <div className="status-msg success mt-6">
                        <ShieldCheck size={20} />
                        <span>Configurações salvas no Supabase com sucesso!</span>
                    </div>
                )}
                {status === 'error' && (
                    <div className="status-msg error mt-6">
                        <AlertCircle size={20} />
                        <span>Erro ao salvar. Verifique se a tabela <code>config</code> existe no Supabase.</span>
                    </div>
                )}
            </form>
        </div>
    );
};


export default Settings;


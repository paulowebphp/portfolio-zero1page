import React, { useState, useEffect } from 'react';
import { Save, Key, Globe, MessageSquare, ShieldCheck, Loader2 } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
        supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        globalWhasappNumber: '5521989248813',
        globalWhatsappMessage: 'Quero saber mais sobre a proposta!',
        siteTitle: 'Portfolio Zero 1 Page',
        siteMetaDescription: 'Estrategistas em desenvolvimento web e performance.'
    });

    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Carrega configurações do localStorage (para sobrescrita local/temp)
    useEffect(() => {
        const localSettings = localStorage.getItem('admin_settings');
        if (localSettings) {
            setSettings(JSON.parse(localSettings));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);

        // Salva no localStorage para assumir as chaves dinâmicas
        localStorage.setItem('admin_settings', JSON.stringify(settings));

        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 800);
    };

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Painel <span>Configurações Gerais</span></h1>
                <p>Ajuste o motor e as chaves de conexão do sistema.</p>
            </header>

            <form onSubmit={handleSave} className="admin-form shadow-premium max-w-2xl">
                <section className="settings-section">
                    <h3><Key size={18} /> Conexão Supabase</h3>
                    <div className="form-group">
                        <label>Supabase URL</label>
                        <input type="text" name="supabaseUrl" value={settings.supabaseUrl} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Supabase Anon Key</label>
                        <input type="password" name="supabaseAnonKey" value={settings.supabaseAnonKey} onChange={handleChange} />
                    </div>
                    <p className="help-text">Alterar estas chaves aqui sobrescreve o arquivo .env no navegador atual.</p>
                </section>

                <section className="settings-section mt-8">
                    <h3><MessageSquare size={18} /> WhatsApp Padrão</h3>
                    <div className="form-group">
                        <label>Número com DDD</label>
                        <input type="text" name="globalWhasappNumber" value={settings.globalWhasappNumber} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Mensagem Padrão</label>
                        <input type="text" name="globalWhatsappMessage" value={settings.globalWhatsappMessage} onChange={handleChange} />
                    </div>
                </section>

                <section className="settings-section mt-8">
                    <h3><Globe size={18} /> SEO Global</h3>
                    <div className="form-group">
                        <label>Título do Site</label>
                        <input type="text" name="siteTitle" value={settings.siteTitle} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Meta Description</label>
                        <textarea name="siteMetaDescription" value={settings.siteMetaDescription} onChange={handleChange} rows="2"></textarea>
                    </div>
                </section>

                <div className="form-actions border-top mt-8 pt-6">
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        <span>{loading ? 'Sincronizando...' : 'Salvar Configurações'}</span>
                    </button>
                    {saved && <span className="text-green-500 ml-4 flex-align"><ShieldCheck size={18} className="mr-1" /> Configurações salvas localmente!</span>}
                </div>
            </form>
        </div>
    );
};

export default Settings;

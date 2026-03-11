import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

// Converte texto amigável em slug: "João Marcos" → "joao-marcos"
const toSlug = (text) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '')    // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-')            // Espaços → hífens
        .replace(/-+/g, '-');            // Hífens duplos → simples
};

const ProposalNew = () => {
    const navigate = useNavigate();
    const [nome, setNome] = useState('');
    const [slug, setSlug] = useState('');
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [slugError, setSlugError] = useState('');

    const handleNomeChange = (e) => {
        const value = e.target.value;
        setNome(value);
        if (!slugManuallyEdited) {
            setSlug(toSlug(value));
            setSlugError('');
        }
    };

    const handleSlugChange = (e) => {
        const value = e.target.value;
        setSlugManuallyEdited(true);
        setSlug(value);

        // Validação em tempo real
        if (value && !/^[a-z0-9-]+$/.test(value)) {
            setSlugError('Slug inválido: use apenas letras minúsculas, números e hífens.');
        } else {
            setSlugError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (slugError) return;

        setLoading(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('propostas')
                .insert([{
                    nome: nome.trim(),
                    slug: slug.trim(),
                    titulo_proposta: `Proposta para ${nome.trim()}`,
                }]);

            if (error) {
                if (error.code === '23505') {
                    setSlugError('Este slug já existe. Escolha outro nome.');
                    setStatus('error');
                } else {
                    throw error;
                }
                return;
            }

            setStatus('success');
            // Redireciona para o workspace da nova proposta após 800ms
            setTimeout(() => navigate(`/admin/proposals/${slug.trim()}/details`), 800);
        } catch (err) {
            console.error('Erro ao criar proposta:', err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Nova <span>Proposta</span></h1>
                <p>Defina o nome e a URL da nova proposta comercial.</p>
            </header>

            <form onSubmit={handleSubmit} className="admin-form shadow-premium" style={{ maxWidth: '600px' }}>
                <div className="form-group">
                    <label>Nome da Proposta</label>
                    <input
                        type="text"
                        value={nome}
                        onChange={handleNomeChange}
                        placeholder="Ex: João Marcos, Clínica Saúde Viva..."
                        required
                        autoFocus
                    />
                    <small className="form-hint">Nome amigável para identificar internamente a proposta.</small>
                </div>

                <div className="form-group">
                    <label>Slug <span className="text-muted">(URL pública)</span></label>
                    <div className="slug-preview-wrapper">
                        <span className="slug-prefix">site.com/</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={handleSlugChange}
                            placeholder="joao-marcos"
                            required
                            pattern="^[a-z0-9-]+$"
                            title="Apenas letras minúsculas, números e hífens"
                        />
                    </div>
                    {slugError && <small className="form-error">{slugError}</small>}
                    {!slugError && slug && (
                        <small className="form-hint">A proposta ficará acessível em: <strong>/{slug}</strong></small>
                    )}
                </div>

                <div className="form-actions mt-8">
                    <button type="button" className="btn-cancel" onClick={() => navigate('/admin/proposals')}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn-save" disabled={loading || !!slugError || !slug || !nome}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <FilePlus size={18} />}
                        <span>{loading ? 'Criando...' : 'Criar Proposta'}</span>
                    </button>
                </div>

                {status === 'success' && (
                    <div className="status-msg success mt-6">
                        <CheckCircle size={20} />
                        <span>Proposta criada! Redirecionando...</span>
                    </div>
                )}
                {status === 'error' && !slugError && (
                    <div className="status-msg error mt-6">
                        <AlertCircle size={20} />
                        <span>Erro ao criar proposta. Tente novamente.</span>
                    </div>
                )}
            </form>
        </div>
    );
};

export default ProposalNew;

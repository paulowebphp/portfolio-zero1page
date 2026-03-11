import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, FileText, Phone, Loader2, ExternalLink, Images } from 'lucide-react';

const ProposalWorkspace = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [proposal, setProposal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProposal = async () => {
            try {
                const { data, error } = await supabase
                    .from('propostas')
                    .select('slug, nome, titulo_proposta')
                    .eq('slug', slug)
                    .single();
                if (error) throw error;
                setProposal(data);
            } catch (err) {
                console.error('Proposta não encontrada:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProposal();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex-center p-20">
                <Loader2 className="animate-spin text-accent" size={40} />
            </div>
        );
    }

    if (!proposal) {
        return (
            <div className="admin-page">
                <div className="status-msg error">
                    <span>Proposta &quot;{slug}&quot; não encontrada.</span>
                </div>
                <button className="btn-cancel mt-4" onClick={() => navigate('/admin/proposals')}>
                    Voltar para Propostas
                </button>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Header do workspace */}
            <div className="workspace-header">
                <button
                    className="btn-back"
                    onClick={() => navigate('/admin/proposals')}
                    title="Voltar para lista de propostas"
                >
                    <ArrowLeft size={18} />
                    <span>Propostas</span>
                </button>

                <div className="workspace-title">
                    <h1>
                        {proposal.nome || proposal.slug}
                        <a
                            href={`/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="workspace-public-link"
                            title="Ver página pública"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </h1>
                    <span className="workspace-slug">/{slug}</span>
                </div>
            </div>

            {/* Tabs de navegação do workspace */}
            <nav className="workspace-tabs">
                <NavLink
                    to={`/admin/proposals/${slug}/details`}
                    className={({ isActive }) => `workspace-tab${isActive ? ' active' : ''}`}
                >
                    <FileText size={16} />
                    <span>Dados & Valores</span>
                </NavLink>
                <NavLink
                    to={`/admin/proposals/${slug}/whatsapp`}
                    className={({ isActive }) => `workspace-tab${isActive ? ' active' : ''}`}
                >
                    <Phone size={16} />
                    <span>WhatsApp</span>
                </NavLink>
                <NavLink
                    to={`/admin/proposals/${slug}/cases`}
                    className={({ isActive }) => `workspace-tab${isActive ? ' active' : ''}`}
                >
                    <Images size={16} />
                    <span>Cases</span>
                </NavLink>
            </nav>

            {/* Conteúdo da tab ativa */}
            <div className="workspace-content">
                <Outlet context={{ slug }} />
                {/* Tab Cases renderizada inline (não usa Outlet) */}
            </div>
        </div>
    );
};

export default ProposalWorkspace;

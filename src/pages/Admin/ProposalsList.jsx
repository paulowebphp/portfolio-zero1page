import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Edit, Trash2, ExternalLink, Loader2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProposals();
    }, []);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('propostas')
                .select(`
                    *,
                    whatsapp_contatos (nome)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProposals(data);
        } catch (err) {
            console.error('Erro ao buscar propostas:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (slug) => {
        if (!window.confirm(`Tem certeza que deseja excluir a proposta "${slug}"?`)) return;

        try {
            const { error } = await supabase
                .from('propostas')
                .delete()
                .eq('slug', slug);

            if (error) throw error;
            setProposals(prev => prev.filter(p => p.slug !== slug));
        } catch (err) {
            alert('Erro ao excluir proposta');
        }
    };

    const filteredProposals = proposals.filter(p =>
        p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.titulo_proposta.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Painel de <span>Propostas Geradas</span></h1>
                <div className="header-actions">
                    <div className="search-bar">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por slug ou título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="flex-center p-12">
                    <Loader2 className="animate-spin text-accent" size={32} />
                </div>
            ) : (
                <div className="admin-table-wrapper shadow-premium">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Link</th>
                                <th>Título</th>
                                <th>Atendente</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProposals.map(p => (
                                <tr key={p.id}>
                                    <td className="text-muted">
                                        <div className="flex-align">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <a href={`/${p.slug}`} target="_blank" rel="noreferrer" className="slug-link">
                                            /{p.slug} <ExternalLink size={12} />
                                        </a>
                                    </td>
                                    <td><div className="truncate-text" title={p.titulo_proposta}>{p.titulo_proposta}</div></td>
                                    <td><span className="badge-user">{p.whatsapp_contatos?.nome || '—'}</span></td>
                                    <td className="actions-cell">
                                        <Link to={`/admin/generator?edit=${p.slug}`} className="btn-icon edit" title="Editar">
                                            <Edit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(p.slug)} className="btn-icon delete" title="Excluir">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProposals.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center p-8 text-muted">Nenhuma proposta encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProposalsList;

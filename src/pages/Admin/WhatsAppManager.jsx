import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Trash2, Plus, Loader2, CheckCircle, AlertCircle, Phone, User, MessageSquare } from 'lucide-react';

const WhatsAppManager = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        nome: '',
        numero: '',
        mensagem_padrao: 'Quero Falar com o Diretor Comercial e Head PR sobre a proposta!'
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('whatsapp_contatos')
                .select('*')
                .order('nome');
            if (error) throw error;
            setContacts(data);
        } catch (err) {
            console.error('Erro ao buscar contatos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setStatus(null);

        try {
            if (editingId) {
                const { error } = await supabase
                    .from('whatsapp_contatos')
                    .update(formData)
                    .eq('id', editingId);
                if (error) throw error;
                setStatus('success_edit');
            } else {
                const { error } = await supabase
                    .from('whatsapp_contatos')
                    .insert([formData]);
                if (error) throw error;
                setStatus('success_add');
            }

            setFormData({
                nome: '',
                numero: '',
                mensagem_padrao: 'Quero Falar com o Diretor Comercial e Head PR sobre a proposta!'
            });
            setEditingId(null);
            fetchContacts();
        } catch (err) {
            console.error('Erro ao salvar contato:', err);
            setStatus('error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (contact) => {
        setFormData({
            nome: contact.nome,
            numero: contact.numero,
            mensagem_padrao: contact.mensagem_padrao
        });
        setEditingId(contact.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Excluir este contato? Isso pode afetar propostas vinculadas.')) return;

        try {
            const { error } = await supabase
                .from('whatsapp_contatos')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchContacts();
        } catch (err) {
            alert('Erro ao excluir contato');
        }
    };

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Gestão de <span>Contatos WhatsApp</span></h1>
                <p>Gerencie quem atende os leads das propostas.</p>
            </header>

            <div className="admin-grid-two">
                <section className="admin-form-section">
                    <form onSubmit={handleSubmit} className="admin-form shadow-premium">
                        <h3 className="form-title">{editingId ? 'Editar Contato' : 'Adicionar Novo Contato'}</h3>

                        <div className="form-group">
                            <label><User size={14} className="inline mr-1" /> Nome do Responsável</label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Ex: Diretor Comercial"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><Phone size={14} className="inline mr-1" /> Número WhatsApp (com DDD)</label>
                            <input
                                type="text"
                                name="numero"
                                value={formData.numero}
                                onChange={handleChange}
                                placeholder="Ex: 5521989248813"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label><MessageSquare size={14} className="inline mr-1" /> Mensagem Padrão</label>
                            <textarea
                                name="mensagem_padrao"
                                value={formData.mensagem_padrao}
                                onChange={handleChange}
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-actions mt-4">
                            <button type="submit" className="btn-save" disabled={actionLoading}>
                                {actionLoading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? <Save size={18} /> : <Plus size={18} />)}
                                <span className="ml-2">{editingId ? 'Atualizar' : 'Adicionar'}</span>
                            </button>
                            {editingId && (
                                <button type="button" className="btn-cancel ml-2" onClick={() => { setEditingId(null); setFormData({ nome: '', numero: '', mensagem_padrao: 'Quero Falar com o Diretor Comercial e Head PR sobre a proposta!' }); }}>
                                    Cancelar
                                </button>
                            )}
                        </div>

                        {status === 'success_add' && <p className="status-msg success mt-4">Contato adicionado!</p>}
                        {status === 'success_edit' && <p className="status-msg success mt-4">Contato atualizado!</p>}
                        {status === 'error' && <p className="status-msg error mt-4">Erro ao salvar.</p>}
                    </form>
                </section>

                <section className="admin-list-section">
                    {loading ? (
                        <div className="flex-center p-8"><Loader2 className="animate-spin text-accent" /></div>
                    ) : (
                        <div className="admin-table-wrapper shadow-premium">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Número</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.map(c => (
                                        <tr key={c.id}>
                                            <td><strong>{c.nome}</strong></td>
                                            <td className="text-muted">{c.numero}</td>
                                            <td className="actions-cell">
                                                <button onClick={() => handleEdit(c)} className="btn-icon edit"><Save size={16} /></button>
                                                <button onClick={() => handleDelete(c.id)} className="btn-icon delete ml-2"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {contacts.length === 0 && <tr><td colSpan="3" className="text-center p-4">Nenhum contato.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default WhatsAppManager;

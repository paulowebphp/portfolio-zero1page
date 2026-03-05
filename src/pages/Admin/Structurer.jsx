import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Layout, Database, Zap, Globe } from 'lucide-react';
import globalAuthorityData from '../../data/global_authority.json';

const Structurer = () => {
    const [data, setData] = useState(globalAuthorityData);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('projects');

    const handleSave = () => {
        setLoading(true);
        console.log('Dados para salvar no local JSON:', data);
        // Nota: Como não podemos salvar arquivos locais, aqui mostraríamos o JSON 
        // ou enviaríamos para uma API/GitHub se tivéssemos integração.
        // Para agora, simulamos o sucesso.
        setTimeout(() => {
            setLoading(false);
            alert('Estrutura atualizada! (Nota: Em modo estático, você precisa me enviar o JSON gerado para eu salvar no arquivo).');
        }, 1000);
    };

    const addItem = (category) => {
        const newItem = category === 'projects'
            ? { id: Date.now().toString(), title: 'Novo Case', tags: [], intro: '', items: [] }
            : { id: Date.now().toString(), title: 'Novo Projeto', image: '', description: '' };

        setData(prev => ({
            ...prev,
            [category]: [newItem, ...prev[category]]
        }));
    };

    const removeItem = (category, id) => {
        setData(prev => ({
            ...prev,
            [category]: prev[category].filter(item => item.id !== id)
        }));
    };

    return (
        <div className="admin-page">
            <header className="page-header">
                <h1>Painel <span>Estruturador Visual</span></h1>
                <p>Gerencie o conteúdo de autoridade exibido em todas as propostas.</p>
            </header>

            <div className="structurer-tabs">
                <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')}><Database size={16} /> Cases de Sucesso</button>
                <button className={activeTab === 'conceptual' ? 'active' : ''} onClick={() => setActiveTab('conceptual')}><Layout size={16} /> Projetos Conceituais</button>
                <button className={activeTab === 'traffic' ? 'active' : ''} onClick={() => setActiveTab('traffic')}><Globe size={16} /> Tráfego Pago</button>
                <button className={activeTab === 'automation' ? 'active' : ''} onClick={() => setActiveTab('automation')}><Zap size={16} /> Automação</button>
            </div>

            <div className="structurer-content shadow-premium">
                <div className="content-header">
                    <h3>Visualizando: {activeTab.toUpperCase()}</h3>
                    <button onClick={() => addItem(activeTab)} className="btn-add"><Plus size={16} /> Adicionar Item</button>
                </div>

                <div className="items-editor">
                    {data[activeTab].map((item, index) => (
                        <div key={item.id} className="editor-card">
                            <div className="card-header">
                                <span>ITEM #{index + 1}</span>
                                <button onClick={() => removeItem(activeTab, item.id)} className="btn-remove"><Trash2 size={16} /></button>
                            </div>
                            <div className="card-body">
                                <input
                                    type="text"
                                    value={item.title}
                                    placeholder="Título"
                                    onChange={(e) => {
                                        const newData = { ...data };
                                        newData[activeTab][index].title = e.target.value;
                                        setData(newData);
                                    }}
                                />
                                <textarea
                                    value={item.description || item.intro}
                                    placeholder="Descrição/Intro"
                                    onChange={(e) => {
                                        const newData = { ...data };
                                        if (activeTab === 'projects') newData[activeTab][index].intro = e.target.value;
                                        else newData[activeTab][index].description = e.target.value;
                                        setData(newData);
                                    }}
                                ></textarea>
                                {activeTab !== 'projects' && (
                                    <input
                                        type="text"
                                        value={item.image}
                                        placeholder="URL da Imagem"
                                        onChange={(e) => {
                                            const newData = { ...data };
                                            newData[activeTab][index].image = e.target.value;
                                            setData(newData);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="form-actions border-top mt-6 pt-4">
                    <button onClick={handleSave} className="btn-save" disabled={loading}>
                        <Save size={20} />
                        <span>{loading ? 'Preparando...' : 'Salvar Estrutura Global'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Structurer;

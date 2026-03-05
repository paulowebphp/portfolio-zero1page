import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;
            navigate('/admin');
        } catch (err) {
            setError('E-mail ou senha incorretos.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card shadow-premium">
                <div className="login-header">
                    <div className="login-logo">
                        <Lock size={32} className="text-accent" />
                    </div>
                    <h1>Admin <span>Login</span></h1>
                    <p>Entre para gerenciar suas propostas.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label><Mail size={16} className="inline mr-2" /> E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    <div className="form-group mt-4">
                        <label><Lock size={16} className="inline mr-2" /> Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="status-msg error mt-4">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn-save w-full mt-6" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Painel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

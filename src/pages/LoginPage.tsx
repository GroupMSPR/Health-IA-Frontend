import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isAxiosError } from 'axios';

export default function Login() {
    const [email, setEmail] = useState('john.doe@example.com');
    const [password, setPassword] = useState('password');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            if (isAxiosError(err) && err.response?.status === 401) {
                setError('Email ou mot de passe incorrect.');
            } else {
                setError('Une erreur réseau est survenue. Le serveur est-il allumé ?');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
                
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Activity size={32} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Health AI Coach
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Connectez-vous à votre espace
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-slate-300 bg-slate-50 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-semibold text-slate-700">
                                    Mot de passe
                                </label>
                                <Link to="/forgot-password" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-slate-300 bg-slate-50 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                        Pas encore de compte ?{' '}
                        <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            S'inscrire
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
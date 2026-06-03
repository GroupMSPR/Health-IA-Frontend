import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 422) {
                    setError(err.response.data.message || 'Vérifiez vos identifiants.');
                } else if (err.response?.status === 401) {
                    setError('Email ou mot de passe incorrect.');
                } else {
                    setError('Une erreur réseau est survenue. Le serveur est-il allumé ?');
                }
            } else {
                setError('Une erreur inattendue est survenue.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full space-y-8">
                
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Health AI Coach</h2>
                    <p className="text-sm text-gray-500 mt-2">Connectez-vous à votre espace</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email" required value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                        <input
                            type="password" required value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit" disabled={isSubmitting}
                        className="w-full bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 flex justify-center disabled:opacity-50"
                    >
                        {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
}
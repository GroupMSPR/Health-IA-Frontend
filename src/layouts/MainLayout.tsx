import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Home, Activity, Dumbbell, Apple, Camera, User, LogOut, Lightbulb, Sparkles, Settings, ChartColumnIncreasing } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../lib/axios';

const NAV_CATEGORIES = [
    {
        title: "MAIN",
        items: [
            { name: "Dashboard", path: "/dashboard", icon: Home },
            { name: "Stats", path: "/statistics", icon: ChartColumnIncreasing },
            { name: "My Metrics", path: "/my-metrics", icon: Activity },
        ]
    },
    {
        title: "TRAINING",
        items: [
            { name: "Exercises", path: "/exercises", icon: Dumbbell },
            { name: "Recommendations", path: "/exercises-recommendations", icon: Lightbulb, isAi: true },
        ]
    },
    {
        title: "NUTRITION",
        items: [
            { name: "Foods", path: "/foods", icon: Apple },
            { name: "Scan Food", path: "/food-scan", icon: Camera, isAi: true },
        ]
    },
    {
        title: "ACCOUNT",
        items: [
            { name: "Profile", path: "/account/profile", icon: User },
            { name: "Settings", path: "/account/settings", icon: Settings },
        ]
    }
];

export default function MainLayout() {
    const { user, logout } = useAuth();

    const [planLabel, setPlanLabel] = useState('Membre');

    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        const fetchPlan = async () => {
            try {
                const res = await axios.post('/api/users/search', {
                    search: {
                        filters: [{ field: 'id', operator: '=', value: user.id }],
                        includes: [{ relation: 'subscriptions' }],
                    },
                });
                if (cancelled) return;

                const profile = res.data?.data?.[0] ?? res.data?.[0] ?? null;
                const subscriptions = (profile?.subscriptions ?? []) as { subscription_type?: string }[];
                if (subscriptions.length) {
                    const premium = subscriptions.find((s) => /premium/i.test(s.subscription_type ?? ''));
                    const type = (premium ?? subscriptions[0]).subscription_type ?? '';
                    setPlanLabel(type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Membre');
                } else {
                    setPlanLabel('Membre');
                }
            } catch (error) {
                console.error('Erreur lors du chargement de l’abonnement :', error);
            }
        };

        fetchPlan();
        return () => {
            cancelled = true;
        };
    }, [user]);

    const mobileNavItems = [
        { name: "Home", path: "/dashboard", icon: Home },
        { name: "Metrics", path: "/my-metrics", icon: Activity },
        { name: "Scan", path: "/food-scan", icon: Camera, isPrimary: true },
        { name: "Exercises", path: "/exercises", icon: Dumbbell },
        { name: "Foods", path: "/foods", icon: Apple },
        
    ];

    const userInitials = user 
        ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() 
        : 'U';

    return (
        <div className="min-h-screen bg-slate-50 flex">
            
            {/* DESKTOP & TABLETTE */}
            <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-100 z-50 transition-all duration-300 w-20 lg:w-64">
                
                <Link 
                    to="/dashboard" 
                    aria-label="Retour à l'accueil Health AI Coach"
                    className="w-full h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-50 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600 shrink-0">
                        <Activity className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-xl text-slate-900 tracking-tight whitespace-nowrap">
                        Health AI Coach
                    </span>
                </Link>

                <nav className="flex-1 overflow-y-auto py-6 px-2 lg:px-4 custom-scrollbar">
                    {NAV_CATEGORIES.map((category, index) => (
                        <div key={index} className="mb-8">
                            <h2 className="hidden lg:block text-md text-slate-500 uppercase tracking-wider mb-3 px-3">
                                {category.title}
                            </h2>
                            
                            <ul className="space-y-1.5">
                                {category.items.map((item) => (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            aria-label={item.name}
                                            className={({ isActive }) => `
                                                relative flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-2.5 rounded-xl transition-all font-medium text-sm
                                                ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                            `}
                                        >
                                            <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                                            <span className="hidden lg:block truncate">{item.name}</span>
                                            
                                            {item.isAi && (
                                                <Sparkles 
                                                    className="absolute top-2 right-2 lg:static lg:ml-auto h-3.5 w-3.5 text-[#7B3FF2] " 
                                                    aria-hidden="true" 
                                                />
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                        <Link
                            to="/account/profile"
                            aria-label="Voir mon profil"
                            className="h-10 w-10 rounded-full bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            {userInitials}
                        </Link>
                        <div className="hidden lg:block flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-slate-500 truncate">{planLabel}</p>
                        </div>
                        <button onClick={logout} aria-label="Se déconnecter" className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-64 pb-20 md:pb-0 transition-all duration-300">
                <header className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40">
                    <Link 
                        to="/dashboard" 
                        aria-label="Retour à l'accueil"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1 -ml-1"
                    >
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600 shrink-0">
                            <Activity className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
                        </div>
                        <span className="font-bold text-lg text-slate-900">Health AI Coach</span>
                    </Link>
                    <Link
                        to="/account/profile"
                        aria-label="Voir mon profil"
                        className="h-8 w-8 rounded-full bg-[#7B3FF2] text-white flex items-center justify-center font-bold text-xs shadow-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        {userInitials}
                    </Link>
                </header>

                <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>

            {/* MOBILE */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <ul className="flex justify-around items-end h-16">
                    {mobileNavItems.map((item) => (
                        <li key={item.path} className="flex-1 relative h-full">
                            {item.isPrimary ? (
                                <NavLink
                                    to={item.path}
                                    aria-label={item.name}
                                    className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center justify-center bg-gradient-to-r from-[#4A6BF0] to-[#7B3FF2] p-4 rounded-full shadow-lg ring-4 ring-white text-white transition-transform active:scale-95 z-50"
                                >
                                    <item.icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                                </NavLink>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    aria-label={item.name}
                                    className={({ isActive }) => `
                                        flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                                        ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <div className="relative flex flex-col items-center">
                                            <item.icon 
                                                className={`h-5 w-5 mb-1 transition-transform ${isActive ? 'scale-110' : ''}`} 
                                                strokeWidth={isActive ? 2.5 : 2} 
                                                aria-hidden="true" 
                                            />
                                            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                                {item.name}
                                            </span>
                                        </div>
                                    )}
                                </NavLink>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
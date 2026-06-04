import { NavLink, Outlet } from 'react-router-dom';
import { Home, Activity, Dumbbell, Apple, Camera, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NAV_CATEGORIES = [
    {
        title: "MAIN",
        items: [
            { name: "Dashboard", path: "/dashboard", icon: Home },
            { name: "Workouts", path: "/workouts", icon: Activity },
        ]
    },
    {
        title: "TRAINING",
        items: [
            { name: "Exercises", path: "/exercises", icon: Dumbbell },
        ]
    },
    {
        title: "NUTRITION",
        items: [
            { name: "Foods", path: "/foods", icon: Apple },
            { name: "Scan Food", path: "/scan", icon: Camera, isPrimary: true },
        ]
    },
    {
        title: "ACCOUNT",
        items: [
            { name: "Profile", path: "/profile", icon: User },
        ]
    }
];

export default function DashboardLayout() {
    const { user, logout } = useAuth();

    const mobileNavItems = [
        { name: "Home", path: "/dashboard", icon: Home },
        { name: "Exercises", path: "/exercises", icon: Dumbbell },
        { name: "Scan", path: "/scan", icon: Camera, isPrimary: true },
        { name: "Foods", path: "/foods", icon: Apple },
        { name: "Profile", path: "/profile", icon: User },
    ];

    const userInitials = user 
        ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() 
        : 'U';

    return (
        <div className="min-h-screen bg-slate-50 flex">
            
            {/* DESKTOP & TABLETTE */}
            <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 bg-white border-r border-slate-100 z-50 transition-all duration-300 w-20 lg:w-64">
                
                <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-50">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <Activity className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-xl text-slate-900 tracking-tight">Health AI</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 lg:px-4 custom-scrollbar">
                    {NAV_CATEGORIES.map((category, index) => (
                        <div key={index} className="mb-8">
                            <h3 className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">
                                {category.title}
                            </h3>
                            
                            <ul className="space-y-1.5">
                                {category.items.map((item) => (
                                    <li key={item.path}>
                                        <NavLink
                                            to={item.path}
                                            aria-label={item.name}
                                            className={({ isActive }) => `
                                                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-sm
                                                ${isActive 
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                }
                                                ${item.isPrimary ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:text-white' : ''}
                                            `}
                                        >
                                            <item.icon 
                                                className={`h-5 w-5 shrink-0 ${item.isPrimary ? 'text-white' : ''}`} 
                                                strokeWidth={2} 
                                                aria-hidden="true" 
                                            />
                                            <span className="hidden lg:block truncate">{item.name}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* User Profile (Desktop/Tablet) */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#7B3FF2] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                            {userInitials}
                        </div>
                        <div className="hidden lg:block flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">Membre Premium</p>
                        </div>
                        <button 
                            onClick={logout}
                            aria-label="Se déconnecter"
                            className="hidden lg:flex p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0 md:ml-20 lg:ml-64 pb-20 md:pb-0 transition-all duration-300">
                
                {/* Mobile */}
                <header className="md:hidden h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                            <Activity className="h-5 w-5" strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-lg text-slate-900">Health AI</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-[#7B3FF2] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {userInitials}
                    </div>
                </header>

                <div className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>

            {/* NAVIGATION (MOBILE) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 px-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <ul className="flex justify-around items-end h-16">
                    {mobileNavItems.map((item) => (
                        <li key={item.path} className="flex-1 relative">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) => `
                                    flex flex-col items-center justify-center w-full h-full gap-1 transition-colors
                                    ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {item.isPrimary ? (
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4A6BF0] to-[#7B3FF2] p-3.5 rounded-full shadow-lg border-4 border-slate-50 text-white">
                                                <item.icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <item.icon 
                                                    className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`} 
                                                    strokeWidth={isActive ? 2.5 : 2} 
                                                    aria-hidden="true" 
                                                />
                                                {isActive && <span className="absolute -top-1 -right-1 h-1.5 w-1.5 bg-blue-600 rounded-full" />}
                                            </div>
                                        )}
                                        {!item.isPrimary && (
                                            <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                                {item.name}
                                            </span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
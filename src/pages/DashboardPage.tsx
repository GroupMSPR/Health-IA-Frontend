import { useAuth } from '../contexts/AuthContext';
import { Activity, Flame, Dumbbell, Target, TrendingUp, Clock, Zap, Camera, Apple, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function DashboardPage() {
    const { user } = useAuth();

    const stats = [
        { id: 1, name: 'Minutes actives', value: '248', change: '+12%', changeType: 'positive', icon: Activity, color: 'text-blue-700', bgColor: 'bg-blue-50' },
        { id: 2, name: 'Calories brûlées', value: '2 340', change: '+8%', changeType: 'positive', icon: Flame, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 3, name: 'Objectifs atteints', value: '18/20', change: '90%', changeType: 'neutral', icon: Target, color: 'text-purple-700', bgColor: 'bg-purple-50' },
        { id: 4, name: 'Progression hebdo', value: '85%', change: '+5%', changeType: 'positive', icon: TrendingUp, color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
    ];

    const workouts = [
        { id: 1, title: 'Cardio HIIT Extrême', duration: '30 min', intensity: 'Élevée', image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=600&h=400' },
        { id: 2, title: 'Renforcement Musculaire', duration: '45 min', intensity: 'Moyenne', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=600&h=400' },
        { id: 3, title: 'Endurance Rameur', duration: '25 min', intensity: 'Moyenne', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600&h=400' },
    ];

    const chartData = {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        datasets: [
            {
                label: 'Calories',
                data: [2100, 2600, 2200, 2800, 2400, 3000, 2500],
                borderColor: '#7B3FF2',
                backgroundColor: 'rgba(123, 63, 242, 0.05)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#7B3FF2',
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: 'Pas',
                data: [5000, 7000, 6000, 8000, 5500, 9000, 7500],
                borderColor: '#3b82f6',
                borderWidth: 3,
                tension: 0.4,
                pointRadius: 0,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { 
                display: true, 
                border: { display: false },
                grid: { color: '#f1f5f9' },
                ticks: { color: '#64748b', font: { size: 11 } }
            },
            x: { 
                border: { display: false },
                grid: { display: false },
                ticks: { color: '#64748b', font: { size: 11 } }
            }
        },
        interaction: { mode: 'index' as const, intersect: false },
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            <header>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Bonjour, {user?.first_name || 'Alex'} !
                </h1>
                <p className="mt-2 text-slate-600 font-medium">
                    Voici ton résumé fitness du jour.
                </p>
            </header>

            <section aria-labelledby="stats-heading">
                <h2 id="stats-heading" className="sr-only">Tes statistiques de la journée</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat) => (
                        <div key={stat.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-2xl ${stat.bgColor} ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                                </div>
                                <span className={`text-sm font-bold ${stat.changeType === 'positive' ? 'text-emerald-700' : 'text-emerald-700'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-600 mb-1">{stat.name}</h3>
                                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section aria-labelledby="workout-heading">
                <div className="flex items-center justify-between mb-4">
                    <h2 id="workout-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Dumbbell className="h-5 w-5 text-blue-600" aria-hidden="true" />
                        Ton programme du jour
                    </h2>
                    <Link to="/exercises/recommendations" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                        Voir tout <ChevronRight className="h-4 w-4 ml-0.5" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-4 sm:gap-6 pb-4 lg:pb-0 snap-x snap-mandatory hide-scrollbar">
                    {workouts.map((workout) => (
                        <article 
                            key={workout.id} 
                            className="relative flex-none w-[85vw] sm:w-[320px] lg:w-auto h-48 sm:h-56 rounded-3xl overflow-hidden group snap-center cursor-pointer shadow-sm hover:shadow-md transition-shadow bg-slate-900"
                        >
                            <img src={workout.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" aria-hidden="true" />
                            
                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                                <h3 className="text-lg sm:text-xl font-bold mb-3 tracking-tight">{workout.title}</h3>
                                <div className="flex items-center gap-4 text-sm font-medium opacity-90">
                                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {workout.duration}</span>
                                    <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> {workout.intensity}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* --- GRAPH CHART.JS --- */}
                <section className="xl:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col" aria-labelledby="chart-heading">
                    <div className="flex items-center justify-between mb-8">
                        <h2 id="chart-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" aria-hidden="true" />
                            Évolution de la semaine
                        </h2>
                        <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="flex items-center gap-1.5 text-slate-700">
                                <span className="h-3 w-3 rounded-full bg-[#7B3FF2]" aria-hidden="true"></span> Calories
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-700">
                                <span className="h-3 w-3 rounded-full bg-blue-500" aria-hidden="true"></span> Pas
                            </span>
                        </div>
                    </div>

                    <div className="relative h-64 w-full flex-1">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </section>

                {/* --- ACTIONS RAPIDES --- */}
                <section className="space-y-4 sm:space-y-6 flex flex-col justify-between" aria-labelledby="actions-heading">
                    <h2 id="actions-heading" className="sr-only">Actions rapides</h2>

                    <Link to="/exercises" className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                        <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                            <Dumbbell className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">Bibliothèque d'exercices</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-medium">Gérer le catalogue</p>
                        </div>
                    </Link>

                    <Link to="/foods" className="flex-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex items-center gap-4">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                            <Apple className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">Bibliothèque d'aliments</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-medium">Gérer les macros</p>
                        </div>
                    </Link>

                    <Link to="/food/scan" className="flex-1 bg-gradient-to-br from-[#4A6BF0] to-[#7B3FF2] p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all group relative overflow-hidden flex items-center gap-4">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl text-white group-hover:scale-110 transition-transform relative z-10">
                            <Camera className="h-7 w-7" strokeWidth={2} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg text-white">Scanner un repas</h3>
                            <p className="text-sm text-blue-100 mt-0.5 font-medium">Analyse par IA</p>
                        </div>
                    </Link>
                </section>
            </div>
        </div>
    );
}
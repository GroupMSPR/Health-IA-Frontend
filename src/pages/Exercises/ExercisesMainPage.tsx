import { useState } from 'react';
import { Search, Plus, Clock, Flame, Zap, CheckSquare, Square, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Exercise {
    id: number;
    title: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    calories: number;
    specs: string;
}

const mockExercises: Exercise[] = [
    { id: 1, title: 'Barbell Squat', difficulty: 'Intermediate', duration: '45 min', calories: 320, specs: '4x8-10' },
    { id: 2, title: 'Bench Press', difficulty: 'Intermediate', duration: '40 min', calories: 280, specs: '4x8-12' },
    { id: 3, title: 'Pull-ups', difficulty: 'Advanced', duration: '30 min', calories: 240, specs: '3x6-10' },
    { id: 4, title: 'Deadlift', difficulty: 'Advanced', duration: '50 min', calories: 400, specs: '3x5-8' },
    { id: 5, title: 'Box Jump HIIT', difficulty: 'Advanced', duration: '25 min', calories: 480, specs: '4x10' },
    { id: 6, title: 'Cycling', difficulty: 'Beginner', duration: '45 min', calories: 380, specs: '1x45 min' },
    { id: 7, title: 'Yoga Flow', difficulty: 'Beginner', duration: '30 min', calories: 140, specs: '1x30 min' },
    { id: 8, title: 'Plank Circuit', difficulty: 'Intermediate', duration: '20 min', calories: 200, specs: '3x60s' },
    { id: 9, title: 'Lunges', difficulty: 'Beginner', duration: '20 min', calories: 150, specs: '3x12' },
    { id: 10, title: 'Overhead Press', difficulty: 'Intermediate', duration: '35 min', calories: 220, specs: '4x8' },
];

const filters = ['All', 'Strength', 'Cardio', 'HIIT', 'Flexibility', 'Balance'];

export default function ExercisesPage() {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const toggleSelectMode = () => {
        setIsSelectMode(!isSelectMode);
        setSelectedIds([]);
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === currentItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(currentItems.map(ex => ex.id));
        }
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = mockExercises.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(mockExercises.length / itemsPerPage);

    const getDifficultyStyles = (difficulty: Exercise['difficulty']) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-emerald-100 text-emerald-800';
            case 'Intermediate': return 'bg-blue-100 text-blue-800';
            case 'Advanced': return 'bg-purple-100 text-purple-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <main className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            {/* EN-TÊTE */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Exercises
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500" aria-live="polite">
                        {mockExercises.length} exercises in your library
                    </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">

                    {isSelectMode && selectedIds.length > 0 && (
                        <button 
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            aria-label={`Delete ${selectedIds.length} selected exercises`}
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Delete ({selectedIds.length})</span>
                        </button>
                    )}

                    {isSelectMode && (
                        <button 
                            onClick={toggleSelectAll}
                            className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                        >
                            {selectedIds.length === currentItems.length ? (
                                <CheckSquare className="h-4 w-4 text-[#7B3FF2]" aria-hidden="true" />
                            ) : (
                                <Square className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">
                                {selectedIds.length === currentItems.length ? 'Deselect All' : 'Select All'}
                            </span>
                        </button>
                    )}

                    <button 
                        onClick={toggleSelectMode}
                        className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-colors text-sm font-bold border focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                            isSelectMode 
                            ? 'bg-slate-800 border-slate-800 text-white hover:bg-slate-700' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        aria-pressed={isSelectMode}
                    >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">{isSelectMode ? 'Cancel' : 'Select'}</span>
                    </button>

                    <Link
                        to="/exercises/create"
                        className="flex items-center justify-center bg-[#7B3FF2] hover:bg-[#6830d1] text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7B3FF2] sm:px-4 sm:py-2.5 rounded-xl w-10 h-10 sm:w-auto sm:h-auto shadow-sm"
                        aria-label="Add a new exercise"
                    >
                        <Plus className="h-5 w-5 sm:mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline font-bold text-sm">Add Exercise</span>
                    </Link>
                </div>
            </header>

            {/* RECHERCHE */}
            <section aria-label="Search and filter" className="space-y-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <input
                        type="search"
                        placeholder="Search exercises or muscles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] transition-colors shadow-sm"
                    />
                </div>

                <div 
                    className="flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar"
                    role="tablist"
                >
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            role="tab"
                            aria-selected={activeFilter === filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] ${
                                activeFilter === filter
                                    ? 'bg-[#4A6BF0] text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* GRILLE */}
            <section aria-label="Exercise list">
                <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {currentItems.map((exercise) => {
                        const isSelected = selectedIds.includes(exercise.id);

                        return (
                            <li key={exercise.id} className="relative">
                                {isSelectMode ? (
                                    <button
                                        onClick={() => toggleSelection(exercise.id)}
                                        className={`w-full text-left block h-full bg-white p-4 sm:p-5 rounded-2xl border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2 ${
                                            isSelected ? 'border-[#7B3FF2] shadow-md bg-blue-50/30' : 'border-slate-100 shadow-sm hover:border-slate-200'
                                        }`}
                                        aria-pressed={isSelected}
                                    >
                                        <CardContent exercise={exercise} isSelected={isSelected} isSelectMode={isSelectMode} getDifficultyStyles={getDifficultyStyles} />
                                    </button>
                                ) : (
                                    <Link 
                                        to={`/exercises/${exercise.id}`}
                                        className="block h-full bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] focus-visible:ring-offset-2"
                                    >
                                        <CardContent exercise={exercise} isSelected={false} isSelectMode={false} getDifficultyStyles={getDifficultyStyles} />
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </section>

            {/* FOOTER & PAGINATION */}
            <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-6 mt-8 pb-8">
                <p className="text-sm text-slate-500 font-medium">
                    Showing <span className="font-bold text-slate-900">{indexOfFirstItem + 1}</span> to <span className="font-bold text-slate-900">{Math.min(indexOfLastItem, mockExercises.length)}</span> of <span className="font-bold text-slate-900">{mockExercises.length}</span> results
                </p>

                <nav aria-label="Pagination" className="inline-flex rounded-xl shadow-sm bg-white border border-slate-200 overflow-hidden">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border-r border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-slate-50"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            aria-current={currentPage === page ? "page" : undefined}
                            className={`px-4 py-2 border-r border-slate-200 text-sm font-bold focus:outline-none transition-colors ${
                                currentPage === page 
                                ? 'bg-[#4A6BF0] text-white' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:bg-slate-50"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </nav>
            </footer>
        </main>
    );
}

function CardContent({ 
    exercise, 
    isSelected, 
    isSelectMode, 
    getDifficultyStyles 
}: { 
    exercise: Exercise, 
    isSelected: boolean, 
    isSelectMode: boolean, 
    getDifficultyStyles: (d: Exercise['difficulty']) => string 
}) {
    return (
        <>
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate pr-2">
                    {exercise.title}
                </h2>
                {isSelectMode && (
                    <div className={`shrink-0 rounded flex items-center justify-center transition-colors ${
                        isSelected ? 'text-[#7B3FF2]' : 'text-slate-300'
                    }`}>
                        {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </div>
                )}
            </div>
            
            <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold mb-4 ${getDifficultyStyles(exercise.difficulty)}`}>
                {exercise.difficulty}
            </span>

            <div className="flex items-center gap-3 sm:gap-4 text-slate-500 text-[10px] sm:text-xs font-medium">
                <div className="flex items-center gap-1" aria-label={`Duration: ${exercise.duration}`}>
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    <span>{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Calories burned: ${exercise.calories}`}>
                    <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-orange-500" aria-hidden="true" />
                    <span>{exercise.calories}</span>
                </div>
                <div className="flex items-center gap-1" aria-label={`Sets and reps: ${exercise.specs}`}>
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" aria-hidden="true" />
                    <span>{exercise.specs}</span>
                </div>
            </div>
        </>
    );
}
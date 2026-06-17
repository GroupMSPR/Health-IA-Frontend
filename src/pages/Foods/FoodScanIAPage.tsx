import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, 
    UploadCloud, 
    Camera, 
    Sparkles, 
    Image as ImageIcon,
    X,
    FileEdit,
    Search,
    Send,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '../../lib/axios'; // <-- Décommenté !

export default function FoodScanIAPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [foodQuery, setFoodQuery] = useState('');
    
    const [showTextAnalysis, setShowTextAnalysis] = useState(false);
    
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    useEffect(() => {
        if (isCameraActive && videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [isCameraActive, stream]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("L'image est trop volumineuse. La taille maximum est de 5 MB.");
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setShowTextAnalysis(false); 
        }
    };

    const handleClearImage = () => {
        setSelectedImage(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (!file.type.startsWith('image/')) {
                toast.error("Veuillez sélectionner un fichier image valide.");
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setShowTextAnalysis(false); 
        }
    };

    const startCamera = async () => {
        setIsCameraActive(true);
        setShowTextAnalysis(false); 
        
        try {
            let mediaStream: MediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
            } catch (err) {
                mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true 
                });
            }
            
            setStream(mediaStream);
            
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(e => console.error("Erreur de lecture de la vidéo :", e));
                    };
                }
            }, 100);

        } catch (err) {
            console.error("Erreur d'accès à la caméra:", err);
            toast.error("Impossible d'accéder à la caméra. Vérifiez les permissions de votre navigateur.");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                toast.error("La caméra s'initialise, veuillez patienter une seconde...");
                return;
            }
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob((blob) => {
                    if (blob) {
                        const file = new File([blob], "capture-ia.jpg", { type: "image/jpeg" });
                        setSelectedImage(file);
                        setPreviewUrl(URL.createObjectURL(file));
                        stopCamera();
                    } else {
                        toast.error("Une erreur est survenue lors de la capture.");
                    }
                }, 'image/jpeg', 0.9);
            }
        }
    };

    // --- SOUMISSION À L'IA (IMAGE) ---
    const handleScanSubmit = async () => {
        if (!selectedImage) return;

        setIsScanning(true);
        
        try {
            const formData = new FormData();
            formData.append('image', selectedImage);

            const response = await axios.post('/api/ai/analyze-meal', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // On récupère le résultat envoyé par le SDK-IA
            const aiResult = response.data.data || response.data;

            toast.success("Analyse terminée !");
            // On passe aiResult ET l'URL de l'image scannée pour l'afficher sur la page suivante
            navigate('/food-scan/result', { state: { aiResult, scannedImageUrl: previewUrl } });
            
        } catch (error) {
            console.error("Erreur de l'IA:", error);
            toast.error("Impossible d'analyser l'aliment. Vérifiez votre connexion.");
        } finally {
            setIsScanning(false);
        }
    };

    // --- SOUMISSION À L'IA (TEXTE) ---
    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!foodQuery.trim()) return;

        setIsScanning(true);
        
        try {
            // À adapter si ton back attend 'query', 'text', etc.
            const response = await axios.post('/api/ai/analyze-meal', {
                description: foodQuery 
            });
            
            const aiResult = response.data.data || response.data;

            toast.success("Analyse textuelle terminée !");
            navigate('/food-scan/result', { state: { aiResult, scannedImageUrl: null } });
            
        } catch (error) {
            console.error("Erreur de l'IA textuelle:", error);
            toast.error("Impossible d'analyser le texte. Veuillez réessayer.");
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <main className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 mb-12">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
                aria-label="Sélectionner une image à analyser"
            />

            <nav aria-label="Navigation secondaire">
                <Link 
                    to="/foods" 
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#7B3FF2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7B3FF2] rounded-lg p-1 w-fit"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour à l'alimentation</span>
                </Link>
            </nav>

            <header className="text-center space-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-purple-50 text-[#7B3FF2] rounded-2xl mb-2">
                    <Sparkles className="h-8 w-8" />
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Scan Intelligent
                </h1>
                <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm sm:text-base">
                    Prenez en photo votre repas ou un code-barres. L'IA Health-Coach identifiera l'aliment et ses valeurs nutritionnelles.
                </p>
            </header>

            <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8">
                
                {isCameraActive ? (
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[3/4] sm:aspect-video flex items-center justify-center shadow-inner">
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        <div className="absolute inset-0 flex flex-col justify-between p-4">
                            <div className="flex justify-end">
                                <button 
                                    onClick={stopCamera} 
                                    className="p-2 bg-black/40 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <div className="flex justify-center pb-4">
                                <button 
                                    onClick={capturePhoto} 
                                    className="p-4 bg-white hover:bg-slate-200 rounded-full shadow-lg transition-colors border-4 border-slate-300 flex items-center justify-center group"
                                >
                                    <Camera className="h-8 w-8 text-slate-900 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : 
                
                !previewUrl ? (
                    <div 
                        className="border-2 border-dashed border-slate-200 hover:border-[#7B3FF2] bg-slate-50/50 hover:bg-purple-50/30 transition-colors rounded-2xl p-8 sm:p-12 text-center cursor-pointer group"
                        onClick={triggerFileSelect}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <div className="mx-auto w-16 h-16 bg-white border border-slate-100 shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-[#7B3FF2] transition-colors" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                            Appuyez pour importer
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mb-6">
                            ou glissez-déposez une image ici
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); startCamera(); }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors w-full sm:w-auto"
                            >
                                <Camera className="h-4 w-4" />
                                <span>Prendre une photo</span>
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); triggerFileSelect(); }}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-500 text-slate-700 rounded-xl font-bold text-sm transition-colors w-full sm:w-auto"
                            >
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                                <span>Parcourir les fichiers</span>
                            </button>
                        </div>
                    </div>
                ) : 
                
                (
                    <div className="space-y-6">
                        <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[3/4] sm:aspect-video flex items-center justify-center group shadow-inner">
                            <img 
                                src={previewUrl} 
                                alt="Aperçu de l'aliment à scanner" 
                                className="w-full h-full object-cover opacity-90"
                            />
                            
                            {isScanning && (
                                <div className="absolute inset-0 bg-[#7B3FF2]/20 backdrop-blur-[2px] z-10">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-[#7B3FF2] shadow-[0_0_15px_#7B3FF2] animate-scan"></div>
                                </div>
                            )}

                            {!isScanning && (
                                <button 
                                    onClick={handleClearImage}
                                    className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all shadow-sm"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleScanSubmit}
                            disabled={isScanning}
                            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all shadow-sm ${
                                isScanning 
                                    ? 'bg-slate-300 cursor-not-allowed' 
                                    : 'bg-[#7B3FF2] hover:bg-[#6830d1] shadow-[#7B3FF2]/20 hover:shadow-md'
                            }`}
                        >
                            {isScanning ? (
                                <>
                                    <Sparkles className="h-5 w-5 animate-pulse" />
                                    <span>Analyse en cours par l'IA...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    <span>Analyser avec Health-IA</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </section>

            {!isCameraActive && !previewUrl && !showTextAnalysis && (
                <section className="text-center pt-4 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-sm text-slate-500 font-medium mb-3">L'aliment n'est pas reconnu ou vous n'avez pas de photo ?</p>
                    <button 
                        onClick={() => setShowTextAnalysis(true)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:border-slate-500 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                    >
                        <FileEdit className="h-4 w-4 text-slate-400" />
                        <span>Entrer les informations manuellement</span>
                    </button>
                </section>
            )}

            {!isCameraActive && !previewUrl && showTextAnalysis && (
                <div className="space-y-6 animate-in slide-in-from-top-6 fade-in duration-500">
                    <section className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl hidden sm:block">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-slate-900 mb-1">Analyse par description</h2>
                                <p className="text-sm text-slate-500 mb-5">
                                    Pas de photo ? Décrivez simplement votre repas et l'IA estimera ses valeurs nutritionnelles.
                                </p>
                                
                                <form onSubmit={handleTextSubmit} className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={foodQuery}
                                            onChange={(e) => setFoodQuery(e.target.value)}
                                            placeholder="Ex: Un bol de riz avec saumon et avocat..."
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#7B3FF2] focus:ring-1 focus:ring-[#7B3FF2] transition-colors"
                                            disabled={isScanning}
                                            autoFocus 
                                        />
                                    </div>
                                    <button 
                                        type="submit"
                                        disabled={isScanning || !foodQuery.trim()}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isScanning ? (
                                            <Sparkles className="h-4 w-4 animate-pulse" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                        <span className="hidden sm:inline">Rechercher</span>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>

                    <section className="text-center pt-2 pb-4">
                        <Link 
                            to="/food/create" 
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl font-medium text-sm transition-colors"
                        >
                            <FileEdit className="h-4 w-4" />
                            <span className="underline">Créer un aliment manuellement sans utiliser l'IA</span>
                        </Link>
                    </section>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scanLine {
                    0% { top: 0; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scanLine 2s ease-in-out infinite;
                }
            `}} />
        </main>
    );
}
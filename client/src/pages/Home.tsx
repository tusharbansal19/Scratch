import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PenTool, Share2, Users, Zap, Layout, ArrowRight } from 'lucide-react';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const createBoard = async () => {
        setLoading(true);
        try {
            // In a real app we'd call the API, but for demo speed we can just generate a UUID locally or use the API
            const res = await fetch('https://scratch-161f.onrender.com/api/boards', {
                method: 'POST',
            });
            if (!res.ok) throw new Error("Failed to create");
            const data = await res.json();
            navigate(`/board/${data.board_id}`);
        } catch (e) {
            console.error(e);
            // Fallback if API is offline for purely UI demo
            const randomId = Math.random().toString(36).substring(7);
            navigate(`/board/${randomId}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            {/* Navbar */}
            <nav className="border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <PenTool size={20} />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Scratch</span>
                    </div>
                    <div className="flex gap-4">
                        <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Log In</button>
                        <button className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">Sign Up</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-8 border border-indigo-100">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Now with Real-time Infinite Canvas
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                        Brainstorm, Draw, & <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Collaborate Live.</span>
                    </h1>

                    <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        The industry-standard whiteboard for engineering teams, designers, and educators.
                        No sign-up required for quick sessions.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={createBoard}
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-indigo-200"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Zap size={20} fill="currentColor" />}
                            Start Whiteboard Now
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2 transition-all">
                            View Demo <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Share2 className="text-indigo-600" />,
                            title: "Instant Sharing",
                            desc: "Just send the link. No accounts or downloads required for your team to join."
                        },
                        {
                            icon: <Layout className="text-violet-600" />,
                            title: "Infinite Canvas",
                            desc: "Never run out of space. Pan and zoom across an endless digital whiteboard."
                        },
                        {
                            icon: <Users className="text-blue-600" />,
                            title: "Multiplayer Sync",
                            desc: "See everyone's cursor and drawings in real-time with sub-100ms latency."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

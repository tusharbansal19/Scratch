import { useParams, Link } from 'react-router-dom';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { Share2, PenTool, MoreHorizontal, Download, Check } from 'lucide-react';
import { useState } from 'react';
import { useBoardStore } from '../store/boardState';
import { useSelector } from 'react-redux';
import { useAuthStore } from '../store/authStore';
import type { RootState } from '../store';

export default function BoardPage() {
    const { boardId } = useParams();
    const [copied, setCopied] = useState(false);
    const { backgroundColor } = useBoardStore();
    const [showUsers, setShowUsers] = useState(false);

    // Get Redux & Auth state for Avatar Stack
    const cursors = useSelector((state: RootState) => state.board.cursors);
    const { user } = useAuthStore();

    const isDark = backgroundColor === '#1e1e1e';

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!boardId) return <div>Invalid Board ID</div>;

    return (
        <div className="w-screen h-screen overflow-hidden flex flex-col transition-colors duration-500" style={{ backgroundColor }}>
            {/* Floating Header */}
            <header className="absolute top-0 left-0 right-0 h-auto sm:h-16 px-2 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between z-30 pointer-events-none gap-2 sm:gap-0 pt-2 sm:pt-0">

                {/* Left: Brand & Board Info */}
                <div className={`
             flex items-center gap-2 sm:gap-4 p-2 pl-3 sm:pl-4 pr-4 sm:pr-6 rounded-2xl shadow-sm border pointer-events-auto mt-2 sm:mt-4 ml-2 sm:ml-4
             backdrop-blur-md transition-colors duration-300 transform scale-90 sm:scale-100 origin-top-left
             ${isDark ? 'bg-[#2a2a2a]/90 border-zinc-700' : 'bg-white/90 border-slate-200/50'}
        `}>
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-indigo-500/20 shadow-lg group-hover:scale-105 transition-transform">
                            <PenTool size={16} />
                        </div>
                        <span className={`font-bold ${isDark ? 'text-gray-100' : 'text-slate-800'}`}>Scratch</span>
                    </Link>
                    <div className={`w-px h-5 ${isDark ? 'bg-zinc-700' : 'bg-slate-200'} hidden sm:block`}></div>
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold leading-none ${isDark ? 'text-gray-200' : 'text-slate-900'}`}>Untitled Board</span>
                        <span className={`text-[10px] font-medium ${isDark ? 'text-zinc-500' : 'text-slate-500'}`}>Auto-saving...</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className={`
             flex items-center gap-2 sm:gap-3 p-2 rounded-2xl shadow-sm border pointer-events-auto mt-2 sm:mt-4 mr-2 sm:mr-4 ml-auto sm:ml-0
             backdrop-blur-md transition-colors duration-300 transform scale-90 sm:scale-100 origin-top-right
             ${isDark ? 'bg-[#2a2a2a]/90 border-zinc-700' : 'bg-white/90 border-slate-200/50'}
        `}>
                    {/* Avatars (Functional) */}
                    <div className="relative mr-2 sm:mr-4">
                        <div
                            onClick={() => setShowUsers(!showUsers)}
                            className="flex items-center -space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                            {/* Me (You) */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-[#1e1e1e] ring-2 ring-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm z-30" title="You">
                                You
                            </div>

                            {/* Remote Users */}
                            {Object.values(cursors).slice(0, 3).map((cursor: any, idx) => (
                                <div
                                    key={idx}
                                    className="w-8 h-8 rounded-full border-2 border-[#1e1e1e] flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-20"
                                    style={{ backgroundColor: cursor.color }}
                                    title={cursor.name}
                                >
                                    {cursor.name ? cursor.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            ))}

                            {/* Overflow */}
                            {Object.keys(cursors).length > 3 && (
                                <div className="w-8 h-8 rounded-full border-2 border-[#1e1e1e] bg-gray-700 flex items-center justify-center text-white text-[10px] font-bold shadow-lg z-10">
                                    +{Object.keys(cursors).length - 3}
                                </div>
                            )}
                        </div>

                        {/* Dropdown */}
                        {showUsers && (
                            <div className="absolute top-full right-0 mt-3 bg-[#1e1e1e]/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-4 min-w-[240px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="flex items-center justify-between border-b border-gray-700/50 pb-2 mb-1">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Online Users</span>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{Object.keys(cursors).length + 1}</span>
                                </div>

                                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {/* Me */}
                                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">You</div>
                                        <span className="text-blue-100 text-sm font-medium">{user?.full_name || 'Guest'} (You)</span>
                                    </div>

                                    {/* Others */}
                                    {Object.values(cursors).map((cursor: any, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm" style={{ backgroundColor: cursor.color }}>
                                                {cursor.name ? cursor.name.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <span className="text-gray-300 text-sm font-medium">{cursor.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={copyLink}
                        className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
                    >
                        {copied ? <Check size={16} /> : <Share2 size={16} />}
                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
                    </button>

                    <div className={`w-px h-5 ${isDark ? 'bg-zinc-700' : 'bg-slate-200'}`}></div>

                    <button className={`p-2 rounded-lg transition-colors hidden sm:block ${isDark ? 'text-gray-400 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <Download size={20} />
                    </button>
                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-zinc-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                        <MoreHorizontal size={20} />
                    </button>
                </div>
            </header>

            {/* Main Canvas Area */}
            <div className="flex-1 relative">
                <Canvas boardId={boardId} />
                <Toolbar />
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setTool, setColor, setBackgroundColor, triggerClearBoard, type ToolType, type BackgroundType } from '../store/boardSlice';
import {
    Square, Circle, Minus, MousePointer2, Eraser,
    Hand,
    Moon, Sun, Monitor, Scissors, Palette, X, Trash2
} from 'lucide-react';

export default function Toolbar() {
    const dispatch = useDispatch();
    const { tool, color, backgroundColor } = useSelector((state: RootState) => state.board);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Helper dispatcher functions
    const handleSetTool = (t: ToolType) => dispatch(setTool(t));
    const handleSetColor = (c: string) => dispatch(setColor(c));
    const handleSetBackgroundColor = (c: BackgroundType) => dispatch(setBackgroundColor(c));

    const handleClearBoard = () => {
        if (window.confirm("Are you sure you want to clear the entire board? This cannot be undone.")) {
            dispatch(triggerClearBoard());
            setIsMobileMenuOpen(false);
        }
    };

    const tools: { id: ToolType; icon: any; label: string; shortcut: string }[] = [
        { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
        { id: 'pan', icon: Hand, label: 'Pan', shortcut: 'H' },
        { id: 'draw', icon: Minus, label: 'Draw', shortcut: 'P' },
        { id: 'rect', icon: Square, label: 'Rectangle', shortcut: 'R' },
        { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'O' },
        { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
        { id: 'eraser-area', icon: Scissors, label: 'Area Eraser', shortcut: 'X' },
    ];

    const backgrounds: { id: BackgroundType; icon: any; label: string }[] = [
        { id: '#1e1e1e', icon: Moon, label: 'Dark' },
        { id: '#f3f4f6', icon: Sun, label: 'Light' },
        { id: '#ffffff', icon: Monitor, label: 'White' },
    ];

    return (
        <>
            {/* Mobile Trigger */}
            <button
                className="md:hidden fixed bottom-6 left-4 z-50 bg-indigo-600 text-white p-3 rounded-full shadow-2xl shadow-indigo-600/40 active:scale-90 transition-all hover:bg-indigo-700 hover:scale-105"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={20} /> : <Palette size={20} />}
            </button>

            {/* Main Toolbar Container */}
            <div className={`
                fixed z-40 flex flex-col gap-2 transition-all duration-300 ease-in-out origin-left
                md:absolute md:top-1/2 md:left-4 md:-translate-y-1/2 md:origin-center
                bottom-24 left-4 
                max-h-[calc(100vh-7rem)] overflow-y-auto hidden-scrollbar overscroll-contain
                ${isMobileMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none md:opacity-100 md:translate-y-0 md:scale-100 md:pointer-events-auto'}
            `}>
                {/* Main Toolbar */}
                <div className="bg-[#1e1e1e]/90 backdrop-blur-md p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-gray-700 shadow-2xl flex flex-col gap-1 shrink-0">
                    {tools.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => {
                                handleSetTool(t.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`p-2 md:p-2.5 rounded-lg md:rounded-xl transition-all duration-200 group relative
                              ${tool === t.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                }`}
                            title={`${t.label} (${t.shortcut})`}
                        >
                            <t.icon size={20} />

                            {/* Tooltip (Desktop Only) */}
                            <div className="hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity border border-gray-800 z-50">
                                {t.label} <span className="text-gray-500 ml-1">({t.shortcut})</span>
                            </div>
                        </button>
                    ))}

                    <div className="h-px bg-gray-700/50 my-0.5" />

                    {/* Clear Board Button */}
                    <button
                        onClick={handleClearBoard}
                        className="p-2 md:p-2.5 rounded-lg md:rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group relative"
                        title="Clear Board"
                    >
                        <Trash2 size={20} />
                        {/* Tooltip */}
                        <div className="hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity border border-gray-800 z-50">
                            Clear Board
                        </div>
                    </button>

                    <div className="h-px bg-gray-700/50 my-0.5" />

                    {/* Color Picker Trigger */}
                    <div className="relative">
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-8 h-8 md:w-9 md:h-9 rounded-lg border-2 border-gray-600 flex items-center justify-center transition-transform hover:scale-105 mx-auto"
                            style={{ backgroundColor: color }}
                        >
                            <div className="hidden" />
                        </button>

                        {/* Popover Color Picker */}
                        {showColorPicker && (
                            <div className="absolute left-full ml-4 bottom-0 md:top-1/2 md:-translate-y-1/2 p-2 bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-xl grid grid-cols-3 gap-1 w-32 md:w-40 z-50">
                                {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#000000', '#9ca3af'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            handleSetColor(c);
                                            setShowColorPicker(false);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-6 h-6 rounded-md border border-gray-600 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Background Controls */}
                <div className="bg-[#1e1e1e]/90 backdrop-blur-md p-1.5 rounded-xl md:rounded-2xl border border-gray-700 shadow-xl flex flex-col gap-1 shrink-0">
                    {backgrounds.map((bg) => (
                        <button
                            key={bg.id}
                            onClick={() => {
                                handleSetBackgroundColor(bg.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`p-2 rounded-lg transition-colors ${backgroundColor === bg.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                                }`}
                            title={bg.label}
                        >
                            <bg.icon size={18} />
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

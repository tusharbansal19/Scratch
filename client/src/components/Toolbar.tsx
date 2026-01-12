import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setTool, setColor, setBackgroundColor, type ToolType, type BackgroundType } from '../store/boardSlice';
import {
    Square, Circle, Minus, MousePointer2, Eraser,
    Hand,
    Moon, Sun, Monitor, Scissors
} from 'lucide-react';

export default function Toolbar() {
    const dispatch = useDispatch();
    const { tool, color, backgroundColor } = useSelector((state: RootState) => state.board);
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Helper dispatcher functions
    const handleSetTool = (t: ToolType) => dispatch(setTool(t));
    const handleSetColor = (c: string) => dispatch(setColor(c));
    const handleSetBackgroundColor = (c: BackgroundType) => dispatch(setBackgroundColor(c));

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
        <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-4 z-10">
            {/* Main Toolbar */}
            <div className="bg-[#1e1e1e]/90 backdrop-blur-md p-3 rounded-2xl border border-gray-700 shadow-2xl flex flex-col gap-3">
                {tools.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => handleSetTool(t.id)}
                        className={`p-3 rounded-xl transition-all duration-200 group relative
                          ${tool === t.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                        title={`${t.label} (${t.shortcut})`}
                    >
                        <t.icon size={20} />

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                            {t.label} <span className="text-gray-500 ml-1">({t.shortcut})</span>
                        </div>
                    </button>
                ))}

                <div className="h-px bg-gray-700/50 my-1" />

                {/* Color Picker Trigger */}
                <div className="relative">
                    <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-10 h-10 rounded-xl border-2 border-gray-600 flex items-center justify-center transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                    >
                        <div className="w-full h-full rounded-lg ring-1 ring-inset ring-black/20" />
                    </button>

                    {/* Popover Color Picker */}
                    {showColorPicker && (
                        <div className="absolute left-full ml-4 top-0 p-3 bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-xl grid grid-cols-3 gap-2 w-48">
                            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#000000', '#9ca3af'].map((c) => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        handleSetColor(c);
                                        setShowColorPicker(false);
                                    }}
                                    className="w-8 h-8 rounded-lg border border-gray-600 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Background Controls */}
            <div className="bg-[#1e1e1e]/90 backdrop-blur-md p-2 rounded-2xl border border-gray-700 shadow-xl flex flex-col gap-2">
                {backgrounds.map((bg) => (
                    <button
                        key={bg.id}
                        onClick={() => handleSetBackgroundColor(bg.id)}
                        className={`p-2 rounded-lg transition-colors ${backgroundColor === bg.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                            }`}
                        title={bg.label}
                    >
                        <bg.icon size={18} />
                    </button>
                ))}
            </div>
        </div>
    );
}

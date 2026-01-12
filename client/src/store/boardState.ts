import { create } from 'zustand';

export type ToolType = 'select' | 'rect' | 'circle' | 'text' | 'draw' | 'eraser' | 'pan';
export type BackgroundType = '#ffffff' | '#1e1e1e' | '#f3f4f6'; // White, Dark (Black/Gray), Light Gray

interface BoardState {
    tool: ToolType;
    color: string;
    strokeWidth: number;
    backgroundColor: BackgroundType;

    setTool: (tool: ToolType) => void;
    setColor: (color: string) => void;
    setStrokeWidth: (width: number) => void;
    setBackgroundColor: (bg: BackgroundType) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
    tool: 'draw',
    color: '#3b82f6', // Default to a nice blue (Cosmic-like)
    strokeWidth: 3,
    backgroundColor: '#1e1e1e', // Default to Dark Industrial

    setTool: (tool) => set({ tool }),
    setColor: (color) => set({ color }),
    setStrokeWidth: (width) => set({ strokeWidth: width }),
    setBackgroundColor: (bg) => set({ backgroundColor: bg }),
}));

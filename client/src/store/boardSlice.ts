import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToolType = 'select' | 'draw' | 'rect' | 'circle' | 'eraser' | 'pan' | 'eraser-area';
export type BackgroundType = '#1e1e1e' | '#f3f4f6' | '#ffffff';

interface BoardState {
    tool: ToolType;
    color: string;
    strokeWidth: number;
    backgroundColor: BackgroundType;
    cursors: Record<string, any>;
}

const initialState: BoardState = {
    tool: 'draw',
    color: '#3b82f6',
    strokeWidth: 2,
    backgroundColor: '#1e1e1e',
    cursors: {},
};

const boardSlice = createSlice({
    name: 'board',
    initialState,
    reducers: {
        setTool(state, action: PayloadAction<ToolType>) {
            state.tool = action.payload;
        },
        setColor(state, action: PayloadAction<string>) {
            state.color = action.payload;
        },
        setStrokeWidth(state, action: PayloadAction<number>) {
            state.strokeWidth = action.payload;
        },
        setBackgroundColor(state, action: PayloadAction<BackgroundType>) {
            state.backgroundColor = action.payload;
        },
        updateCursors(state, action: PayloadAction<Record<string, any>>) {
            state.cursors = action.payload;
        },
    },
});

export const { setTool, setColor, setStrokeWidth, setBackgroundColor, updateCursors } = boardSlice.actions;
export default boardSlice.reducer;

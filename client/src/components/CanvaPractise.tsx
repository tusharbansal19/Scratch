import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

export default function CanvaPractise() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const [tool, setTool] = useState<"draw" | "erase" | "select">("draw");
    const toolRef = useRef(tool); // Keep ref for event listeners

    // Update ref when state changes
    useEffect(() => {
        toolRef.current = tool;
    }, [tool]);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Dispose old canvas if strict mode re-runs
        if (fabricRef.current) {
            fabricRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            backgroundColor: "#111827",
            isDrawingMode: true,
            width: 900,
            height: 600,
            selection: false
        });

        fabricRef.current = canvas;

        // Set initial brush properties
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = 4;
            canvas.freeDrawingBrush.color = "white";
        }


        canvas.on("path:created", (e: any) => {
            const currentTool = toolRef.current;

            if (currentTool === "erase") {
                // 🔴 CRITICAL: remove the eraser path object
                canvas.remove(e.path);
                canvas.requestRenderAll();
            }
        });


        // Event listener for new paths
        // canvas.on('path:created', (e: any) => {
        //     const path = e.path;
        //     if (toolRef.current === 'erase') {
        //         // Mark as eraser path and prevent selection
        //         path.set({
        //             globalCompositeOperation: 'destination-out',
        //             selectable: false,
        //             evented: false,
        //             isEraser: true
        //         });
        //         // Send to back so it doesn't obscure other selection handles if overlapped (though evented:false helps)
        //         // Actually for destination-out, it needs to be where it is in stack to erase things below it.
        //     }
        // });



        return () => {
            canvas.dispose();
            fabricRef.current = null;
        };
    }, []);

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        // Reset everything
        canvas.isDrawingMode = false;
        canvas.selection = false;
        canvas.defaultCursor = "default";

        // VERY IMPORTANT: reset composite mode
        (canvas as any).contextTop.globalCompositeOperation = "source-over";

        canvas.forEachObject(obj => {
            obj.selectable = false;
            obj.evented = false;
        });

        // ---------- SELECT ----------
        if (tool === "select") {
            canvas.selection = true;
            canvas.forEachObject(obj => {
                obj.selectable = true;
                obj.evented = true;
            });
            return;
        }

        // ---------- DRAW or ERASE ----------
        canvas.isDrawingMode = true;

        const brush = new fabric.PencilBrush(canvas);

        if (tool === "draw") {
            brush.color = "white";
            brush.width = 4;
            (brush as any).globalCompositeOperation = "source-over"; // normal draw
        }

        if (tool === "erase") {
            brush.color = "rgba(0,0,0,1)"; // color doesn't matter
            brush.width = 30;

            // 🔴 THIS is the REAL ERASER
            (brush as any).globalCompositeOperation = "destination-out";
        }

        canvas.freeDrawingBrush = brush;
        canvas.defaultCursor = "crosshair";

    }, [tool]);

    const clearCanvas = () => {
        const canvas = fabricRef.current;
        if (canvas) {
            canvas.clear();
            canvas.setBackgroundColor("#111827", () => canvas.requestRenderAll());
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center py-10 font-sans">
            <h1 className="text-white text-3xl font-bold mb-6 tracking-tight">Drawing Board</h1>

            {/* Controls */}
            <div className="flex gap-4 mb-6 bg-slate-900 p-2 rounded-lg border border-slate-700 shadow-lg">
                <button
                    onClick={() => setTool("draw")}
                    className={`px-6 py-2 rounded font-medium transition-all duration-200 ${tool === "draw"
                        ? "bg-blue-600 text-white scale-105 shadow-blue-900/50 shadow-md"
                        : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                >
                    Draw
                </button>
                <button
                    onClick={() => setTool("erase")}
                    className={`px-6 py-2 rounded font-medium transition-all duration-200 ${tool === "erase"
                        ? "bg-blue-600 text-white scale-105 shadow-blue-900/50 shadow-md"
                        : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                >
                    Erase
                </button>
                <button
                    onClick={() => setTool("select")}
                    className={`px-6 py-2 rounded font-medium transition-all duration-200 ${tool === "select"
                        ? "bg-blue-600 text-white scale-105 shadow-blue-900/50 shadow-md"
                        : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                >
                    Select
                </button>
                <div className="w-px bg-slate-700 mx-2 self-stretch"></div>
                <button
                    onClick={clearCanvas}
                    className="px-6 py-2 rounded font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Canvas Container */}
            <div className="border border-slate-700 rounded-lg overflow-hidden shadow-2xl bg-[#111827]">
                <canvas ref={canvasRef} />
            </div>

            <p className="mt-4 text-slate-500 text-sm">
                Selection will ignore eraser lines
            </p>
        </div>
    );
}

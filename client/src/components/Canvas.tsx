// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { updateCursors } from '../store/boardSlice';
import { v4 as uuidv4 } from 'uuid';
import { throttle } from 'lodash';
import { useAuthStore } from '../store/authStore';

// Extend fabric object to include ID
// @ts-ignore
fabric.Object.prototype.toObject = (function (toObject) {
    return function (this: any) {
        return fabric.util.object.extend(toObject.call(this), { id: this.id });
    };
})(fabric.Object.prototype.toObject);

interface CanvasProps {
    boardId: string;
}

const CURSOR_COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ff00ff', '#00ffff', '#ffff00'];

export default function Canvas({ boardId }: CanvasProps) {
    const dispatch = useDispatch();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const { tool, color, strokeWidth, backgroundColor, clearTrigger } = useSelector((state: RootState) => state.board);
    const prevClearTriggerRef = useRef(clearTrigger);

    // Auth & User Info
    const { user } = useAuthStore();

    // Clear Board Listener
    useEffect(() => {
        if (prevClearTriggerRef.current !== clearTrigger && fabricCanvas) {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    type: 'board:clear',
                    data: null,
                    userId: clientId
                }));
            }
            fabricCanvas.clear();
            fabricCanvas.setBackgroundColor(backgroundColor || '#1e1e1e', () => fabricCanvas.requestRenderAll());
        }
        prevClearTriggerRef.current = clearTrigger;
    }, [clearTrigger, fabricCanvas, backgroundColor]);

    // Remote cursors state: { [userId]: { x, y, name, color, lastUpdate } }
    const [cursors, setCursors] = useState<Record<string, any>>({});

    // Sync Cursors to Redux (for Header UI)
    useEffect(() => {
        dispatch(updateCursors(cursors));
    }, [cursors, dispatch]);

    const socketRef = useRef<WebSocket | null>(null);
    const isRemoteUpdate = useRef(false);
    const clientId = useRef(uuidv4()).current;

    // Assign a random color/name to this client
    const myCursorColor = useRef(CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)]).current;

    // Dynamic Name Ref
    const myName = useRef('Guest ' + clientId.slice(0, 4));
    useEffect(() => {
        if (user?.full_name) myName.current = user.full_name;
        else if (user?.email) myName.current = user.email;
    }, [user]);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: window.innerWidth,
            height: window.innerHeight,
            isDrawingMode: false,
            backgroundColor: backgroundColor,
            selection: true,
            preserveObjectStacking: true,
        });

        const handleResize = () => {
            canvas.setWidth(window.innerWidth);
            canvas.setHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Zoom Logic
        canvas.on('mouse:wheel', function (opt) {
            if (!opt.e.ctrlKey) {
                // optional pan logic
            }
            var delta = opt.e.deltaY;
            var zoom = canvas.getZoom();
            zoom *= 0.999 ** delta;
            if (zoom > 20) zoom = 20;
            if (zoom < 0.01) zoom = 0.01;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        });

        setFabricCanvas(canvas);

        return () => {
            window.removeEventListener('resize', handleResize);
            canvas.dispose();
        };
    }, []);

    // Sync Background Color
    useEffect(() => {
        if (fabricCanvas) {
            fabricCanvas.setBackgroundColor(backgroundColor, () => {
                fabricCanvas.requestRenderAll();
            });
        }
    }, [backgroundColor, fabricCanvas]);

    // Enhanced Tool Configuration
    useEffect(() => {
        if (!fabricCanvas) return;

        const bgColor = backgroundColor || '#1e1e1e';
        const brushColor = color || '#3b82f6';

        // Reset
        fabricCanvas.isDrawingMode = false;
        fabricCanvas.selection = false;
        fabricCanvas.defaultCursor = 'default';

        // Clean basic listeners
        fabricCanvas.off('mouse:down');
        fabricCanvas.off('mouse:move');
        fabricCanvas.off('mouse:up');

        if (tool === 'draw') {
            fabricCanvas.isDrawingMode = true;
            const brush = new fabric.PencilBrush(fabricCanvas);
            brush.color = brushColor;
            brush.width = strokeWidth;
            brush.decimate = 2.5;
            fabricCanvas.freeDrawingBrush = brush;
            fabricCanvas.defaultCursor = 'crosshair';
        } else if (tool === 'eraser') {
            fabricCanvas.isDrawingMode = true;
            const brush = new fabric.PencilBrush(fabricCanvas);
            brush.color = bgColor;
            brush.width = strokeWidth * 10;
            fabricCanvas.freeDrawingBrush = brush;
            fabricCanvas.defaultCursor = 'crosshair';
        } else if (tool === 'eraser-area') {
            fabricCanvas.isDrawingMode = true;
            const brush = new fabric.PencilBrush(fabricCanvas);
            brush.color = 'rgba(255, 0, 0, 0.3)';
            brush.width = 1;
            fabricCanvas.freeDrawingBrush = brush;
            fabricCanvas.defaultCursor = 'cell';
        } else if (tool === 'select') {
            fabricCanvas.selection = true;
            fabricCanvas.forEachObject((o: any) => { o.selectable = true; o.evented = true; });
        } else if (tool === 'pan') {
            fabricCanvas.defaultCursor = 'grab';
            let isDragging = false;
            let lastPosX = 0; let lastPosY = 0;
            const onMouseDown = (opt: any) => {
                const evt = opt.e;
                isDragging = true;
                fabricCanvas.defaultCursor = 'grabbing';
                lastPosX = evt.clientX; lastPosY = evt.clientY;
            };
            const onMouseMove = (opt: any) => {
                if (isDragging) {
                    const e = opt.e;
                    const vpt = fabricCanvas.viewportTransform!;
                    vpt[4] += e.clientX - lastPosX;
                    vpt[5] += e.clientY - lastPosY;
                    fabricCanvas.requestRenderAll();
                    lastPosX = e.clientX; lastPosY = e.clientY;
                }
            };
            const onMouseUp = () => {
                if (fabricCanvas.viewportTransform) {
                    fabricCanvas.setViewportTransform(fabricCanvas.viewportTransform);
                }
                isDragging = false;
                fabricCanvas.defaultCursor = 'grab';
            };
            fabricCanvas.on('mouse:down', onMouseDown);
            fabricCanvas.on('mouse:move', onMouseMove);
            fabricCanvas.on('mouse:up', onMouseUp);
        }

        // Shapes
        if (tool === 'rect' || tool === 'circle') {
            fabricCanvas.defaultCursor = 'crosshair';
            let isDown = false;
            let tempObj: any;
            let startX: number; let startY: number;

            const onShapeMouseDown = (o: any) => {
                isDown = true;
                const pointer = fabricCanvas.getPointer(o.e);
                startX = pointer.x; startY = pointer.y;
                const id = uuidv4();
                const shapeStroke = color || '#3b82f6';
                if (tool === 'rect') {
                    tempObj = new fabric.Rect({
                        left: startX, top: startY, width: 0, height: 0,
                        fill: 'transparent', stroke: shapeStroke, strokeWidth: strokeWidth,
                        selectable: false, id: id // @ts-ignore
                    });
                } else {
                    tempObj = new fabric.Circle({
                        left: startX, top: startY, radius: 0,
                        fill: 'transparent', stroke: shapeStroke, strokeWidth: strokeWidth,
                        selectable: false, id: id // @ts-ignore
                    });
                }
                if (tempObj) fabricCanvas.add(tempObj);
            };

            const onShapeMouseMove = (o: any) => {
                if (!isDown || !tempObj) return;
                const pointer = fabricCanvas.getPointer(o.e);
                if (tool === 'rect') {
                    if (startX > pointer.x) tempObj.set({ left: Math.abs(pointer.x) });
                    if (startY > pointer.y) tempObj.set({ top: Math.abs(pointer.y) });
                    tempObj.set({ width: Math.abs(startX - pointer.x) });
                    tempObj.set({ height: Math.abs(startY - pointer.y) });
                } else {
                    const radius = Math.abs(startX - pointer.x) / 2;
                    tempObj.set({ radius: radius });
                    if (startX > pointer.x) tempObj.set({ left: Math.abs(pointer.x) });
                    if (startY > pointer.y) tempObj.set({ top: Math.abs(pointer.y) });
                }
                fabricCanvas.requestRenderAll();
            };

            const onShapeMouseUp = () => {
                if (!isDown) return;
                isDown = false;
                if (tempObj) { tempObj.setCoords(); fabricCanvas.fire('object:modified', { target: tempObj }); }
                tempObj = null;
            };

            fabricCanvas.on('mouse:down', onShapeMouseDown);
            fabricCanvas.on('mouse:move', onShapeMouseMove);
            fabricCanvas.on('mouse:up', onShapeMouseUp);
        }

    }, [tool, color, strokeWidth, backgroundColor, fabricCanvas]);

    // WebSocket & Live Cursors
    useEffect(() => {
        if (!fabricCanvas) return;

        const ws = new WebSocket(`wss://scratch-161f.onrender.com/api/ws/${boardId}`);
        socketRef.current = ws;

        const sendCursorMove = throttle((data: any) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'cursor',
                    data: data,
                    userId: clientId
                }));
            }
        }, 32);

        const handleMouseMove = (opt: any) => {
            const pointer = fabricCanvas.getPointer(opt.e);
            sendCursorMove({
                x: pointer.x,
                y: pointer.y,
                color: myCursorColor,
                name: myName.current
            });
        };
        fabricCanvas.on('mouse:move', handleMouseMove);

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg.type === 'history') {
                    handleHistory(msg.data);
                    return;
                }

                if (msg.type === 'cursor' && msg.userId !== clientId) {
                    setCursors(prev => ({
                        ...prev,
                        [msg.userId]: { ...msg.data, lastUpdate: Date.now() }
                    }));
                    return;
                }

                if (msg.type === 'board:clear') {
                    fabricCanvas.clear();
                    fabricCanvas.setBackgroundColor(backgroundColor || '#1e1e1e', () => fabricCanvas.requestRenderAll());
                    return;
                }

                if (msg.userId && msg.userId !== clientId) {
                    handleRemoteEvent(msg);
                }
            } catch (e) {
                console.error("WS Parse error", e);
            }
        };

        const handleHistory = (historyItems: any[]) => {
            if (!Array.isArray(historyItems)) return;
            isRemoteUpdate.current = true;
            fabric.util.enlivenObjects(historyItems, (objs: any[]) => {
                objs.forEach((obj) => fabricCanvas.add(obj));
                fabricCanvas.requestRenderAll();
            }, "");
            isRemoteUpdate.current = false;
        };

        const handleRemoteEvent = (msg: any) => {
            isRemoteUpdate.current = true;
            const { type, data } = msg;

            if (data) {
                if (data.fill === 'null') data.fill = 'transparent';
                if (data.stroke === 'null') data.stroke = '#000000';
            }

            if (type === 'object:added') {
                fabric.util.enlivenObjects([data], (objs: any[]) => {
                    objs.forEach(obj => fabricCanvas.add(obj));
                    fabricCanvas.requestRenderAll();
                }, "");
            } else if (type === 'object:modified') {
                const obj = fabricCanvas.getObjects().find((o: any) => o.id === data.id);
                if (obj) {
                    obj.set(data);
                    obj.setCoords();
                    fabricCanvas.requestRenderAll();
                }
            } else if (type === 'object:removed') {
                const obj = fabricCanvas.getObjects().find((o: any) => o.id === data.id);
                if (obj) {
                    fabricCanvas.remove(obj);
                    fabricCanvas.requestRenderAll();
                }
            }
            isRemoteUpdate.current = false;
        };

        const sendEvent = (type: string, data: any) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type, data, userId: clientId }));
            }
        };

        const handlePathCreated = (e: any) => {
            const path = e.path;

            if (tool === 'eraser-area') {
                const objects = fabricCanvas.getObjects();
                path.setCoords();

                objects.forEach(obj => {
                    if (obj === path) return;
                    obj.setCoords();

                    if (
                        path.intersectsWithObject(obj) ||
                        obj.intersectsWithObject(path) ||
                        path.isContainedWithinObject(obj) ||
                        obj.isContainedWithinObject(path)
                    ) {
                        fabricCanvas.remove(obj);
                        sendEvent('object:removed', { id: obj.id });
                    }
                });

                fabricCanvas.remove(path);
                fabricCanvas.requestRenderAll();
                return;
            }

            if (isRemoteUpdate.current) return;
            if (!path.id) path.id = uuidv4();
            sendEvent('object:added', path.toObject());
        };

        const handleObjectAdded = (e: any) => {
            if (isRemoteUpdate.current) return;
            if (e.target.type === 'path') return;
            const obj = e.target;
            if (!obj.id) obj.id = uuidv4();
            sendEvent('object:added', obj.toObject());
        };

        const handleObjectModified = (e: any) => {
            if (isRemoteUpdate.current) return;
            sendEvent('object:modified', e.target.toObject());
        };

        fabricCanvas.on('path:created', handlePathCreated);
        fabricCanvas.on('object:added', handleObjectAdded);
        fabricCanvas.on('object:modified', handleObjectModified);

        return () => {
            // clean up socket
            if (socketRef.current) socketRef.current.close();
            sendCursorMove.cancel();
            fabricCanvas.off('path:created', handlePathCreated);
            fabricCanvas.off('object:added', handleObjectAdded);
            fabricCanvas.off('object:modified', handleObjectModified);
            fabricCanvas.off('mouse:move', handleMouseMove);
        };
    }, [fabricCanvas, boardId, tool]);

    // Cleanup old cursors
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setCursors(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(next).forEach(key => {
                    if (now - next[key].lastUpdate > 5000) {
                        delete next[key];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor }}>
            {/* Grid Dots */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: backgroundColor === '#1e1e1e'
                        ? 'radial-gradient(#4b5563 1px, transparent 1px)'
                        : 'radial-gradient(#9ca3af 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            ></div>

            <canvas ref={canvasRef} className="block" />

            {/* Live Cursors Overlay - Arrows Only */}
            {Object.entries(cursors).map(([id, cursor]) => (
                <div key={id}
                    className="absolute pointer-events-none flex flex-col items-start z-50 transition-all duration-75 ease-linear"
                    style={{
                        left: cursor.x,
                        top: cursor.y
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={cursor.color} stroke="white" strokeWidth="2">
                        <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19169L11.7841 12.3673H5.65376Z" />
                    </svg>
                    <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded ml-4 whitespace-nowrap opacity-80 backdrop-blur-sm shadow-sm border border-gray-600">
                        {cursor.name}
                    </span>
                </div>
            ))}
        </div>
    );
}

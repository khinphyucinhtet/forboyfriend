import { useCallback, useEffect, useRef, useState } from "react";
const KEY = "forboyfriend-drawing-v1";
const PREFS = "forboyfriend-preferences-v1";
function readJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
export function useDrawing() {
  const canvasRef = useRef(null), activeRef = useRef(null), redrawRef = useRef(() => {}), latestPngRef = useRef("");
  const initial = readJSON(KEY, { strokes: [] });
  const [strokes, setStrokes] = useState(initial.strokes || []);
  const [redoStrokes, setRedoStrokes] = useState([]);
  const [savedAt, setSavedAt] = useState("");
  const preferences = readJSON(PREFS, { color: "#F06292", thickness: 8 });
  const [color, setColor] = useState(preferences.color), [thickness, setThickness] = useState(preferences.thickness), [tool, setTool] = useState("pen");
  useEffect(() => { localStorage.setItem(PREFS, JSON.stringify({ color, thickness })); }, [color, thickness]);
  const persist = useCallback((next) => { localStorage.setItem(KEY, JSON.stringify({ strokes: next })); }, []);
  const redraw = useCallback((items = strokes) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"), rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr)); canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr * rect.width, 0, 0, dpr * rect.height, 0, 0);
    ctx.clearRect(0, 0, 1, 1);
    for (const stroke of items) {
      if (!stroke.points.length) continue;
      ctx.beginPath(); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = stroke.width;
      ctx.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over"; ctx.strokeStyle = stroke.color;
      ctx.moveTo(...stroke.points[0]);
      if (stroke.points.length === 1) { ctx.lineTo(stroke.points[0][0] + .0001, stroke.points[0][1] + .0001); }
      else stroke.points.slice(1).forEach(p => ctx.lineTo(...p));
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }, [strokes]);
  useEffect(() => { redrawRef.current = redraw; redraw(); const canvas = canvasRef.current; if (!canvas) return; const ro = new ResizeObserver(() => redrawRef.current()); ro.observe(canvas); return () => ro.disconnect(); }, [redraw]);
  const setCanvas = useCallback(node => { canvasRef.current = node; if (node) redrawRef.current(); }, []);
  const point = e => { const r = canvasRef.current.getBoundingClientRect(); return [Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))]; };
  const pointerDown = e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); activeRef.current = { id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, color, tool, width: thickness / Math.max(1, canvasRef.current.getBoundingClientRect().width), points: [point(e)] }; setStrokes(s => [...s, activeRef.current]); setRedoStrokes([]); };
  const pointerMove = e => { if (!activeRef.current) return; activeRef.current.points.push(point(e)); redrawRef.current([...strokes.filter(s => s.id !== activeRef.current.id), activeRef.current]); };
  const pointerUp = () => { if (!activeRef.current) return; const finished=activeRef.current; activeRef.current=null; setStrokes(s=>{const next=[...s.slice(0,-1),finished];persist(next);return next;}); };
  const undo = () => setStrokes(s => { if (!s.length) return s; const next=s.slice(0,-1); setRedoStrokes(r=>[...r,s.at(-1)]); persist(next); return next; });
  const redo = () => setRedoStrokes(r => { if (!r.length)return r; const item=r.at(-1); setStrokes(s=>{const next=[...s,item];persist(next);return next;});return r.slice(0,-1); });
  const clear = () => { setStrokes([]); setRedoStrokes([]); persist([]); };
  const save = () => { const canvas=canvasRef.current; if(!canvas)return false; const out=document.createElement("canvas");const scale=Math.min(1,600/Math.max(canvas.width,canvas.height));out.width=Math.max(1,Math.round(canvas.width*scale));out.height=Math.max(1,Math.round(canvas.height*scale));const ctx=out.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(canvas,0,0,out.width,out.height);const data=out.toDataURL("image/png");latestPngRef.current=data;try{localStorage.setItem("forboyfriend-latest-export",data);localStorage.setItem("forboyfriend-latest-at",new Date().toISOString());}catch{ /* PNG download remains available even if browser storage is full. */ }setSavedAt(new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}));return true; };
  const downloadPng = () => { const data=latestPngRef.current || localStorage.getItem("forboyfriend-latest-export"); if(!data)return false; const a=document.createElement("a");a.download="ForBoyfriend-drawing.png";a.href=data;a.click();return true; };  return { setCanvas, strokes, color, setColor, thickness, setThickness, tool, setTool, pointerDown, pointerMove, pointerUp, undo, redo, clear, save, downloadPng, savedAt, canUndo:strokes.length>0, canRedo:redoStrokes.length>0 };
}







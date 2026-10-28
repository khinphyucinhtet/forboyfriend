import { useCallback, useEffect, useRef, useState } from "react";
import { drawingService } from "../services/drawingService";

const DRAWING_KEY = "forboyfriend-drawing-v1";
const PREFERENCES_KEY = "forboyfriend-preferences-v1";
const CLIENT_KEY = "forboyfriend-client-id";
const DRAFT_DIRTY_KEY = "forboyfriend-draft-unsaved";
const DEFAULTS = { color: "#F06292", thickness: 8 };

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function getClientId() {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
}
function readDraftDirty() {
  try { return localStorage.getItem(DRAFT_DIRTY_KEY) === "true"; }
  catch { return false; }
}

export function useDrawing() {
  const canvasRef = useRef(null);
  const activeRef = useRef(null);
  const redrawRef = useRef(() => {});
  const latestPngRef = useRef("");
  const syncErrorRef = useRef("");
  const [initialDraftDirty] = useState(readDraftDirty);
  const dirtyRef = useRef(initialDraftDirty);
  const [clientId] = useState(getClientId);
  const clientIdRef = useRef(clientId);
  const [strokes, setStrokes] = useState(() => {
    const initial = readJSON(DRAWING_KEY, { strokes: [] });
    return (initial.strokes || []).map(stroke => ({ ...stroke, clientId: stroke.clientId || clientId }));
  });
  const strokesRef = useRef(strokes);
  useEffect(() => { strokesRef.current = strokes; }, [strokes]);
  const [redoStrokes, setRedoStrokes] = useState([]);
  const preferences = readJSON(PREFERENCES_KEY, DEFAULTS);
  const [color, setColor] = useState(preferences.color || DEFAULTS.color);
  const [thickness, setThickness] = useState(preferences.thickness || DEFAULTS.thickness);
  const [tool, setTool] = useState("pen");
  const [connectionStatus, setConnectionStatus] = useState(drawingService.firebaseAvailable ? "Connecting..." : "Local canvas");
  const [syncError, setSyncError] = useState("");
  const [savedAt, setSavedAt] = useState("");
  useEffect(() => { try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ color, thickness })); } catch { /* Preferences are optional when storage is unavailable. */ } }, [color, thickness]);

  const persist = useCallback(next => {
    try { localStorage.setItem(DRAWING_KEY, JSON.stringify({ strokes: next })); }
    catch { setSyncError("This browser is low on storage. The current canvas may not persist after closing the page."); }
  }, []);
  const markDraftDirty = value => {
    dirtyRef.current = value;
    try { localStorage.setItem(DRAFT_DIRTY_KEY, String(value)); } catch { /* The current in-memory draft remains usable. */ }
  };

  useEffect(() => drawingService.subscribe({
    onStatus: status => {
      if (status === "Connected" && syncErrorRef.current) return;
      setConnectionStatus(status);
    },
    onError: message => {
      syncErrorRef.current = message;
      setSyncError(message);
      setConnectionStatus("Unable to connect");
    },
    onSnapshot: snapshot => {
      if (dirtyRef.current || !Array.isArray(snapshot?.strokes)) return;
      const next = snapshot.strokes;
      strokesRef.current = next;
      setStrokes(next);
      setRedoStrokes([]);
      persist(next);
    },
  }), [persist]);
  const redraw = useCallback((items = strokes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    context.setTransform(dpr * rect.width, 0, 0, dpr * rect.height, 0, 0);
    context.clearRect(0, 0, 1, 1);
    for (const stroke of items) {
      if (!stroke.points?.length) continue;
      context.beginPath();
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = stroke.width;
      context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
      context.strokeStyle = stroke.color;
      context.moveTo(...stroke.points[0]);
      if (stroke.points.length === 1) context.lineTo(stroke.points[0][0] + .0001, stroke.points[0][1] + .0001);
      else stroke.points.slice(1).forEach(point => context.lineTo(...point));
      context.stroke();
    }
    context.globalCompositeOperation = "source-over";
  }, [strokes]);

  useEffect(() => {
    redrawRef.current = redraw;
    redraw();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => redrawRef.current());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [redraw]);

  const setCanvas = useCallback(node => {
    canvasRef.current = node;
    if (node) redrawRef.current();
  }, []);
  const pointFromEvent = event => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    ];
  };

  const pointerDown = event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    markDraftDirty(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const stroke = {
      id: globalThis.crypto?.randomUUID?.() || `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      clientId: clientIdRef.current,
      color,
      tool,
      width: thickness / Math.max(1, rect.width),
      points: [pointFromEvent(event)],
    };
    activeRef.current = stroke;
    setStrokes(previous => [...previous, stroke]);
    setRedoStrokes([]);
  };
  const pointerMove = event => {
    if (!activeRef.current) return;
    activeRef.current.points.push(pointFromEvent(event));
    redrawRef.current([...strokes.filter(stroke => stroke.id !== activeRef.current.id), activeRef.current]);
  };
  const pointerUp = () => {
    const finished = activeRef.current;
    if (!finished) return;
    activeRef.current = null;
    setStrokes(previous => {
      const found = previous.some(stroke => stroke.id === finished.id);
      const next = found ? previous.map(stroke => stroke.id === finished.id ? finished : stroke) : [...previous, finished];
      persist(next);
      return next;
    });
  };

  const undo = () => {
    const index = strokes.findLastIndex(stroke => stroke.clientId === clientIdRef.current);
    if (index < 0) return;
    const removed = strokes[index];
    markDraftDirty(true);
    const next = strokes.filter((_, position) => position !== index);
    setStrokes(next);
    setRedoStrokes(previous => [...previous, removed]);
    persist(next);
  };
  const redo = () => {
    const restored = redoStrokes.at(-1);
    if (!restored) return;
    markDraftDirty(true);
    const nextRedo = redoStrokes.slice(0, -1);
    const nextStrokes = [...strokes, restored];
    setRedoStrokes(nextRedo);
    setStrokes(nextStrokes);
    persist(nextStrokes);
  };
  const clear = () => {
    markDraftDirty(true);
    setStrokes([]);
    setRedoStrokes([]);
    persist([]);
  };

  const save = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const output = document.createElement("canvas");
    const scale = Math.min(1, 600 / Math.max(canvas.width, canvas.height));
    output.width = Math.max(1, Math.round(canvas.width * scale));
    output.height = Math.max(1, Math.round(canvas.height * scale));
    const context = output.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(canvas, 0, 0, output.width, output.height);
    const data = output.toDataURL("image/png");
    latestPngRef.current = data;
    try {
      localStorage.setItem("forboyfriend-latest-export", data);
      localStorage.setItem("forboyfriend-latest-at", new Date().toISOString());
    } catch { /* PNG export stays available for this session. */ }
    const savedAt = new Date().toISOString();
    setSavedAt(new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    if (!drawingService.firebaseAvailable) {
      markDraftDirty(false);
      return { shared: false };
    }
    try {
      await drawingService.publishSnapshot({
        strokes,
        clientId: clientIdRef.current,
        savedAt,
      });
      markDraftDirty(false);
      syncErrorRef.current = "";
      setSyncError("");
      return { shared: true };
    } catch (error) {
      markDraftDirty(true);
      syncErrorRef.current = error?.message || "Could not share this drawing. Check the Firebase rules and try again.";
      setConnectionStatus("Unable to sync");
      setSyncError(syncErrorRef.current);
      throw error;
    }
  };
  const downloadPng = () => {
    const data = latestPngRef.current || localStorage.getItem("forboyfriend-latest-export");
    if (!data) return false;
    const link = document.createElement("a");
    link.download = "ForBoyfriend-drawing.png";
    link.href = data;
    link.click();
    return true;
  };

  return {
    setCanvas, strokes, color, setColor, thickness, setThickness, tool, setTool,
    pointerDown, pointerMove, pointerUp, undo, redo, clear, save, downloadPng, savedAt,
    connectionStatus, syncError,
    canUndo: strokes.some(stroke => stroke.clientId === clientId),
    canRedo: redoStrokes.length > 0,
  };
}










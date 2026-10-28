import { useState } from "react";
import "./DrawingScreen.css";
import DrawingCanvas from "./DrawingCanvas";
import DrawingToolbar from "./DrawingToolbar";
import ClearDialog from "./ClearDialog";
import SaveDialog from "./SaveDialog";
import Toast from "./Toast";

export default function DrawingScreen({ drawing, onBack }) {
  const [dialog, setDialog] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedShared, setSavedShared] = useState(false);
  const save = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const result = await drawing.save();
      if (!result) setToast("Canvas is not ready yet");
      else {
        setSavedShared(result.shared);
        setDialog("save");
      }
    } catch {
      setToast(drawing.syncError || "Could not share the drawing. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  const clear = () => {
    drawing.clear();
    setDialog("");
    setToast("Canvas cleared");
  };
  const statusClass = drawing.connectionStatus === "Connected"
    ? "is-connected"
    : drawing.connectionStatus === "Local canvas" ? "is-local" : "is-offline";

  return (
    <main className="app">
      <header className="topbar">
        <button className="back-button" aria-label="Back to home" onClick={onBack}>‹</button>
        <div className="brand">
          <div>
            <h1>ForBoyfriend <span>♡</span></h1>
            <p>our little world, drawn together</p>
          </div>
        </div>
        <button
          className="settings-button"
          aria-label="Canvas settings"
          onClick={() => setToast(drawing.syncError || (drawing.connectionStatus === "Connected" ? "Connected. Press Save to share your drawing." : "Saved on this device until Firebase is configured"))}
        >⚙</button>
        <div className={`connection ${statusClass}`} role="status"><i />{drawing.connectionStatus}</div>
      </header>
      <section className="drawing-page">
        <div className="board-heading">
          <div><h3>Our shared canvas <span>♡</span></h3><p>Draw your note, then save it to share.</p></div>
          <span className="live-badge"><i />{drawing.connectionStatus === "Connected" ? "Save to share" : "Ready to draw"}</span>
        </div>
        <DrawingToolbar drawing={drawing} onClear={() => setDialog("clear")} onSave={save} saving={saving} />
        <DrawingCanvas drawing={drawing} />
        {drawing.syncError && <p className="sync-error" role="status">{drawing.syncError}</p>}
        <div className="board-footer">
          <span>♡ made for two</span>
          <span>{drawing.connectionStatus === "Connected" ? "Press Save to share" : "Saved on this device"}</span>
        </div>
      </section>
      <ClearDialog open={dialog === "clear"} onClose={() => setDialog("")} onConfirm={clear} />
      <SaveDialog open={dialog === "save"} shared={savedShared} onClose={() => setDialog("")} onDownload={() => { drawing.downloadPng(); setDialog(""); }} />
      <Toast message={toast} onDismiss={() => setToast("")} />
    </main>
  );
}

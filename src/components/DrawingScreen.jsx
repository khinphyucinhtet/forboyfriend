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
  const save = () => {
    if (drawing.save()) setDialog("save");
    else setToast("Canvas is not ready yet");
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
          onClick={() => setToast(drawing.syncError || (drawing.connectionStatus === "Connected" ? "Changes sync with Firebase" : "Saved on this device until Firebase is configured"))}
        >⚙</button>
        <div className={`connection ${statusClass}`} role="status"><i />{drawing.connectionStatus}</div>
      </header>
      <section className="drawing-page">
        <div className="board-heading">
          <div><h3>Our shared canvas <span>♡</span></h3><p>Two hearts, one little whiteboard.</p></div>
          <span className="live-badge"><i />{drawing.connectionStatus === "Connected" ? "Live together" : "Ready to draw"}</span>
        </div>
        <DrawingToolbar drawing={drawing} onClear={() => setDialog("clear")} onSave={save} />
        <DrawingCanvas drawing={drawing} />
        {drawing.syncError && <p className="sync-error" role="status">{drawing.syncError}</p>}
        <div className="board-footer">
          <span>♡ made for two</span>
          <span>{drawing.connectionStatus === "Connected" ? "Changes sync live" : "Saved on this device"}</span>
        </div>
      </section>
      <ClearDialog open={dialog === "clear"} onClose={() => setDialog("")} onConfirm={clear} />
      <SaveDialog open={dialog === "save"} onClose={() => setDialog("")} onDownload={() => { drawing.downloadPng(); setDialog(""); }} />
      <Toast message={toast} onDismiss={() => setToast("")} />
    </main>
  );
}

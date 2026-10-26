import "./DrawingCanvas.css";
export default function DrawingCanvas({ drawing, preview = false }) {
  return <div className={`canvas-wrap ${preview ? "preview-canvas" : ""}`}>
    <canvas ref={drawing.setCanvas} className="drawing-canvas" aria-label="Drawing canvas" onPointerDown={drawing.pointerDown} onPointerMove={drawing.pointerMove} onPointerUp={drawing.pointerUp} onPointerCancel={drawing.pointerUp} onLostPointerCapture={drawing.pointerUp}/>
    {!drawing.strokes.length && <div className="canvas-empty">Leave a little love here <span>♡</span></div>}
    {!preview && <div className="canvas-hint">made for two ♡</div>}
  </div>;
}


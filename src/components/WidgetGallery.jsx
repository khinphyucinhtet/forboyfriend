import "./WidgetGallery.css";
import WidgetPreview from "./WidgetPreview";
import LockScreenWidget from "./LockScreenWidget";
import HomeScreenWidget from "./HomeScreenWidget";
export default function WidgetGallery({drawing,onBack,onOpen}) {
 const latest=localStorage.getItem("forboyfriend-latest-export");
 const drawn=<svg viewBox="0 0 1 1" preserveAspectRatio="none" aria-label="Live drawing preview">{drawing.strokes.map(s=><polyline key={s.id} points={s.points.map(p=>`${p[0]},${p[1]}`).join(" ")} fill="none" stroke={s.tool==="eraser"?"white":s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round"/>)}</svg>;
 return <main className="gallery-page"><header className="gallery-head"><button onClick={onBack} className="nav-back">‹ Back</button><div><h1>Widgets &amp; Previews</h1><p>Little windows into our world</p></div></header><div className="gallery-grid">
 <LockScreenWidget latest={latest} onOpen={onOpen}/><HomeScreenWidget onOpen={onOpen}/>
 <WidgetPreview title="3. Open App"><div className="phone splash-phone"><div className="mini-heart">♡</div><b>ForBoyfriend</b><span>our little world, drawn together</span><button className="primary-button" onClick={onOpen}>Open Our Canvas</button></div></WidgetPreview>
 <WidgetPreview title="4. Drawing Board"><div className="phone drawing-phone"><div className="mini-head">ForBoyfriend ♡<small>{drawing.connectionStatus}</small></div><div className="mini-draw-area" onClick={onOpen}>{drawn}</div><button className="mini-open" onClick={onOpen}>Open interactive board ↗</button></div></WidgetPreview>
 <WidgetPreview title="5. Draw Together"><div className="phone drawing-phone"><div className="mini-head">ForBoyfriend ♡<small>{drawing.connectionStatus === "Connected" ? "Connected · save to share" : "Local preview"}</small></div><div className="mini-draw-area">{drawn}{!drawing.strokes.length&&<span>Leave a little love ♡</span>}</div><p>Partner sees updates after you press Save</p></div></WidgetPreview>
 </div><p className="gallery-note">These are in-app previews. They do not install native iOS or Android widgets. Current board status: {drawing.connectionStatus}.</p></main>
}


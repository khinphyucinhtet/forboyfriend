import ThicknessSlider from "./ThicknessSlider";
import "./DrawingToolbar.css";
const COLORS=["#F06292","#FF3B30","#FF9500","#FFD60A","#30C85A","#00BFA5","#168BFF","#5956E9","#AF52DE","#222222"];
const paths={pen:<><path d="m4 20 4-1 11-11a2 2 0 0 0-3-3L5 16Z"/><path d="m14 6 4 4"/></>,eraser:<><path d="m7 16-3-3 8-8 8 8-3 3H8Z"/><path d="m8 16 4 4h7"/></>,undo:<><path d="m9 14-5-5 5-5"/><path d="M4 9h9a6 6 0 0 1 0 12"/></>,redo:<><path d="m15 14 5-5-5-5"/><path d="M20 9h-9a6 6 0 0 0 0 12"/></>,trash:<><path d="M4 7h16M9 7V4h6v3m4 0-1 13H6L5 7"/></>,save:<><path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/></>};
function Icon({name}) {return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>}
export default function DrawingToolbar({drawing,onClear,onSave}) { return <div className="drawing-toolbar">
 <div className="tool-row">{[["pen","Pen",()=>drawing.setTool("pen")],["eraser","Eraser",()=>drawing.setTool("eraser")],["undo","Undo",drawing.undo,drawing.canUndo],["redo","Redo",drawing.redo,drawing.canRedo],["trash","Clear",onClear],["save","Save",onSave]].map(([icon,label,action,enabled=true])=><button key={label} className={`tool-button ${drawing.tool===icon?"selected":""}`} onClick={action} disabled={!enabled} aria-label={label} title={label}><Icon name={icon}/><span>{label}</span></button>)}</div>
 <div className="color-group" aria-label="Drawing colors">{COLORS.map(c=><button key={c} className={`color-swatch ${drawing.color===c&&drawing.tool==="pen"?"active":""}`} style={{"--swatch":c}} onClick={()=>{drawing.setColor(c);drawing.setTool("pen")}} aria-label={`Choose ${c}`} />)}</div>
 <ThicknessSlider value={drawing.thickness} onChange={drawing.setThickness}/>
 </div> }


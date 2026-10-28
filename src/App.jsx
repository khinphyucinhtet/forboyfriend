import { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import HomeScreen from "./components/HomeScreen";
import DrawingScreen from "./components/DrawingScreen";
import WidgetGallery from "./components/WidgetGallery";
import { useDrawing } from "./hooks/useDrawing";
import "./App.css";
export default function App() {
 const [screen,setScreen]=useState("splash"); const drawing=useDrawing();
 useEffect(()=>{const handle=e=>{e.preventDefault();window.forBoyfriendInstallPrompt=e;};window.addEventListener("beforeinstallprompt",handle);return()=>window.removeEventListener("beforeinstallprompt",handle)},[]);
 useEffect(()=>{const t=setTimeout(()=>setScreen("home"),1550);return()=>clearTimeout(t)},[]);
 useEffect(()=>{const f=e=>{if(e.key==="Escape"&&screen!=="home"&&screen!=="splash")setScreen("home")};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f)},[screen]);
 if(screen==="splash")return <SplashScreen/>;
 if(screen==="drawing")return <DrawingScreen drawing={drawing} onBack={()=>setScreen("home")}/>;
 if(screen==="widgets")return <WidgetGallery drawing={drawing} onBack={()=>setScreen("home")} onOpen={()=>setScreen("drawing")}/>;
 return <HomeScreen drawing={drawing} onOpen={()=>setScreen("drawing")} onWidgets={()=>setScreen("widgets")}/>;
}

import { useEffect } from "react";
export default function Toast({message,onDismiss}) { useEffect(()=>{if(!message)return;const id=setTimeout(onDismiss,2600);return()=>clearTimeout(id)},[message,onDismiss]);return message?<div className="toast" role="status">♡ {message}</div>:null }

import { useState, useEffect, useCallback } from "react";
import { db } from "./firebase";
import { ref, set, get } from "firebase/database";

// ── palette ───────────────────────────────────────────────────────────────────
const C = {
  sage: "#6b8f71", sageLight: "#a8c5ac", sageDark: "#3d5c42",
  cream: "#faf7f2", warm: "#f2ede4", charcoal: "#272727",
  muted: "#8a8880", accent: "#c4845a", accentLight: "#f0d5c4",
  cardio: "#7a6ea0", cardioLight: "#ddd8f0",
  water: "#5b9abd",
};

// ── exercise data ─────────────────────────────────────────────────────────────
const EXERCISES = {
  squat:        { name: "Bodyweight Squat",   img: "https://inspirefulwomen.com/wp-content/uploads/2021/02/bodyweight-squat.jpg" },
  wallPushup:   { name: "Wall Push-Up",       img: "https://i.ytimg.com/vi/XEkb-yLgFew/maxresdefault.jpg" },
  gluteBridge:  { name: "Glute Bridge",       img: "https://bodybuilding-wizard.com/wp-content/uploads/2014/03/glute-bridge-exercise-1-1.jpg" },
  lunge:        { name: "Reverse Lunge",      img: "https://i.ytimg.com/vi/xrjGq-9oFv4/maxresdefault.jpg" },
  plank:        { name: "Plank Hold",         img: "https://johnsifferman.com/wp-content/uploads/2010/01/plank-position.jpg" },
  bandedSquat:  { name: "Banded Squat",       img: "https://myworkouts.io/wp-content/uploads/2021/06/resistance-band-squat.jpg" },
  bandedRow:    { name: "Banded Row",         img: "https://gethealthyu.com/wp-content/uploads/2014/06/Resistance-Band-Row-1.jpg" },
  rdl:          { name: "Romanian Deadlift",  img: "https://www.inspireusafoundation.org/wp-content/uploads/2022/06/dumbbell-romanian-deadlift.gif" },
  lateralWalk:  { name: "Lateral Band Walk",  img: "https://www.inspireusafoundation.org/wp-content/uploads/2022/01/lateral-band-walk.gif" },
  intervalWalk: { name: "Interval Walk",      img: "https://i.pinimg.com/originals/4a/40/a5/4a40a5b9e7cc4ae2e2ab765e0dee69f9.jpg" },
  kneesPushup:  { name: "Knee Push-Up",       img: "https://i.ytimg.com/vi/XEkb-yLgFew/maxresdefault.jpg" },
};

const P1 = [
  { label:"Mon", type:"strength", exercises:[{ex:"squat",sets:"3×12"},{ex:"wallPushup",sets:"3×10"},{ex:"gluteBridge",sets:"3×15"},{ex:"lunge",sets:"3×10 ea"},{ex:"plank",sets:"3×20s"}] },
  { label:"Tue", type:"rest" },
  { label:"Wed", type:"strength", exercises:[{ex:"squat",sets:"3×12"},{ex:"wallPushup",sets:"3×10"},{ex:"gluteBridge",sets:"3×15"},{ex:"lunge",sets:"3×10 ea"},{ex:"plank",sets:"3×20s"}] },
  { label:"Thu", type:"cardio",   exercises:[{ex:"intervalWalk",sets:"20–25 min"}] },
  { label:"Fri", type:"strength", exercises:[{ex:"squat",sets:"3×12"},{ex:"wallPushup",sets:"3×10"},{ex:"gluteBridge",sets:"3×15"},{ex:"lunge",sets:"3×10 ea"},{ex:"plank",sets:"3×20s"}] },
  { label:"Sat", type:"rest" },
  { label:"Sun", type:"rest" },
];
const P2 = [
  { label:"Mon", type:"strength", exercises:[{ex:"bandedSquat",sets:"3×12"},{ex:"kneesPushup",sets:"3×10"},{ex:"bandedRow",sets:"3×12"},{ex:"rdl",sets:"3×12"},{ex:"lateralWalk",sets:"3×15 ea"},{ex:"plank",sets:"3×30s"}] },
  { label:"Tue", type:"rest" },
  { label:"Wed", type:"cardio",   exercises:[{ex:"intervalWalk",sets:"30 min"}] },
  { label:"Thu", type:"rest" },
  { label:"Fri", type:"strength", exercises:[{ex:"bandedSquat",sets:"3×12"},{ex:"kneesPushup",sets:"3×10"},{ex:"bandedRow",sets:"3×12"},{ex:"rdl",sets:"3×12"},{ex:"lateralWalk",sets:"3×15 ea"},{ex:"plank",sets:"3×30s"}] },
  { label:"Sat", type:"cardio",   exercises:[{ex:"intervalWalk",sets:"30 min"}] },
  { label:"Sun", type:"rest" },
];
const P3 = [
  { label:"Mon", type:"strength", exercises:[{ex:"bandedSquat",sets:"4×12"},{ex:"kneesPushup",sets:"4×10"},{ex:"bandedRow",sets:"4×12"},{ex:"rdl",sets:"4×12"},{ex:"lateralWalk",sets:"3×20 ea"},{ex:"plank",sets:"3×40s"}] },
  { label:"Tue", type:"cardio",   exercises:[{ex:"intervalWalk",sets:"35–40 min"}] },
  { label:"Wed", type:"rest" },
  { label:"Thu", type:"strength", exercises:[{ex:"bandedSquat",sets:"4×12"},{ex:"kneesPushup",sets:"4×10"},{ex:"bandedRow",sets:"4×12"},{ex:"rdl",sets:"4×12"},{ex:"lateralWalk",sets:"3×20 ea"},{ex:"plank",sets:"3×40s"}] },
  { label:"Fri", type:"cardio",   exercises:[{ex:"intervalWalk",sets:"35–40 min"}] },
  { label:"Sat", type:"strength", exercises:[{ex:"squat",sets:"3×15"},{ex:"lunge",sets:"3×12 ea"},{ex:"gluteBridge",sets:"3×20"},{ex:"plank",sets:"3×45s"}] },
  { label:"Sun", type:"rest" },
];
const WEEK_PLANS   = [P1,P1,P1,P1, P2,P2,P2,P2, P3,P3,P3,P3];
const PHASE_LABELS = ["Phase 1 · Wks 1–4","Phase 2 · Wks 5–8","Phase 3 · Wks 9–12"];

const SSRI_TIPS = [
  { emoji:"🥚", title:"Prioritize protein",      body:"Sertraline can spike appetite. Protein keeps you full — eggs, Greek yogurt, chicken, beans at every meal." },
  { emoji:"💧", title:"Hydrate more than you think", body:"SSRI fatigue worsens with mild dehydration. Aim for 8–10 cups. Keep a bottle visible as a cue." },
  { emoji:"🚫", title:"Don't skip meals",         body:"Irregular eating amplifies SSRI appetite swings. Three meals + one protein snack is ideal." },
  { emoji:"🫐", title:"Antioxidants help mood",   body:"Berries, leafy greens, and walnuts support serotonin — a natural complement to your medication." },
  { emoji:"☕", title:"Watch caffeine timing",    body:"Caffeine can amplify Zoloft-related anxiety. Try to cut off by 1–2pm." },
  { emoji:"🌾", title:"Fiber fights bloating",    body:"Constipation is a common Zoloft side effect. Oats, flaxseed, veggies, and legumes help." },
];

function genCode() { return Math.random().toString(36).substring(2,8).toUpperCase(); }

// ── Access password ───────────────────────────────────────────────────────────
// STEP: Change this to any password you want. Set the SAME value as the
//       APP_PASSWORD secret in Firebase (see SETUP.md Step 9b).
const APP_PASSWORD = "REPLACE_WITH_YOUR_PASSWORD";

// ── AI meal analysis — calls your Firebase Cloud Function proxy ───────────────
// STEP: After deploying your Cloud Function, paste its URL below.
const CLOUD_FN_URL = "REPLACE_WITH_YOUR_CLOUD_FUNCTION_URL";

async function analyzeMeal(mealText) {
  const res = await fetch(CLOUD_FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Password sent as a header — Cloud Function checks this before calling Anthropic
      "x-app-password": APP_PASSWORD,
    },
    body: JSON.stringify({ meal: mealText }),
  });
  if (!res.ok) throw new Error("Function error");
  return res.json();
}

// ── main app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("fit_unlocked") === "yes");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [tab, setTab]           = useState("workout");
  const [phase, setPhase]       = useState(0);
  const [shareCode, setShareCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [data, setData] = useState({
    completedDays: {}, weight: {}, measurements: {}, meals: {}, water: {},
  });
  const [today] = useState(new Date().toISOString().split("T")[0]);
  const [mealInput, setMealInput]   = useState("");
  const [mealLoading, setMealLoading] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput]   = useState("");
  const [hipsInput, setHipsInput]     = useState("");
  const [chestInput, setChestInput]   = useState("");

  // load from Firebase on mount
  useEffect(() => {
    (async () => {
      let code = localStorage.getItem("fitcode");
      if (!code) { code = genCode(); localStorage.setItem("fitcode", code); }
      setShareCode(code);
      try {
        const snap = await get(ref(db, `users/${code}`));
        if (snap.exists()) setData(snap.val());
      } catch(e) { console.warn("Firebase load failed", e); }
    })();
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    try {
      await set(ref(db, `users/${shareCode}`), newData);
      setSaveStatus("✓ Saved");
      setTimeout(() => setSaveStatus(""), 1500);
    } catch(e) { setSaveStatus("Save failed"); }
  }, [shareCode]);

  const handleShare = () => {
    navigator.clipboard.writeText(shareCode).catch(()=>{});
    setShareMsg(`✓ Code "${shareCode}" copied! Share it so others can view your progress.`);
    setTimeout(() => setShareMsg(""), 4000);
  };

  const handleImport = async () => {
    const code = importCode.trim().toUpperCase();
    if (!code) { setShareMsg("Enter a share code first"); return; }
    try {
      const snap = await get(ref(db, `users/${code}`));
      if (snap.exists()) {
        setData(snap.val());
        setShareMsg(`✓ Loaded progress for code: ${code}`);
      } else { setShareMsg("Code not found — check the code and try again"); }
    } catch(e) { setShareMsg("Import failed"); }
    setTimeout(() => setShareMsg(""), 3000);
  };

  const toggleDay = (key) => {
    const nd = { ...data, completedDays: { ...data.completedDays, [key]: !data.completedDays[key] } };
    save(nd);
  };

  const totalWorkoutDays = WEEK_PLANS.flatMap(p=>p).filter(d=>d.type!=="rest").length;
  const totalCompleted   = Object.values(data.completedDays).filter(Boolean).length;

  const todayMeals   = data.meals?.[today] || [];
  const totalCals    = todayMeals.reduce((a,m) => a+(m.cal||0), 0);
  const totalProtein = todayMeals.reduce((a,m) => a+(m.protein||0), 0);
  const todayWater   = data.water?.[today] || 0;

  const handleLogMeal = async () => {
    if (!mealInput.trim()) return;
    setMealLoading(true);
    try {
      const result = await analyzeMeal(mealInput);
      const entry  = { text: mealInput, ...result, time: new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) };
      const nd = { ...data, meals: { ...data.meals, [today]: [...todayMeals, entry] } };
      await save(nd);
      setMealInput("");
    } catch(e) { alert("Couldn't analyze meal. Check your Cloud Function URL is set correctly."); }
    setMealLoading(false);
  };

  const setWater = (cups) => {
    const nd = { ...data, water: { ...data.water, [today]: Math.max(0, Math.min(12, cups)) } };
    save(nd);
  };

  const logStats = () => {
    const nd = {
      ...data,
      weight:       weightInput ? { ...data.weight,       [today]: parseFloat(weightInput) } : data.weight,
      measurements: (waistInput||hipsInput||chestInput) ? { ...data.measurements, [today]: {
        waist: waistInput ? parseFloat(waistInput) : undefined,
        hips:  hipsInput  ? parseFloat(hipsInput)  : undefined,
        chest: chestInput ? parseFloat(chestInput) : undefined,
      }} : data.measurements,
    };
    save(nd);
    setWeightInput(""); setWaistInput(""); setHipsInput(""); setChestInput("");
  };

  const weightEntries = Object.entries(data.weight||{}).sort();
  const measEntries   = Object.entries(data.measurements||{}).sort();
  const weekDays      = WEEK_PLANS[phase * 4];

  // ── styles (same design, unchanged) ──────────────────────────────────────────
  const s = {
    app:        { fontFamily:"Georgia, serif", background:C.cream, minHeight:"100vh", maxWidth:520, margin:"0 auto", paddingBottom:80 },
    header:     { background:C.sageDark, color:"#fff", padding:"20px 18px 14px", position:"sticky", top:0, zIndex:100 },
    h1:         { fontSize:22, fontWeight:700, letterSpacing:"-0.3px" },
    sub:        { fontSize:11, opacity:0.7, marginTop:2 },
    shareRow:   { display:"flex", gap:6, marginTop:10, alignItems:"center", flexWrap:"wrap" },
    codeBox:    { background:"rgba(255,255,255,0.15)", borderRadius:8, padding:"4px 10px", fontSize:13, fontWeight:700, letterSpacing:2, fontFamily:"monospace", color:"#fff", border:"1px solid rgba(255,255,255,0.3)" },
    shareBtn:   { background:C.accent, color:"#fff", border:"none", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, cursor:"pointer" },
    importRow:  { display:"flex", gap:6, marginTop:6 },
    importInput:{ flex:1, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, padding:"4px 10px", fontSize:13, color:"#fff", fontFamily:"monospace", outline:"none" },
    shareMsg:   { fontSize:11, color:C.sageLight, marginTop:4 },
    tabBar:     { display:"flex", background:"#fff", borderBottom:`2px solid ${C.warm}`, position:"sticky", top:80, zIndex:99 },
    tab:    (a) => ({ flex:1, padding:"11px 4px", textAlign:"center", fontSize:11, fontWeight:700, cursor:"pointer", border:"none", background:"none", color:a?C.sageDark:C.muted, borderBottom:a?`3px solid ${C.sageDark}`:"3px solid transparent", fontFamily:"Georgia,serif", transition:"all 0.15s" }),
    section:    { padding:"14px 14px 0" },
    card:       { background:"#fff", borderRadius:14, padding:"14px", marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)", border:`1px solid ${C.warm}` },
    label:      { fontSize:11, fontWeight:700, letterSpacing:1, color:C.muted, textTransform:"uppercase", marginBottom:6 },
    phaseRow:   { display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" },
    phaseBtn:(a)=> ({ padding:"5px 12px", borderRadius:100, border:`2px solid ${a?C.sageDark:C.sageLight}`, background:a?C.sageDark:"#fff", color:a?C.cream:C.sageDark, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all 0.15s" }),
    weekGrid:   { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 },
    dayCard:(type,done) => ({ borderRadius:10, padding:"9px 10px", cursor:type==="rest"?"default":"pointer", background:done?C.sageDark:type==="strength"?"#edf4ee":type==="cardio"?C.cardioLight:"#f0ece7", border:`1.5px solid ${done?C.sageDark:type==="strength"?C.sageLight:type==="cardio"?"#b0a6d4":"#d5cfc6"}`, transition:"all 0.15s" }),
    dayLabel:(done) => ({ fontSize:12, fontWeight:700, color:done?"#fff":C.charcoal }),
    dayType:(done)  => ({ fontSize:10, color:done?"rgba(255,255,255,0.75)":C.muted, marginTop:2 }),
    progressBar:    { background:C.warm, borderRadius:100, height:8, overflow:"hidden", margin:"8px 0" },
    progressFill:(pct,color) => ({ height:"100%", width:`${Math.min(100,pct)}%`, background:color||C.sage, borderRadius:100, transition:"width 0.5s ease" }),
    statRow:    { display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:8 },
    statNum:    { fontSize:24, fontWeight:700, color:C.sageDark },
    statUnit:   { fontSize:11, color:C.muted },
    input:      { width:"100%", border:`1.5px solid ${C.warm}`, borderRadius:9, padding:"9px 12px", fontSize:14, fontFamily:"Georgia,serif", outline:"none", background:"#faf8f5", color:C.charcoal, boxSizing:"border-box" },
    inputSmall: { flex:1, border:`1.5px solid ${C.warm}`, borderRadius:9, padding:"7px 10px", fontSize:13, fontFamily:"Georgia,serif", outline:"none", background:"#faf8f5", color:C.charcoal, boxSizing:"border-box" },
    btn:  (color) => ({ background:color||C.sageDark, color:"#fff", border:"none", borderRadius:9, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"Georgia,serif" }),
    mealEntry:  { borderBottom:`1px solid ${C.warm}`, padding:"9px 0", display:"flex", gap:10, alignItems:"flex-start" },
    mealText:   { fontSize:13, color:C.charcoal, lineHeight:1.4 },
    mealMeta:   { fontSize:11, color:C.muted, marginTop:2 },
    mealNote:   { fontSize:11, color:C.sageDark, marginTop:3, fontStyle:"italic" },
    waterRow:   { display:"flex", gap:5, flexWrap:"wrap", margin:"8px 0" },
    waterCup:(f)=> ({ fontSize:20, cursor:"pointer", opacity:f?1:0.3, transition:"opacity 0.1s" }),
    tipCard:    { background:"#f7f4ef", borderRadius:11, padding:"11px 13px", marginBottom:8, display:"flex", gap:10 },
    tipTitle:   { fontSize:12, fontWeight:700, color:C.sageDark, marginBottom:2 },
    tipBody:    { fontSize:12, color:"#555", lineHeight:1.5 },
    statInputRow: { display:"flex", gap:8, marginBottom:8, flexWrap:"wrap" },
    histRow:    { display:"flex", justifyContent:"space-between", fontSize:12, color:C.muted, padding:"4px 0", borderBottom:`1px solid ${C.warm}` },
    histVal:    { color:C.charcoal, fontWeight:700 },
    saveStatus: { position:"fixed", bottom:90, right:16, background:C.sageDark, color:"#fff", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, opacity:saveStatus?1:0, transition:"opacity 0.3s", zIndex:200, pointerEvents:"none" },
  };

  const renderWorkout = () => (
    <div style={s.section}>
      <div style={s.card}>
        <div style={s.label}>Overall Progress</div>
        <div style={s.statRow}>
          <div><span style={s.statNum}>{totalCompleted}</span> <span style={s.statUnit}>/ {totalWorkoutDays} sessions</span></div>
          <div style={{fontSize:12,color:C.muted}}>{Math.round(totalCompleted/totalWorkoutDays*100)}%</div>
        </div>
        <div style={s.progressBar}><div style={s.progressFill(totalCompleted/totalWorkoutDays*100)}></div></div>
      </div>
      <div style={s.card}>
        <div style={s.label}>Phase</div>
        <div style={s.phaseRow}>
          {PHASE_LABELS.map((p,i) => <button key={i} style={s.phaseBtn(phase===i)} onClick={()=>setPhase(i)}>{p}</button>)}
        </div>
        <div style={{fontSize:11,color:C.muted,marginBottom:10}}>Tap a workout day to mark it complete ✓</div>
        <div style={s.weekGrid}>
          {weekDays.map((day,i) => {
            const key  = `w${phase+1}-${day.label}`;
            const done = !!data.completedDays?.[key];
            const typeLabel = {strength:"💪 Strength",cardio:"🚶 Cardio",rest:"😴 Rest"}[day.type];
            return (
              <div key={i} style={s.dayCard(day.type,done)} onClick={()=>day.type!=="rest"&&toggleDay(key)}>
                <div style={s.dayLabel(done)}>{day.label} {done&&<span style={{float:"right"}}>✓</span>}</div>
                <div style={s.dayType(done)}>{typeLabel}</div>
                {day.exercises&&<div style={{fontSize:10,color:done?"rgba(255,255,255,0.6)":C.muted,marginTop:4}}>{day.exercises.map(e=>EXERCISES[e.ex].name).join(", ")}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderNutrition = () => (
    <div style={s.section}>
      <div style={s.card}>
        <div style={s.label}>Today's Summary</div>
        <div style={{display:"flex",gap:12,marginBottom:12}}>
          {[[`${totalCals}`,"Calories","kcal",C.accent],[`${totalProtein}g`,"Protein","goal 100g+",C.sage],[`${todayMeals.length}`,"Meals","logged",C.cardio]].map(([v,l,u,c],i)=>(
            <div key={i} style={{flex:1,background:"#f8f5f0",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:c}}>{v}</div>
              <div style={{fontSize:10,color:C.muted}}>{l}</div>
              <div style={{fontSize:9,color:C.muted}}>{u}</div>
            </div>
          ))}
        </div>
        <div style={s.progressBar}><div style={s.progressFill(Math.min(100,totalCals/1700*100),C.accent)}></div></div>
        <div style={{fontSize:10,color:C.muted,marginTop:4,textAlign:"right"}}>Target: ~1,600–1,800 kcal</div>
      </div>

      <div style={s.card}>
        <div style={s.label}>💧 Water Intake</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Tap cups to track — aim for 8–10 daily</div>
        <div style={s.waterRow}>
          {Array.from({length:10},(_,i)=>(
            <span key={i} style={s.waterCup(i<todayWater)} onClick={()=>setWater(i<todayWater?i:i+1)}>🥤</span>
          ))}
        </div>
        <div style={{fontSize:13,color:C.water,fontWeight:700}}>{todayWater} / 10 cups</div>
      </div>

      <div style={s.card}>
        <div style={s.label}>Log a Meal</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Describe what you ate — AI estimates nutrition & gives SSRI-friendly feedback</div>
        <textarea style={{...s.input,height:70,resize:"vertical",fontSize:13}} placeholder='e.g. "2 scrambled eggs, spinach, whole wheat toast, black coffee"' value={mealInput} onChange={e=>setMealInput(e.target.value)} />
        <button style={{...s.btn(C.accent),marginTop:8,width:"100%",opacity:mealLoading?0.7:1}} onClick={handleLogMeal} disabled={mealLoading}>
          {mealLoading?"🤔 Analyzing...":"✨ Log & Analyze Meal"}
        </button>
        {todayMeals.length>0&&<div style={{marginTop:12}}>
          <div style={{...s.label,marginBottom:8}}>Today's Meals</div>
          {todayMeals.map((m,i)=>(
            <div key={i} style={s.mealEntry}>
              <div style={{fontSize:18,minWidth:24}}>{"⭐".repeat(Math.round(m.rating||3))}</div>
              <div style={{flex:1}}>
                <div style={s.mealText}>{m.text}</div>
                <div style={s.mealMeta}>{m.time} · {m.cal||"?"}kcal · {m.protein||"?"}g protein</div>
                {m.note&&<div style={s.mealNote}>💬 {m.note}</div>}
              </div>
            </div>
          ))}
        </div>}
      </div>

      <div style={s.card}>
        <div style={s.label}>🌿 SSRI-Friendly Tips</div>
        {SSRI_TIPS.map((t,i)=>(
          <div key={i} style={s.tipCard}>
            <div style={{fontSize:20,minWidth:24}}>{t.emoji}</div>
            <div><div style={s.tipTitle}>{t.title}</div><div style={s.tipBody}>{t.body}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div style={s.section}>
      <div style={s.card}>
        <div style={s.label}>Log Today's Stats</div>
        <div style={s.statInputRow}>
          <input style={s.inputSmall} placeholder="Weight (lbs)" type="number" value={weightInput} onChange={e=>setWeightInput(e.target.value)} />
          <input style={s.inputSmall} placeholder="Waist (in)"   type="number" value={waistInput}  onChange={e=>setWaistInput(e.target.value)} />
        </div>
        <div style={s.statInputRow}>
          <input style={s.inputSmall} placeholder="Hips (in)"    type="number" value={hipsInput}   onChange={e=>setHipsInput(e.target.value)} />
          <input style={s.inputSmall} placeholder="Chest (in)"   type="number" value={chestInput}  onChange={e=>setChestInput(e.target.value)} />
        </div>
        <button style={{...s.btn(),width:"100%"}} onClick={logStats}>Save Measurements</button>
      </div>

      {weightEntries.length>0&&<div style={s.card}>
        <div style={s.label}>⚖️ Weight History</div>
        {(()=>{ const first=weightEntries[0]?.[1]; const last=weightEntries[weightEntries.length-1]?.[1]; const diff=last-first; return (
          <div style={{marginBottom:10}}>
            <span style={{fontSize:22,fontWeight:700,color:C.sageDark}}>{last} lbs</span>
            {weightEntries.length>1&&<span style={{fontSize:13,color:diff<0?C.sage:C.accent,marginLeft:8,fontWeight:700}}>{diff<0?"▼":"▲"} {Math.abs(diff).toFixed(1)} lbs total</span>}
          </div>
        );})()}
        {weightEntries.slice(-6).reverse().map(([date,val],i)=>(
          <div key={i} style={s.histRow}>
            <span>{new Date(date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
            <span style={s.histVal}>{val} lbs</span>
          </div>
        ))}
      </div>}

      {measEntries.length>0&&<div style={s.card}>
        <div style={s.label}>📏 Measurements History</div>
        {measEntries.slice(-4).reverse().map(([date,m],i)=>(
          <div key={i} style={{marginBottom:8}}>
            <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{new Date(date+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
            <div style={{display:"flex",gap:10}}>
              {m.waist&&<div style={{flex:1,background:"#f0f7f0",borderRadius:8,padding:"6px 10px",textAlign:"center"}}><div style={{fontWeight:700,color:C.sageDark}}>{m.waist}"</div><div style={{fontSize:10,color:C.muted}}>Waist</div></div>}
              {m.hips &&<div style={{flex:1,background:"#f0f7f0",borderRadius:8,padding:"6px 10px",textAlign:"center"}}><div style={{fontWeight:700,color:C.sageDark}}>{m.hips}"</div><div style={{fontSize:10,color:C.muted}}>Hips</div></div>}
              {m.chest&&<div style={{flex:1,background:"#f0f7f0",borderRadius:8,padding:"6px 10px",textAlign:"center"}}><div style={{fontWeight:700,color:C.sageDark}}>{m.chest}"</div><div style={{fontSize:10,color:C.muted}}>Chest</div></div>}
            </div>
          </div>
        ))}
      </div>}

      <div style={s.card}>
        <div style={s.label}>📸 Weekly Photo Reminder</div>
        <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Every Sunday morning, same lighting, same outfit. The scale moves slowly on Zoloft — photos often show real changes the scale misses.</div>
      </div>
    </div>
  );

  // ── password gate ─────────────────────────────────────────────────────────
  const handleUnlock = () => {
    if (passwordInput === APP_PASSWORD) {
      sessionStorage.setItem("fit_unlocked", "yes");
      setUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  if (!unlocked) {
    return (
      <div style={{ fontFamily:"Georgia,serif", background:C.sageDark, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:C.cream, borderRadius:20, padding:"36px 28px", maxWidth:340, width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💪</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:22, fontWeight:700, color:C.sageDark, marginBottom:6 }}>Fit Tracker</div>
          <div style={{ fontSize:13, color:C.muted, marginBottom:28, lineHeight:1.5 }}>Enter your password to access the tracker</div>
          <input
            style={{ ...s.input, textAlign:"center", letterSpacing:3, fontSize:16, marginBottom:10, border: passwordError ? `1.5px solid ${C.accent}` : `1.5px solid ${C.warm}` }}
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={e=>{ setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={e=>e.key==="Enter"&&handleUnlock()}
            autoFocus
          />
          {passwordError && <div style={{ fontSize:12, color:C.accent, marginBottom:10 }}>Incorrect password — try again</div>}
          <button style={{ ...s.btn(C.sageDark), width:"100%", padding:"11px", fontSize:14 }} onClick={handleUnlock}>
            Unlock →
          </button>
          <div style={{ fontSize:11, color:C.muted, marginTop:16, lineHeight:1.5 }}>
            This app is private.<br/>Contact the owner for access.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={s.h1}>💪 12-Week Fit Tracker</div>
        <div style={s.sub}>SSRI-aware · Cloud-synced · Shareable</div>
        <div style={s.shareRow}>
          <span style={{fontSize:11,opacity:0.7}}>Your code:</span>
          <span style={s.codeBox}>{shareCode}</span>
          <button style={s.shareBtn} onClick={handleShare}>📋 Copy Code</button>
        </div>
        <div style={s.importRow}>
          <input style={s.importInput} placeholder="Enter code to load progress…" value={importCode} onChange={e=>setImportCode(e.target.value.toUpperCase())} />
          <button style={{...s.shareBtn,background:"rgba(255,255,255,0.2)"}} onClick={handleImport}>Load</button>
        </div>
        {shareMsg&&<div style={s.shareMsg}>{shareMsg}</div>}
      </div>

      <div style={s.tabBar}>
        {[["workout","🏋️ Workouts"],["nutrition","🥗 Nutrition"],["progress","📈 Progress"]].map(([id,label])=>(
          <button key={id} style={s.tab(tab===id)} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab==="workout"   && renderWorkout()}
      {tab==="nutrition" && renderNutrition()}
      {tab==="progress"  && renderProgress()}

      <div style={s.saveStatus}>{saveStatus}</div>
    </div>
  );
}

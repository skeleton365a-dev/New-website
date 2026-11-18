import React, { useEffect, useMemo, useState } from "react";
import CurriculumCenter from "./CurriculumCenter.jsx";
import QuizLab from "./QuizLab.jsx";
import {
  LayoutDashboard, CalendarDays, BookOpen, NotebookPen, Brain, Calculator,
  GraduationCap, Clock3, Target, Settings, Search, Plus, Trash2, Check,
  Bell, Sparkles, Menu, X, ChevronRight, ChevronLeft, Play, Pause, RotateCcw,
  FileText, ClipboardList, Layers, Lightbulb, BookMarked, ChartNoAxesCombined,
  ListTodo, AlarmClock, Save, Download, Upload, Sun, Moon, WandSparkles,
  MessageCircle, CircleHelp, Timer, Trophy, Bookmark, Pencil, ArrowRight,
  BrainCircuit, Languages, FlaskConical, Sigma, CalendarCheck, Zap, CircleCheck, Library,
  CircleAlert, RefreshCw, Copy, ExternalLink, Star, Filter, GraduationCap as Cap
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from "recharts";

const STORE = "student-hub-pro-v1";
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);
const starter = {
  profile: { name: "Student", grade: "Class 12", board: "Choose your board", school: "", goal: "Stay consistent" },
  subjects: [
    { id: "s1", name: "Mathematics", color: "#8b7cf6", chapters: ["Functions", "Limits", "Differentiation"], done: [true, false, false] },
    { id: "s2", name: "Physics", color: "#39b7a5", chapters: ["Electrostatics", "Current Electricity", "Magnetism"], done: [false, false, false] },
    { id: "s3", name: "Computer Science", color: "#e5a84b", chapters: ["Programming", "Data Structures", "Databases"], done: [true, true, false] }
  ],
  tasks: [
    { id: "t1", title: "Revise Mathematics: Functions", date: today(), time: "18:00", subject: "Mathematics", priority: "High", done: false, reminder: true },
    { id: "t2", title: "Solve Physics numericals", date: today(), time: "19:00", subject: "Physics", priority: "Medium", done: false, reminder: false }
  ],
  notes: [
    { id: "n1", title: "Functions — quick notes", subject: "Mathematics", body: "A function maps every input to exactly one output. Domain is the set of allowed inputs; range is the set of actual outputs.", pinned: true, created: today() }
  ],
  flashcards: [
    { id: "f1", front: "What is a function?", back: "A relation that assigns exactly one output to each input." },
    { id: "f2", front: "SI unit of electric current?", back: "Ampere (A)." }
  ],
  quizzes: [], sessions: [], timetable: [], goals: [], resources: [], journal: [],
  studyDocuments: [], questionBank: [], customChapters: [],
  settings: { theme: "dark", accent: "#8b7cf6", notifications: true, sound: false, focusMinutes: 25, breakMinutes: 5, aiProvider: "gemini", aiKey: "", language: "English" }
};

function loadData() {
  try { return { ...starter, ...JSON.parse(localStorage.getItem(STORE) || "{}") }; }
  catch { return starter; }
}
const saveBlob = (name, content, type = "text/plain") => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

const navGroups = [
  { label: "Workspace", items: [
    ["Dashboard", LayoutDashboard], ["Planner", CalendarDays], ["Subjects", BookOpen], ["Syllabus Library", Library],
    ["Notes", NotebookPen], ["AI Tutor", Sparkles], ["Problem Solver", Calculator]
  ]},
  { label: "Study tools", items: [
    ["Flashcards", Layers], ["Quiz Maker", ClipboardList], ["Focus Room", Timer],
    ["Study Tracker", ChartNoAxesCombined], ["Timetable", CalendarCheck], ["Resources", BookMarked]
  ]},
  { label: "Personal", items: [
    ["Goals", Target], ["Study Journal", FileText], ["Settings", Settings]
  ]}
];

const aiTools = [
  ["Explain my notes", "Turn difficult notes into a clear, step-by-step explanation."],
  ["Summarise chapter", "Create a concise chapter summary with key concepts."],
  ["Make flashcards", "Create question-and-answer flashcards from study text."],
  ["Generate MCQs", "Create multiple-choice questions with answer explanations."],
  ["Make a study plan", "Build a realistic study plan from subjects and deadlines."],
  ["Ask a tutor", "Ask a question and get a patient, step-by-step tutor response."],
  ["Simplify this topic", "Explain a topic in beginner-friendly language."],
  ["Find key points", "Extract definitions, formulas and important points."],
  ["Create revision sheet", "Create a one-page revision sheet from your notes."],
  ["Check my answer", "Review your written answer and suggest improvements."],
  ["Make practice questions", "Generate short and long practice questions."],
  ["Translate study text", "Translate educational text while preserving meaning."]
];

function App() {
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState("");
  const [form, setForm] = useState({});
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [activeAi, setActiveAi] = useState("Ask a tutor");
  const [showKey, setShowKey] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusMode, setFocusMode] = useState("focus");
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { setToast("Browser storage is full. Export a backup and remove older imported files."); } }, [data]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!focusRunning) return;
    const t = setInterval(() => setFocusSeconds(s => {
      if (s <= 1) { setFocusRunning(false); setToast(focusMode === "focus" ? "Focus session complete. Take a short break." : "Break complete. Ready for another session?"); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [focusRunning, focusMode]);
  useEffect(() => {
    if (!data.settings.notifications) return;
    const checkReminders = () => {
      const due = data.tasks.filter(t => !t.done && t.reminder && t.date === today() && t.time);
      const now = new Date();
      due.forEach(t => {
        const [h, m] = t.time.split(":").map(Number);
        const key = "reminded-" + t.id + today();
        if (now.getHours() === h && now.getMinutes() === m && !sessionStorage.getItem(key)) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Study reminder", { body: t.title });
          }
          setToast("Reminder: " + t.title);
          sessionStorage.setItem(key, "1");
        }
      });
    };
    checkReminders();
    const timer = window.setInterval(checkReminders, 15000);
    return () => window.clearInterval(timer);
  }, [data.tasks, data.settings.notifications]);

  const update = (key, value) => setData(d => ({ ...d, [key]: value }));
  const notify = msg => setToast(msg);
  const addTask = () => {
    if (!form.title?.trim()) return notify("Please enter a task title.");
    update("tasks", [...data.tasks, { id: uid(), title: form.title, date: form.date || today(), time: form.time || "", subject: form.subject || "", priority: form.priority || "Medium", done: false, reminder: !!form.reminder }]);
    setForm({}); setModal(""); notify("Task added to your planner.");
  };
  const addSubject = () => {
    if (!form.name?.trim()) return notify("Enter a subject name first.");
    update("subjects", [...data.subjects, { id: uid(), name: form.name, color: form.color || "#8b7cf6", chapters: (form.chapters || "").split("\n").map(x => x.trim()).filter(Boolean), done: [] }]);
    setForm({}); setModal(""); notify("Subject added.");
  };
  const addNote = () => {
    if (!form.title?.trim() || !form.body?.trim()) return notify("A note needs a title and content.");
    update("notes", [{ id: uid(), title: form.title, subject: form.subject || "", body: form.body, pinned: false, created: today() }, ...data.notes]);
    setForm({}); setModal(""); notify("Note saved.");
  };
  const addFlashcard = () => {
    if (!form.front?.trim() || !form.back?.trim()) return notify("Fill in both sides of the flashcard.");
    update("flashcards", [...data.flashcards, { id: uid(), front: form.front, back: form.back }]);
    setForm({}); setModal(""); notify("Flashcard created.");
  };
  const addGoal = () => {
    if (!form.title?.trim()) return notify("Give your goal a name.");
    update("goals", [...data.goals, { id: uid(), title: form.title, target: form.target || "Complete consistently", progress: 0, due: form.due || "" }]);
    setForm({}); setModal(""); notify("Goal created.");
  };
  const addResource = () => {
    if (!form.title?.trim()) return notify("Enter a resource title.");
    update("resources", [...data.resources, { id: uid(), title: form.title, url: form.url || "", subject: form.subject || "", type: form.type || "Link" }]);
    setForm({}); setModal(""); notify("Resource saved.");
  };
  const addJournal = () => {
    if (!form.body?.trim()) return notify("Write something before saving.");
    update("journal", [{ id: uid(), date: today(), mood: form.mood || "Okay", body: form.body }, ...data.journal]);
    setForm({}); setModal(""); notify("Journal entry saved.");
  };
  const deleteItem = (key, id) => update(key, data[key].filter(x => x.id !== id));
  const toggleTask = id => update("tasks", data.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const toggleChapter = (sid, i) => update("subjects", data.subjects.map(s => s.id === sid ? { ...s, done: s.chapters.map((_, j) => j === i ? !s.done[j] : !!s.done[j]) } : s));
  const totalChapters = data.subjects.reduce((a, s) => a + s.chapters.length, 0);
  const doneChapters = data.subjects.reduce((a, s) => a + s.done.filter(Boolean).length, 0);
  const completedTasks = data.tasks.filter(t => t.done).length;
  const todayTasks = data.tasks.filter(t => t.date === today());
  const progress = totalChapters ? Math.round(doneChapters / totalChapters * 100) : 0;
  const chartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({ day, hours: data.sessions.slice(-7)[i]?.minutes ? +(data.sessions.slice(-7)[i].minutes / 60).toFixed(1) : 0 }));
  const filteredNotes = data.notes.filter(n => (n.title + n.body + n.subject).toLowerCase().includes(query.toLowerCase()));
  const setSetting = (key, value) => update("settings", { ...data.settings, [key]: value });
  const openModal = (type) => { setForm({}); setModal(type); };
  const requestNotifications = async () => {
    if (!("Notification" in window)) return notify("This browser does not support desktop notifications.");
    const result = await Notification.requestPermission();
    notify(result === "granted" ? "Notifications enabled." : "Notification permission was not granted.");
  };
  const runAI = async (tool = activeAi) => {
    if (!aiInput.trim()) return notify("Add your topic, question or notes first.");
    setAiBusy(true); setAiOutput("");
    const prompts = {
      "Explain my notes": "Explain these notes in simple language. Define difficult terms, use an example, then give a short recap.",
      "Summarise chapter": "Create a clear chapter summary with headings, key ideas, definitions and a final recap.",
      "Make flashcards": "Create 8 concise flashcards. Format each as Q: and A:.",
      "Generate MCQs": "Create 10 MCQs with four options each. Mark the correct answer and explain why.",
      "Make a study plan": "Create a balanced, realistic study plan with breaks, revision and practice. Do not overload the student.",
      "Ask a tutor": "Act as a patient, encouraging teacher. Explain step by step, check assumptions and include a simple example.",
      "Simplify this topic": "Explain this for a beginner using plain language and one everyday analogy.",
      "Find key points": "Extract the most important points, definitions, formulas and likely exam facts.",
      "Create revision sheet": "Create a compact revision sheet with headings, definitions, formulas and common mistakes.",
      "Check my answer": "Review this student's answer. Explain what is correct, what needs improvement and provide a model answer.",
      "Make practice questions": "Create a mix of short-answer and longer practice questions, then provide a separate answer key.",
      "Translate study text": "Translate the text into clear, natural language while preserving technical terms and meaning."
    };
    const prompt = `${prompts[tool] || prompts["Ask a tutor"]}\n\nStudent's input:\n${aiInput}`;
    try {
      if (data.settings.aiKey.trim()) {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + encodeURIComponent(data.settings.aiKey), {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const json = await response.json();
        if (!response.ok) throw new Error(json.error?.message || "AI request failed. Check your API key.");
        setAiOutput(json.candidates?.[0]?.content?.parts?.map(p => p.text).join("\n") || "No response returned.");
      } else {
        setAiOutput(localAssist(tool, aiInput));
      }
    } catch (e) { setAiOutput("Could not reach the AI service: " + e.message + "\n\nCheck your connection and API key in Settings."); }
    finally { setAiBusy(false); }
  };
  const localAssist = (tool, input) => {
    const clean = input.trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (tool === "Find key points") return "KEY POINTS\n" + sentences.slice(0, 8).map((s, i) => `${i + 1}. ${s}`).join("\n") + "\n\nTip: Add a configured AI key for deeper concept extraction.";
    if (tool === "Summarise chapter" || tool === "Create revision sheet") return `${tool.toUpperCase()}\n\n${sentences.slice(0, 5).join(" ")}\n\nQUICK REVISION\n• Read each concept once.\n• Close your notes and recall the main ideas.\n• Solve practice questions to check understanding.\n\nThis is a basic offline draft. Configure an AI key for a full generated response.`;
    if (tool === "Make flashcards") return sentences.slice(0, 8).map((s, i) => `Card ${i + 1}\nQ: What is the key idea in: "${s.slice(0, 70)}${s.length > 70 ? "…" : ""}"?\nA: ${s}`).join("\n\n") || "Add a few sentences to create flashcards.";
    if (tool === "Generate MCQs" || tool === "Make practice questions") return sentences.slice(0, 6).map((s, i) => `${i + 1}. Explain this idea in your own words: ${s}`).join("\n\n") + "\n\nOffline mode creates prompts from your text, not verified exam questions.";
    return `OFFLINE STUDY HELPER — ${tool}\n\nI can help you organise the material, but full AI tutoring requires an API key in Settings.\n\nYour input:\n${clean}\n\nTry this approach:\n1. Identify the main concept.\n2. Break it into smaller parts.\n3. Write one example.\n4. Test yourself without looking at the notes.\n\nFor a detailed, generated explanation, add your own Gemini API key in Settings.`;
  };

  const pageTitle = page;
  const headerAction = () => {
    if (page === "Planner") openModal("task");
    else if (page === "Subjects") openModal("subject");
    else if (page === "Notes") openModal("note");
    else if (page === "Flashcards") openModal("flashcard");
    else if (page === "Goals") openModal("goal");
    else if (page === "Resources") openModal("resource");
    else if (page === "Study Journal") openModal("journal");
    else openModal("task");
  };

  return <div className={`app ${data.settings.theme}`}>
    <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark"><GraduationCap size={22}/></div><div><b>Lahore Student Hub</b><small>BISE EDITION · YOUR STUDY SPACE</small></div><button className="mobile-close" onClick={() => setMobileNav(false)}><X/></button></div>
      <div className="profile-mini"><div className="avatar">{(data.profile.name || "S").slice(0,1).toUpperCase()}</div><div><b>{data.profile.name || "Student"}</b><small>{data.profile.grade} · {data.profile.board}</small></div></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(([name, Icon]) => <button key={name} className={`nav-item ${page === name ? "active" : ""}`} onClick={() => { setPage(name); setMobileNav(false); }}><Icon size={17}/><span>{name}</span>{page === name && <span className="nav-dot"/>}</button>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="streak-card"><div className="streak-top"><Zap size={16}/><b>Keep your streak alive</b></div><p>Small, consistent study sessions add up.</p><div className="streak-line"><span style={{width: `${progress}%`}}/></div><small>{progress}% syllabus progress</small></div><button className="help-link" onClick={() => setPage("Settings")}><CircleHelp size={16}/> Help & settings</button></div>
    </aside>
    {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)}/>}
    <main className="main">
      <header className="topbar"><div className="top-left"><button className="menu-btn" onClick={() => setMobileNav(true)}><Menu/></button><div><div className="breadcrumb">STUDENT WORKSPACE <ChevronRight size={13}/> {page.toUpperCase()}</div><h1>{pageTitle}</h1></div></div><div className="top-actions"><div className="today-pill"><CalendarDays size={15}/>{new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}</div><button className="icon-btn" title="Enable reminders" onClick={requestNotifications}><Bell size={18}/></button>{!["Quiz Maker", "Syllabus Library"].includes(page) && <button className="primary-btn" onClick={headerAction}><Plus size={17}/> {page === "Dashboard" ? "Add task" : `Add ${page === "Planner" ? "task" : page === "Subjects" ? "subject" : page === "Notes" ? "note" : "new"}`}</button>}</div></header>
      <div className="content">
        {page === "Dashboard" && <Dashboard data={data} progress={progress} doneChapters={doneChapters} totalChapters={totalChapters} completedTasks={completedTasks} todayTasks={todayTasks} chartData={chartData} toggleTask={toggleTask} setPage={setPage} openModal={openModal}/>}
        {page === "Planner" && <Planner data={data} toggleTask={toggleTask} deleteItem={deleteItem} openModal={openModal}/>}
        {page === "Subjects" && <Subjects data={data} toggleChapter={toggleChapter} deleteItem={deleteItem} openModal={openModal}/>}
        {page === "Notes" && <Notes notes={filteredNotes} query={query} setQuery={setQuery} update={update} data={data} deleteItem={deleteItem} openModal={openModal} setAiInput={setAiInput} setPage={setPage}/>}
        {page === "AI Tutor" && <AITutor tools={aiTools} activeAi={activeAi} setActiveAi={setActiveAi} aiInput={aiInput} setAiInput={setAiInput} aiOutput={aiOutput} aiBusy={aiBusy} runAI={runAI}/>}
        {page === "Problem Solver" && <ProblemSolver aiInput={aiInput} setAiInput={setAiInput} aiOutput={aiOutput} aiBusy={aiBusy} runAI={runAI} setActiveAi={setActiveAi}/>}
        {page === "Flashcards" && <Flashcards data={data} cardIndex={cardIndex} setCardIndex={setCardIndex} cardFlipped={cardFlipped} setCardFlipped={setCardFlipped} deleteItem={deleteItem} openModal={openModal}/>}
        {page === "Quiz Maker" && <QuizLab data={data} update={update} notify={notify}/> }
        {page === "Syllabus Library" && <CurriculumCenter data={data} update={update} notify={notify} setPage={setPage}/> }
        {page === "Focus Room" && <FocusRoom seconds={focusSeconds} setSeconds={setFocusSeconds} running={focusRunning} setRunning={setFocusRunning} mode={focusMode} setMode={setFocusMode} data={data} update={update}/>}
        {page === "Study Tracker" && <Tracker data={data} progress={progress} doneChapters={doneChapters} totalChapters={totalChapters} chartData={chartData}/>}
        {page === "Timetable" && <Timetable data={data} update={update}/>}
        {page === "Resources" && <Resources data={data} deleteItem={deleteItem} openModal={openModal}/>}
        {page === "Goals" && <Goals data={data} update={update} deleteItem={deleteItem} openModal={openModal}/>}
        {page === "Study Journal" && <Journal data={data} deleteItem={deleteItem} openModal={openModal}/>}
        {page === "Settings" && <SettingsPage data={data} update={update} setSetting={setSetting} showKey={showKey} setShowKey={setShowKey}/>}
      </div>
    </main>
    {modal && <Modal type={modal} form={form} setForm={setForm} close={() => setModal("")} addTask={addTask} addSubject={addSubject} addNote={addNote} addFlashcard={addFlashcard} addGoal={addGoal} addResource={addResource} addJournal={addJournal} data={data}/>}
    {toast && <div className="toast"><CircleCheck size={17}/>{toast}</div>}
  </div>;
}

function SectionHead({title, subtitle, action, onAction}) {
  return <div className="section-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="outline-btn" onClick={onAction}><Plus size={15}/>{action}</button>}</div>;
}
function Stat({label, value, hint, icon: Icon, tone}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-hint">{hint}</div></div>;
}
function Dashboard({data, progress, doneChapters, totalChapters, completedTasks, todayTasks, chartData, toggleTask, setPage, openModal}) {
  const pending = todayTasks.filter(t => !t.done);
  return <>
    <div className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL STUDY COMMAND CENTRE</div><h2>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {data.profile.name || "Student"}.</h2><p>Make today count. One focused session at a time.</p></div><div className="welcome-art"><div className="orbit o1"/><div className="orbit o2"/><div className="book-emoji"><BookOpen size={40}/></div><Sparkles className="spark s1"/><Star className="spark s2"/></div></div>
    <div className="stats-grid"><Stat label="Syllabus completed" value={`${progress}%`} hint={`${doneChapters} of ${totalChapters} chapters`} icon={BookOpen} tone="purple"/><Stat label="Tasks completed" value={completedTasks} hint={`${data.tasks.length - completedTasks} still on your list`} icon={CircleCheck} tone="green"/><Stat label="Study sessions" value={data.sessions.length} hint="Sessions tracked here" icon={Clock3} tone="blue"/><Stat label="Active goals" value={data.goals.filter(g=>g.progress<100).length} hint="Keep moving forward" icon={Target} tone="orange"/></div>
    <div className="dashboard-grid"><div className="panel chart-panel"><div className="panel-head"><div><h3>Study activity</h3><p>Your tracked study time</p></div><button className="text-btn" onClick={()=>setPage("Study Tracker")}>View report <ArrowRight size={14}/></button></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="studyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b7cf6" stopOpacity={.35}/><stop offset="100%" stopColor="#8b7cf6" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"var(--muted)",fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"var(--muted)",fontSize:11}}/><Tooltip contentStyle={{background:"var(--panel)",border:"1px solid var(--line)",borderRadius:12,color:"var(--text)"}}/><Area type="monotone" dataKey="hours" stroke="#8b7cf6" strokeWidth={2.5} fill="url(#studyFill)"/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><i className="legend-dot"/> Hours studied</span><small>Log sessions in Focus Room</small></div></div>
      <div className="panel today-panel"><div className="panel-head"><div><h3>Today's plan</h3><p>{pending.length} tasks remaining</p></div><button className="round-add" onClick={()=>openModal("task")}><Plus size={17}/></button></div>{todayTasks.length ? <div className="task-list">{todayTasks.slice(0,5).map(t=><TaskRow key={t.id} task={t} toggle={toggleTask}/>)}</div> : <Empty icon={CalendarDays} title="Your day is clear" text="Add a task and make a plan."/>}<button className="wide-link" onClick={()=>setPage("Planner")}>Open planner <ArrowRight size={14}/></button></div></div>
    <div className="lower-grid"><div className="panel"><div className="panel-head"><div><h3>My subjects</h3><p>Pick up where you left off</p></div><button className="text-btn" onClick={()=>setPage("Subjects")}>All subjects <ArrowRight size={14}/></button></div>{data.subjects.slice(0,4).map(s=>{const pct=s.chapters.length?Math.round(s.done.filter(Boolean).length/s.chapters.length*100):0;return <div className="subject-progress" key={s.id}><div className="subject-line"><span className="subject-color" style={{background:s.color}}/><b>{s.name}</b><small>{pct}%</small></div><div className="progress-track"><span style={{width:pct+"%",background:s.color}}/></div></div>})}{!data.subjects.length&&<Empty icon={BookOpen} title="No subjects yet" text="Add your first subject to start tracking."/>}</div>
      <div className="panel quick-panel"><div className="panel-head"><div><h3>Study shortcuts</h3><p>Jump straight into learning</p></div><Sparkles size={18} className="muted-icon"/></div><div className="shortcut-grid"><Shortcut icon={Sparkles} label="Ask AI tutor" onClick={()=>setPage("AI Tutor")}/><Shortcut icon={NotebookPen} label="Write a note" onClick={()=>openModal("note")}/><Shortcut icon={Timer} label="Focus session" onClick={()=>setPage("Focus Room")}/><Shortcut icon={Layers} label="Flashcards" onClick={()=>setPage("Flashcards")}/></div></div></div>
  </>;
}
function TaskRow({task,toggle}) { return <div className={`task-row ${task.done?"completed":""}`}><button className={`check-circle ${task.done?"checked":""}`} onClick={()=>toggle(task.id)}>{task.done&&<Check size={13}/>}</button><div className="task-info"><b>{task.title}</b><small>{task.time || "No time set"} {task.subject ? "· "+task.subject : ""}</small></div><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></div>; }
function Empty({icon:Icon,title,text}) {return <div className="empty"><div><Icon size={22}/></div><b>{title}</b><p>{text}</p></div>}
function Shortcut({icon:Icon,label,onClick}) {return <button className="shortcut" onClick={onClick}><span><Icon size={18}/></span><b>{label}</b><ChevronRight size={15}/></button>}

function Planner({data,toggleTask,deleteItem,openModal}) {
  const [filter,setFilter]=useState("All");
  const tasks=[...data.tasks].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).filter(t=>filter==="All"||(filter==="Completed"?t.done:!t.done));
  return <><SectionHead title="Smart planner" subtitle="Plan assignments, revision, deadlines and daily study sessions." action="Add task" onAction={()=>openModal("task")}/><div className="filter-row">{["All","Pending","Completed"].map(x=><button className={filter===x?"filter active":"filter"} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div><div className="panel"><div className="task-table-head"><span>Task</span><span>Due date</span><span>Priority</span><span>Status</span><span/></div>{tasks.map(t=><div className="task-table-row" key={t.id}><div className="task-table-title"><button className={`check-circle ${t.done?"checked":""}`} onClick={()=>toggleTask(t.id)}>{t.done&&<Check size={13}/>}</button><div><b>{t.title}</b><small>{t.subject || "General"} {t.reminder?"· Reminder on":""}</small></div></div><span>{t.date}{t.time?" · "+t.time:""}</span><span className={`priority ${t.priority.toLowerCase()}`}>{t.priority}</span><span className={t.done?"status-done":"status-pending"}>{t.done?"Completed":"Pending"}</span><button className="icon-btn danger" onClick={()=>deleteItem("tasks",t.id)}><Trash2 size={16}/></button></div>)}{!tasks.length&&<Empty icon={ListTodo} title="Nothing here yet" text="Add a task to organise your study day."/>}</div></>;
}
function Subjects({data,toggleChapter,deleteItem,openModal}) {
  return <><SectionHead title="My subjects" subtitle="Organise your syllabus and track every chapter." action="Add subject" onAction={()=>openModal("subject")}/><div className="subject-grid">{data.subjects.map(s=>{const count=s.done.filter(Boolean).length,pct=s.chapters.length?Math.round(count/s.chapters.length*100):0;return <div className="panel subject-card" key={s.id}><div className="subject-card-top"><span className="subject-icon" style={{background:s.color+"22",color:s.color}}><BookOpen/></span><button className="icon-btn danger" onClick={()=>deleteItem("subjects",s.id)}><Trash2 size={16}/></button></div><h3>{s.name}</h3><div className="subject-meta">{count}/{s.chapters.length} chapters completed <b>{pct}%</b></div><div className="progress-track"><span style={{width:pct+"%",background:s.color}}/></div><div className="chapter-list">{s.chapters.map((c,i)=><label className="chapter-item" key={i}><input type="checkbox" checked={!!s.done[i]} onChange={()=>toggleChapter(s.id,i)}/><span className={s.done[i]?"strike":""}>{c}</span></label>)}</div>{!s.chapters.length&&<p className="muted">No chapters added. Edit the subject or add a new one with chapter names.</p>}</div>})}{!data.subjects.length&&<Empty icon={BookOpen} title="Add your first subject" text="Create subjects and add their chapters to track progress."/>}</div></>;
}
function Notes({notes,query,setQuery,update,data,deleteItem,openModal,setAiInput,setPage}) {
  const explain = n => {setAiInput(n.body);setPage("AI Tutor");};
  return <><SectionHead title="Notes library" subtitle="Your searchable notebook for class notes, summaries and revision." action="Create note" onAction={()=>openModal("note")}/><div className="searchbar"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search notes, subjects or keywords..."/><span>{notes.length} notes</span></div><div className="notes-grid">{notes.map(n=><article className="note-card" key={n.id}><div className="note-card-head"><span className="tag">{n.subject||"General"}</span><div><button className="icon-btn" title="Explain with AI" onClick={()=>explain(n)}><Sparkles size={16}/></button><button className="icon-btn" title="Pin note" onClick={()=>update("notes",data.notes.map(x=>x.id===n.id?{...x,pinned:!x.pinned}:x))}><Star size={16} fill={n.pinned?"currentColor":"none"}/></button><button className="icon-btn danger" onClick={()=>deleteItem("notes",n.id)}><Trash2 size={16}/></button></div></div><h3>{n.title}</h3><p>{n.body}</p><div className="note-footer"><small>{n.created}</small><button className="text-btn" onClick={()=>explain(n)}>Explain notes <Sparkles size={14}/></button></div></article>)}{!notes.length&&<Empty icon={NotebookPen} title="No notes found" text="Create a note or try a different search."/>}</div></>;
}
function AITutor({tools,activeAi,setActiveAi,aiInput,setAiInput,aiOutput,aiBusy,runAI}) {
  return <><div className="ai-hero"><div className="ai-orb"><BrainCircuit size={34}/></div><div><div className="eyebrow">YOUR PERSONAL LEARNING ASSISTANT</div><h2>Meet your AI study tutor.</h2><p>Ask questions, simplify difficult topics, turn notes into revision material and practise what you learn.</p></div></div><div className="ai-layout"><div className="panel ai-tools"><div className="panel-head"><div><h3>AI study tools</h3><p>Choose what you need help with</p></div></div>{tools.map(([name,desc])=><button className={`ai-tool ${activeAi===name?"selected":""}`} key={name} onClick={()=>setActiveAi(name)}><span className="ai-tool-icon"><Sparkles size={16}/></span><span><b>{name}</b><small>{desc}</small></span><ChevronRight size={15}/></button>)}</div><div className="panel ai-workspace"><div className="ai-work-head"><div><span className="live-dot"/> STUDY ASSISTANT</div><span className="tag">{activeAi}</span></div><h3>{activeAi}</h3><p className="muted">Paste your notes, enter a topic or ask a question below.</p><textarea className="ai-input" value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="For example: Explain Newton's second law with a simple example..."/><div className="ai-controls"><small>More context usually gives a better answer.</small><button className="primary-btn" disabled={aiBusy} onClick={()=>runAI(activeAi)}><Sparkles size={16}/>{aiBusy?"Thinking...":"Generate response"}</button></div>{aiOutput&&<div className="ai-response"><div className="response-title"><Sparkles size={16}/> STUDY RESPONSE <button className="text-btn" onClick={()=>navigator.clipboard?.writeText(aiOutput)}><Copy size={14}/> Copy</button></div><pre>{aiOutput}</pre></div>}<div className="ai-disclaimer">Without an API key, this workspace uses basic offline study helpers. Add a Gemini API key in Settings to enable live AI responses.</div></div></div></>;
}
function ProblemSolver({aiInput,setAiInput,aiOutput,aiBusy,runAI,setActiveAi}) {
  const solve = () => {setActiveAi("Ask a tutor");runAI("Ask a tutor");};
  return <><SectionHead title="Problem solver" subtitle="Work through academic questions with a step-by-step learning approach."/><div className="solver-grid"><div className="panel solver-main"><div className="solver-icon"><Sigma size={25}/></div><h3>What are you stuck on?</h3><p className="muted">Enter a maths problem, science concept, programming question or written question.</p><textarea className="solver-input" value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder={"Example:\nSolve 2x + 5 = 17 and explain each step."}/><div className="solver-options"><span><Calculator size={15}/> Maths</span><span><FlaskConical size={15}/> Science</span><span><Brain size={15}/> Concepts</span><span><Cap size={15}/> Homework help</span></div><button className="primary-btn" disabled={aiBusy} onClick={solve}><WandSparkles size={16}/>{aiBusy?"Solving...":"Explain step by step"}</button>{aiOutput&&<div className="ai-response"><pre>{aiOutput}</pre></div>}</div><div className="panel solver-tips"><h3>How to get a useful explanation</h3>{["Write the complete question, including given values.","Mention your class or level if the topic is advanced.","Tell the tutor where you got stuck.","Try the solution yourself after reading the steps."].map((x,i)=><div className="tip-row" key={i}><span>{i+1}</span><p>{x}</p></div>)}<div className="notice"><Lightbulb size={17}/> Use the explanation to learn the method, not just copy the final answer.</div></div></div></>;
}
function Flashcards({data,cardIndex,setCardIndex,cardFlipped,setCardFlipped,deleteItem,openModal}) {
  const cards=data.flashcards;const card=cards[cardIndex];
  return <><SectionHead title="Flashcards" subtitle="Use active recall to remember definitions, formulas and key concepts." action="Create flashcard" onAction={()=>openModal("flashcard")}/><div className="flash-wrap">{card?<><div className="flash-count">CARD {cardIndex+1} OF {cards.length}</div><button className="flash-card" onClick={()=>setCardFlipped(!cardFlipped)}><span className="flash-label">{cardFlipped?"ANSWER":"QUESTION"}</span><h2>{cardFlipped?card.back:card.front}</h2><small>Click to flip</small></button><div className="flash-controls"><button className="outline-btn" onClick={()=>{setCardIndex((cardIndex-1+cards.length)%cards.length);setCardFlipped(false)}}><ChevronLeft/> Previous</button><button className="primary-btn" onClick={()=>{setCardIndex((cardIndex+1)%cards.length);setCardFlipped(false)}}>Next card <ChevronRight/></button></div><button className="text-btn danger-text" onClick={()=>{deleteItem("flashcards",card.id);setCardIndex(0);setCardFlipped(false)}}><Trash2 size={14}/> Delete this card</button></>:<Empty icon={Layers} title="No flashcards yet" text="Create your first card to start practising."/>}</div></>;
}
function FocusRoom({seconds,setSeconds,running,setRunning,mode,setMode,data,update}) {
  const mins=Math.floor(seconds/60),secs=seconds%60;const total=(mode==="focus"?data.settings.focusMinutes:data.settings.breakMinutes)*60;const pct=total?((total-seconds)/total)*100:0;
  const finishSession=()=>{if(mode==="focus")update("sessions",[...data.sessions,{id:uid(),date:today(),minutes:data.settings.focusMinutes}]);setMode(mode==="focus"?"break":"focus");setSeconds((mode==="focus"?data.settings.breakMinutes:data.settings.focusMinutes)*60);setRunning(false);};
  return <><SectionHead title="Focus room" subtitle="A calm space for deep work, timed study and proper breaks."/><div className="focus-layout"><div className="panel focus-panel"><div className="mode-tabs"><button className={mode==="focus"?"active":""} onClick={()=>{setMode("focus");setRunning(false);setSeconds(data.settings.focusMinutes*60)}}>Focus</button><button className={mode==="break"?"active":""} onClick={()=>{setMode("break");setRunning(false);setSeconds(data.settings.breakMinutes*60)}}>Short break</button></div><div className="timer-ring"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="96"/><circle className="timer-progress" cx="110" cy="110" r="96" style={{strokeDashoffset:603-(603*pct/100)}}/></svg><div className="timer-value"><strong>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</strong><small>{mode==="focus"?"STAY FOCUSED":"TAKE A BREATHER"}</small></div></div><div className="timer-actions"><button className="primary-btn" onClick={()=>{if(seconds===0)setSeconds(total);setRunning(!running)}}>{running?<Pause size={17}/>:<Play size={17}/>} {running?"Pause":"Start session"}</button><button className="outline-btn" onClick={()=>{setRunning(false);setSeconds(total)}}><RotateCcw size={16}/> Reset</button><button className="outline-btn" onClick={finishSession}>Finish</button></div></div><div className="panel focus-settings"><h3>Focus settings</h3><label>Focus duration <b>{data.settings.focusMinutes} min</b><input type="range" min="10" max="90" step="5" value={data.settings.focusMinutes} onChange={e=>{const v=+e.target.value;update("settings",{...data.settings,focusMinutes:v});if(mode==="focus"&&!running)setSeconds(v*60)}}/></label><label>Break duration <b>{data.settings.breakMinutes} min</b><input type="range" min="3" max="20" value={data.settings.breakMinutes} onChange={e=>update("settings",{...data.settings,breakMinutes:+e.target.value})}/></label><div className="notice"><Lightbulb size={17}/> Put your phone away, choose one task and work on it until the timer ends.</div><div className="focus-stat"><Clock3/><div><b>{data.sessions.reduce((a,s)=>a+s.minutes,0)} minutes</b><small>Total tracked focus time</small></div></div></div></div></>;
}
function Tracker({data,progress,doneChapters,totalChapters,chartData}) {
  return <><SectionHead title="Study tracker" subtitle="See your study consistency, syllabus progress and quiz performance."/><div className="stats-grid"><Stat label="Syllabus progress" value={progress+"%"} hint={`${doneChapters}/${totalChapters} chapters`} icon={BookOpen} tone="purple"/><Stat label="Study minutes" value={data.sessions.reduce((a,s)=>a+s.minutes,0)} hint="Tracked focus time" icon={Clock3} tone="blue"/><Stat label="Quiz attempts" value={data.quizzes.length} hint="Completed quizzes" icon={ClipboardList} tone="green"/><Stat label="Notes created" value={data.notes.length} hint="In your library" icon={NotebookPen} tone="orange"/></div><div className="panel tracker-chart"><h3>Study sessions</h3><p className="muted">Your recent recorded sessions</p><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)"/><XAxis dataKey="day" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="hours" fill="#8b7cf6" radius={[6,6,0,0]}/></BarChart></ResponsiveContainer></div></div><div className="panel"><h3>Subject progress</h3>{data.subjects.map(s=>{const pct=s.chapters.length?Math.round(s.done.filter(Boolean).length/s.chapters.length*100):0;return <div className="subject-progress" key={s.id}><div className="subject-line"><b>{s.name}</b><small>{pct}%</small></div><div className="progress-track"><span style={{width:pct+"%",background:s.color}}/></div></div>})}</div></>;
}
function Timetable({data,update}) {
  const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const [entry,setEntry]=useState({day:"Monday",time:"08:00",subject:"",room:""});
  const add=()=>{if(!entry.subject.trim())return;update("timetable",[...data.timetable,{...entry,id:uid()}]);setEntry({...entry,subject:""});};
  return <><SectionHead title="Weekly timetable" subtitle="Build a weekly class schedule and keep your study routine in one place."/><div className="panel timetable-add"><select value={entry.day} onChange={e=>setEntry({...entry,day:e.target.value})}>{days.map(d=><option key={d}>{d}</option>)}</select><input type="time" value={entry.time} onChange={e=>setEntry({...entry,time:e.target.value})}/><input placeholder="Class / subject" value={entry.subject} onChange={e=>setEntry({...entry,subject:e.target.value})}/><input placeholder="Room (optional)" value={entry.room} onChange={e=>setEntry({...entry,room:e.target.value})}/><button className="primary-btn" onClick={add}><Plus size={16}/> Add slot</button></div><div className="timetable-grid">{days.map(day=><div className="panel day-column" key={day}><h3>{day}</h3>{data.timetable.filter(x=>x.day===day).sort((a,b)=>a.time.localeCompare(b.time)).map(x=><div className="class-slot" key={x.id}><b>{x.time}</b><span>{x.subject}</span><small>{x.room}</small><button className="icon-btn danger" onClick={()=>update("timetable",data.timetable.filter(y=>y.id!==x.id))}><X size={13}/></button></div>)}</div>)}</div></>;
}
function Resources({data,deleteItem,openModal}) {
  return <><SectionHead title="Resource library" subtitle="Keep useful websites, PDFs, videos and study references together." action="Add resource" onAction={()=>openModal("resource")}/><div className="resource-grid">{data.resources.map(r=><div className="panel resource-card" key={r.id}><div className="resource-icon"><BookMarked/></div><div className="resource-info"><span className="tag">{r.type} · {r.subject||"General"}</span><h3>{r.title}</h3>{r.url&&<a href={r.url} target="_blank" rel="noreferrer">Open resource <ExternalLink size={13}/></a>}</div><button className="icon-btn danger" onClick={()=>deleteItem("resources",r.id)}><Trash2 size={16}/></button></div>)}{!data.resources.length&&<Empty icon={BookMarked} title="No saved resources" text="Add a useful link or study resource here."/>}</div></>;
}
function Goals({data,update,deleteItem,openModal}) {
  return <><SectionHead title="Learning goals" subtitle="Set meaningful targets and make steady progress." action="Add goal" onAction={()=>openModal("goal")}/><div className="goal-grid">{data.goals.map(g=><div className="panel goal-card" key={g.id}><div className="goal-top"><Target/><button className="icon-btn danger" onClick={()=>deleteItem("goals",g.id)}><Trash2 size={15}/></button></div><h3>{g.title}</h3><p>{g.target}</p>{g.due&&<small>Target date: {g.due}</small>}<div className="goal-progress"><b>{g.progress}%</b><input type="range" min="0" max="100" value={g.progress} onChange={e=>update("goals",data.goals.map(x=>x.id===g.id?{...x,progress:+e.target.value}:x))}/></div></div>)}{!data.goals.length&&<Empty icon={Target} title="No goals yet" text="Add a goal and track your progress."/>}</div></>;
}
function Journal({data,deleteItem,openModal}) {
  return <><SectionHead title="Study journal" subtitle="Reflect on what you learned, what was difficult and what to do next." action="New entry" onAction={()=>openModal("journal")}/><div className="journal-list">{data.journal.map(j=><div className="panel journal-card" key={j.id}><div><span className="tag">{j.date}</span><span className="tag">{j.mood}</span></div><p>{j.body}</p><button className="icon-btn danger" onClick={()=>deleteItem("journal",j.id)}><Trash2 size={15}/></button></div>)}{!data.journal.length&&<Empty icon={FileText} title="Your journal starts here" text="Write a short reflection after your study session."/>}</div></>;
}
function SettingsPage({data,update,setSetting,showKey,setShowKey}) {
  const [profile,setProfile]=useState(data.profile);
  const exportData=()=>saveBlob("student-hub-backup.json",JSON.stringify(data,null,2),"application/json");
  const importData=e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{updateAll(JSON.parse(reader.result));}catch{alert("That file is not a valid Student Hub backup.");}};reader.readAsText(file);};
  const updateAll = obj => {Object.keys(obj).forEach(k=>update(k,obj[k]));alert("Backup imported.");};
  return <><SectionHead title="Settings & profile" subtitle="Personalise your workspace, manage reminders and configure AI."/><div className="settings-grid"><div className="panel settings-card"><h3>Student profile</h3><label>Display name<input value={profile.name||""} onChange={e=>setProfile({...profile,name:e.target.value})}/></label><label>Class / grade<select value={profile.grade} onChange={e=>setProfile({...profile,grade:e.target.value})}>{["Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12","College","University","Other"].map(x=><option key={x}>{x}</option>)}</select></label><label>Board / curriculum<input value={profile.board||""} onChange={e=>setProfile({...profile,board:e.target.value})} placeholder="e.g. BISE Lahore, CBSE, Cambridge"/></label><label>School / institution<input value={profile.school||""} onChange={e=>setProfile({...profile,school:e.target.value})}/></label><label>Main learning goal<input value={profile.goal||""} onChange={e=>setProfile({...profile,goal:e.target.value})}/></label><button className="primary-btn" onClick={()=>{update("profile",profile);alert("Profile saved.")}}><Save size={16}/> Save profile</button></div><div className="panel settings-card"><h3>Workspace preferences</h3><div className="setting-row"><div><b>Dark appearance</b><small>Switch between dark and light mode</small></div><button className={`toggle ${data.settings.theme==="dark"?"on":""}`} onClick={()=>setSetting("theme",data.settings.theme==="dark"?"light":"dark")}/></div><div className="setting-row"><div><b>Study reminders</b><small>Show browser notifications for planned tasks</small></div><button className={`toggle ${data.settings.notifications?"on":""}`} onClick={()=>setSetting("notifications",!data.settings.notifications)}/></div><div className="setting-row"><div><b>Notification sound preference</b><small>Reserved for future sound support</small></div><button className={`toggle ${data.settings.sound?"on":""}`} onClick={()=>setSetting("sound",!data.settings.sound)}/></div><label>Accent colour<input type="color" value={data.settings.accent} onChange={e=>setSetting("accent",e.target.value)}/></label><label>Preferred language<select value={data.settings.language} onChange={e=>setSetting("language",e.target.value)}><option>English</option><option>Urdu</option><option>Roman Urdu</option></select></label></div><div className="panel settings-card wide"><h3><Sparkles size={18}/> AI connection</h3><p className="muted">Add your own Gemini API key to activate live AI tutoring, note explanations, summaries, quiz generation and more. Your key is stored in this browser only.</p><label>Gemini API key<div className="key-input"><input type={showKey?"text":"password"} value={data.settings.aiKey} onChange={e=>setSetting("aiKey",e.target.value)} placeholder="Paste your API key"/><button className="outline-btn" onClick={()=>setShowKey(!showKey)}>{showKey?"Hide":"Show"}</button></div></label><small className="muted">Get a key from Google AI Studio. Never share your key or commit it to a public repository. For a public app, route AI requests through a secure backend.</small></div><div className="panel settings-card"><h3>Data & backup</h3><p className="muted">Your notes, tasks and progress are saved in this browser using local storage.</p><div className="backup-actions"><button className="outline-btn" onClick={exportData}><Download size={16}/> Export backup</button><label className="outline-btn upload-btn"><Upload size={16}/> Import backup<input type="file" accept="application/json" onChange={importData}/></label></div><button className="danger-btn" onClick={()=>{if(confirm("Delete all Student Hub data from this browser? Export a backup first if needed.")){localStorage.removeItem(STORE);location.reload()}}}><Trash2 size={15}/> Reset all local data</button></div></div></>;
}

function Modal({type,form,setForm,close,addTask,addSubject,addNote,addFlashcard,addGoal,addResource,addJournal,data}) {
  const config={task:["Add a planner task",addTask],subject:["Add a subject",addSubject],note:["Create a study note",addNote],flashcard:["Create flashcard",addFlashcard],goal:["Create a learning goal",addGoal],resource:["Save a resource",addResource],journal:["New journal entry",addJournal]}[type];
  const field=(label,key,placeholder="",kind="text")=><label>{label}<input type={kind} placeholder={placeholder} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}/></label>;
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close()}}><div className="modal"><div className="modal-head"><h2>{config[0]}</h2><button className="icon-btn" onClick={close}><X/></button></div>
    {type==="task"&&<>{field("Task title","title","e.g. Revise Chapter 3")}{field("Due date","date","", "date")}{field("Time","time","", "time")}<label>Subject<select value={form.subject||""} onChange={e=>setForm({...form,subject:e.target.value})}><option value="">General</option>{data.subjects.map(s=><option key={s.id}>{s.name}</option>)}</select></label><label>Priority<select value={form.priority||"Medium"} onChange={e=>setForm({...form,priority:e.target.value})}>{["Low","Medium","High"].map(x=><option>{x}</option>)}</select></label><label className="check-label"><input type="checkbox" checked={!!form.reminder} onChange={e=>setForm({...form,reminder:e.target.checked})}/> Remind me at this time</label></>}
    {type==="subject"&&<>{field("Subject name","name","e.g. Chemistry")}<label>Chapter names (one per line)<textarea value={form.chapters||""} onChange={e=>setForm({...form,chapters:e.target.value})} placeholder={"Atomic structure\nChemical bonding\nEquilibrium"}/></label><label>Subject colour<input type="color" value={form.color||"#8b7cf6"} onChange={e=>setForm({...form,color:e.target.value})}/></label></>}
    {type==="note"&&<>{field("Note title","title","e.g. Chapter 4 summary")}<label>Subject<select value={form.subject||""} onChange={e=>setForm({...form,subject:e.target.value})}><option value="">General</option>{data.subjects.map(s=><option>{s.name}</option>)}</select></label><label>Note content<textarea rows="7" value={form.body||""} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your notes here..."/></label></>}
    {type==="flashcard"&&<>{field("Question / front","front","What is...") }<label>Answer / back<textarea value={form.back||""} onChange={e=>setForm({...form,back:e.target.value})} placeholder="The answer is..."/></label></>}
    {type==="goal"&&<>{field("Goal title","title","e.g. Complete Physics syllabus")}{field("What does success look like?","target","e.g. Finish all 8 chapters")}{field("Target date","due","", "date")}</>}
    {type==="resource"&&<>{field("Resource title","title","e.g. Physics lecture notes")}{field("URL (optional)","url","https://...","url")}{field("Subject","subject","e.g. Physics")}<label>Type<select value={form.type||"Link"} onChange={e=>setForm({...form,type:e.target.value})}>{["Link","PDF","Video","Website","Book","Other"].map(x=><option>{x}</option>)}</select></label></>}
    {type==="journal"&&<><label>How was your study session?<select value={form.mood||"Okay"} onChange={e=>setForm({...form,mood:e.target.value})}>{["Great","Focused","Okay","Confused","Tired"].map(x=><option>{x}</option>)}</select></label><label>Your reflection<textarea rows="6" value={form.body||""} onChange={e=>setForm({...form,body:e.target.value})} placeholder="What did you learn? What should you revise next?"/></label></>}
    <div className="modal-actions"><button className="outline-btn" onClick={close}>Cancel</button><button className="primary-btn" onClick={config[1]}><Save size={16}/> Save</button></div>
  </div></div>;
}

export default App;

import React, { useMemo, useState } from 'react';
import { ClipboardList, FileUp, Sparkles, Plus, Trash2, CheckCircle2, CircleHelp, RotateCcw, Trophy, BookOpen, AlertCircle } from 'lucide-react';
import { CURRICULUM } from './curriculum';
const uid=()=>Math.random().toString(36).slice(2,10);

export default function QuizLab({data,update,notify}){
 const [grade,setGrade]=useState(data.profile?.grade?.startsWith('Class')?data.profile.grade:'Class 9');
 const [subject,setSubject]=useState(''); const [chapter,setChapter]=useState(''); const [docId,setDocId]=useState('');
 const [count,setCount]=useState(10); const [difficulty,setDifficulty]=useState('Board exam');
 const [questions,setQuestions]=useState([]); const [answers,setAnswers]=useState({}); const [submitted,setSubmitted]=useState(false); const [busy,setBusy]=useState(false);
 const [showAdd,setShowAdd]=useState(false); const [draft,setDraft]=useState({question:'',A:'',B:'',C:'',D:'',correct:'A',explanation:''});
 const docs=(data.studyDocuments||[]).filter(d=>d.grade===grade&&(!subject||d.subject===subject));
 const selectedDoc=docs.find(d=>d.id===docId)||null;
 const bank=(data.questionBank||[]).filter(q=>q.grade===grade&&(!subject||q.subject===subject)&&(!chapter||q.chapter===chapter));
 const availableChapters=[...new Set([...docs.map(d=>d.chapter),...(data.customChapters||[]).filter(c=>c.grade===grade&&(!subject||c.subject===subject)).map(c=>c.chapter),...bank.map(q=>q.chapter)])].filter(Boolean);
 const score=questions.reduce((n,q,i)=>n+(answers[i]===q.correct?1:0),0);
 const setField=(k,v)=>setDraft(d=>({...d,[k]:v}));
 const addQuestion=()=>{
  if(!subject||!chapter||!draft.question.trim()||!draft.A.trim()||!draft.B.trim()||!draft.C.trim()||!draft.D.trim())return notify('Fill the subject, chapter, question and all four options.');
  const q={id:uid(),grade,subject,chapter,question:draft.question.trim(),options:['A','B','C','D'].map(k=>draft[k].trim()),correct:['A','B','C','D'].indexOf(draft.correct),explanation:draft.explanation.trim()||'Review this answer in your source material.',source:'Student-authored'};
  update('questionBank',[...(data.questionBank||[]),q]);setDraft({question:'',A:'',B:'',C:'',D:'',correct:'A',explanation:''});setShowAdd(false);notify('Question saved to your chapter question bank.');
 };
 const generate=async()=>{
  if(!subject)return notify('Choose a subject first.');
  if(!chapter)return notify('Choose a chapter. Random quizzes are disabled.');
  const bankQuestions=bank.filter(q=>q.subject===subject&&q.chapter===chapter);
  if(bankQuestions.length>=count){setQuestions(bankQuestions.slice(0,count));setAnswers({});setSubmitted(false);return;}
  if(!selectedDoc?.text){
   if(bankQuestions.length){setQuestions(bankQuestions);setAnswers({});setSubmitted(false);return;}
   return notify('Import the chapter PDF/text or add chapter questions first.');
  }
  if(!data.settings?.aiKey?.trim())return notify('Add your Gemini API key in Settings to generate verified MCQs from the imported chapter.');
  setBusy(true);
  try{
   const source=selectedDoc.text.slice(0,50000);
   const prompt=`You are creating a board-exam practice quiz for a student. Use ONLY the supplied source text. Do not use outside facts. If the source does not support enough questions, return only the number it supports. Create exactly up to ${count} distinct ${difficulty}-level single-answer MCQs for ${grade}, subject ${subject}, chapter ${chapter}. Questions must be about this chapter, not generic knowledge. Four plausible options, one correct answer. Include a concise explanation supported by the source. Return valid JSON only in this exact shape: {"questions":[{"question":"...","options":["...","...","...","..."],"correct":0,"explanation":"..."}]}. correct is zero-based. Do not include markdown fences.\n\nSOURCE TEXT:\n${source}`;
   const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+encodeURIComponent(data.settings.aiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.2,responseMimeType:'application/json'}})});
   const payload=await response.json(); if(!response.ok)throw new Error(payload.error?.message||'AI request failed');
   const raw=payload.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('')||'';
   const parsed=JSON.parse(raw.replace(/^```json\s*/i,'').replace(/```$/,'').trim());
   const generated=(parsed.questions||[]).filter(q=>q.question&&Array.isArray(q.options)&&q.options.length===4&&Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4).map(q=>({...q,id:uid(),options:q.options,source:selectedDoc.name}));
   if(!generated.length)throw new Error('The source did not produce valid questions. Try a chapter with selectable text.');
   setQuestions([...bankQuestions,...generated].slice(0,count));setAnswers({});setSubmitted(false);
  }catch(e){notify('Quiz generation failed: '+e.message);}
  finally{setBusy(false);}
 };
 const finish=()=>{
  setSubmitted(true);
  const result={id:uid(),date:new Date().toISOString(),grade,subject,chapter,score,total:questions.length,source:selectedDoc?.name||'Chapter question bank'};
  update('quizzes',[...(data.quizzes||[]),result]);
 };
 const reset=()=>{setQuestions([]);setAnswers({});setSubmitted(false);};
 const deleteBankQuestion=id=>update('questionBank',(data.questionBank||[]).filter(q=>q.id!==id));
 return <div className="quiz-lab">
  <div className="quiz-lab-hero"><div><div className="eyebrow">CHAPTER-LOCKED ASSESSMENT ENGINE</div><h2>Build a quiz from your actual syllabus.</h2><p>Every test is tied to a class, subject, chapter and imported source. No random filler questions.</p></div><div className="quiz-lab-icon"><ClipboardList size={34}/></div></div>
  {!questions.length&&<div className="quiz-builder-grid"><section className="panel quiz-builder"><h3><BookOpen size={17}/> Test configuration</h3><div className="quiz-fields"><label>Class<select value={grade} onChange={e=>{setGrade(e.target.value);setSubject('');setChapter('');setDocId('')}}>{Object.keys(CURRICULUM).map(g=><option key={g}>{g}</option>)}</select></label><label>Subject<select value={subject} onChange={e=>{setSubject(e.target.value);setChapter('');setDocId('')}}><option value="">Select subject</option>{CURRICULUM[grade].subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>Chapter<select value={chapter} onChange={e=>setChapter(e.target.value)}><option value="">Select chapter</option>{availableChapters.map(c=><option key={c}>{c}</option>)}</select></label><label>Source book / file<select value={docId} onChange={e=>setDocId(e.target.value)}><option value="">Choose imported source</option>{docs.filter(d=>!chapter||d.chapter===chapter).map(d=><option key={d.id} value={d.id}>{d.name} — {d.chapter}</option>)}</select></label><label>Number of questions<select value={count} onChange={e=>setCount(+e.target.value)}>{[5,10,15,20].map(n=><option key={n} value={n}>{n} questions</option>)}</select></label><label>Difficulty<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>Board exam</option><option>Easy revision</option><option>Challenging</option></select></label></div><button className="primary-btn generate-quiz" disabled={busy} onClick={generate}><Sparkles size={17}/>{busy?'Generating from your chapter...':'Generate chapter quiz'}</button><div className="notice"><AlertCircle size={16}/><span>AI-generated questions require your own API key and are grounded in the selected imported text. Without an imported chapter, use questions you add to the chapter bank.</span></div></section>
   <aside className="quiz-source-side"><div className="panel"><h3>Your available material</h3><div className="source-stat"><b>{docs.length}</b><span>Imported files for {grade}</span></div><div className="source-stat"><b>{bank.length}</b><span>Saved questions for this selection</span></div><button className="outline-btn" onClick={()=>notify('Open Syllabus Library from the sidebar to import your PDF or notes.') }><FileUp size={15}/> Import a textbook / chapter</button><p className="muted">Supported imports: selectable-text PDF, TXT, MD and CSV.</p></div><div className="panel"><h3>Question bank</h3><p className="muted">Write verified questions from your teacher notes or textbook and keep them under the exact chapter.</p><button className="outline-btn" onClick={()=>setShowAdd(!showAdd)}><Plus size={15}/> Add your own MCQ</button></div></aside></div>}
  {showAdd&&<div className="panel manual-question"><div className="section-head"><div><h2>Add a chapter MCQ</h2><p>Save it to the selected class, subject and chapter.</p></div><button className="text-btn" onClick={()=>setShowAdd(false)}>Close</button></div><label>Question<textarea value={draft.question} onChange={e=>setField('question',e.target.value)} placeholder="Write the question exactly..."/></label><div className="manual-options">{['A','B','C','D'].map(k=><label key={k}>Option {k}<input value={draft[k]} onChange={e=>setField(k,e.target.value)}/></label>)}</div><label>Correct option<select value={draft.correct} onChange={e=>setField('correct',e.target.value)}>{['A','B','C','D'].map(k=><option key={k}>{k}</option>)}</select></label><label>Explanation<input value={draft.explanation} onChange={e=>setField('explanation',e.target.value)} placeholder="Why is this answer correct?"/></label><button className="primary-btn" onClick={addQuestion}>Save to chapter bank</button></div>}
  {questions.length>0&&<section className="panel active-quiz"><div className="section-head"><div><div className="eyebrow">{grade} · {subject} · {chapter}</div><h2>{submitted?'Quiz result':'Chapter practice test'}</h2><p>{selectedDoc?.name||'Saved chapter questions'} · {questions.length} questions</p></div>{submitted&&<div className="quiz-score"><Trophy size={21}/><b>{score}/{questions.length}</b></div>}</div>{questions.map((q,i)=><article className="quiz-question" key={q.id||i}><div className="question-number">QUESTION {i+1}</div><h3>{q.question}</h3><div className="quiz-options">{q.options.map((o,j)=><button key={j} disabled={submitted} className={`quiz-option ${answers[i]===j?'chosen':''} ${submitted&&q.correct===j?'answer-correct':''} ${submitted&&answers[i]===j&&q.correct!==j?'answer-wrong':''}`} onClick={()=>setAnswers(a=>({...a,[i]:j}))}><span>{String.fromCharCode(65+j)}</span>{o}</button>)}</div>{submitted&&<div className="answer-explanation"><b>{answers[i]===q.correct?'Your answer is correct':'Review this answer'}</b><p>Correct answer: {q.options[q.correct]}</p><small>{q.explanation}</small></div>}</article>)}<div className="quiz-bottom"><button className="outline-btn" onClick={reset}><RotateCcw size={15}/> {submitted?'Build another quiz':'Cancel test'}</button>{!submitted&&<button className="primary-btn" disabled={Object.keys(answers).length!==questions.length} onClick={finish}>Submit answers</button>}</div></section>}
  <div className="panel saved-question-bank"><div className="section-head"><div><h2>Saved questions</h2><p>Questions are stored under their own class, subject and chapter.</p></div><b>{bank.length} items</b></div>{bank.length?bank.map(q=><div className="bank-row" key={q.id}><div><b>{q.question}</b><small>{q.chapter} · {q.source}</small></div><button className="icon-btn danger" onClick={()=>deleteBankQuestion(q.id)}><Trash2 size={15}/></button></div>):<p className="muted">No saved MCQs for this class and subject yet. Import material and generate a test, or add your own questions.</p>}</div>
 </div>;
}

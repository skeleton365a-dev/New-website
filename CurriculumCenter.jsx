import React, { useMemo, useState } from 'react';
import { BookOpen, FileUp, FileText, ExternalLink, Trash2, Search, CheckCircle2, AlertCircle, Library, Download, Sparkles } from 'lucide-react';
import { CURRICULUM, OFFICIAL_CURRICULUM_URL, BISE_NOTIFICATIONS_URL } from './curriculum';

const uid = () => Math.random().toString(36).slice(2, 10);

async function readPdf(file) {
  const pdfjs = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  const pages = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    pages.push(content.items.map(x => x.str).join(' '));
  }
  return pages.join('\n\n');
}

export default function CurriculumCenter({ data, update, notify, setPage }) {
  const [grade, setGrade] = useState(data.profile?.grade?.startsWith('Class') ? data.profile.grade : 'Class 9');
  const [group, setGroup] = useState('All groups');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('catalog');
  const subjects = CURRICULUM[grade].subjects.filter(s => (s.name + s.type).toLowerCase().includes(search.toLowerCase()) && (group === 'All groups' || s.type.toLowerCase().includes(group.toLowerCase())));
  const documents = data.studyDocuments || [];
  const filteredDocs = useMemo(() => documents.filter(d => d.grade === grade), [documents, grade]);

  const importFiles = async (files) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const imported = [];
      for (const file of Array.from(files)) {
        let text = '';
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) text = await readPdf(file);
        else if (/\.(txt|md|csv)$/i.test(file.name) || file.type.startsWith('text/')) text = await file.text();
        else { notify(`${file.name}: use PDF, TXT, MD or CSV.`); continue; }
        if (!text.trim()) { notify(`${file.name}: no selectable text found. Scanned PDFs need OCR first.`); continue; }
        imported.push({ id: uid(), name: file.name, grade, subject: subject || 'Unassigned', chapter: chapter.trim() || 'Unsorted chapters', materialType, text: text.slice(0, 900000), chars: text.length, importedAt: new Date().toISOString(), source: 'Student upload' });
      }
      if (imported.length) {
        update('studyDocuments', [...documents, ...imported]);
        notify(`${imported.length} study file(s) imported and indexed.`);
        setTab('imports'); setSubject(''); setChapter(''); setMaterialType('Textbook');
      }
    } catch (e) {
      notify('Could not read this PDF. If it is scanned, run OCR or upload selectable text.');
      console.error(e);
    } finally { setBusy(false); }
  };
  const removeDoc = id => update('studyDocuments', documents.filter(d => d.id !== id));
  const saveChapter = () => {
    if (!subject || !chapter.trim()) return notify('Choose a subject and enter a chapter name.');
    const custom = data.customChapters || [];
    update('customChapters', [...custom, { id: uid(), grade, subject, chapter: chapter.trim() }]);
    setChapter(''); notify('Chapter added to your personal syllabus.');
  };
  return <div className="curriculum-page">
    <div className="curriculum-hero"><div><div className="eyebrow">BISE LAHORE • PUNJAB CURRICULUM</div><h2>Your syllabus, books and study files — organised properly.</h2><p>Choose a class and subject, import your own textbook or notes, then build tests from the material you actually study.</p></div><div className="curriculum-hero-icon"><Library size={38}/></div></div>
    <div className="curriculum-tabs"><button className={tab==='catalog'?'active':''} onClick={()=>setTab('catalog')}>Class & subjects</button><button className={tab==='imports'?'active':''} onClick={()=>setTab('imports')}>My imported books ({documents.length})</button><button className={tab==='add'?'active':''} onClick={()=>setTab('add')}>Import / add chapters</button></div>
    {tab==='catalog' && <>
      <div className="curriculum-controls"><div className="grade-switch">{Object.keys(CURRICULUM).map(g=><button key={g} className={grade===g?'active':''} onClick={()=>{setGrade(g);setGroup('All groups')}}>{g}</button>)}</div><select value={group} onChange={e=>setGroup(e.target.value)}><option>All groups</option>{CURRICULUM[grade].group.map(g=><option key={g}>{g}</option>)}</select><div className="search-box"><Search size={16}/><input placeholder="Find a subject..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
      <div className="curriculum-summary"><div><b>{subjects.length}</b><span>subjects shown</span></div><div><b>{filteredDocs.length}</b><span>files imported for {grade}</span></div><div><b>{(data.customChapters||[]).filter(x=>x.grade===grade).length}</b><span>personal chapters added</span></div></div>
      <div className="curriculum-subject-grid">{subjects.map((s,i)=><article className="curriculum-subject" key={s.name}><div className="curriculum-subject-icon"><BookOpen size={18}/></div><div className="curriculum-subject-main"><h3>{s.name}</h3><span>{s.type}</span><small>{filteredDocs.filter(d=>d.subject===s.name).length} imported files</small></div><button className="text-btn" onClick={()=>{setSubject(s.name);setSelectedSubject(s.name);setTab('subject')}}>Open subject <span>→</span></button></article>)}</div>
      <div className="official-links panel"><div><h3>Official curriculum and book sources</h3><p>These official portals provide the current notices, smart syllabus, e-books and model papers. Check the applicable session before studying.</p></div><a href={OFFICIAL_CURRICULUM_URL} target="_blank" rel="noreferrer"><ExternalLink size={15}/> PECTAA e-books & Smart Syllabus</a><a href={BISE_NOTIFICATIONS_URL} target="_blank" rel="noreferrer"><ExternalLink size={15}/> BISE Lahore notifications</a><a href="https://www.elearn.gov.pk/" target="_blank" rel="noreferrer"><ExternalLink size={15}/> eLearn Punjab textbooks</a></div>
      <div className="notice curriculum-notice"><AlertCircle size={17}/><span>Subject availability depends on your group and registration. This catalogue is a navigation index, not a replacement for your official BISE subject combination or current-year smart syllabus.</span></div>
    </>}
    {tab==='subject' && <><div className="section-head"><div><div className="eyebrow">{grade.toUpperCase()} · SUBJECT WORKSPACE</div><h2>{selectedSubject}</h2><p>Its own chapter list, imported books and revision material.</p></div><button className="outline-btn" onClick={()=>setTab('catalog')}>Back to subjects</button></div><div className="panel subject-detail-panel"><div className="subject-detail-actions"><button className="primary-btn" onClick={()=>{setSubject(selectedSubject);setTab('add')}}><FileUp size={15}/> Import this subject's book</button><button className="outline-btn" onClick={()=>{setSubject(selectedSubject);setTab('add')}}>Add a chapter</button><button className="outline-btn" onClick={()=>setPage('Quiz Maker')}>Open chapter quiz lab</button></div><h3>Chapters and study files</h3>{[...new Set([...filteredDocs.filter(d=>d.subject===selectedSubject).map(d=>d.chapter),...(data.customChapters||[]).filter(c=>c.grade===grade&&c.subject===selectedSubject).map(c=>c.chapter)])].length ? [...new Set([...filteredDocs.filter(d=>d.subject===selectedSubject).map(d=>d.chapter),...(data.customChapters||[]).filter(c=>c.grade===grade&&c.subject===selectedSubject).map(c=>c.chapter)])].map(ch=><div className="subject-chapter-row" key={ch}><div><b>{ch}</b><small>{filteredDocs.filter(d=>d.subject===selectedSubject&&d.chapter===ch).length} imported file(s)</small></div><button className="text-btn" onClick={()=>{setSubject(selectedSubject);setChapter(ch);setTab('add')}}>Add material</button><button className="text-btn" onClick={()=>setPage('Quiz Maker')}>Make quiz</button></div>) : <div className="empty"><BookOpen size={24}/><b>No chapters added yet</b><p>Import this subject's textbook or add chapter names to start.</p></div>}</div></>}
    {tab==='imports' && <><div className="section-head"><div><h2>My imported study library</h2><p>Only material you import appears here. Each file is tagged to a class, subject and chapter.</p></div><button className="primary-btn" onClick={()=>setTab('add')}><FileUp size={16}/> Import material</button></div>{filteredDocs.length ? <div className="imported-doc-grid">{filteredDocs.map(d=><article className="panel imported-doc" key={d.id}><div className="doc-icon"><FileText size={20}/></div><div className="doc-info"><h3>{d.name}</h3><p>{d.subject} · {d.chapter}</p><small>{d.materialType || 'Study material'}</small><small>{(d.chars||0).toLocaleString()} characters · {new Date(d.importedAt).toLocaleDateString()}</small></div><button className="icon-btn danger" onClick={()=>removeDoc(d.id)} title="Remove file"><Trash2 size={16}/></button><button className="outline-btn" onClick={()=>{setPage('Quiz Maker');}}>Use in quiz lab</button></article>)}</div>:<div className="panel empty-import"><FileUp size={30}/><h3>No books imported for {grade}</h3><p>Upload a selectable-text PDF or TXT/MD file to build a personal chapter library.</p><button className="primary-btn" onClick={()=>setTab('add')}>Import your first book</button></div>}</>}
    {tab==='add' && <div className="import-layout"><div className="panel import-form"><div className="eyebrow">IMPORT YOUR OWN MATERIAL</div><h2>Add textbook, notes or a chapter</h2><p>Upload a book or notes file. We extract its selectable text and tag it so your quiz builder can use the exact source.</p><label>Class<select value={grade} onChange={e=>setGrade(e.target.value)}>{Object.keys(CURRICULUM).map(g=><option key={g}>{g}</option>)}</select></label><label>Subject<select value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Choose subject</option>{CURRICULUM[grade].subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>Chapter / unit name<input value={chapter} onChange={e=>setChapter(e.target.value)} placeholder="e.g. Chapter 2 — Atomic Structure"/></label><label>Material type<select value={materialType} onChange={e=>setMaterialType(e.target.value)}><option>Textbook</option><option>Key book / solved answers</option><option>Class notes</option><option>Past paper / model paper</option><option>Teacher handout</option></select></label><label className="file-drop"><FileUp size={26}/><b>{busy?'Reading your files...':'Choose PDF, TXT, MD or CSV files'}</b><span>Multiple files supported. Scanned image-only PDFs require OCR.</span><input type="file" accept=".pdf,.txt,.md,.csv,text/*" multiple disabled={busy} onChange={e=>importFiles(e.target.files)}/></label><div className="notice"><CheckCircle2 size={16}/><span>Your uploaded material stays in this browser. The app does not claim to contain every publisher's key book or textbook by default.</span></div></div><div className="panel chapter-form"><h3>Or add a chapter manually</h3><p>Add a chapter label now; import its content later.</p><label>Subject<select value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Choose subject</option>{CURRICULUM[grade].subjects.map(s=><option key={s.name}>{s.name}</option>)}</select></label><label>Chapter name<input value={chapter} onChange={e=>setChapter(e.target.value)} placeholder="Chapter title"/></label><button className="primary-btn" onClick={saveChapter}>Add chapter to syllabus</button><div className="added-chapters">{(data.customChapters||[]).filter(x=>x.grade===grade).map(x=><div key={x.id}><span>{x.subject}</span><b>{x.chapter}</b></div>)}</div></div></div>}
  </div>;
}

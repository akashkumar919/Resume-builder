import React, { useEffect, useMemo, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Plus, Trash2, ChevronDown, ChevronUp, Download, FileText, RotateCcw, Save, Eye, GripVertical, Sun, Moon } from "lucide-react";
import ResumePdf from "./ResumePdf.jsx";
import { defaultResume } from "./defaultResume.js";

const STORAGE_KEY = "resume-studio-data-v1";
const THEME_STORAGE_KEY = "resume-studio-theme";
const clone = (x) => JSON.parse(JSON.stringify(x));
const newId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // fallback
  }
  return "light";
}

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...clone(defaultResume), ...JSON.parse(saved) } : clone(defaultResume);
  } catch {
    return clone(defaultResume);
  }
}

const sectionMeta = [
  ["summary", "Summary"], ["links", "Links"], ["skills", "Skills"], ["experience", "Experience"],
  ["projects", "Projects"], ["education", "Education"], ["activities", "Extra Activities"], ["awards", "Awards & Certifications"]
];

function Field({ label, value, onChange, placeholder = "", multiline = false, type = "text" }) {
  return <label className="field">
    <span>{label}</span>
    {multiline
      ? <textarea value={value ?? ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} rows={3} />
      : <input type={type} value={value ?? ""} placeholder={placeholder} onChange={e => onChange(e.target.value)} />}
  </label>;
}

function Card({ title, children, onDelete, onUp, onDown, first, last }) {
  return <div className="entry-card">
    <div className="entry-head">
      <span className="entry-title"><GripVertical size={15} />{title}</span>
      <div className="entry-actions">
        <button className="icon-btn" title="Move up" onClick={onUp} disabled={first}><ChevronUp size={16}/></button>
        <button className="icon-btn" title="Move down" onClick={onDown} disabled={last}><ChevronDown size={16}/></button>
        <button className="icon-btn danger" title="Delete entry" onClick={onDelete}><Trash2 size={15}/></button>
      </div>
    </div>
    {children}
  </div>;
}

function ResumePreview({ resume }) {
  const p = resume.personal;
  const visible = resume.sectionOrder.filter(k => !resume.hiddenSections.includes(k));
  const has = (s) => s && String(s).trim();
  const dates = (a, b, current) => [a, current ? "Present" : b].filter(has).join(" – ");
  return <div className="paper">
    <header className="resume-header">
      <h1>{p.name || "YOUR NAME"}</h1>
      <div className="contact-line">
        {[p.phone, p.email, p.linkedin, p.github, p.portfolio, p.location].filter(has).map((v, i) => <React.Fragment key={`${v}-${i}`}>{i > 0 && <span className="sep"> | </span>}{v}</React.Fragment>)}
      </div>
    </header>
    {visible.map(key => {
      const title = resume.sectionTitles[key] || sectionMeta.find(x => x[0] === key)?.[1] || key;
      if (key === "summary" && has(resume.summary)) return <section className="resume-section" key={key}><h2>{title}</h2><p>{resume.summary}</p></section>;
      if (key === "links" && resume.links.some(x => has(x.label) && has(x.url))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.links.filter(x => has(x.label) && has(x.url)).map((x,i)=><p key={i}><b>{x.label}: </b><a>{x.url}</a></p>)}</section>;
      if (key === "skills" && resume.skills.some(x => has(x.category) && has(x.skills))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.skills.filter(x => has(x.category) && has(x.skills)).map((x,i)=><p key={i}><b>{x.category}: </b>{x.skills}</p>)}</section>;
      if (key === "experience" && resume.experience.some(x => has(x.title) || has(x.company))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.experience.filter(x => has(x.title) || has(x.company)).map((x,i)=><div className="resume-entry" key={i}>
        <div className="resume-row"><b>{x.title}{x.linkLabel && x.linkUrl ? <> | <a>{x.linkLabel}</a></> : null}</b><span>{dates(x.start,x.end,x.current)}</span></div>
        <div className="resume-row"><span>{[x.company,x.location].filter(has).join(", ")}</span>{has(x.technologies) && <span className="right-note">Technologies: {x.technologies}</span>}</div>
        {(x.bullets || []).filter(has).map((b,j)=><p className="bullet" key={j}>• {b}</p>)}
      </div>)}</section>;
      if (key === "projects" && resume.projects.some(x => has(x.name))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.projects.filter(x => has(x.name)).map((x,i)=><div className="resume-entry" key={i}>
        <div className="resume-row"><b>{x.name}{x.liveUrl ? <> | <a>Live Demo</a></> : null}{x.githubUrl ? <> | <a>GitHub Repo</a></> : null}</b><span>{x.date}</span></div>
        {has(x.tech) && <p><b>Tech Stack: </b>{x.tech}</p>}{has(x.overview) && <p><b>Overview: </b>{x.overview}</p>}{has(x.features) && <p><b>Key Features: </b>{x.features}</p>}{has(x.impact) && <p><b>Impact: </b>{x.impact}</p>}
      </div>)}</section>;
      if (key === "education" && resume.education.some(x => has(x.institution))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.education.filter(x => has(x.institution)).map((x,i)=><div className="resume-entry" key={i}>
        <div className="resume-row"><b>{x.institution}</b><span>{dates(x.start,x.end,x.current)}</span></div>
        <div className="resume-row"><span>{x.degree}</span>{has(x.score) && <span>{x.scoreLabel || "Score"}: {x.score}</span>}</div>{has(x.details) && <p>{x.details}</p>}
      </div>)}</section>;
      if (key === "activities" && resume.activities.some(x => has(x.title))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.activities.filter(x => has(x.title)).map((x,i)=><div className="resume-entry" key={i}><div className="resume-row"><b>{x.title}{x.organization ? ` — ${x.organization}` : ""}</b><span>{x.date}</span></div>{(x.bullets||[]).filter(has).map((b,j)=><p className="bullet" key={j}>• {b}</p>)}</div>)}</section>;
      if (key === "awards" && resume.awards.some(x => has(x.name))) return <section className="resume-section" key={key}><h2>{title}</h2>{resume.awards.filter(x => has(x.name)).map((x,i)=><div className="resume-entry award-line" key={i}><p>• <b>{x.name}</b>{x.organization ? ` — ${x.organization}` : ""}{x.date ? ` (${x.date})` : ""}</p>{has(x.description) && <p>{x.description}</p>}</div>)}</section>;
      return null;
    })}
  </div>;
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme);
  const [resume, setResume] = useState(loadInitial);
  const [expanded, setExpanded] = useState({ personal: true, summary: true });
  const [savedLabel, setSavedLabel] = useState("Saved locally");
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    const metaThemeColor = document.getElementById("meta-theme-color") || document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", theme === "dark" ? "#1a1a1a" : "#f3f5f9");
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  // Sync with OS color scheme when no explicit user choice is set
  useEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem("theme");
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    media.addEventListener?.("change", handler);
    return () => media.removeEventListener?.("change", handler);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
      setSavedLabel("Autosaved");
    } catch { setSavedLabel("Could not save locally"); }
  }, [resume]);

  const update = (path, value) => setResume(prev => {
    const next = clone(prev);
    const parts = path.split(".");
    let obj = next;
    for (let i=0;i<parts.length-1;i++) obj = obj[parts[i]];
    obj[parts.at(-1)] = value;
    return next;
  });
  const updateItem = (key, index, field, value) => setResume(prev => {
    const next = clone(prev); next[key][index][field] = value; return next;
  });
  const addItem = (key, item) => setResume(prev => ({ ...prev, [key]: [...prev[key], clone(item)] }));
  const deleteItem = (key, index) => setResume(prev => ({ ...prev, [key]: prev[key].filter((_,i)=>i!==index) }));
  const moveItem = (key, index, delta) => setResume(prev => {
    const arr = [...prev[key]], to = index + delta;
    if (to < 0 || to >= arr.length) return prev;
    [arr[index], arr[to]] = [arr[to], arr[index]];
    return { ...prev, [key]: arr };
  });
  const toggle = key => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2600); };

  const toggleSection = (key) => setResume(prev => ({
    ...prev,
    hiddenSections: prev.hiddenSections.includes(key) ? prev.hiddenSections.filter(k=>k!==key) : [...prev.hiddenSections, key]
  }));
  const addSection = (key) => {
    setResume(prev => ({ ...prev, hiddenSections: prev.hiddenSections.filter(k=>k!==key), sectionOrder: prev.sectionOrder.includes(key) ? prev.sectionOrder : [...prev.sectionOrder, key] }));
    setExpanded(prev => ({ ...prev, [key]: true }));
  };
  const moveSection = (key, delta) => setResume(prev => {
    const arr = [...prev.sectionOrder], i = arr.indexOf(key), j = i + delta;
    if (i < 0 || j < 0 || j >= arr.length) return prev;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...prev, sectionOrder: arr };
  });
  const newResume = () => {
    if (window.confirm("Start a new resume? This will replace the current resume data.")) {
      setResume(clone(defaultResume)); notify("New resume created");
    }
  };
  const clearResume = () => {
    if (window.confirm("Clear all resume data? This cannot be undone unless you exported a backup.")) {
      const blank = clone(defaultResume);
      blank.personal = { name:"", title:"", phone:"", email:"", location:"", linkedin:"", github:"", portfolio:"" };
      blank.summary = ""; blank.links=[]; blank.skills=[]; blank.experience=[]; blank.projects=[]; blank.education=[]; blank.activities=[]; blank.awards=[];
      setResume(blank); notify("Resume cleared");
    }
  };
  const availableSections = sectionMeta.filter(([key]) => !resume.sectionOrder.includes(key));
  const titleFor = key => resume.sectionTitles[key] || sectionMeta.find(s=>s[0]===key)?.[1] || key;

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-icon"><FileText size={20}/></div><div><strong>Resume Studio</strong><small>Build a resume that gets noticed</small></div></div>
      <div className="top-actions">
        <span className="save-status"><Save size={14}/>{savedLabel}</span>
        <button className="btn secondary" onClick={newResume}><RotateCcw size={15}/> New</button>
        <PDFDownloadLink document={<ResumePdf resume={resume}/>} fileName={`${(resume.personal.name || "resume").trim().replace(/\s+/g,"-").toLowerCase()}.pdf`} className="btn primary download-link">
          {({ loading }) => <><Download size={16}/>{loading ? "Preparing PDF..." : "Download PDF"}</>}
        </PDFDownloadLink>
        <button
          type="button"
          className={`theme-toggle-btn ${theme === "dark" ? "is-dark" : "is-light"}`}
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="theme-toggle-icon" key={theme}>
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </span>
          <span className="theme-tooltip" role="tooltip">
            {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </span>
        </button>
      </div>
    </header>

    <main className="workspace">
      <aside className={`editor ${showPreview ? "hide-mobile" : ""}`}>
        <div className="panel-title"><div><h2>Resume details</h2><p>Update fields and watch your resume change.</p></div><button className="text-btn" onClick={clearResume}>Clear all</button></div>

        <section className="form-section">
          <button className="section-toggle" onClick={()=>toggle("personal")}><span className="section-number">01</span><span className="section-name">Personal information<small>Name and contact details</small></span>{expanded.personal ? <ChevronUp/> : <ChevronDown/>}</button>
          {expanded.personal && <div className="section-content">
            <Field label="Full name" value={resume.personal.name} onChange={v=>update("personal.name",v)} placeholder="Your full name"/>
            <Field label="Job title" value={resume.personal.title} onChange={v=>update("personal.title",v)} placeholder="e.g. Full Stack Developer"/>
            <div className="field-grid">
              <Field label="Phone" value={resume.personal.phone} onChange={v=>update("personal.phone",v)} placeholder="+91..."/>
              <Field label="Email" value={resume.personal.email} onChange={v=>update("personal.email",v)} placeholder="you@example.com"/>
              <Field label="Location" value={resume.personal.location} onChange={v=>update("personal.location",v)} placeholder="City, State"/>
              <Field label="LinkedIn" value={resume.personal.linkedin} onChange={v=>update("personal.linkedin",v)} placeholder="linkedin.com/in/..."/>
              <Field label="GitHub" value={resume.personal.github} onChange={v=>update("personal.github",v)} placeholder="github.com/..."/>
              <Field label="Portfolio" value={resume.personal.portfolio} onChange={v=>update("personal.portfolio",v)} placeholder="your-site.com"/>
            </div>
          </div>}
        </section>

        {sectionMeta.map(([key, label], idx) => {
          const isHidden = resume.hiddenSections.includes(key);
          const isExpanded = expanded[key] ?? false;
          const items = resume[key];
          return <section className={`form-section ${isHidden ? "section-disabled" : ""}`} key={key}>
            <div className="section-toggle-wrap">
              <button className="section-toggle" onClick={()=>toggle(key)}><span className="section-number">{String(idx+2).padStart(2,"0")}</span><span className="section-name">{titleFor(key)}<small>{key==="summary" ? "A short professional introduction" : key==="skills" ? "Group skills by category" : key==="experience" ? "Work, internships and training" : key==="projects" ? "Showcase your best work" : key==="education" ? "Academic background" : key==="awards" ? "Recognition and certificates" : key==="links" ? "Additional links" : "Activities and leadership"}</small></span>{isExpanded ? <ChevronUp/> : <ChevronDown/>}</button>
              <button className={`visibility-btn ${isHidden ? "is-hidden" : ""}`} onClick={()=>toggleSection(key)} title={isHidden ? "Show section in resume" : "Hide section from resume"}>{isHidden ? "Hidden" : "Visible"}</button>
            </div>
            {isExpanded && !isHidden && <div className="section-content">
              <Field label="Section heading" value={resume.sectionTitles[key] || label} onChange={v=>update(`sectionTitles.${key}`,v)} />
              {key === "summary" && <Field label="Professional summary" value={resume.summary} onChange={v=>update("summary",v)} multiline placeholder="Write a concise summary of your experience and strengths."/>}
              {key === "links" && <>
                {resume.links.map((x,i)=><Card key={i} title={x.label || `Link ${i+1}`} onDelete={()=>deleteItem("links",i)} onUp={()=>moveItem("links",i,-1)} onDown={()=>moveItem("links",i,1)} first={i===0} last={i===resume.links.length-1}>
                  <Field label="Display name" value={x.label} onChange={v=>updateItem("links",i,"label",v)} placeholder="Portfolio"/>
                  <Field label="URL" value={x.url} onChange={v=>updateItem("links",i,"url",v)} placeholder="https://..."/>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("links",{label:"",url:""})}><Plus size={15}/> Add link</button>
              </>}
              {key === "skills" && <>
                {resume.skills.map((x,i)=><Card key={i} title={x.category || `Skill category ${i+1}`} onDelete={()=>deleteItem("skills",i)} onUp={()=>moveItem("skills",i,-1)} onDown={()=>moveItem("skills",i,1)} first={i===0} last={i===resume.skills.length-1}>
                  <Field label="Category name" value={x.category} onChange={v=>updateItem("skills",i,"category",v)} placeholder="Frontend Development"/>
                  <Field label="Skills (comma separated)" value={x.skills} onChange={v=>updateItem("skills",i,"skills",v)} placeholder="React, JavaScript, CSS"/>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("skills",{category:"",skills:""})}><Plus size={15}/> Add skill category</button>
              </>}
              {key === "experience" && <>
                {resume.experience.map((x,i)=><Card key={i} title={x.title || `Experience ${i+1}`} onDelete={()=>deleteItem("experience",i)} onUp={()=>moveItem("experience",i,-1)} onDown={()=>moveItem("experience",i,1)} first={i===0} last={i===resume.experience.length-1}>
                  <Field label="Job title / program" value={x.title} onChange={v=>updateItem("experience",i,"title",v)} placeholder="Software Developer Intern"/>
                  <div className="field-grid"><Field label="Company" value={x.company} onChange={v=>updateItem("experience",i,"company",v)} placeholder="Company name"/><Field label="Location" value={x.location} onChange={v=>updateItem("experience",i,"location",v)} placeholder="City, State"/></div>
                  <div className="field-grid"><Field label="Start date" value={x.start} onChange={v=>updateItem("experience",i,"start",v)} placeholder="Jun 2025"/><Field label="End date" value={x.end} onChange={v=>updateItem("experience",i,"end",v)} placeholder="Sep 2025"/></div>
                  <label className="check-field"><input type="checkbox" checked={!!x.current} onChange={e=>updateItem("experience",i,"current",e.target.checked)}/> I currently work here</label>
                  <Field label="Technologies" value={x.technologies} onChange={v=>updateItem("experience",i,"technologies",v)} placeholder="React, Node.js..."/>
                  <Field label="Bullet points (one per line)" value={(x.bullets||[]).join("\n")} onChange={v=>updateItem("experience",i,"bullets",v.split("\n"))} multiline placeholder="Describe your work and achievements..."/>
                  <div className="field-grid"><Field label="Link label" value={x.linkLabel} onChange={v=>updateItem("experience",i,"linkLabel",v)} placeholder="Live Demo"/><Field label="Link URL" value={x.linkUrl} onChange={v=>updateItem("experience",i,"linkUrl",v)} placeholder="https://..."/></div>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("experience",{title:"",company:"",location:"",start:"",end:"",current:false,technologies:"",bullets:[],linkLabel:"",linkUrl:""})}><Plus size={15}/> Add experience</button>
              </>}
              {key === "projects" && <>
                {resume.projects.map((x,i)=><Card key={i} title={x.name || `Project ${i+1}`} onDelete={()=>deleteItem("projects",i)} onUp={()=>moveItem("projects",i,-1)} onDown={()=>moveItem("projects",i,1)} first={i===0} last={i===resume.projects.length-1}>
                  <Field label="Project name" value={x.name} onChange={v=>updateItem("projects",i,"name",v)} placeholder="Project title"/>
                  <Field label="Project date" value={x.date} onChange={v=>updateItem("projects",i,"date",v)} placeholder="October 2025"/>
                  <div className="field-grid"><Field label="Live demo URL" value={x.liveUrl} onChange={v=>updateItem("projects",i,"liveUrl",v)} placeholder="https://..."/><Field label="GitHub URL" value={x.githubUrl} onChange={v=>updateItem("projects",i,"githubUrl",v)} placeholder="https://github.com/..."/></div>
                  <Field label="Tech stack" value={x.tech} onChange={v=>updateItem("projects",i,"tech",v)} placeholder="React, Node.js, MongoDB"/>
                  <Field label="Overview" value={x.overview} onChange={v=>updateItem("projects",i,"overview",v)} multiline placeholder="What does the project do?"/>
                  <Field label="Key features" value={x.features} onChange={v=>updateItem("projects",i,"features",v)} multiline placeholder="Main features and functionality"/>
                  <Field label="Impact / results" value={x.impact} onChange={v=>updateItem("projects",i,"impact",v)} multiline placeholder="Results or improvements"/>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("projects",{name:"",date:"",liveUrl:"",githubUrl:"",tech:"",overview:"",features:"",impact:""})}><Plus size={15}/> Add project</button>
              </>}
              {key === "education" && <>
                {resume.education.map((x,i)=><Card key={i} title={x.institution || `Education ${i+1}`} onDelete={()=>deleteItem("education",i)} onUp={()=>moveItem("education",i,-1)} onDown={()=>moveItem("education",i,1)} first={i===0} last={i===resume.education.length-1}>
                  <Field label="Institution" value={x.institution} onChange={v=>updateItem("education",i,"institution",v)} placeholder="College / University"/>
                  <Field label="Location" value={x.location} onChange={v=>updateItem("education",i,"location",v)} placeholder="City, State"/>
                  <Field label="Degree / qualification" value={x.degree} onChange={v=>updateItem("education",i,"degree",v)} placeholder="B.Tech - Computer Science"/>
                  <div className="field-grid"><Field label="Start year" value={x.start} onChange={v=>updateItem("education",i,"start",v)} placeholder="2022"/><Field label="End year" value={x.end} onChange={v=>updateItem("education",i,"end",v)} placeholder="2026"/></div>
                  <div className="field-grid"><Field label="Score type" value={x.scoreLabel} onChange={v=>updateItem("education",i,"scoreLabel",v)} placeholder="CGPA"/><Field label="Score" value={x.score} onChange={v=>updateItem("education",i,"score",v)} placeholder="8.2/10"/></div>
                  <Field label="Additional details" value={x.details} onChange={v=>updateItem("education",i,"details",v)} multiline placeholder="Relevant coursework or details"/>
                  <label className="check-field"><input type="checkbox" checked={!!x.current} onChange={e=>updateItem("education",i,"current",e.target.checked)}/> Currently studying</label>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("education",{institution:"",location:"",degree:"",start:"",end:"",current:false,scoreLabel:"CGPA",score:"",details:""})}><Plus size={15}/> Add education</button>
              </>}
              {key === "activities" && <>
                {resume.activities.map((x,i)=><Card key={i} title={x.title || `Activity ${i+1}`} onDelete={()=>deleteItem("activities",i)} onUp={()=>moveItem("activities",i,-1)} onDown={()=>moveItem("activities",i,1)} first={i===0} last={i===resume.activities.length-1}>
                  <Field label="Activity title" value={x.title} onChange={v=>updateItem("activities",i,"title",v)} placeholder="Volunteer / Hackathon"/>
                  <div className="field-grid"><Field label="Organization" value={x.organization} onChange={v=>updateItem("activities",i,"organization",v)} placeholder="Organization"/><Field label="Date" value={x.date} onChange={v=>updateItem("activities",i,"date",v)} placeholder="2025"/></div>
                  <Field label="Bullet points (one per line)" value={(x.bullets||[]).join("\n")} onChange={v=>updateItem("activities",i,"bullets",v.split("\n"))} multiline placeholder="Describe the activity"/>
                  <Field label="Link URL" value={x.url} onChange={v=>updateItem("activities",i,"url",v)} placeholder="https://..."/>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("activities",{title:"",organization:"",date:"",bullets:[],url:""})}><Plus size={15}/> Add activity</button>
              </>}
              {key === "awards" && <>
                {resume.awards.map((x,i)=><Card key={i} title={x.name || `Award ${i+1}`} onDelete={()=>deleteItem("awards",i)} onUp={()=>moveItem("awards",i,-1)} onDown={()=>moveItem("awards",i,1)} first={i===0} last={i===resume.awards.length-1}>
                  <Field label="Award / certification name" value={x.name} onChange={v=>updateItem("awards",i,"name",v)} placeholder="Certification title"/>
                  <div className="field-grid"><Field label="Issuing organization" value={x.organization} onChange={v=>updateItem("awards",i,"organization",v)} placeholder="Organization"/><Field label="Issue date" value={x.date} onChange={v=>updateItem("awards",i,"date",v)} placeholder="2025"/></div>
                  <Field label="Credential ID" value={x.credentialId} onChange={v=>updateItem("awards",i,"credentialId",v)} placeholder="Optional ID"/>
                  <Field label="Credential URL" value={x.url} onChange={v=>updateItem("awards",i,"url",v)} placeholder="https://..."/>
                  <Field label="Description" value={x.description} onChange={v=>updateItem("awards",i,"description",v)} multiline placeholder="Optional details"/>
                </Card>)}
                <button className="add-btn" onClick={()=>addItem("awards",{name:"",organization:"",date:"",credentialId:"",url:"",description:""})}><Plus size={15}/> Add award / certification</button>
              </>}
              <div className="section-order-actions">
                <button className="text-btn" onClick={()=>moveSection(key,-1)}>↑ Move section up</button>
                <button className="text-btn" onClick={()=>moveSection(key,1)}>↓ Move section down</button>
              </div>
            </div>}
          </section>;
        })}

        <div className="add-section-area">
          <h3>Add a section</h3>
          <p>Restore hidden sections or add a section to your resume.</p>
          <div className="add-section-list">
            {sectionMeta.filter(([key]) => resume.hiddenSections.includes(key) || !resume.sectionOrder.includes(key)).map(([key,label])=><button key={key} onClick={()=>addSection(key)}><Plus size={14}/>{label}</button>)}
            {sectionMeta.every(([key]) => !resume.hiddenSections.includes(key) && resume.sectionOrder.includes(key)) && <span className="muted">All sections are already available.</span>}
          </div>
        </div>
        <div className="editor-footer"><button className="btn primary" onClick={()=>notify("Your changes are saved in this browser.")}><Save size={15}/> Save now</button></div>
      </aside>

      <section className={`preview-panel ${showPreview ? "show-mobile" : ""}`}>
        <div className="preview-toolbar">
          <div><h2>Live preview</h2><p><span className="live-dot"/> Updates as you edit · A4 document</p></div>
          <div className="preview-tools"><span className="page-pill">A4 · Portrait</span><button className="btn primary small-btn" onClick={()=>notify("Use Download PDF to export your resume.")}><Download size={14}/> Export</button></div>
        </div>
        <div className="paper-wrap"><ResumePreview resume={resume}/></div>
        <div className="preview-note"><Eye size={15}/> Preview is an approximation of the exported PDF. Download and inspect the PDF before sending it.</div>
      </section>
    </main>
    <nav className="mobile-switch"><button className={!showPreview ? "active" : ""} onClick={()=>setShowPreview(false)}>Edit resume</button><button className={showPreview ? "active" : ""} onClick={()=>setShowPreview(true)}>Preview</button></nav>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}

(() => {
  const KEY = "still-static-demo-v2";
  let state = load();
  let currentView = "this-week";
  let calendarOffset = 0;
  let toastTimer;

  const i18n = {
    en: {
      nav:["This Week","Next Week","Calendar","Areas","Work Log"], add:"Add", reset:"Reset demo", thisWeek:"This week", nextWeek:"Next week", weekDesc:"Meetings, deadlines, and focused work—without the noise.", nextDesc:"See what is coming before it becomes urgent.", weeklyFocus:"Weekly focus", calendarTitle:"Weekly calendar", calendarDesc:"Timed events sit where they happen; deadlines stay visible above the timeline.", calendarEyebrow:"7:00 AM — 11:00 PM", areasTitle:"Areas", areasDesc:"Areas, projects, and the concrete things inside them.", areasEyebrow:"Your worlds", workTitle:"Work Log", workDesc:"Record completed work; weekly hours total automatically.", weekOf:"Week of", hours:"hours", today:"Today", none:"Nothing scheduled", undated:"Unscheduled focus", deadline:"DDL", noTime:"No set time", min:"min", allDay:"ALL-DAY / DEADLINE", project:"Project", area:"Area", title:"Title", type:"Type", task:"Task", event:"Event", date:"Date", time:"Start time", duration:"Duration (minutes)", due:"Deadline date", location:"Location", priority:"Priority", status:"Status", notes:"Notes", low:"Low", medium:"Medium", high:"High", open:"To do", progress:"In progress", done:"Done", save:"Save changes", create:"Create item", delete:"Delete", cancel:"Cancel", addItem:"Add item", editItem:"Edit item", previous:"Previous week", next:"Next week", current:"This week", projects:"projects", items:"items", noItems:"Nothing in this project yet.", workProject:"Project", whatWorked:"What did you work on?", addLog:"Add work log", noLogs:"No hours logged this week.", resetConfirm:"Reset all demo data?", deleted:"Item deleted", saved:"Saved", resetDone:"Demo restored", logAdded:"Work log added", complete:"Complete", reopen:"Reopen", progressLabel:"Progress", longTerm:"Long-term commitments", portfolioNote:"Interactive concept product · static portfolio build"
    },
    zh: {
      nav:["本周","下周","周历","领域","工时记录"], add:"添加", reset:"重置演示", thisWeek:"本周", nextWeek:"下周", weekDesc:"只看会议、截止事项和真正需要推进的工作。", nextDesc:"提前看清下周安排，不让事情突然变急。", weeklyFocus:"本周重点", calendarTitle:"周历", calendarDesc:"带时间的安排落在时间轴上，截止事项固定显示在顶部。", calendarEyebrow:"早 7:00 — 晚 11:00", areasTitle:"领域", areasDesc:"按一级标题、二级标题和具体事项整理。", areasEyebrow:"你的生活结构", workTitle:"工时记录", workDesc:"记录已经完成的工作，本周工时自动汇总。", weekOf:"本周开始于", hours:"小时", today:"今天", none:"没有安排", undated:"无日期待办", deadline:"DDL", noTime:"无具体时间", min:"分钟", allDay:"全天 / 截止", project:"二级标题", area:"一级标题", title:"标题", type:"类型", task:"任务", event:"事件", date:"日期", time:"开始时间", duration:"持续时长（分钟）", due:"截止日期", location:"地点", priority:"优先级", status:"状态", notes:"备注", low:"低", medium:"中", high:"高", open:"待处理", progress:"进行中", done:"已完成", save:"保存更改", create:"创建事项", delete:"删除", cancel:"取消", addItem:"添加事项", editItem:"编辑事项", previous:"上一周", next:"下一周", current:"返回本周", projects:"个项目", items:"项", noItems:"这个项目下还没有事项。", workProject:"项目", whatWorked:"完成了什么工作？", addLog:"添加工时记录", noLogs:"本周还没有工时记录。", resetConfirm:"确定恢复全部演示数据？", deleted:"事项已删除", saved:"已保存", resetDone:"演示数据已恢复", logAdded:"工时已添加", complete:"完成", reopen:"重新打开", progressLabel:"进度", longTerm:"长期承诺", portfolioNote:"交互概念产品 · 静态作品集版本"
    }
  };

  const $ = (q, root=document) => root.querySelector(q);
  const $$ = (q, root=document) => [...root.querySelectorAll(q)];
  const t = () => i18n[state.locale] || i18n.en;
  const esc = (s="") => String(s).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const pad = n => String(n).padStart(2,"0");
  const toISO = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parseISO = iso => { const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d,12,0,0,0); };
  const addDays = (d,n) => { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
  const startOfWeek = d => { const x=new Date(d); x.setHours(12,0,0,0); x.setDate(x.getDate()-((x.getDay()+6)%7)); return x; };
  const formatShort = d => new Intl.DateTimeFormat(state.locale==="zh"?"zh-CN":"en-US",{month:"short",day:"numeric"}).format(d);
  const weekdayLong = d => new Intl.DateTimeFormat(state.locale==="zh"?"zh-CN":"en-US",{weekday:"long"}).format(d);
  const monday = (offset=0) => addDays(startOfWeek(new Date()), offset*7);
  const areaById = id => state.areas.find(a=>a.id===id);
  const projectById = id => state.projects.find(p=>p.id===id);
  const projectName = id => projectById(id)?.name || "—";
  const areaName = id => { const a=areaById(id); if(!a) return "—"; return state.locale==="zh" && a.nameZh ? a.nameZh : a.name; };

  function load(){
    try { const saved=JSON.parse(localStorage.getItem(KEY)); if(saved?.version===2) return saved; } catch(e){}
    const fresh=window.StillDemo.makeInitialData(); localStorage.setItem(KEY,JSON.stringify(fresh)); return fresh;
  }
  function save(){ localStorage.setItem(KEY,JSON.stringify(state)); }
  function toast(msg){ const el=$("#toast"); el.textContent=msg; el.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove("show"),1700); }

  function renderNav(){
    const icons=["◫","▤","▦","◧","◷"];
    const ids=["this-week","next-week","calendar","areas","work-log"];
    $("#nav").innerHTML=ids.map((id,i)=>`<button class="nav-button ${currentView===id?"active":""}" data-view="${id}"><span class="nav-icon">${icons[i]}</span><span>${t().nav[i]}</span></button>`).join("");
    $$('[data-view]').forEach(btn=>btn.onclick=()=>{currentView=btn.dataset.view; if(currentView==="calendar") calendarOffset=0; render();});
  }

  function pageHeading(eyebrow,title,description,aside=""){
    return `<section class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1 class="page-title">${esc(title)}</h1><p class="page-description">${esc(description)}</p></div>${aside?`<div class="heading-aside">${aside}</div>`:""}</section>`;
  }

  function render(){
    document.documentElement.lang=state.locale;
    $("#languageButton").textContent=state.locale==="en"?"中文":"EN";
    $("#resetButton").textContent=t().reset;
    $("#quickAddButton span").textContent=t().add;
    renderNav();
    if(currentView==="this-week") renderAgenda(0);
    else if(currentView==="next-week") renderAgenda(1);
    else if(currentView==="calendar") renderCalendar();
    else if(currentView==="areas") renderAreas();
    else renderWorkLog();
  }

  function itemsForDay(iso){ return state.items.filter(i=>i.dueDate===iso || i.deadlineDate===iso); }
  function sortItems(a,b){
    if(a.deadlineDate&&!b.deadlineDate) return -1; if(b.deadlineDate&&!a.deadlineDate) return 1;
    return (a.dueTime||"99:99").localeCompare(b.dueTime||"99:99");
  }
  function agendaRow(item){
    const done=item.status==="done";
    return `<div class="agenda-row ${done?"done":""}" data-edit="${item.id}">
      <button class="check ${done?"checked":""}" data-toggle="${item.id}" title="${done?t().reopen:t().complete}">${done?"✓":""}</button>
      <div class="agenda-content">
        <div class="agenda-title-line"><span class="agenda-title">${esc(item.title)}</span><span class="badges">${item.deadlineDate?`<span class="badge deadline">⚑ ${t().deadline}${item.deadlineDate?` · ${item.deadlineDate.slice(5)}`:""}</span>`:""}${item.dueTime?`<span class="badge time">${item.dueTime}</span>`:""}${item.priority==="high"?`<span class="badge priority-high">${t().high}</span>`:""}</span></div>
        ${item.notes?`<p class="agenda-notes">${esc(item.notes)}</p>`:""}
        <div class="meta">${item.duration?`<span>◷ ${item.duration} ${t().min}</span>`:""}${item.location?`<span>⌖ ${esc(item.location)}</span>`:""}<span>${esc(projectName(item.projectId))}</span>${!item.dueTime&&!item.deadlineDate?`<span>○ ${t().noTime}</span>`:""}</div>
      </div>
    </div>`;
  }

  function renderAgenda(offset){
    const start=monday(offset); const days=Array.from({length:7},(_,i)=>addDays(start,i)); const today=toISO(new Date());
    let content=pageHeading(`${t().weeklyFocus} · ${toISO(start)} — ${toISO(addDays(start,6))}`,offset?t().nextWeek:t().thisWeek,offset?t().nextDesc:t().weekDesc);
    content+=`<section class="agenda-grid">`;
    days.forEach(d=>{
      const iso=toISO(d), dayItems=itemsForDay(iso).sort(sortItems);
      content+=`<article class="card agenda-day ${iso===today?"today":""}"><header class="agenda-header"><div><strong>${esc(weekdayLong(d))}</strong><span>${esc(formatShort(d))}</span></div>${iso===today?`<span class="today-badge">${t().today}</span>`:""}</header><div class="agenda-list">${dayItems.length?dayItems.map(agendaRow).join(""):`<p class="agenda-empty">${t().none}</p>`}</div></article>`;
    });
    const undated=state.items.filter(i=>!i.dueDate&&!i.deadlineDate).sort(sortItems);
    content+=`<article class="card undated-card"><header class="agenda-header"><div><strong>${t().undated}</strong></div></header><div class="agenda-list">${undated.length?undated.map(agendaRow).join(""):`<p class="agenda-empty">${t().none}</p>`}</div></article></section>`;
    $("#main").innerHTML=content; bindItemRows();
  }

  function renderCalendar(){
    const start=monday(calendarOffset); const days=Array.from({length:7},(_,i)=>addDays(start,i)); const today=toISO(new Date());
    let content=pageHeading(t().calendarEyebrow,t().calendarTitle,t().calendarDesc);
    content+=`<div class="calendar-toolbar"><div class="calendar-nav"><button class="soft-button" id="prevWeek">‹</button><button class="soft-button" id="currentWeek">${t().current}</button><button class="soft-button" id="nextWeek">›</button></div><div class="calendar-range">${formatShort(start)} — ${formatShort(addDays(start,6))}</div></div>`;
    content+=`<div class="calendar-shell"><div class="calendar-canvas"><div class="calendar-grid calendar-header"><div></div>${days.map(d=>{const iso=toISO(d);return `<div class="day-head ${iso===today?"today":""}"><small>${esc(new Intl.DateTimeFormat(state.locale==="zh"?"zh-CN":"en-US",{weekday:"short"}).format(d))}</small><strong>${d.getDate()}</strong></div>`}).join("")}</div>`;
    content+=`<div class="calendar-grid all-day-row"><div class="all-day-label">${t().allDay}</div>${days.map(d=>{const iso=toISO(d);const deadlines=state.items.filter(i=>i.deadlineDate===iso);return `<div class="all-day-cell">${deadlines.map(i=>`<button class="deadline-chip" data-edit="${i.id}">⚑ ${esc(i.title)}</button>`).join("")}</div>`}).join("")}</div>`;
    content+=`<div class="calendar-grid"><div class="time-axis">${Array.from({length:17},(_,i)=>`<span class="time-label" style="top:${i*72}px">${formatHour(7+i)}</span>`).join("")}</div>`;
    days.forEach(d=>{ const iso=toISO(d); const timed=state.items.filter(i=>i.dueDate===iso&&i.dueTime); content+=`<div class="timeline-day ${iso===today?"today":""}" data-day="${iso}">${Array.from({length:32},(_,slot)=>`<button class="slot" data-slot="${iso}" data-time="${minutesToTime(7*60+slot*30)}" style="top:${slot*36}px" aria-label="Add ${iso} ${minutesToTime(7*60+slot*30)}"></button>`).join("")}${timed.map(calendarEvent).join("")}</div>`; });
    content+=`</div></div></div>`;
    $("#main").innerHTML=content;
    $("#prevWeek").onclick=()=>{calendarOffset--;renderCalendar()}; $("#nextWeek").onclick=()=>{calendarOffset++;renderCalendar()}; $("#currentWeek").onclick=()=>{calendarOffset=0;renderCalendar()};
    $$('[data-edit]').forEach(x=>x.onclick=e=>{e.stopPropagation();openItemModal(x.dataset.edit)});
    $$('[data-slot]').forEach(x=>x.onclick=()=>openItemModal(null,{date:x.dataset.slot,time:x.dataset.time}));
  }
  function formatHour(h){return `${h%12||12} ${h<12?"AM":"PM"}`}
  function minutesToTime(m){return `${pad(Math.floor(m/60))}:${pad(m%60)}`}
  function calendarEvent(item){
    const [h,m]=item.dueTime.split(":").map(Number); const top=Math.max(0,((h*60+m)-7*60)/60*72); const height=Math.max(30,(item.duration||60)/60*72); const klass=item.eventKind==="class"?"class-event":"";
    return `<button class="event-card ${klass} ${item.status==="done"?"done":""}" data-edit="${item.id}" style="top:${top}px;height:${height}px"><strong>${esc(item.title)}</strong><span>${item.dueTime} · ${item.duration||60} ${t().min}</span>${item.location?`<span class="event-location">⌖ ${esc(item.location)}</span>`:""}</button>`;
  }

  function renderAreas(){
    let content=pageHeading(t().areasEyebrow,t().areasTitle,t().areasDesc,`<div class="stat-pill"><strong>${state.projects.length}</strong><span>${t().projects}</span></div>`);
    content+=`<section class="areas-stack">`;
    state.areas.forEach(area=>{
      const projects=state.projects.filter(p=>p.areaId===area.id);
      content+=`<article class="area-card" style="--accent:${area.color}"><header class="area-header"><div class="area-title-wrap"><button class="collapse-button" data-collapse="${area.id}">⌄</button><div><p class="level-label">AREA</p><h2 class="area-title">${esc(areaName(area.id))}</h2></div><span class="area-count">${projects.length} ${t().projects}</span></div></header><div class="area-projects" data-area-body="${area.id}">`;
      projects.forEach(p=>{ const items=state.items.filter(i=>i.projectId===p.id); content+=`<article class="project-card"><header class="project-header"><div class="project-main"><p class="level-label">PROJECT</p><h3 class="project-name">${esc(p.name)}</h3></div><div class="project-progress-wrap"><div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,p.progress||0))}%"></div></div><span class="progress-number">${p.progress||0}%</span></div></header><div class="project-items">${items.length?items.map(i=>`<div class="project-item"><button class="check ${i.status==="done"?"checked":""}" data-toggle="${i.id}">${i.status==="done"?"✓":""}</button><button class="project-item-title ${i.status==="done"?"done":""}" data-edit="${i.id}" style="border:0;background:transparent;text-align:left;padding:0">${esc(i.title)}</button><span class="project-item-meta">${i.deadlineDate?`DDL ${i.deadlineDate.slice(5)}`:(i.dueDate?i.dueDate.slice(5):"")}</span></div>`).join(""):`<div class="empty-project">${t().noItems}</div>`}</div></article>`; });
      content+=`</div></article>`;
    });
    content+=`</section><p class="page-description" style="margin-top:20px">${t().portfolioNote}</p>`;
    $("#main").innerHTML=content;
    $$('[data-collapse]').forEach(btn=>btn.onclick=()=>{const body=$(`[data-area-body="${btn.dataset.collapse}"]`);const hidden=body.style.display==="none";body.style.display=hidden?"flex":"none";btn.textContent=hidden?"⌄":"›"});
    bindItemRows();
  }

  function renderWorkLog(){
    const start=monday(0), end=addDays(start,6); const logs=state.workLogs.filter(l=>l.date>=toISO(start)&&l.date<=toISO(end)); const total=logs.reduce((s,l)=>s+Number(l.hours||0),0);
    let content=pageHeading(`${t().weekOf} ${toISO(start)}`,t().workTitle,t().workDesc,`<div class="stat-pill"><strong>${total.toFixed(1)}</strong><span>${t().hours}</span></div>`);
    content+=`<form id="workForm" class="card work-form"><label class="field-label"><span>${t().date}</span><input class="field" type="date" name="date" required value="${toISO(new Date())}"></label><label class="field-label"><span>${t().workProject}</span><select class="field" name="projectId"><option value="portfolio">Vibe Coding Portfolio</option><option value="xr">Immersive Media Workflow</option><option value="capstone">Capstone</option></select></label><label class="field-label"><span>${t().hours}</span><input class="field" type="number" name="hours" min=".25" max="24" step=".25" required placeholder="1.5"></label><label class="field-label span-2"><span>${t().whatWorked}</span><textarea class="field" name="description" required></textarea></label><div><button class="primary-button">${t().addLog}</button></div></form>`;
    content+=`<section class="card work-list">${logs.length?logs.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(l=>`<div class="work-row"><div><p>${esc(l.description)}</p><small>${l.date} · ${esc(projectName(l.projectId))}</small></div><strong class="work-hours">${Number(l.hours).toFixed(1)}h</strong></div>`).join(""):`<p class="agenda-empty">${t().noLogs}</p>`}</section>`;
    $("#main").innerHTML=content;
    $("#workForm").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.currentTarget);state.workLogs.push({id:`w${Date.now()}`,date:fd.get("date"),projectId:fd.get("projectId"),hours:Number(fd.get("hours")),description:String(fd.get("description"))});save();toast(t().logAdded);renderWorkLog();};
  }

  function bindItemRows(){
    $$('[data-edit]').forEach(x=>x.onclick=e=>{e.stopPropagation();openItemModal(x.dataset.edit)});
    $$('[data-toggle]').forEach(x=>x.onclick=e=>{e.stopPropagation();const item=state.items.find(i=>i.id===x.dataset.toggle);if(!item)return;item.status=item.status==="done"?"open":"done";save();render();});
  }

  function openItemModal(id,defaults={}){
    const existing=id?state.items.find(i=>i.id===id):null;
    const item=existing?{...existing}:{id:`i${Date.now()}`,title:"",type:"task",eventKind:null,areaId:"academic",projectId:"aipi",dueDate:defaults.date||toISO(new Date()),dueTime:defaults.time||"",duration:60,location:"",deadlineDate:null,priority:"medium",status:"open",notes:""};
    const projectsForArea=state.projects.filter(p=>p.areaId===item.areaId);
    $("#modalRoot").innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><section class="modal" role="dialog" aria-modal="true"><header class="modal-header"><div><p class="eyebrow">${existing?t().editItem:t().addItem}</p><h2>${existing?esc(item.title):t().create}</h2></div><button class="icon-button" id="closeModal">✕</button></header><form id="itemForm"><div class="modal-grid"><label class="field-label span-2"><span>${t().title}</span><input class="field" name="title" required value="${esc(item.title)}"></label><label class="field-label"><span>${t().area}</span><select class="field" name="areaId" id="areaSelect">${state.areas.map(a=>`<option value="${a.id}" ${a.id===item.areaId?"selected":""}>${esc(areaName(a.id))}</option>`).join("")}</select></label><label class="field-label"><span>${t().project}</span><select class="field" name="projectId" id="projectSelect">${projectsForArea.map(p=>`<option value="${p.id}" ${p.id===item.projectId?"selected":""}>${esc(p.name)}</option>`).join("")}</select></label><label class="field-label"><span>${t().type}</span><select class="field" name="type"><option value="task" ${item.type==="task"?"selected":""}>${t().task}</option><option value="event" ${item.type==="event"?"selected":""}>${t().event}</option></select></label><label class="field-label"><span>${t().status}</span><select class="field" name="status"><option value="open" ${item.status==="open"?"selected":""}>${t().open}</option><option value="in_progress" ${item.status==="in_progress"?"selected":""}>${t().progress}</option><option value="done" ${item.status==="done"?"selected":""}>${t().done}</option></select></label><label class="field-label"><span>${t().date}</span><input class="field" name="dueDate" type="date" value="${item.dueDate||""}"></label><label class="field-label"><span>${t().time}</span><input class="field" name="dueTime" type="time" value="${item.dueTime||""}"></label><label class="field-label"><span>${t().duration}</span><input class="field" name="duration" type="number" min="5" step="5" value="${item.duration||""}"></label><label class="field-label"><span>${t().due}</span><input class="field" name="deadlineDate" type="date" value="${item.deadlineDate||""}"></label><label class="field-label"><span>${t().location}</span><input class="field" name="location" value="${esc(item.location||"")}"></label><label class="field-label"><span>${t().priority}</span><select class="field" name="priority"><option value="low" ${item.priority==="low"?"selected":""}>${t().low}</option><option value="medium" ${item.priority==="medium"?"selected":""}>${t().medium}</option><option value="high" ${item.priority==="high"?"selected":""}>${t().high}</option></select></label><label class="field-label span-2"><span>${t().notes}</span><textarea class="field" name="notes">${esc(item.notes||"")}</textarea></label></div><div class="modal-actions"><div>${existing?`<button type="button" class="danger-button" id="deleteItem">${t().delete}</button>`:""}</div><div style="display:flex;gap:8px"><button type="button" class="soft-button" id="cancelModal">${t().cancel}</button><button class="primary-button">${existing?t().save:t().create}</button></div></div></form></section></div>`;
    const close=()=>$("#modalRoot").innerHTML="";
    $("#closeModal").onclick=close; $("#cancelModal").onclick=close; $("#modalBackdrop").onclick=e=>{if(e.target.id==="modalBackdrop")close()};
    $("#areaSelect").onchange=e=>{const opts=state.projects.filter(p=>p.areaId===e.target.value);$("#projectSelect").innerHTML=opts.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")};
    if(existing) $("#deleteItem").onclick=()=>{if(confirm(`${t().delete}: ${item.title}?`)){state.items=state.items.filter(i=>i.id!==item.id);save();close();toast(t().deleted);render();}};
    $("#itemForm").onsubmit=e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const updated={...item,title:String(fd.get("title")),areaId:String(fd.get("areaId")),projectId:String(fd.get("projectId")),type:String(fd.get("type")),status:String(fd.get("status")),dueDate:String(fd.get("dueDate"))||null,dueTime:String(fd.get("dueTime"))||null,duration:fd.get("duration")?Number(fd.get("duration")):null,deadlineDate:String(fd.get("deadlineDate"))||null,location:String(fd.get("location")||""),priority:String(fd.get("priority")),notes:String(fd.get("notes")||"")};if(existing) state.items=state.items.map(i=>i.id===updated.id?updated:i);else state.items.push(updated);save();close();toast(t().saved);render();};
  }

  $("#quickAddButton").onclick=()=>openItemModal();
  $("#languageButton").onclick=()=>{state.locale=state.locale==="en"?"zh":"en";save();render();};
  $("#resetButton").onclick=()=>{if(confirm(t().resetConfirm)){state=window.StillDemo.makeInitialData();save();calendarOffset=0;currentView="this-week";toast(t().resetDone);render();}};
  render();
})();

(function () {
  const pad = (n) => String(n).padStart(2, "0");
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate()+n); return x; };
  const startOfWeek = (d) => { const x = new Date(d); const day = x.getDay(); x.setDate(x.getDate() - ((day + 6) % 7)); x.setHours(12,0,0,0); return x; };

  window.StillDemo = {
    makeInitialData() {
      const monday = startOfWeek(new Date());
      const iso = (offset) => toISO(addDays(monday, offset));

      const areas = [
        { id: "academic", name: "Academic", nameZh: "学业", color: "#718b78" },
        { id: "work", name: "Work & Portfolio", nameZh: "工作与作品集", color: "#8b765f" },
        { id: "career", name: "Career", nameZh: "求职", color: "#7b8199" },
        { id: "personal", name: "Personal", nameZh: "个人", color: "#9a806e" }
      ];

      const projects = [
        { id: "aipi", areaId: "academic", name: "AIPI 590 – AI in Product Management", progress: 28 },
        { id: "ie", areaId: "academic", name: "I&E 748 – New Ventures Discovery", progress: 18 },
        { id: "g590", areaId: "academic", name: "GAMEDSGN 590 – Serious Games", progress: 32 },
        { id: "g552", areaId: "academic", name: "GAMEDSGN 552 – Business Fundamentals II", progress: 24 },
        { id: "capstone", areaId: "academic", name: "Capstone", progress: 40 },
        { id: "portfolio", areaId: "work", name: "Vibe Coding Portfolio", progress: 68 },
        { id: "xr", areaId: "work", name: "Immersive Media Workflow", progress: 55 },
        { id: "interviews", areaId: "career", name: "Interview Preparation", progress: 42 },
        { id: "applications", areaId: "career", name: "Applications", progress: 26 },
        { id: "life", areaId: "personal", name: "Life Admin", progress: 35 }
      ];

      const items = [
        { id:"i1", title:"AIPI 590 · AI in Product Management", type:"event", eventKind:"class", areaId:"academic", projectId:"aipi", dueDate:iso(3), dueTime:"13:40", duration:165, location:"Hudson Hall 207", deadlineDate:null, priority:"medium", status:"open", notes:"Weekly class session." },
        { id:"i2", title:"I&E 748 · New Ventures Discovery", type:"event", eventKind:"class", areaId:"academic", projectId:"ie", dueDate:iso(0), dueTime:"15:30", duration:150, location:"Fuqua", deadlineDate:null, priority:"medium", status:"open", notes:"Problem discovery workshop." },
        { id:"i3", title:"Serious Games studio", type:"event", eventKind:"class", areaId:"academic", projectId:"g590", dueDate:iso(1), dueTime:"10:05", duration:160, location:"Smith Warehouse", deadlineDate:null, priority:"medium", status:"open", notes:"Studio / playtest block." },
        { id:"i4", title:"Business Fundamentals II", type:"event", eventKind:"class", areaId:"academic", projectId:"g552", dueDate:iso(4), dueTime:"14:00", duration:150, location:"Duke campus", deadlineDate:null, priority:"medium", status:"open", notes:"Weekly class session." },
        { id:"i5", title:"Portfolio: finish Safari image pass", type:"task", eventKind:null, areaId:"work", projectId:"portfolio", dueDate:iso(2), dueTime:"09:30", duration:90, location:"", deadlineDate:iso(4), priority:"high", status:"in_progress", notes:"Complete images, bilingual copy, and map polish." },
        { id:"i6", title:"Weekly planner static demo", type:"task", eventKind:null, areaId:"work", projectId:"portfolio", dueDate:iso(2), dueTime:"20:00", duration:75, location:"", deadlineDate:iso(5), priority:"high", status:"in_progress", notes:"Prepare stable version that opens without a backend." },
        { id:"i7", title:"Prepare three product interview stories", type:"task", eventKind:null, areaId:"career", projectId:"interviews", dueDate:null, dueTime:null, duration:null, location:"", deadlineDate:iso(2), priority:"high", status:"open", notes:"Ambiguity, collaboration, measurable impact." },
        { id:"i8", title:"Review next application batch", type:"task", eventKind:null, areaId:"career", projectId:"applications", dueDate:iso(4), dueTime:"18:00", duration:45, location:"", deadlineDate:null, priority:"medium", status:"open", notes:"Prioritize roles before tailoring resumes." },
        { id:"i9", title:"Capstone section draft", type:"task", eventKind:null, areaId:"academic", projectId:"capstone", dueDate:iso(5), dueTime:"11:00", duration:120, location:"Library", deadlineDate:iso(6), priority:"high", status:"open", notes:"Finish the next section and note open questions." },
        { id:"i10", title:"Test immersive media workflow", type:"task", eventKind:null, areaId:"work", projectId:"xr", dueDate:iso(1), dueTime:"16:30", duration:90, location:"Co-Lab", deadlineDate:null, priority:"medium", status:"done", notes:"Compare capture methods and document trade-offs." },
        { id:"i11", title:"Laundry + weekly reset", type:"task", eventKind:null, areaId:"personal", projectId:"life", dueDate:iso(6), dueTime:"19:00", duration:60, location:"", deadlineDate:null, priority:"low", status:"open", notes:"Reset before the new week." },
        { id:"i12", title:"Refine long-term project milestones", type:"task", eventKind:null, areaId:"academic", projectId:"capstone", dueDate:null, dueTime:null, duration:null, location:"", deadlineDate:null, priority:"medium", status:"open", notes:"Break the next month into visible checkpoints." }
      ];

      const workLogs = [
        { id:"w1", date:iso(0), projectId:"portfolio", hours:2.5, description:"Reviewed portfolio structure and selected the two projects to publish." },
        { id:"w2", date:iso(1), projectId:"xr", hours:2.0, description:"Tested 360 workflow and documented capture / editing trade-offs." },
        { id:"w3", date:iso(2), projectId:"portfolio", hours:1.5, description:"Cleaned the Safari site and prepared a stable deployment version." }
      ];

      return { version: 2, areas, projects, items, workLogs, locale:"en" };
    }
  };
})();

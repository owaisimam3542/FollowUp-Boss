// import React, { useState, useRef } from "react";
// import axios from "axios";
// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";

// dayjs.extend(utc);
// dayjs.extend(timezone);

// const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

// function App() {
//   const [token, setToken] = useState(null);
//   const [user, setUser] = useState(null);
//   const [items, setItems] = useState([]);
//   const [form, setForm] = useState({
//     source: "WHATSAPP",
//     contact_name: "",
//     contact_phone: "",
//     description: "",
//     due_date: dayjs().format("YYYY-MM-DDTHH:mm"),
//     priority: "MEDIUM",
//     status: "PENDING"
//   });

//   const [loginUsername, setLoginUsername] = useState("");
//   const [loginPassword, setLoginPassword] = useState("");
//   const [audioBlob, setAudioBlob] = useState(null);
//   const [recording, setRecording] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const [currentAudioId, setCurrentAudioId] = useState(null);
//   const audioRefs = useRef({});

//   const login = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await axios.post("http://127.0.0.1:8000/api/auth/token/", {
//         username: loginUsername,
//         password: loginPassword
//       });
//       setToken(res.data.access);
//       api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
//       setLoginUsername("");
//       setLoginPassword("");
//       const userRes = await api.get("/auth/user/");
//       setUser(userRes.data);
//       fetchData();
//     } catch {
//       alert("Login failed");
//     }
//   };

//   const fetchData = async () => {
//     const res = await api.get("/followups/");
//     setItems(res.data);
//   };

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream);
//       mediaRecorderRef.current = mediaRecorder;
//       const chunks = [];
//       mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
//       mediaRecorder.onstop = () => setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
//       mediaRecorder.start();
//       setRecording(true);
//     } catch {
//       alert("Microphone access denied");
//     }
//   };

//   const stopRecording = () => {
//     mediaRecorderRef.current.stop();
//     setRecording(false);
//   };

//   const addFollowUp = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("source", form.source);
//     formData.append("contact_name", form.contact_name);
//     formData.append("contact_phone", form.contact_phone);
//     formData.append("description", form.description);
//     formData.append("due_date", dayjs(form.due_date).utc().format());
//     formData.append("priority", form.priority);
//     formData.append("status", form.status);
//     if (audioBlob) formData.append("audio_note", audioBlob, "note.webm");
//     try {
//       await api.post("/followups/", formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });
//       setForm({
//         source: "WHATSAPP",
//         contact_name: "",
//         contact_phone: "",
//         description: "",
//         due_date: dayjs().format("YYYY-MM-DDTHH:mm"),
//         priority: "MEDIUM",
//         status: "PENDING"
//       });
//       setAudioBlob(null);
//       fetchData();
//     } catch {
//       alert("Failed to add follow-up");
//     }
//   };

//   const markDone = async (id) => {
//     await api.patch(`/followups/${id}/mark_done/`);
//     fetchData();
//   };

//   const snooze = async (id) => {
//     const dt = prompt("Enter snooze till (YYYY-MM-DDTHH:mm)");
//     if (dt) {
//       await api.patch(`/followups/${id}/snooze/`, { snoozed_till: dt });
//       fetchData();
//     }
//   };

//   const whatsAppLink = (item) => {
//     const msg = `Follow-up: ${item.description}\nWith: ${item.contact_name}\nDue: ${dayjs
//       .utc(item.due_date)
//       .tz(dayjs.tz.guess())
//       .format("DD MMM, HH:mm")}`;
//     return item.contact_phone
//       ? `https://wa.me/${item.contact_phone}?text=${encodeURIComponent(msg)}`
//       : `https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
//   };

//   const columns = ["PENDING", "SNOOZED", "DONE"];

//   const togglePlayGlobal = (id) => {
//     const audio = audioRefs.current[id];
//     if (!audio) return;
//     Object.entries(audioRefs.current).forEach(([key, a]) => {
//       if (key !== id.toString() && !a.paused) {
//         a.pause();
//         a.currentTime = 0;
//       }
//     });
//     if (audio.paused) {
//       audio.play();
//       setCurrentAudioId(id);
//     } else {
//       audio.pause();
//       audio.currentTime = 0;
//       setCurrentAudioId(null);
//     }
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     setItems([]);
//     setLoginUsername("");
//     setLoginPassword("");
//   };

//   const simulateMissedCall = async () => {
//     const mockNames = ["Raj", "Priya", "Amit", "Neha", "Kiran", "Sana"];
//     const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
//     const randomPhone = "9" + Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
//     const formData = new FormData();
//     formData.append("source", "CALL");
//     formData.append("contact_name", randomName);
//     formData.append("contact_phone", randomPhone);
//     formData.append("description", "Missed call. Please follow up.");
//     formData.append("due_date", dayjs().format());
//     formData.append("priority", "MEDIUM");
//     formData.append("status", "PENDING");
//     try {
//       await api.post("/followups/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       fetchData();
//     } catch {
//       alert("Missed call entry failed");
//     }
//   };

//   return (
//     <div style={{
//       maxWidth: 1200,
//       margin: "36px auto",
//       padding: 20,
//       fontFamily: "'Segoe UI', Arial, sans-serif",
//       background: "#f8f9fa",
//       borderRadius: 16,
//       boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
//       position: "relative"
//     }}>
//       {token && (
//         <button onClick={logout}
//           style={{
//             position: 'absolute', right: 24, top: 22, zIndex: 10,
//             padding: "8px 22px", background: "#344957",
//             color: "#fff", fontWeight: "bold", border: "none",
//             borderRadius: "6px", cursor: "pointer", fontSize: 15,
//             boxShadow: "0 4px 14px rgba(52,73,87,0.09)",
//             transition: "background .2s"
//           }}
//         >
//           Logout
//         </button>
//       )}
//       {!token && (
//         <div style={{
//           display: 'flex', flexDirection: 'column', alignItems: 'center',
//           justifyContent: 'center', minHeight: '60vh'
//         }}>
//           <h1 style={{ fontSize: 32, color: "#d72861", marginBottom: 20 }}>
//             <span style={{ marginRight: 10 }}>📌</span>FollowUp Boss
//           </h1>
//           <form onSubmit={login} style={{
//             display: 'flex', flexDirection: 'column',
//             gap: 14, background: "#fff", padding: 34,
//             borderRadius: 8, boxShadow: "0 2px 14px rgb(220 40 97 / 0.08)"
//           }}>
//             <input
//               type="text"
//               placeholder="Username"
//               value={loginUsername}
//               onChange={(e) => setLoginUsername(e.target.value)}
//               required
//               style={{
//                 padding: "12px", borderRadius: 6, border: "1px solid #ccc",
//                 fontSize: 18, outline: "none"
//               }}
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={loginPassword}
//               onChange={(e) => setLoginPassword(e.target.value)}
//               required
//               style={{
//                 padding: "12px", borderRadius: 6, border: "1px solid #ccc",
//                 fontSize: 18, outline: "none"
//               }}
//             />
//             <button
//               type="submit"
//               style={{
//                 padding: "12px 0", background: "#d72861", color: "white",
//                 border: "none", borderRadius: 7, fontWeight: "bold", fontSize: 18,
//                 cursor: "pointer", marginTop: "12px", letterSpacing: "0.05em"
//               }}
//             >Login</button>
//           </form>
//         </div>
//       )}
//       {token && (
//         <div style={{ marginTop: 60 }}>
//           <h1 style={{ fontSize: 32, color: "#d72861", marginBottom: 12 }}>
//             <span style={{ marginRight: 10 }}>📌</span>FollowUp Boss
//           </h1>
//           {user && (
//             <div style={{
//               marginBottom: 16,
//               color: user.is_staff ? "#2ecc40" : "#2980b9",
//               fontWeight: "bold",
//               fontSize: 18
//             }}>
//               <span style={{
//                 padding: "2px 10px",
//                 borderRadius: 8,
//                 background: user.is_staff ? "#eafbe7" : "#eaf3fb",
//                 marginRight: 10
//               }}>
//                 {user.is_staff
//                   ? "MANAGER"
//                   : "SALESPERSON"}
//               </span>
//               {user.is_staff
//                 ? "You are a manager. Viewing all follow-ups."
//                 : "You are a salesperson. Viewing your follow-ups only."}
//             </div>
//           )}
//           <button
//             style={{
//               background: "#fee", color: "#d72861",
//               padding: "7px 20px", fontWeight: "bold", border: "none",
//               borderRadius: "6px", marginBottom: "18px", fontSize: 15,
//               cursor: "pointer", boxShadow: "0 1px 8px rgb(220 40 97 / 0.07)",
//               transition: "background .2s"
//             }}
//             onClick={simulateMissedCall}
//           >
//             Simulate Missed Call
//           </button>
//           {/* BEAUTIFUL, LABELED, CLEAN FORM STARTS HERE */}
//           <form onSubmit={addFollowUp}
//             style={{
//               background: "#fff", borderRadius: 8, padding: 22, marginBottom: 30,
//               boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
//               display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24
//             }}>
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               <label style={{ fontWeight: "bold", color: "#d72861" }}>Source</label>
//               <select
//                 value={form.source}
//                 onChange={e => setForm({ ...form, source: e.target.value })}
//                 style={{
//                   padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15,
//                   background: "#f6f4fa"
//                 }}>
//                 <option>WHATSAPP</option>
//                 <option>CALL</option>
//                 <option>VERBAL</option>
//                 <option>EMAIL</option>
//                 <option>OTHER</option>
//               </select>
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               <label style={{ fontWeight: "bold", color: "#d72861" }}>Contact Name</label>
//               <input
//                 value={form.contact_name}
//                 onChange={e => setForm({ ...form, contact_name: e.target.value })}
//                 required
//                 placeholder="Who to follow up with"
//                 style={{
//                   padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15,
//                   background: "#f6f4fa"
//                 }}
//               />
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               <label style={{ fontWeight: "bold", color: "#d72861" }}>Phone</label>
//               <input
//                 value={form.contact_phone}
//                 onChange={e => setForm({ ...form, contact_phone: e.target.value })}
//                 placeholder="Phone (e.g. 919876543210)"
//                 style={{
//                   padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15,
//                   background: "#f6f4fa"
//                 }}
//               />
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               <label style={{ fontWeight: "bold", color: "#d72861" }}>Description</label>
//               <input
//                 value={form.description}
//                 onChange={e => setForm({ ...form, description: e.target.value })}
//                 required
//                 placeholder="What is the follow-up?"
//                 style={{
//                   padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15,
//                   background: "#f6f4fa"
//                 }}
//               />
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               <label style={{ fontWeight: "bold", color: "#d72861" }}>Due Date</label>
//               <input
//                 type="datetime-local"
//                 value={form.due_date}
//                 onChange={e => setForm({ ...form, due_date: e.target.value })}
//                 style={{
//                   padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15,
//                   background: "#f6f4fa"
//                 }}
//               />
//             </div>
//             <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//               <label style={{ fontWeight: "bold", color: "#d72861" }}>Priority</label>
//               <select
//                 value={form.priority}
//                 onChange={e => setForm({ ...form, priority: e.target.value })}
//                 style={{
//                   padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15,
//                   background: "#f6f4fa"
//                 }}>
//                 <option>LOW</option>
//                 <option>MEDIUM</option>
//                 <option>HIGH</option>
//               </select>
//             </div>
//             <div style={{ gridColumn: "1/-1", marginTop: 12 }}>
//               <div style={{ marginBottom: 14 }}>
//                 {recording ? (
//                   <button type="button" onClick={stopRecording}
//                     style={{
//                       padding: "8px 24px", background: "#f3e17e", color: "#445",
//                       border: "none", borderRadius: "6px", fontSize: 15, fontWeight: "bold", cursor: "pointer"
//                     }}
//                   >Stop Recording ⏹️</button>
//                 ) : (
//                   <button type="button" onClick={startRecording}
//                     style={{
//                       padding: "8px 24px", background: "#e3e4fd", color: "#2b26cc",
//                       border: "none", borderRadius: "6px", fontSize: 15, fontWeight: "bold", cursor: "pointer"
//                     }}
//                   >Record 🎤</button>
//                 )}
//                 {audioBlob && (
//                   <audio controls src={URL.createObjectURL(audioBlob)} style={{ marginLeft: "18px", width: "320px" }} />
//                 )}
//               </div>
//               <button type="submit"
//                 style={{
//                   padding: "10px 30px", background: "#1ec48e",
//                   color: "#fff", fontWeight: "bold", border: "none",
//                   borderRadius: "6px", fontSize: 17, cursor: "pointer",
//                   transition: "background .2s"
//                 }}
//               >Add FollowUp</button>
//             </div>
//           </form>
//           {/* END BEAUTIFUL FORM */}
//           <div style={{ display: "flex", gap: "24px" }}>
//             {columns.map((col) => {
//               let colItems = items.filter((f) => f.status === col);
//               colItems.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
//               let dueTodayCount = 0;
//               if (col === "PENDING") {
//                 dueTodayCount = colItems.filter(
//                   (f) => new Date(f.due_date).toDateString() === new Date().toDateString()
//                 ).length;
//               }
//               const colorMap = {
//                 PENDING: "#ea8685",
//                 SNOOZED: "#fed18c",
//                 DONE: "#41c480"
//               };
//               return (
//                 <div key={col} style={{
//                   flex: 1,
//                   background: "#fff",
//                   borderRadius: "14px",
//                   padding: "18px",
//                   boxShadow: "0 2px 12px rgb(0 0 0 / 0.04)",
//                   border: "2px solid " + colorMap[col]
//                 }}>
//                   <h2 style={{
//                     color: colorMap[col], fontSize: 22,
//                     fontWeight: "bold", marginBottom: 17
//                   }}>
//                     {col}
//                     {col === "PENDING" &&
//                       <span style={{ marginLeft: 8, fontSize: "14px", color: "#444", fontWeight: "normal" }}>
//                         ({dueTodayCount} due today)</span>}
//                   </h2>
//                   {colItems.length === 0 &&
//                     <p style={{ color: "#bbb", fontStyle: "italic", padding: "36px 0" }}>No follow-ups in this status.</p>
//                   }
//                   {colItems.map((f) => {
//                     const isOverdue = col !== "DONE" && new Date(f.due_date) < new Date();
//                     return (
//                       <div key={f.id}
//                         style={{
//                           border: `1px solid ${isOverdue ? "#dd0033" : "#ccc"}`,
//                           padding: 12,
//                           borderRadius: "10px",
//                           marginBottom: "14px",
//                           background: isOverdue ? "#fff0f0" : "#f7f9fb",
//                           boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
//                           position: "relative"
//                         }}>
//                         <div style={{
//                           display: "flex", alignItems: "center",
//                           marginBottom: 4
//                         }}>
//                           <b style={{ fontSize: 18 }}>{f.contact_name}</b>
//                           {f.source === "CALL" &&
//                             <span style={{
//                               marginLeft: 10,
//                               padding: "2px 7px",
//                               background: "#e3e0ff",
//                               borderRadius: "8px",
//                               fontWeight: "bold",
//                               fontSize: 12,
//                               color: "#4932d6"
//                             }}>Missed Call</span>
//                           }
//                         </div>
//                         {f.contact_phone &&
//                           <p style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>
//                             📞 {f.contact_phone}
//                           </p>
//                         }
//                         <p style={{ fontSize: 15, marginBottom: '6px' }}>{f.description}</p>
//                         {f.audio_note && (
//                           <div style={{ margin: "7px 0" }}>
//                             <button
//                               type="button"
//                               onClick={() => togglePlayGlobal(f.id)}
//                               style={{
//                                 background: "#f7e5fe",
//                                 color: "#4932d6",
//                                 padding: "5px 12px", borderRadius: "6px",
//                                 border: "none", fontWeight: "bold",
//                                 fontSize: 13, cursor: "pointer", marginBottom: "5px",
//                                 transition: "background .2s"
//                               }}
//                             >
//                               {currentAudioId === f.id ? "⏹️ Stop Audio" : "🎤 Play Audio Note"}
//                             </button>
//                             <audio
//                               ref={(el) => (audioRefs.current[f.id] = el)}
//                               src={f.audio_note}
//                               controls
//                               onEnded={() => setCurrentAudioId(null)}
//                               style={{ marginLeft: "6px", width: "100%" }}
//                             />
//                           </div>
//                         )}
//                         <small style={{
//                           color: isOverdue ? "#dd0033" : "#444",
//                           fontWeight: isOverdue ? "bold" : "normal",
//                           fontSize: 15,
//                           display: "block"
//                         }}>
//                           Due: {dayjs.utc(f.due_date).tz(dayjs.tz.guess()).format("DD MMM YYYY HH:mm")}
//                         </small>
//                         <div style={{
//                           marginTop: 11, display: "flex", gap: 8, flexWrap: 'wrap'
//                         }}>
//                           {f.status !== "DONE" &&
//                             <button onClick={() => markDone(f.id)}
//                               style={{
//                                 background: "#41c480", color: "#fff",
//                                 padding: "5px 17px", borderRadius: "7px", border: "none",
//                                 fontWeight: "bold", cursor: "pointer", fontSize: 14
//                               }}>✅ Done</button>
//                           }
//                           {f.status === "PENDING" &&
//                             <button onClick={() => snooze(f.id)}
//                               style={{
//                                 background: "#fed18c", color: "#a65d0f",
//                                 padding: "5px 17px", borderRadius: "7px", border: "none",
//                                 fontWeight: "bold", cursor: "pointer", fontSize: 14
//                               }}>⏰ Snooze</button>
//                           }
//                           <a href={whatsAppLink(f)} target="_blank" rel="noreferrer"
//                             style={{
//                               background: "#1360e3", color: "#fff", fontWeight: "bold",
//                               padding: "5px 17px", borderRadius: "7px", textDecoration: "none",
//                               fontSize: 14, transition: "background .2s"
//                             }}>💬 WhatsApp</a>
//                         </div>
//                         {isOverdue && (
//                           <span style={{
//                             position: "absolute", right: 12, top: 14,
//                             background: "#e44", color: "#fff", borderRadius: "6px",
//                             fontSize: 13, padding: "3px 12px", fontWeight: "bold"
//                           }}>Overdue</span>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


import React, { useState, useRef } from "react";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    source: "WHATSAPP",
    contact_name: "",
    contact_phone: "",
    description: "",
    due_date: dayjs().format("YYYY-MM-DDTHH:mm"),
    priority: "MEDIUM",
    status: "PENDING",
    input1: "",
    input2: "",
    input3: "",
    input4: "",
    formula: "",
  });
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [currentAudioId, setCurrentAudioId] = useState(null);
  const audioRefs = useRef({});

  const login = async (e) => {
    e.preventDefault();
    try {
      //http://127.0.0.1:8000/api/auth/token/
      const res = await axios.post("https://backend-10-vael.onrender.com/api/auth/token/", {
        username: loginUsername,
        password: loginPassword,
      });
      setToken(res.data.access);
      api.defaults.headers.common.Authorization = `Bearer ${res.data.access}`;
      setLoginUsername("");
      setLoginPassword("");
      const userRes = await api.get("/auth/user/");
      setUser(userRes.data);
      fetchData();
    } catch {
      alert("Login failed");
    }
  };

  const fetchData = async () => {
    const res = await api.get("/followups/");
    setItems(res.data);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => setAudioBlob(new Blob(chunks, { type: "audio/webm" }));
      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const addFollowUp = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("source", form.source);
    formData.append("contact_name", form.contact_name);
    formData.append("contact_phone", form.contact_phone);
    formData.append("description", form.description);
    formData.append("due_date", dayjs(form.due_date).utc().format());
    formData.append("priority", form.priority);
    formData.append("status", form.status);
    formData.append("input1", form.input1);
    formData.append("input2", form.input2);
    formData.append("input3", form.input3);
    formData.append("input4", form.input4);
    formData.append("formula", form.formula);
    if (audioBlob) formData.append("audio_note", audioBlob, "note.webm");
    try {
      await api.post("/followups/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm({
        source: "WHATSAPP",
        contact_name: "",
        contact_phone: "",
        description: "",
        due_date: dayjs().format("YYYY-MM-DDTHH:mm"),
        priority: "MEDIUM",
        status: "PENDING",
        input1: "",
        input2: "",
        input3: "",
        input4: "",
        formula: "",
      });
      setAudioBlob(null);
      fetchData();
    } catch {
      alert("Failed to add follow-up");
    }
  };

  const markDone = async (id) => {
    await api.patch(`/followups/${id}/mark_done/`);
    fetchData();
  };

  const snooze = async (id) => {
    const dt = prompt("Enter snooze till (YYYY-MM-DDTHH:mm)");
    if (dt) {
      await api.patch(`/followups/${id}/snooze/`, { snoozed_till: dt });
      fetchData();
    }
  };

  const whatsAppLink = (item) => {
    const msg = `Follow-up: ${item.description}\nWith: ${item.contact_name}\nDue: ${dayjs
      .utc(item.due_date)
      .tz(dayjs.tz.guess())
      .format("DD MMM, HH:mm")}`;
    return item.contact_phone
      ? `https://wa.me/${item.contact_phone}?text=${encodeURIComponent(msg)}`
      : `https://web.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  };

  const columns = ["PENDING", "SNOOZED", "DONE"];

  const togglePlayGlobal = (id) => {
    const audio = audioRefs.current[id];
    if (!audio) return;
    Object.entries(audioRefs.current).forEach(([key, a]) => {
      if (key !== id.toString() && !a.paused) {
        a.pause();
        a.currentTime = 0;
      }
    });
    if (audio.paused) {
      audio.play();
      setCurrentAudioId(id);
    } else {
      audio.pause();
      audio.currentTime = 0;
      setCurrentAudioId(null);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setItems([]);
    setLoginUsername("");
    setLoginPassword("");
  };

  const simulateMissedCall = async () => {
    const mockNames = ["Raj", "Priya", "Amit", "Neha", "Kiran", "Sana"];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomPhone = "9" + Math.floor(Math.random() * 1000000000).toString().padStart(9, "0");
    const formData = new FormData();
    formData.append("source", "CALL");
    formData.append("contact_name", randomName);
    formData.append("contact_phone", randomPhone);
    formData.append("description", "Missed call. Please follow up.");
    formData.append("due_date", dayjs().format());
    formData.append("priority", "MEDIUM");
    formData.append("status", "PENDING");
    try {
      await api.post("/followups/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchData();
    } catch {
      alert("Missed call entry failed");
    }
  };

  return (
    <div style={{
      maxWidth: 1200,
      margin: "36px auto",
      padding: 20,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: "#f8f9fa",
      borderRadius: 16,
      boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
      position: "relative"
    }}>
      {token && (
        <button onClick={logout}
          style={{
            position: 'absolute', right: 24, top: 22, zIndex: 10,
            padding: "8px 22px", background: "#344957",
            color: "#fff", fontWeight: "bold", border: "none",
            borderRadius: "6px", cursor: "pointer", fontSize: 15,
            boxShadow: "0 4px 14px rgba(52,73,87,0.09)",
            transition: "background .2s"
          }}
        >
          Logout
        </button>
      )}
      {!token && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '60vh'
        }}>
          <h1 style={{ fontSize: 32, color: "#d72861", marginBottom: 20 }}>
            <span style={{ marginRight: 10 }}>📌</span>FollowUp Boss
          </h1>
          <form onSubmit={login} style={{
            display: 'flex', flexDirection: 'column',
            gap: 14, background: "#fff", padding: 34,
            borderRadius: 8, boxShadow: "0 2px 14px rgb(220 40 97 / 0.08)"
          }}>
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              style={{
                padding: "12px", borderRadius: 6, border: "1px solid #ccc",
                fontSize: 18, outline: "none"
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              style={{
                padding: "12px", borderRadius: 6, border: "1px solid #ccc",
                fontSize: 18, outline: "none"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 0", background: "#d72861", color: "white",
                border: "none", borderRadius: 7, fontWeight: "bold", fontSize: 18,
                cursor: "pointer", marginTop: "12px", letterSpacing: "0.05em"
              }}
            >Login</button>
          </form>
        </div>
      )}
      {token && (
        <div style={{ marginTop: 60 }}>
          <h1 style={{ fontSize: 32, color: "#d72861", marginBottom: 12 }}>
            <span style={{ marginRight: 10 }}>📌</span>FollowUp Boss
          </h1>
          {user && (
            <div style={{
              marginBottom: 16,
              color: user.is_staff ? "#2ecc40" : "#2980b9",
              fontWeight: "bold",
              fontSize: 18
            }}>
              <span style={{
                padding: "2px 10px",
                borderRadius: 8,
                background: user.is_staff ? "#eafbe7" : "#eaf3fb",
                marginRight: 10
              }}>
                {user.is_staff
                  ? "MANAGER"
                  : "SALESPERSON"}
              </span>
              {user.is_staff
                ? "You are a manager. Viewing all follow-ups."
                : "You are a salesperson. Viewing your follow-ups only."}
            </div>
          )}
          <button
            style={{
              background: "#fee", color: "#d72861",
              padding: "7px 20px", fontWeight: "bold", border: "none",
              borderRadius: "6px", marginBottom: "18px", fontSize: 15,
              cursor: "pointer", boxShadow: "0 1px 8px rgb(220 40 97 / 0.07)",
              transition: "background .2s"
            }}
            onClick={simulateMissedCall}
          >
            Simulate Missed Call
          </button>
          {/* FORM: original fields + new quotation fields */}
          <form onSubmit={addFollowUp}
            style={{
              background: "#fff", borderRadius: 8, padding: 22, marginBottom: 30,
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24
            }}>
            {/* Original fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: "bold", color: "#d72861" }}>Source</label>
              <select
                value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}
                style={{ padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15, background: "#f6f4fa" }}
              >
                <option>WHATSAPP</option>
                <option>CALL</option>
                <option>VERBAL</option>
                <option>EMAIL</option>
                <option>OTHER</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: "bold", color: "#d72861" }}>Contact Name</label>
              <input
                value={form.contact_name}
                onChange={e => setForm({ ...form, contact_name: e.target.value })}
                required
                placeholder="Who to follow up with"
                style={{ padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15, background: "#f6f4fa" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: "bold", color: "#d72861" }}>Phone</label>
              <input
                value={form.contact_phone}
                onChange={e => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="Phone (e.g. 919876543210)"
                style={{ padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15, background: "#f6f4fa" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: "bold", color: "#d72861" }}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                placeholder="What is the follow-up?"
                style={{ padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15, background: "#f6f4fa" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: "bold", color: "#d72861" }}>Due Date</label>
              <input
                type="datetime-local"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                style={{ padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15, background: "#f6f4fa" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: "bold", color: "#d72861" }}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                style={{ padding: "10px", borderRadius: 6, border: "1px solid #eee", fontSize: 15, background: "#f6f4fa" }}
              >
                <option>LOW</option>
                <option>MEDIUM</option>
                <option>HIGH</option>
              </select>
            </div>
            {/* Quotation fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  <label style={{ fontWeight: "bold", color: "#d72861" }}>Input 1</label>
  <input
    type="number"
    value={form.input1}
    onChange={e => setForm({ ...form, input1: e.target.value })}
    required
    placeholder="Input 1"
    style={{
      padding: "10px",
      borderRadius: 6,
      border: "1px solid #eee",
      fontSize: 15,
      background: "#f6f4fa"
    }}
  />
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  <label style={{ fontWeight: "bold", color: "#d72861" }}>Input 2</label>
  <input
    type="number"
    value={form.input2}
    onChange={e => setForm({ ...form, input2: e.target.value })}
    required
    placeholder="Input 2"
    style={{
      padding: "10px",
      borderRadius: 6,
      border: "1px solid #eee",
      fontSize: 15,
      background: "#f6f4fa"
    }}
  />
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  <label style={{ fontWeight: "bold", color: "#d72861" }}>Input 3</label>
  <input
    type="number"
    value={form.input3}
    onChange={e => setForm({ ...form, input3: e.target.value })}
    required
    placeholder="Input 3"
    style={{
      padding: "10px",
      borderRadius: 6,
      border: "1px solid #eee",
      fontSize: 15,
      background: "#f6f4fa"
    }}
  />
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  <label style={{ fontWeight: "bold", color: "#d72861" }}>Input 4</label>
  <input
    type="number"
    value={form.input4}
    onChange={e => setForm({ ...form, input4: e.target.value })}
    required
    placeholder="Input 4"
    style={{
      padding: "10px",
      borderRadius: 6,
      border: "1px solid #eee",
      fontSize: 15,
      background: "#f6f4fa"
    }}
  />
</div>
<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
  <label style={{ fontWeight: "bold", color: "#d72861" }}>Formula</label>
  <input
    type="text"
    value={form.formula}
    onChange={e => setForm({ ...form, formula: e.target.value })}
    placeholder="(input1 * input2 + input3) / input4"
    style={{
      padding: "10px",
      borderRadius: 6,
      border: "1px solid #eee",
      fontSize: 15,
      background: "#f6f4fa"
    }}
  />
</div>

            <div style={{ gridColumn: "1/-1", marginTop: 12 }}>
              <div style={{ marginBottom: 14 }}>
                {recording ? (
                  <button type="button" onClick={stopRecording}
                    style={{
                      padding: "8px 24px", background: "#f3e17e", color: "#445",
                      border: "none", borderRadius: "6px", fontSize: 15, fontWeight: "bold", cursor: "pointer"
                    }}
                  >Stop Recording ⏹️</button>
                ) : (
                  <button type="button" onClick={startRecording}
                    style={{
                      padding: "8px 24px", background: "#e3e4fd", color: "#2b26cc",
                      border: "none", borderRadius: "6px", fontSize: 15, fontWeight: "bold", cursor: "pointer"
                    }}
                  >Record 🎤</button>
                )}
                {audioBlob && (
                  <audio controls src={URL.createObjectURL(audioBlob)} style={{ marginLeft: "18px", width: "320px" }} />
                )}
              </div>
              <button type="submit"
                style={{
                  padding: "10px 30px", background: "#1ec48e",
                  color: "#fff", fontWeight: "bold", border: "none",
                  borderRadius: "6px", fontSize: 17, cursor: "pointer",
                  transition: "background .2s"
                }}
              >Add FollowUp</button>
            </div>
          </form>
          <div style={{ display: "flex", gap: "24px" }}>
            {columns.map((col) => {
              let colItems = items.filter((f) => f.status === col);
              colItems.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
              let dueTodayCount = 0;
              if (col === "PENDING") {
                dueTodayCount = colItems.filter(
                  (f) => new Date(f.due_date).toDateString() === new Date().toDateString()
                ).length;
              }
              const colorMap = {
                PENDING: "#ea8685",
                SNOOZED: "#fed18c",
                DONE: "#41c480"
              };
              return (
                <div key={col} style={{
                  flex: 1,
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "18px",
                  boxShadow: "0 2px 12px rgb(0 0 0 / 0.04)",
                  border: "2px solid " + colorMap[col]
                }}>
                  <h2 style={{
                    color: colorMap[col], fontSize: 22,
                    fontWeight: "bold", marginBottom: 17
                  }}>
                    {col}
                    {col === "PENDING" &&
                      <span style={{ marginLeft: 8, fontSize: "14px", color: "#444", fontWeight: "normal" }}>
                        ({dueTodayCount} due today)</span>}
                  </h2>
                  {colItems.length === 0 &&
                    <p style={{ color: "#bbb", fontStyle: "italic", padding: "36px 0" }}>No follow-ups in this status.</p>
                  }
                  {colItems.map((f) => {
                    const isOverdue = col !== "DONE" && new Date(f.due_date) < new Date();
                    return (
                      <div key={f.id}
                        style={{
                          border: `1px solid ${isOverdue ? "#dd0033" : "#ccc"}`,
                          padding: 12,
                          borderRadius: "10px",
                          marginBottom: "14px",
                          background: isOverdue ? "#fff0f0" : "#f7f9fb",
                          boxShadow: "0 1px 6px rgba(0,0,0,0.02)",
                          position: "relative"
                        }}>
                        <div style={{
                          display: "flex", alignItems: "center",
                          marginBottom: 4
                        }}>
                          <b style={{ fontSize: 18 }}>{f.contact_name}</b>
                          {f.source === "CALL" &&
                            <span style={{
                              marginLeft: 10,
                              padding: "2px 7px",
                              background: "#e3e0ff",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              fontSize: 12,
                              color: "#4932d6"
                            }}>Missed Call</span>
                          }
                        </div>
                        {f.contact_phone &&
                          <p style={{ color: "#666", fontSize: 14, marginBottom: 4 }}>
                            📞 {f.contact_phone}
                          </p>
                        }
                        <p style={{ fontSize: 15, marginBottom: '6px' }}>{f.description}</p>
                        <div style={{ fontSize: 15, color: "#355", marginBottom: 4 }}>
                          <strong>Quotation Amount:</strong> {f.quotation_amount !== undefined ? f.quotation_amount : "--"}
                        </div>
                        {f.audio_note && (
                          <div style={{ margin: "7px 0" }}>
                            <button
                              type="button"
                              onClick={() => togglePlayGlobal(f.id)}
                              style={{
                                background: "#f7e5fe",
                                color: "#4932d6",
                                padding: "5px 12px", borderRadius: "6px",
                                border: "none", fontWeight: "bold",
                                fontSize: 13, cursor: "pointer", marginBottom: "5px",
                                transition: "background .2s"
                              }}
                            >
                              {currentAudioId === f.id ? "⏹️ Stop Audio" : "🎤 Play Audio Note"}
                            </button>
                            <audio
                              ref={(el) => (audioRefs.current[f.id] = el)}
                              src={f.audio_note}
                              controls
                              onEnded={() => setCurrentAudioId(null)}
                              style={{ marginLeft: "6px", width: "100%" }}
                            />
                          </div>
                        )}
                        <small style={{
                          color: isOverdue ? "#dd0033" : "#444",
                          fontWeight: isOverdue ? "bold" : "normal",
                          fontSize: 15,
                          display: "block"
                        }}>
                          Due: {dayjs.utc(f.due_date).tz(dayjs.tz.guess()).format("DD MMM YYYY HH:mm")}
                        </small>
                        <div style={{
                          marginTop: 11, display: "flex", gap: 8, flexWrap: 'wrap'
                        }}>
                          {f.status !== "DONE" &&
                            <button onClick={() => markDone(f.id)}
                              style={{
                                background: "#41c480", color: "#fff",
                                padding: "5px 17px", borderRadius: "7px", border: "none",
                                fontWeight: "bold", cursor: "pointer", fontSize: 14
                              }}>✅ Done</button>
                          }
                          {f.status === "PENDING" &&
                            <button onClick={() => snooze(f.id)}
                              style={{
                                background: "#fed18c", color: "#a65d0f",
                                padding: "5px 17px", borderRadius: "7px", border: "none",
                                fontWeight: "bold", cursor: "pointer", fontSize: 14
                              }}>⏰ Snooze</button>
                          }
                          <a href={whatsAppLink(f)} target="_blank" rel="noreferrer"
                            style={{
                              background: "#1360e3", color: "#fff", fontWeight: "bold",
                              padding: "5px 17px", borderRadius: "7px", textDecoration: "none",
                              fontSize: 14, transition: "background .2s"
                            }}>💬 WhatsApp</a>
                        </div>
                        {isOverdue && (
                          <span style={{
                            position: "absolute", right: 12, top: 14,
                            background: "#e44", color: "#fff", borderRadius: "6px",
                            fontSize: 13, padding: "3px 12px", fontWeight: "bold"
                          }}>Overdue</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

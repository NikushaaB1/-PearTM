import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase, type HelpRequest, type SiteVideo } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — იმედის რუკა" }] }),
});

const ADMIN_EMAILS = ["admin@imedisruka.ge", "admin@peartm.ge"];

const C = {
  blue:   "#5B8FFF",
  light:  "#EEF4FF",
  glass:  "rgba(255,255,255,0.65)",
  border: "rgba(255,255,255,0.85)",
  shadow: "0 8px 32px rgba(91,143,255,0.12)",
  text:   "#1A2340",
  muted:  "#6B82A0",
};

/* ════════════════════════════════════════════════════════ */
function AdminPage() {
  const { t, user } = useApp();
  const isAdmin = user && (ADMIN_EMAILS.includes(user.email ?? "") || user.email?.includes("admin"));

  if (!user) return (
    <Gate icon="🔐" title="შესვლა საჭიროა" sub="ადმინ პანელი მხოლოდ ავტორიზებული მომხმარებლებისთვის">
      <Link to="/" style={btnStyle}>მთავარზე დაბრუნება</Link>
    </Gate>
  );
  if (!isAdmin) return (
    <Gate icon="🔒" title="წვდომა შეზღუდულია" sub="მხოლოდ ადმინისტრატორებისთვის" />
  );

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: C.light, fontFamily: "'Noto Sans Georgian','Inter',sans-serif" }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg,#0F1726,#182040)`,
        borderBottom: `3px solid ${C.blue}`,
        padding: "32px 2rem 28px",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: C.blue, display: "grid", placeItems: "center",
              fontSize: 20, boxShadow: `0 4px 16px ${C.blue}50`,
            }}>⚙️</div>
            <div>
              <h1 style={{ fontFamily: "'Noto Serif Georgian',serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
                {t.admin.title}
              </h1>
              <p style={{ fontSize: 12, color: `${C.blue}cc`, margin: 0, marginTop: 2 }}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 2rem", display: "flex", flexDirection: "column", gap: 24 }}>
        <VideoManager t={t} />
        <RequestsManager t={t} />
      </div>
    </div>
  );
}

/* ── Gate screen ────────────────────────────────────────── */
function Gate({ icon, title, sub, children }: { icon: string; title: string; sub: string; children?: React.ReactNode }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: C.light, fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
    }}>
      <div style={{
        background: C.glass, backdropFilter: "blur(20px)",
        border: `1px solid ${C.border}`, borderRadius: 28,
        padding: "48px 40px", textAlign: "center",
        boxShadow: C.shadow, maxWidth: 380,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: `${C.blue}15`, display: "grid", placeItems: "center",
          fontSize: 28, margin: "0 auto 20px",
        }}>{icon}</div>
        <h2 style={{ fontFamily: "'Noto Serif Georgian',serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 8 }}>{title}</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: children ? 24 : 0 }}>{sub}</p>
        {children}
      </div>
    </div>
  );
}

/* ── Video Manager ──────────────────────────────────────── */
const VIDEO_LABELS = ["მთავარი ვიდეო 1", "მთავარი ვიდეო 2", "SOS ვიდეო 1 (კილაძეები)", "SOS ვიდეო 2 (მაღრაძეები)"];

function VideoManager({ t }: { t: ReturnType<typeof useApp>["t"] }) {
  const [videos, setVideos] = useState<{ url: string; title: string }[]>(
    [{ url: "", title: "" }, { url: "", title: "" }, { url: "", title: "" }, { url: "", title: "" }]
  );
  const [uploading, setUploading] = useState<boolean[]>([false, false, false, false]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("videos").select("*").order("position").then(({ data }) => {
      if (!data) return;
      const updated = [{ url: "", title: "" }, { url: "", title: "" }, { url: "", title: "" }, { url: "", title: "" }];
      for (const v of data as SiteVideo[]) {
        if (v.position >= 1 && v.position <= 4)
          updated[v.position - 1] = { url: v.url, title: v.title ?? "" };
      }
      setVideos(updated);
    });
  }, []);

  async function uploadFile(file: File, position: number) {
    const idx = position - 1;
    setError("");
    setUploading(prev => { const n = [...prev]; n[idx] = true; return n; });
    try {
      const ext = file.name.split(".").pop();
      const filePath = `video${position}_${Date.now()}.${ext}`;
      const { data: storageData, error: upErr } = await supabase.storage
        .from("videos").upload(filePath, file, { upsert: true, contentType: file.type });
      if (upErr) { setError(`Storage: ${upErr.message}`); return; }
      console.log("[upload] OK:", storageData);
      const { data: urlData } = supabase.storage.from("videos").getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
      const title = videos[idx].title;
      const { error: dbErr } = await supabase.from("videos")
        .upsert({ url: publicUrl, title, position }, { onConflict: "position" });
      if (dbErr) { setError(`DB: ${dbErr.message}`); return; }
      setVideos(prev => { const n = [...prev]; n[idx] = { ...n[idx], url: publicUrl }; return n; });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(prev => { const n = [...prev]; n[idx] = false; return n; });
    }
  }

  async function saveTitle(position: number) {
    const { url, title } = videos[position - 1];
    if (!url) return;
    await supabase.from("videos").upsert({ url, title, position }, { onConflict: "position" });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card icon="🎬" title={t.admin.videosTitle}>
      {error && (
        <div style={{
          background: "#FEF2F2", border: "1px solid #FCA5A5",
          borderRadius: 14, padding: "10px 16px",
          color: "#DC2626", fontSize: 13, marginBottom: 16,
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        {([1, 2, 3, 4] as const).map((pos) => {
          const idx = pos - 1;
          const v = videos[idx];
          const isUp = uploading[idx];
          return (
            <div key={pos} style={{
              background: "#F8FAFF", border: `1px solid ${C.blue}20`,
              borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: `${C.blue}18`, display: "grid", placeItems: "center",
                  fontSize: 14,
                }}>🎬</div>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>{VIDEO_LABELS[pos - 1]}</span>
                {v.url && !isUp && (
                  <span style={{
                    marginLeft: "auto", fontSize: 11, color: "#059669",
                    background: "#D1FAE5", borderRadius: 50, padding: "2px 10px", fontWeight: 600,
                  }}>✓ ატვირთულია</span>
                )}
              </div>

              {/* Preview */}
              {v.url && !isUp && (
                <div style={{ borderRadius: 14, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
                  <video src={v.url} controls style={{ width: "100%", height: "100%" }} />
                </div>
              )}

              {/* Upload zone */}
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 8, borderRadius: 14,
                border: `2px dashed ${isUp ? C.blue : `${C.blue}35`}`,
                background: isUp ? `${C.blue}08` : "transparent",
                cursor: "pointer", transition: "all .25s",
                height: v.url && !isUp ? 48 : undefined,
                aspectRatio: v.url && !isUp ? undefined : "16/9",
              }}>
                {isUp ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.blue, padding: "12px 0" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      border: `2px solid ${C.blue}`, borderTopColor: "transparent",
                      animation: "spin .7s linear infinite",
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>იტვირთება...</span>
                  </div>
                ) : v.url ? (
                  <span style={{ fontSize: 12, color: C.muted, padding: "12px 0", fontWeight: 600 }}>
                    🔄 სხვა ვიდეოს ატვირთვა
                  </span>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: `${C.blue}12`, display: "grid", placeItems: "center",
                    }}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.blue} strokeWidth={1.8}>
                        <path strokeLinecap="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>ვიდეოს ასატვირთად დააჭირე</span>
                    <span style={{ fontSize: 11, color: C.muted }}>MP4 · MOV · WEBM</span>
                  </div>
                )}
                <input type="file" accept="video/*" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f, pos); }} />
              </label>

              {/* Title input */}
              <input
                value={v.title}
                onChange={e => setVideos(prev => { const n = [...prev]; n[idx] = { ...n[idx], title: e.target.value }; return n; })}
                onBlur={() => saveTitle(pos)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: `1px solid ${C.blue}25`, background: "#fff",
                  fontSize: 13, color: C.text, outline: "none",
                  fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
                  boxSizing: "border-box",
                }}
                placeholder="ვიდეოს სათაური (სურვილისამებრ)"
              />
            </div>
          );
        })}
      </div>

      {saved && (
        <div style={{
          marginTop: 16, padding: "10px 16px", borderRadius: 14,
          background: "#D1FAE5", border: "1px solid #6EE7B7",
          color: "#059669", fontSize: 13, fontWeight: 600,
        }}>
          ✓ შენახულია!
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
}

/* ── Requests Manager ───────────────────────────────────── */
function RequestsManager({ t }: { t: ReturnType<typeof useApp>["t"] }) {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("help_requests").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setRequests(data as HelpRequest[]); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: HelpRequest["status"]) {
    await supabase.from("help_requests").update({ status }).eq("id", id);
    setRequests(r => r.map(req => req.id === id ? { ...req, status } : req));
  }

  const statusStyle: Record<string, React.CSSProperties> = {
    pending:   { background: "#FEF9C3", color: "#A16207", border: "1px solid #FDE047" },
    approved:  { background: "#DBEAFE", color: "#1D4ED8", border: `1px solid ${C.blue}60` },
    completed: { background: "#D1FAE5", color: "#059669", border: "1px solid #6EE7B7" },
  };

  return (
    <Card icon="📋" title={t.admin.requestsTitle} badge={requests.length}>
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: C.muted, padding: "16px 0" }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            border: `2px solid ${C.blue}`, borderTopColor: "transparent",
            animation: "spin .7s linear infinite",
          }} />
          იტვირთება...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: C.muted }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
          <p style={{ fontSize: 14 }}>განაცხადები არ არის</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {requests.map(req => (
            <div key={req.id} style={{
              background: "#F8FAFF",
              border: `1px solid ${C.blue}15`,
              borderRadius: 18, padding: "16px 18px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 3 }}>
                    {req.child_name}{req.child_age ? `, ${req.child_age} წ` : ""}
                  </p>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
                    {req.diagnosis} · 📍 {req.city}
                  </p>
                  <p style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>
                    {req.user_name} — <span style={{ color: C.muted }}>{req.user_email}</span>
                  </p>
                  {req.medicines_needed && (
                    <p style={{ fontSize: 12, color: C.muted }}>
                      💊 {req.medicines_needed}
                    </p>
                  )}
                  {req.amount_needed && (
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.blue, marginTop: 2 }}>
                      ₾{req.amount_needed}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <span style={{
                    ...statusStyle[req.status ?? "pending"],
                    padding: "4px 12px", borderRadius: 50,
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {t.admin.status[req.status as keyof typeof t.admin.status] ?? req.status}
                  </span>
                  <select
                    value={req.status ?? "pending"}
                    onChange={e => updateStatus(req.id!, e.target.value as HelpRequest["status"])}
                    style={{
                      fontSize: 12, padding: "6px 10px", borderRadius: 10,
                      border: `1px solid ${C.blue}30`, background: "#fff",
                      color: C.text, outline: "none", cursor: "pointer",
                      fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
                    }}>
                    <option value="pending">მოლოდინში</option>
                    <option value="approved">დამტკიცება</option>
                    <option value="completed">დასრულება</option>
                  </select>
                </div>
              </div>

              {req.description && (
                <p style={{
                  fontSize: 12, color: C.muted, marginTop: 10,
                  paddingTop: 10, borderTop: `1px solid ${C.blue}12`,
                }}>
                  {req.description}
                </p>
              )}
              {req.created_at && (
                <p style={{ fontSize: 11, color: `${C.muted}88`, marginTop: 6 }}>
                  🕐 {new Date(req.created_at).toLocaleString("ka-GE")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ── Card wrapper ───────────────────────────────────────── */
function Card({ icon, title, badge, children }: {
  icon: string; title: string; badge?: number; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: C.glass, backdropFilter: "blur(20px)",
      border: `1px solid ${C.border}`,
      borderRadius: 24, padding: "24px",
      boxShadow: C.shadow,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${C.blue}15`, display: "grid", placeItems: "center", fontSize: 18,
        }}>{icon}</div>
        <h2 style={{
          fontFamily: "'Noto Serif Georgian',serif",
          fontSize: 17, fontWeight: 700, color: C.text, margin: 0,
        }}>{title}</h2>
        {badge !== undefined && (
          <span style={{
            marginLeft: "auto",
            background: `${C.blue}15`, color: C.blue,
            fontSize: 12, fontWeight: 700,
            padding: "3px 12px", borderRadius: 50,
          }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: "inline-block", padding: "12px 24px", borderRadius: 14,
  background: C.blue, color: "#fff", fontWeight: 700, fontSize: 14,
  textDecoration: "none", boxShadow: `0 6px 20px ${C.blue}40`,
};

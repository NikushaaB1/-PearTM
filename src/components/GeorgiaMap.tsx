import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { supabase, type HelpRequest } from "@/lib/supabase";
import { getCityCoords } from "@/lib/mapData";

function makePin() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:38px;height:38px;
      background:linear-gradient(135deg,#e63946,#c41e3a);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 4px 14px rgba(230,57,70,0.45);
      display:grid;place-items:center;
    "><span style="transform:rotate(45deg);font-size:15px;line-height:1">❤</span></div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -42],
  });
}

function maskPhone(phone?: string) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 5) return phone;
  return "+995 " + digits.slice(0, 3) + " ••• •• " + digits.slice(-2);
}

export default function GeorgiaMap() {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [selected, setSelected] = useState<HelpRequest | null>(null);
  const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    supabase.from("help_requests").select("*").eq("status", "approved")
      .then(({ data }) => { if (data) setRequests(data as HelpRequest[]); });

    // overall stats across all requests
    supabase.from("help_requests").select("status")
      .then(({ data }) => {
        if (!data) return;
        const total = data.length;
        const completed = data.filter((r: { status?: string }) => r.status === "completed").length;
        setStats({ total, completed });
      });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserLoc([p.coords.latitude, p.coords.longitude]),
        () => {}
      );
    }
  }, []);

  return (
    <>
      <MapContainer
        center={[42.0, 43.5]}
        zoom={7}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution="&copy; OpenStreetMap &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
        />
        {requests.map((req) => {
          const pos: [number, number] = (req.latitude != null && req.longitude != null)
            ? [req.latitude, req.longitude]
            : getCityCoords(req.city);
          return (
            <Marker
              key={req.id}
              position={pos}
              icon={makePin()}
              eventHandlers={{ click: () => setSelected(req) }}
            />
          );
        })}
      </MapContainer>

      {/* Stats panel — top left */}
      <div style={{
        position: "absolute", top: 16, left: 16, zIndex: 1000,
        display: "flex", gap: 10,
        fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
      }}>
        <StatBox icon="❤" value={stats.total} label="მოითხოვა დახმარება" color="#e63946" />
        <StatBox icon="✓" value={stats.completed} label="შესრულდა" color="#10b981" />
      </div>

      {selected && (
        <ShareModal
          req={selected}
          userLoc={userLoc}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

/* ── Stat box ────────────────────────────────────────── */
function StatBox({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.9)",
      borderRadius: 16,
      padding: "10px 16px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      display: "flex", alignItems: "center", gap: 10,
      minWidth: 120,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: `${color}18`, color,
        display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700,
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1A2340", lineHeight: 1, fontFamily: "'Inter',sans-serif" }}>
          {value}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: "#6B82A0", marginTop: 2 }}>{label}</p>
      </div>
    </div>
  );
}

/* ── Share / Help modal ──────────────────────────────── */
function ShareModal({ req, userLoc, onClose }:
  { req: HelpRequest; userLoc: [number, number] | null; onClose: () => void }) {

  const isMoney = !req.medicines_needed || req.medicines_needed === "—";
  const [method, setMethod] = useState<string | null>(null);

  // distance
  let distance: number | null = null;
  if (userLoc) {
    const [lat, lng] = (req.latitude != null && req.longitude != null)
      ? [req.latitude, req.longitude]
      : getCityCoords(req.city);
    const R = 6371;
    const dLat = (lat - userLoc[0]) * Math.PI / 180;
    const dLng = (lng - userLoc[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(userLoc[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    distance = Math.round(2 * R * Math.asin(Math.sqrt(a)));
  }

  function confirm() {
    if (isMoney) { window.open(req.donation_url || "https://kisa.ge", "_blank"); return; }
    if (!method) return;
    if (method === "self")     window.open(`tel:${req.user_phone ?? ""}`);
    if (method === "delivery") window.open("https://glovoapp.com", "_blank");
    if (method === "courier")  window.open(`tel:${req.user_phone ?? ""}`);
    onClose();
  }

  const options = [
    { id: "self",     icon: "🚶", title: "თვითონ მივიტან",        desc: "პირადად მივიტან სიკეთეს მიმღებთან" },
    { id: "delivery", icon: "🚗", title: "მიტანას დავაორგანიზებ", desc: "გლოვო/ვოლტი, ან შეკვეთა მიიტანს" },
    { id: "courier",  icon: "🚲", title: "მჭირდება მიმტანი",      desc: "მაქვს სიკეთე და მჭირდება მიმტანი" },
  ];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "absolute", inset: 0, zIndex: 3000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,15,0.6)", backdropFilter: "blur(8px)",
        fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
      }}>
      <div style={{
        width: "100%", maxWidth: 480, maxHeight: "88vh",
        borderRadius: 28, overflow: "hidden",
        background: "rgba(16,16,28,0.94)",
        backdropFilter: "blur(48px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        display: "flex", flexDirection: "column",
        animation: "shareIn .35s cubic-bezier(.34,1.4,.64,1) both",
      }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>
              {isMoney ? "შემოწირულობა" : "მისიის გაზიარება"}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 14,
          }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Person card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20, padding: 18,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: "50%",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                display: "grid", placeItems: "center", fontSize: 20, flexShrink: 0,
              }}>👤</div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 17, margin: 0 }}>{req.child_name}</p>
                {req.child_age && (
                  <p style={{ color: "#e63946", fontSize: 12, margin: 0, marginTop: 2, fontWeight: 600 }}>
                    🕐 {req.child_age} წლის წინ
                  </p>
                )}
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "rgba(230,57,70,0.15)", border: "1px solid rgba(230,57,70,0.35)",
                display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0,
              }}>{isMoney ? "💳" : "💊"}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 15, opacity: 0.4 }}>📍</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>{req.city}, საქართველო</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15, opacity: 0.4 }}>📞</span>
              <div>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0, fontFamily: "'Inter',sans-serif" }}>
                  {maskPhone(req.user_phone)}
                </p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: 0 }}>
                  ნომერი გამოჩნდება მისიის აღების შემდეგ
                </p>
              </div>
            </div>

            {(req.diagnosis || (req.medicines_needed && !isMoney)) && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {req.diagnosis && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>🩺 {req.diagnosis}</p>}
                {req.medicines_needed && !isMoney && <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "4px 0 0" }}>💊 {req.medicines_needed}</p>}
              </div>
            )}
          </div>

          {/* Money → donate info / Items → delivery options */}
          {isMoney ? (
            <div style={{
              background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
              borderRadius: 20, padding: 18, textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>💜</div>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 6px" }}>ფინანსური დახმარება</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                შემოწირულობა ხდება უსაფრთხო პლატფორმა kisa.ge-ის მეშვეობით
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, margin: 0 }}>როგორ გნებავთ მიტანა?</p>
                {distance !== null && (
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: "#5B9FFF",
                    background: "rgba(91,159,255,0.12)", border: "1px solid rgba(91,159,255,0.3)",
                    borderRadius: 50, padding: "3px 12px", fontFamily: "'Inter',sans-serif",
                  }}>~{distance} კმ</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {options.map((o) => {
                  const active = method === o.id;
                  return (
                    <button key={o.id} onClick={() => setMethod(o.id)} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 16px", borderRadius: 16, width: "100%", textAlign: "left",
                      background: active ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${active ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.08)"}`,
                      cursor: "pointer", transition: "all .2s",
                      fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                        background: active ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.06)",
                        display: "grid", placeItems: "center", fontSize: 20,
                      }}>{o.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0 }}>{o.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0, marginTop: 2 }}>{o.desc}</p>
                      </div>
                      <span style={{ color: active ? "#10b981" : "rgba(255,255,255,0.25)", fontSize: 18 }}>
                        {active ? "✓" : "›"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer button */}
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
          <button onClick={confirm} disabled={!isMoney && !method} style={{
            width: "100%", padding: 15, borderRadius: 18, border: "none",
            background: (isMoney || method) ? "linear-gradient(135deg,#e63946,#c41e3a)" : "rgba(255,255,255,0.08)",
            color: (isMoney || method) ? "#fff" : "rgba(255,255,255,0.3)",
            fontWeight: 700, fontSize: 15,
            cursor: (isMoney || method) ? "pointer" : "not-allowed",
            boxShadow: (isMoney || method) ? "0 6px 24px rgba(230,57,70,0.4)" : "none",
            fontFamily: "'Noto Sans Georgian','Inter',sans-serif",
            transition: "all .2s",
          }}>
            {isMoney ? "❤ შემოწირე kisa.ge-ზე" : method ? "დაადასტურე მისია" : "აირჩიე მეთოდი"}
          </button>
        </div>
      </div>

      <style>{`@keyframes shareIn { from{opacity:0;transform:scale(0.94) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { supabase, type HelpRequest } from "@/lib/supabase";
import { getCityCoords } from "@/lib/mapData";
import { useApp } from "@/contexts/AppContext";
import ShareButtons from "@/components/ShareButtons";
import VerificationBadge from "@/components/VerificationBadge";
import DonationPanel from "@/components/DonationPanel";
import ProgressHistory from "@/components/ProgressHistory";
import ReportButton from "@/components/ReportButton";
import CaseLinks from "@/components/CaseLinks";

function makePin() {
    return L.divIcon({
        className: "",
        html: `<div style="
      width:38px;height:38px;
      background:linear-gradient(135deg,#B5454A,#8f3338);
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 4px 14px rgba(181,69,74,0.4);
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

type FilterType = "all" | "medicine" | "money";
type FilterStatus = "all" | "active" | "completed";

export default function GeorgiaMap() {
    const { t } = useApp();
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [selected, setSelected] = useState<HelpRequest | null>(null);
    const [userLoc, setUserLoc] = useState<[number, number] | null>(null);
    const [stats, setStats] = useState({ total: 0, completed: 0 });
    const [query, setQuery] = useState("");
    const [city, setCity] = useState("all");
    const [type, setType] = useState<FilterType>("all");
    const [status, setStatus] = useState<FilterStatus>("active");
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        supabase.from("help_requests").select("*").eq("status", "approved")
            .then(({ data }) => { if (data) setRequests(data as HelpRequest[]); });
        supabase.from("help_requests").select("status")
            .then(({ data }) => {
                if (!data) return;
                setStats({
                    total: data.length,
                    completed: data.filter(r => r.status === "completed").length,
                });
            });
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                p => setUserLoc([p.coords.latitude, p.coords.longitude]),
                () => {},
            );
        }
    }, [refresh]);

    const cities = useMemo(() => {
        const set = new Set(requests.map(r => r.city).filter(Boolean));
        return ["all", ...Array.from(set).sort()];
    }, [requests]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return requests.filter(req => {
            const isMoney = !req.medicines_needed || req.medicines_needed === "—";
            if (city !== "all" && req.city !== city) return false;
            if (type === "medicine" && isMoney) return false;
            if (type === "money" && !isMoney) return false;
            if (status === "completed" && req.status !== "completed") return false;
            if (status === "active" && req.status === "completed") return false;
            if (!q) return true;
            return [req.child_name, req.diagnosis, req.city, req.medicines_needed]
                .filter(Boolean).join(" ").toLowerCase().includes(q);
        });
    }, [requests, query, city, type, status]);

    return (
        <>
            <MapContainer center={[42.0, 43.5]} zoom={7} scrollWheelZoom zoomControl={false} style={{ height: "100%", width: "100%" }}>
                <ZoomControl position="topright" />
                <TileLayer
                    attribution="&copy; OpenStreetMap &copy; CARTO"
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains={["a", "b", "c", "d"]}
                />
                {filtered.map(req => {
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

            <div className="map-statbar">
                <StatBox icon="❤" value={stats.total} label="მოითხოვა დახმარება" color="#B5454A" />
                <StatBox icon="✓" value={stats.completed} label="შესრულდა" color="#059669" />
            </div>

            <div className="map-filters">
                <input
                    className="map-filters__search"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder={t.map.filters + "..."}
                />
                <select className="map-filters__select" value={city} onChange={e => setCity(e.target.value)}>
                    {cities.map(c => (
                        <option key={c} value={c}>{c === "all" ? t.map.city : c}</option>
                    ))}
                </select>
                <select className="map-filters__select" value={type} onChange={e => setType(e.target.value as FilterType)}>
                    <option value="all">{t.common.all}</option>
                    <option value="medicine">{t.map.medicine}</option>
                    <option value="money">{t.map.money}</option>
                </select>
                <select className="map-filters__select" value={status} onChange={e => setStatus(e.target.value as FilterStatus)}>
                    <option value="active">{t.map.active}</option>
                    <option value="completed">{t.map.completed}</option>
                    <option value="all">{t.common.all}</option>
                </select>
            </div>

            {selected && (
                <MapDetailModal
                    req={selected}
                    userLoc={userLoc}
                    onClose={() => setSelected(null)}
                    onRefresh={() => setRefresh(r => r + 1)}
                />
            )}
        </>
    );
}

function StatBox({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
    return (
        <div className="map-statbox">
            <div className="map-statbox__icon" style={{ background: `${color}18`, color }}>{icon}</div>
            <div>
                <p className="map-statbox__val">{value}</p>
                <p className="map-statbox__lbl">{label}</p>
            </div>
        </div>
    );
}

function MapDetailModal({ req, userLoc, onClose, onRefresh }: {
    req: HelpRequest;
    userLoc: [number, number] | null;
    onClose: () => void;
    onRefresh: () => void;
}) {
    const { t } = useApp();
    const isMoney = !req.medicines_needed || req.medicines_needed === "—";
    const [method, setMethod] = useState<string | null>(null);

    let distance: number | null = null;
    if (userLoc) {
        const [lat, lng] = (req.latitude != null && req.longitude != null)
            ? [req.latitude, req.longitude]
            : getCityCoords(req.city);
        const R = 6371;
        const dLat = (lat - userLoc[0]) * Math.PI / 180;
        const dLng = (lng - userLoc[1]) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(userLoc[0] * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        distance = Math.round(2 * R * Math.asin(Math.sqrt(a)));
    }

    const options = [
        { id: "self", icon: "🚶", title: "თვითონ მივიტან", desc: "პირადად მივიტან სიკეთეს" },
        { id: "delivery", icon: "🚗", title: "მიტანას დავაორგანიზებ", desc: "Glovo / Bolt" },
        { id: "courier", icon: "🚲", title: "მჭირდება მიმტანი", desc: "მჭირდება კურიერი" },
    ];

    function confirmMedicine() {
        if (!method) return;
        if (method === "self" || method === "courier") window.open(`tel:${req.user_phone ?? ""}`);
        if (method === "delivery") window.open("https://glovoapp.com", "_blank");
        onClose();
    }

    return (
        <div className="map-modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="map-modal__dialog" role="dialog">
                <header className="map-modal__header">
                    <div>
                        <p className="map-modal__kicker">{isMoney ? t.map.money : t.map.medicine}</p>
                        <h2 className="map-modal__title">{req.child_name}</h2>
                        <VerificationBadge status={req.verification_status} verified={req.verified} note={req.verification_note} />
                    </div>
                    <button type="button" className="map-modal__close" onClick={onClose}>✕</button>
                </header>

                <div className="map-modal__body">
                    <div className="map-modal__info">
                        <p>📍 {req.city}</p>
                        <p>📞 {maskPhone(req.user_phone)}</p>
                        {req.diagnosis && <p>🩺 {req.diagnosis}</p>}
                        {!isMoney && req.medicines_needed && <p>💊 {req.medicines_needed}</p>}
                        {distance !== null && <p className="map-modal__dist">~{distance} კმ</p>}
                    </div>

                    {req.goal_amount ? (
                        <div className="sos-progress">
                            <div className="sos-progress__top">
                                <span className="sos-progress__raised">{(req.raised_amount ?? 0).toLocaleString()} ₾</span>
                                <span className="sos-progress__goal">{t.donation.goal}: {req.goal_amount.toLocaleString()} ₾</span>
                            </div>
                            <div className="sos-progress__track">
                                <div className="sos-progress__fill" style={{
                                    width: `${Math.min(100, Math.round(((req.raised_amount ?? 0) / req.goal_amount) * 100))}%`,
                                }} />
                            </div>
                        </div>
                    ) : null}

                    {isMoney ? (
                        <DonationPanel
                            donation_url={req.donation_url}
                            bog_link={req.bog_link}
                            tbc_link={req.tbc_link}
                            paypal_link={req.paypal_link}
                            purpose={req.diagnosis}
                            raised={req.raised_amount ?? 0}
                            goal={req.goal_amount}
                            caseId={req.case_id}
                            helpRequestId={req.id}
                            onDonated={onRefresh}
                        />
                    ) : (
                        <div className="map-modal__methods">
                            <p className="map-modal__methods-title">როგორ გნებავთ მიტანა?</p>
                            {options.map(o => (
                                <button
                                    key={o.id}
                                    type="button"
                                    className={`map-modal__method${method === o.id ? " map-modal__method--on" : ""}`}
                                    onClick={() => setMethod(o.id)}
                                >
                                    <span>{o.icon}</span>
                                    <div>
                                        <strong>{o.title}</strong>
                                        <p>{o.desc}</p>
                                    </div>
                                </button>
                            ))}
                            <button type="button" className="e-btn e-btn--sos" style={{ width: "100%", marginTop: 12 }} disabled={!method} onClick={confirmMedicine}>
                                დაადასტურე მისია
                            </button>
                        </div>
                    )}

                    <ProgressHistory helpRequestId={req.id} caseId={req.case_id} />
                    <CaseLinks caseId={req.case_id} sosPostId={req.sos_post_id} helpRequestId={req.id} />

                    {req.sos_post_id && (
                        <Link to="/forum/$postId" params={{ postId: req.sos_post_id }} className="map-modal__forum-link">
                            → SOS ფორუმის პოსტი
                        </Link>
                    )}
                </div>

                <footer className="map-modal__footer">
                    <ShareButtons text={`${req.child_name} — ${req.diagnosis ?? "დახმარება"}`} variant="dark" size="sm" />
                    <ReportButton contentType="help_request" contentId={req.id!} />
                </footer>
            </div>
        </div>
    );
}

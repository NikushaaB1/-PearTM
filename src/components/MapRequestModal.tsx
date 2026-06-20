import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { cityCoords } from "@/lib/mapData";

type HelpType = "medicine" | "money";
type ForWhom = "self" | "other";
type LocStatus = "idle" | "loading" | "ok" | "denied";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        helpType: HelpType;
        forWhom: ForWhom;
        medicine: string;
        donationUrl: string;
        childName: string;
        diagnosis: string;
        city: string;
        coords: [number, number] | null;
        phone: string;
    }) => Promise<void>;
    userName?: string | null;
};

export default function MapRequestModal({ open, onClose, onSubmit, userName }: Props) {
    const { t } = useApp();
    const [helpType, setHelpType] = useState<HelpType>("medicine");
    const [forWhom, setForWhom] = useState<ForWhom>("self");
    const [medicine, setMedicine] = useState("");
    const [donationUrl, setDonationUrl] = useState("");
    const [childName, setChildName] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [city, setCity] = useState("თბილისი");
    const [coords, setCoords] = useState<[number, number] | null>(null);
    const [locStatus, setLocStatus] = useState<LocStatus>("idle");
    const [phone, setPhone] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!open) return;
        setDone(false);
        setHelpType("medicine");
        setForWhom("self");
        setMedicine("");
        setDonationUrl("");
        setChildName("");
        setDiagnosis("");
        setCity("თბილისი");
        setCoords(null);
        setPhone("");
        setAgreed(false);
        setLoading(false);
    }, [open]);

    useEffect(() => {
        if (!open || done) return;
        setLocStatus("idle");
        if (!navigator.geolocation) { setLocStatus("denied"); return; }
        setLocStatus("loading");
        const onOk = (pos: GeolocationPosition) => applyCoords(pos.coords.latitude, pos.coords.longitude);
        navigator.geolocation.getCurrentPosition(onOk, () => {
            navigator.geolocation.getCurrentPosition(onOk, () => setLocStatus("denied"), { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
    }, [open, done]);

    function applyCoords(latitude: number, longitude: number) {
        setCoords([latitude, longitude]);
        let nearest = "სხვა";
        let minDist = Infinity;
        for (const [name, [lat, lng]] of Object.entries(cityCoords)) {
            if (name === "სხვა") continue;
            const d = Math.hypot(lat - latitude, lng - longitude);
            if (d < minDist) { minDist = d; nearest = name; }
        }
        setCity(nearest);
        setLocStatus("ok");
    }

    function detectLocation() {
        if (!navigator.geolocation) { setLocStatus("denied"); return; }
        setLocStatus("loading");
        const onOk = (pos: GeolocationPosition) => applyCoords(pos.coords.latitude, pos.coords.longitude);
        navigator.geolocation.getCurrentPosition(onOk, () => setLocStatus("denied"), { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
    }

    function pickCity(name: string) {
        setCity(name);
        const c = cityCoords[name];
        if (c) setCoords([c[0], c[1]]);
        setLocStatus("ok");
    }

    const canSubmit = agreed && phone.trim().length >= 9
        && (helpType === "medicine" ? medicine.trim().length > 0 : donationUrl.trim().length > 0)
        && (forWhom === "self" || childName.trim().length > 0);

    async function submit() {
        if (!canSubmit) return;
        setLoading(true);
        await onSubmit({ helpType, forWhom, medicine, donationUrl, childName, diagnosis, city, coords, phone });
        setLoading(false);
        setDone(true);
    }

    if (!open) return null;

    return (
        <div className="map-modal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="map-modal__dialog map-request-modal" role="dialog">
                {done ? (
                    <div className="map-request-modal__done">
                        <div className="map-request-modal__done-icon">✓</div>
                        <h2>განაცხადი მიღებულია!</h2>
                        <p>მოთხოვნა ახლავე გამოჩნდა რუკაზე</p>
                        <div className="map-request-modal__done-pills">
                            <span>📍 {city}</span>
                            <span>📞 +995 {phone}</span>
                            <span>{helpType === "medicine" ? "💊 წამალი" : "💳 თანხა"}</span>
                        </div>
                        <button type="button" className="e-btn e-btn--sos" style={{ width: "100%" }} onClick={() => { onClose(); window.location.reload(); }}>
                            🗺 ნახე რუკაზე
                        </button>
                        <button type="button" className="e-btn e-btn--outline-dark" style={{ width: "100%", marginTop: 8 }} onClick={onClose}>
                            დახურვა
                        </button>
                    </div>
                ) : (
                    <>
                        <header className="map-modal__header">
                            <div>
                                <p className="map-modal__kicker">{t.map.requestHelp}</p>
                                <h2 className="map-modal__title">იმედის რუკა</h2>
                            </div>
                            <button type="button" className="map-modal__close" onClick={onClose}>✕</button>
                        </header>

                        <div className="map-modal__body map-request-modal__body">
                            <Section label="რა გჭირდებათ?">
                                <div className="map-request-modal__pills">
                                    <Pill active={helpType === "medicine"} onClick={() => setHelpType("medicine")} icon="💊" label={t.map.medicine} />
                                    <Pill active={helpType === "money"} onClick={() => setHelpType("money")} icon="💳" label={t.map.money} />
                                </div>
                                {helpType === "medicine" && (
                                    <input className="page-input" placeholder="საჭირო წამლის სახელი..." value={medicine} onChange={e => setMedicine(e.target.value)} />
                                )}
                                {helpType === "money" && (
                                    <input className="page-input" placeholder="https://kisa.ge/campaign/..." value={donationUrl} onChange={e => setDonationUrl(e.target.value)} />
                                )}
                            </Section>

                            <Section label="ვისთვის?">
                                <div className="map-request-modal__pills">
                                    <Pill active={forWhom === "self"} onClick={() => setForWhom("self")} icon="👤" label="ჩემთვის" />
                                    <Pill active={forWhom === "other"} onClick={() => setForWhom("other")} icon="🧒" label="სხვისთვის" />
                                </div>
                                {forWhom === "other" && (
                                    <>
                                        <input className="page-input" placeholder="ბავშვის სახელი" value={childName} onChange={e => setChildName(e.target.value)} />
                                        <input className="page-input" placeholder="დიაგნოზი" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
                                    </>
                                )}
                                {forWhom === "self" && userName && (
                                    <p className="map-request-modal__hint">👤 {userName}</p>
                                )}
                            </Section>

                            <Section label="ლოკაცია">
                                <div className="map-request-modal__loc">
                                    <span>📍</span>
                                    <div style={{ flex: 1 }}>
                                        {locStatus === "loading" && <p>ლოკაციის დადგენა...</p>}
                                        {locStatus === "ok" && <p><strong>{city}</strong></p>}
                                        {locStatus === "denied" && <p>აირჩიე ქალაქი ქვემოთ</p>}
                                        {locStatus === "idle" && <p>დააჭირე დადგენას</p>}
                                    </div>
                                    <button type="button" className="map-request-modal__loc-btn" onClick={detectLocation}>
                                        {locStatus === "loading" ? "..." : "📡 დადგენა"}
                                    </button>
                                </div>
                                {(locStatus === "denied" || locStatus === "ok") && (
                                    <select className="page-input" value={city} onChange={e => pickCity(e.target.value)}>
                                        {Object.keys(cityCoords).map(name => (
                                            <option key={name} value={name}>{name === "სხვა" ? "სხვა ქალაქი" : name}</option>
                                        ))}
                                    </select>
                                )}
                            </Section>

                            <Section label="ტელეფონი">
                                <div className="map-request-modal__phone">
                                    <span>+995</span>
                                    <input
                                        type="tel"
                                        placeholder="5XX XXX XXX"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                        maxLength={9}
                                    />
                                    <span className={phone.length === 9 ? "map-request-modal__phone-ok" : ""}>{phone.length}/9</span>
                                </div>
                            </Section>

                            <label className="map-request-modal__agree">
                                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
                                <span>ვეთანხმები <strong>წესებსა და პირობებს</strong></span>
                            </label>
                        </div>

                        <footer className="map-modal__footer">
                            <button type="button" className="e-btn e-btn--sos" style={{ width: "100%" }} disabled={!canSubmit || loading} onClick={submit}>
                                {loading ? "იგზავნება..." : canSubmit ? "❤ მოითხოვე დახმარება" : "შეავსე ყველა ველი"}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="map-request-modal__section">
            <p className="map-request-modal__section-label">{label}</p>
            {children}
        </div>
    );
}

function Pill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
    return (
        <button type="button" className={`map-request-modal__pill${active ? " map-request-modal__pill--on" : ""}`} onClick={onClick}>
            <span>{icon}</span> {label}
        </button>
    );
}

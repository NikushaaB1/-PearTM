import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type ComponentType } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import { createCase, notifyAdmin } from "@/lib/platform";
import MapRequestModal from "@/components/MapRequestModal";

export const Route = createFileRoute("/map")({
    component: MapPage,
    head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — რუკა" }] }),
});

function MapPage() {
    const [MapComp, setMapComp] = useState<ComponentType | null>(null);
    const [open, setOpen] = useState(false);
    const { user } = useApp();

    useEffect(() => {
        import("@/components/GeorgiaMap").then(m => setMapComp(() => m.default));
    }, []);

    async function handleSubmit(data: {
        helpType: "medicine" | "money";
        forWhom: "self" | "other";
        medicine: string;
        donationUrl: string;
        childName: string;
        diagnosis: string;
        city: string;
        coords: [number, number] | null;
        phone: string;
    }) {
        const child = data.forWhom === "other" ? data.childName : (user?.displayName ?? "—");
        const diag = data.diagnosis || (data.helpType === "medicine" ? "წამლის საჭიროება" : "ფინანსური დახმარება");
        const caseId = await createCase({
            firebase_uid: user?.uid,
            title: child,
            city: data.city,
            diagnosis: diag,
        });
        const { data: inserted } = await supabase.from("help_requests").insert({
            firebase_uid: user?.uid ?? null,
            user_name: data.forWhom === "self" ? (user?.displayName ?? "—") : data.childName,
            user_email: user?.email ?? "—",
            user_phone: data.phone,
            child_name: child,
            diagnosis: diag,
            medicines_needed: data.helpType === "medicine" ? data.medicine : "—",
            donation_url: data.helpType === "money" ? data.donationUrl : null,
            city: data.city,
            latitude: data.coords?.[0] ?? null,
            longitude: data.coords?.[1] ?? null,
            status: "approved",
            verification_status: "pending",
            case_id: caseId,
        }).select("id").single();

        await notifyAdmin({
            type: "help_request",
            title: "ახალი მოთხოვნა რუკაზე",
            message: `${child} — ${data.city}`,
            url: inserted?.id ? `${typeof window !== "undefined" ? window.location.origin : ""}/map` : undefined,
        });
    }

    return (
        <div style={{ position: "relative", overflow: "hidden", height: "calc(100vh - 64px)" }}>
            {MapComp ? <MapComp /> : (
                <div style={{ height: "100%", display: "grid", placeItems: "center", background: "#f5f7fa", color: "#888", fontSize: 14 }}>
                    რუკა იტვირთება…
                </div>
            )}

            <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
                <button type="button" onClick={() => setOpen(true)} className="map-fab">
                    <span className="map-fab__icon">❤</span>
                    მოითხოვე დახმარება
                </button>
            </div>

            <MapRequestModal
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={handleSubmit}
                userName={user?.displayName}
            />
        </div>
    );
}

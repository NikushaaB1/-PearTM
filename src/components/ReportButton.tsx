import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { submitReport } from "@/lib/platform";

export default function ReportButton({
    contentType,
    contentId,
}: {
    contentType: "sos_post" | "help_request";
    contentId: string;
}) {
    const { user, t } = useApp();
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    async function submit() {
        if (!reason.trim()) return;
        setLoading(true);
        const ok = await submitReport({
            contentType,
            contentId,
            reason: reason.trim(),
            reporterUid: user?.uid ?? null,
        });
        setLoading(false);
        if (ok) {
            setDone(true);
            setTimeout(() => { setOpen(false); setDone(false); setReason(""); }, 2000);
        }
    }

    if (!open) {
        return (
            <button type="button" className="report-btn" onClick={() => setOpen(true)}>
                ⚠ {t.report.btn}
            </button>
        );
    }

    return (
        <div className="report-form">
            {done ? (
                <p className="report-form__ok">✓ {t.report.sent}</p>
            ) : (
                <>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        placeholder={t.report.placeholder}
                        rows={3}
                    />
                    <div className="report-form__actions">
                        <button type="button" onClick={() => setOpen(false)}>{t.report.cancel}</button>
                        <button type="button" disabled={loading || !reason.trim()} onClick={submit}>
                            {loading ? "..." : t.report.send}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

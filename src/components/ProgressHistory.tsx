import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { fetchDonationHistory, type DonationUpdate } from "@/lib/platform";

export default function ProgressHistory({
    sosPostId,
    helpRequestId,
    caseId,
}: {
    sosPostId?: string;
    helpRequestId?: string;
    caseId?: string;
}) {
    const { t } = useApp();
    const [items, setItems] = useState<DonationUpdate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDonationHistory({ sosPostId, helpRequestId, caseId })
            .then(setItems)
            .finally(() => setLoading(false));
    }, [sosPostId, helpRequestId, caseId]);

    if (loading) return null;
    if (!items.length) return null;

    return (
        <div className="progress-history">
            <h4 className="progress-history__title">{t.donation.history}</h4>
            <ul className="progress-history__list">
                {items.map(item => (
                    <li key={item.id}>
                        <span className="progress-history__amt">+{Number(item.amount).toLocaleString()} ₾</span>
                        <span className="progress-history__meta">
                            {item.donor_name ? `${item.donor_name} · ` : ""}
                            {item.created_at
                                ? new Date(item.created_at).toLocaleDateString("ka-GE", { day: "numeric", month: "short" })
                                : ""}
                        </span>
                        {item.note && <p className="progress-history__note">{item.note}</p>}
                    </li>
                ))}
            </ul>
        </div>
    );
}

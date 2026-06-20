import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { recordDonation, type DonationLinks } from "@/lib/platform";

type Props = DonationLinks & {
    accountNumber?: string;
    bankName?: string;
    purpose?: string;
    raised?: number;
    goal?: number;
    caseId?: string | null;
    sosPostId?: string | null;
    helpRequestId?: string | null;
    onDonated?: () => void;
    variant?: "light" | "dark";
};

export default function DonationPanel({
    accountNumber,
    bankName,
    purpose,
    donation_url,
    bog_link,
    tbc_link,
    paypal_link,
    kisa_link,
    raised = 0,
    goal,
    caseId,
    sosPostId,
    helpRequestId,
    onDonated,
    variant = "light",
}: Props) {
    const { user, t } = useApp();
    const [showPaid, setShowPaid] = useState(false);
    const [amount, setAmount] = useState("");
    const [donorName, setDonorName] = useState("");
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const links = [
        { label: "Kisa.ge", url: kisa_link || donation_url, icon: "💜" },
        { label: "BOG", url: bog_link, icon: "🏦" },
        { label: "TBC", url: tbc_link, icon: "🏦" },
        { label: "PayPal", url: paypal_link, icon: "🌐" },
    ].filter(l => l.url);

    async function handlePaid() {
        const num = Number(amount.replace(/\D/g, ""));
        if (!num || num <= 0) return;
        setSaving(true);
        const res = await recordDonation({
            amount: num,
            donorName: donorName || undefined,
            createdBy: user?.uid ?? null,
            caseId,
            sosPostId,
            helpRequestId,
            currentRaised: raised,
        });
        setSaving(false);
        if (res.ok) {
            setMsg(t.donation.paidThanks);
            setShowPaid(false);
            setAmount("");
            onDonated?.();
        }
        else {
            setMsg(res.error ?? t.donation.paidError);
        }
    }

    const dark = variant === "dark";

    return (
        <div className={`donation-panel${dark ? " donation-panel--dark" : ""}`}>
            <h4 className="donation-panel__title">{t.donation.howTo}</h4>
            <ol className="donation-panel__steps">
                <li>{t.donation.step1}</li>
                <li>{t.donation.step2}{purpose ? `: ${purpose}` : ""}</li>
                <li>{t.donation.step3}</li>
            </ol>

            {accountNumber && (
                <div className="donation-panel__iban">
                    <span>{bankName || "IBAN"}</span>
                    <code>{accountNumber}</code>
                    <button type="button" onClick={() => navigator.clipboard?.writeText(accountNumber)}>
                        {t.donation.copy}
                    </button>
                </div>
            )}

            {links.length > 0 && (
                <div className="donation-panel__links">
                    {links.map(l => (
                        <a key={l.label} href={l.url!} target="_blank" rel="noreferrer" className="donation-panel__link">
                            {l.icon} {l.label}
                        </a>
                    ))}
                </div>
            )}

            {goal ? (
                <p className="donation-panel__progress">
                    {(raised).toLocaleString()} / {goal.toLocaleString()} ₾
                </p>
            ) : null}

            <button type="button" className="donation-panel__paid-btn" onClick={() => setShowPaid(s => !s)}>
                {t.donation.iPaid}
            </button>

            {showPaid && (
                <div className="donation-panel__paid-form">
                    <input
                        type="text"
                        placeholder={t.donation.amount}
                        value={amount}
                        onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ""))}
                    />
                    <input
                        type="text"
                        placeholder={t.donation.yourName}
                        value={donorName}
                        onChange={e => setDonorName(e.target.value)}
                    />
                    <button type="button" disabled={saving || !amount} onClick={handlePaid}>
                        {saving ? "..." : t.donation.confirm}
                    </button>
                </div>
            )}
            {msg && <p className="donation-panel__msg">{msg}</p>}
        </div>
    );
}

import { useApp } from "@/contexts/AppContext";
import { verificationLabel, type VerificationStatus } from "@/lib/platform";

export default function VerificationBadge({
    status,
    note,
    verified,
}: {
    status?: VerificationStatus | string | null;
    note?: string | null;
    verified?: boolean;
}) {
    const { lang } = useApp();
    const effective: VerificationStatus = verified
        ? "verified"
        : (status as VerificationStatus) ?? "pending";

    const cls = effective === "verified"
        ? "verify-badge verify-badge--ok"
        : effective === "rejected"
            ? "verify-badge verify-badge--no"
            : "verify-badge verify-badge--wait";

    return (
        <span className={cls} title={note ?? undefined}>
            {verificationLabel(effective, lang)}
        </span>
    );
}

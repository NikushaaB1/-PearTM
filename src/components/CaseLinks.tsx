import { Link } from "@tanstack/react-router";
import { useApp } from "@/contexts/AppContext";

export default function CaseLinks({
    caseId,
    sosPostId,
    helpRequestId,
}: {
    caseId?: string | null;
    sosPostId?: string | null;
    helpRequestId?: string | null;
}) {
    const { t } = useApp();
    if (!caseId && !sosPostId && !helpRequestId) return null;

    return (
        <div className="case-links">
            <span className="case-links__label">{t.caseLinks.label}</span>
            <div className="case-links__row">
                <Link to="/map" className="case-links__item">🗺 {t.caseLinks.map}</Link>
                {sosPostId && (
                    <Link to="/forum/$postId" params={{ postId: sosPostId }} className="case-links__item">
                        🆘 {t.caseLinks.forum}
                    </Link>
                )}
                {!sosPostId && caseId && (
                    <Link to="/forum" className="case-links__item">🆘 {t.caseLinks.forum}</Link>
                )}
            </div>
        </div>
    );
}

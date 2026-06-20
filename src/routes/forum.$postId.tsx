import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, type SosPost } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";
import { fetchSosPostForSeo } from "@/lib/platform";
import ShareButtons from "@/components/ShareButtons";
import VerificationBadge from "@/components/VerificationBadge";
import DonationPanel from "@/components/DonationPanel";
import ProgressHistory from "@/components/ProgressHistory";
import ReportButton from "@/components/ReportButton";
import CaseLinks from "@/components/CaseLinks";

const SITE_URL = typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL
    ? String(import.meta.env.VITE_SITE_URL)
    : "";

function buildSeoMeta(post: {
    recipient: string;
    purpose: string;
    description?: string | null;
    media_url?: string | null;
    media_type?: string | null;
} | null, postId: string) {
    const title = post
        ? `${post.recipient} — ${post.purpose} | იმედის რუკა`
        : "SOS — იმედის რუკა";
    const description = post
        ? (post.description?.slice(0, 160) || `${post.recipient} სჭირდება დახმარება: ${post.purpose}. დაეხმარე ახლავე.`)
        : "გადაუდებელი დახმარების მოწოდება";
    const image = post?.media_url && post.media_type === "image" ? post.media_url : "/hero-bg.png";
    const url = SITE_URL ? `${SITE_URL}/forum/${postId}` : `/forum/${postId}`;

    return [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:url", content: url },
        { property: "og:locale", content: "ka_GE" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
    ];
}

export const Route = createFileRoute("/forum/$postId")({
    loader: async ({ params }) => {
        const post = await fetchSosPostForSeo(params.postId);
        return { post, postId: params.postId };
    },
    head: ({ loaderData }) => ({
        meta: buildSeoMeta(loaderData?.post ?? null, loaderData?.postId ?? ""),
    }),
    component: SosDetailPage,
});

function SosDetailPage() {
    const { postId } = Route.useParams();
    const { t } = useApp();
    const [post, setPost] = useState<SosPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        setLoading(true);
        supabase.from("sos_posts").select("*").eq("id", postId).maybeSingle()
            .then(({ data }) => {
                if (data) setPost(data as SosPost);
                setLoading(false);
            });
    }, [postId, refresh]);

    if (loading) {
        return (
            <div className="page" style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
                <p>{t.common.loading}</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="page" style={{ display: "grid", placeItems: "center", minHeight: "50vh" }}>
                <div className="page-empty">
                    <p>{t.forum.notFound}</p>
                    <Link to="/forum" className="e-btn e-btn--primary">{t.forum.back}</Link>
                </div>
            </div>
        );
    }

    const pct = post.goal_amount
        ? Math.min(100, Math.round(((post.raised_amount ?? 0) / post.goal_amount) * 100))
        : 0;

    return (
        <main className="page">
            <section className="page-hero page-hero--sos">
                <div className="page-wrap">
                    <Link to="/forum" className="sos-detail__back">← {t.forum.back}</Link>
                    <div className="sos-detail__head">
                        <h1 className="e-heading e-heading--light" style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", margin: "12px 0 8px" }}>
                            {post.recipient}
                        </h1>
                        <VerificationBadge status={post.verification_status} verified={post.verified} note={post.verification_note} />
                    </div>
                    {post.verification_note && (
                        <p className="sos-detail__verify-note">{post.verification_note}</p>
                    )}
                </div>
            </section>

            <section className="page-body">
                <div className="page-wrap sos-detail__grid">
                    <div className="sos-detail__main">
                        {post.media_url && (
                            <div className="sos-detail__media">
                                {post.media_type === "video"
                                    ? <video src={post.media_url} controls className="sos-detail__img" />
                                    : <img src={post.media_url} alt={post.recipient} className="sos-detail__img" />}
                            </div>
                        )}

                        {post.description && <p className="sos-detail__desc">{post.description}</p>}
                        {post.address && <p className="sos-detail__addr">📍 {post.address}</p>}

                        {post.goal_amount ? (
                            <div className="sos-progress" style={{ marginTop: 24 }}>
                                <div className="sos-progress__top">
                                    <span className="sos-progress__raised">{(post.raised_amount ?? 0).toLocaleString()} ₾</span>
                                    <span className="sos-progress__goal">{t.donation.goal}: {post.goal_amount.toLocaleString()} ₾</span>
                                </div>
                                <div className="sos-progress__track">
                                    <div className="sos-progress__fill" style={{ width: `${pct}%` }} />
                                </div>
                                <p className="sos-progress__hint">{pct}% {t.donation.collected}</p>
                            </div>
                        ) : null}

                        <ProgressHistory sosPostId={post.id} caseId={post.case_id} />
                        <CaseLinks caseId={post.case_id} sosPostId={post.id} helpRequestId={post.help_request_id} />

                        <div className="sos-detail__share">
                            <ShareButtons text={`${post.recipient} — ${post.purpose}`} variant="dark" />
                        </div>
                        <ReportButton contentType="sos_post" contentId={post.id!} />
                    </div>

                    <aside className="sos-detail__side">
                        <DonationPanel
                            accountNumber={post.account_number}
                            bankName={post.bank_name}
                            purpose={post.purpose}
                            bog_link={post.bog_link}
                            tbc_link={post.tbc_link}
                            paypal_link={post.paypal_link}
                            kisa_link={post.kisa_link}
                            donation_url={post.kisa_link}
                            raised={post.raised_amount ?? 0}
                            goal={post.goal_amount}
                            caseId={post.case_id}
                            sosPostId={post.id}
                            onDonated={() => setRefresh(r => r + 1)}
                        />
                        {post.last_updated_at && (
                            <p className="sos-detail__updated">
                                {t.common.updated}: {new Date(post.last_updated_at).toLocaleString("ka-GE")}
                            </p>
                        )}
                    </aside>
                </div>
            </section>
        </main>
    );
}

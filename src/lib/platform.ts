import { supabase } from "./supabase";

export type VerificationStatus = "pending" | "verified" | "rejected";

export type DonationLinks = {
    donation_url?: string | null;
    bog_link?: string | null;
    tbc_link?: string | null;
    paypal_link?: string | null;
    kisa_link?: string | null;
};

export type DonationUpdate = {
    id?: string;
    case_id?: string | null;
    sos_post_id?: string | null;
    help_request_id?: string | null;
    amount: number;
    note?: string | null;
    donor_name?: string | null;
    created_by?: string | null;
    created_at?: string;
};

export type ContentReport = {
    id?: string;
    content_type: "sos_post" | "help_request";
    content_id: string;
    reporter_uid?: string | null;
    reason: string;
    status?: "pending" | "resolved" | "dismissed";
    created_at?: string;
};

export type Partner = {
    id?: string;
    name: string;
    role: string;
    description?: string | null;
    logo_url?: string | null;
    sort_order?: number;
    active?: boolean;
    created_at?: string;
};

export type CaseRecord = {
    id?: string;
    firebase_uid?: string | null;
    title: string;
    city?: string | null;
    diagnosis?: string | null;
    created_at?: string;
};

export type SiteStats = {
    activeCases: number;
    verifiedPosts: number;
    totalRaised: number;
    completedRequests: number;
    activeVolunteers: number;
    totalPosts: number;
    totalRequests: number;
};

export function isVerified(item: {
    verified?: boolean;
    verification_status?: string | null;
}) {
    return Boolean(item.verified) || item.verification_status === "verified";
}

export async function createCase(params: {
    firebase_uid?: string | null;
    title: string;
    city?: string;
    diagnosis?: string;
}): Promise<string | null> {
    const { data, error } = await supabase.from("cases").insert({
        firebase_uid: params.firebase_uid ?? null,
        title: params.title,
        city: params.city ?? null,
        diagnosis: params.diagnosis ?? null,
    }).select("id").single();
    if (error) return null;
    return data.id as string;
}

/** ადმინიდან: help_request → SOS პოსტის შექმნა და დაკავშირება */
export async function createSosFromHelpRequest(req: {
    id?: string;
    case_id?: string | null;
    child_name: string;
    diagnosis: string;
    city: string;
    description?: string | null;
    donation_url?: string | null;
    amount_needed?: number | null;
    firebase_uid?: string | null;
    document_urls?: string[] | null;
}): Promise<{ ok: boolean; sosPostId?: string; error?: string }> {
    const row = {
        firebase_uid: req.firebase_uid ?? null,
        recipient: req.child_name,
        account_number: "GE00TB0000000000000000",
        bank_name: "დასაზუსტებელია",
        purpose: req.diagnosis || "დახმარება",
        description: req.description ?? null,
        address: req.city,
        goal_amount: req.amount_needed ?? null,
        raised_amount: 0,
        verified: false,
        verification_status: "pending" as const,
        source: "manual" as const,
        case_id: req.case_id ?? null,
        help_request_id: req.id ?? null,
        kisa_link: req.donation_url ?? null,
        document_urls: req.document_urls ?? null,
    };

    const { data, error } = await supabase.from("sos_posts").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };

    const sosPostId = data.id as string;
    if (req.id) {
        await supabase.from("help_requests").update({ sos_post_id: sosPostId }).eq("id", req.id);
    }
    return { ok: true, sosPostId };
}

export async function fetchSosPostForSeo(postId: string) {
    const { data } = await supabase.from("sos_posts").select("recipient,purpose,description,media_url,media_type").eq("id", postId).maybeSingle();
    return data;
}

export async function uploadDocument(file: File, prefix: string): Promise<string | null> {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `documents/${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
        .from("videos")
        .upload(path, file, { upsert: true, contentType: file.type });
    if (error) return null;
    const { data } = supabase.storage.from("videos").getPublicUrl(path);
    return data.publicUrl;
}

export async function notifyAdmin(payload: {
    type: "help_request" | "sos_post" | "verification" | "report" | "donation";
    title: string;
    message: string;
    url?: string;
    meta?: Record<string, unknown>;
}) {
    try {
        await fetch("/api/notify", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
        });
    }
    catch {
        // notification is best-effort
    }
}

export async function recordDonation(params: {
    amount: number;
    note?: string;
    donorName?: string;
    createdBy?: string | null;
    caseId?: string | null;
    sosPostId?: string | null;
    helpRequestId?: string | null;
    currentRaised?: number;
}): Promise<{ ok: boolean; error?: string }> {
    const row: DonationUpdate = {
        amount: params.amount,
        note: params.note ?? null,
        donor_name: params.donorName ?? null,
        created_by: params.createdBy ?? null,
        case_id: params.caseId ?? null,
        sos_post_id: params.sosPostId ?? null,
        help_request_id: params.helpRequestId ?? null,
    };
    const { error: insErr } = await supabase.from("donation_updates").insert(row);
    if (insErr) return { ok: false, error: insErr.message };

    const newRaised = (params.currentRaised ?? 0) + params.amount;
    const now = new Date().toISOString();

    if (params.sosPostId) {
        await supabase.from("sos_posts").update({
            raised_amount: newRaised,
            last_updated_at: now,
        }).eq("id", params.sosPostId);
    }
    if (params.helpRequestId) {
        await supabase.from("help_requests").update({
            raised_amount: newRaised,
        }).eq("id", params.helpRequestId);
    }
    return { ok: true };
}

export async function fetchDonationHistory(opts: {
    sosPostId?: string;
    helpRequestId?: string;
    caseId?: string;
}): Promise<DonationUpdate[]> {
    let q = supabase.from("donation_updates").select("*").order("created_at", { ascending: false });
    if (opts.sosPostId) q = q.eq("sos_post_id", opts.sosPostId);
    else if (opts.helpRequestId) q = q.eq("help_request_id", opts.helpRequestId);
    else if (opts.caseId) q = q.eq("case_id", opts.caseId);
    else return [];
    const { data } = await q.limit(20);
    return (data ?? []) as DonationUpdate[];
}

export async function submitReport(params: {
    contentType: "sos_post" | "help_request";
    contentId: string;
    reason: string;
    reporterUid?: string | null;
}): Promise<boolean> {
    const { error } = await supabase.from("content_reports").insert({
        content_type: params.contentType,
        content_id: params.contentId,
        reason: params.reason,
        reporter_uid: params.reporterUid ?? null,
        status: "pending",
    });
    if (!error) {
        await notifyAdmin({
            type: "report",
            title: "ახალი რეპორტი",
            message: params.reason,
            meta: { contentType: params.contentType, contentId: params.contentId },
        });
    }
    return !error;
}

export async function fetchSiteStats(): Promise<SiteStats> {
    const [reqs, sos, profiles] = await Promise.all([
        supabase.from("help_requests").select("status, raised_amount, goal_amount, verified, verification_status, case_id"),
        supabase.from("sos_posts").select("verified, raised_amount, goal_amount, verification_status, case_id"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const requests = reqs.data ?? [];
    const posts = sos.data ?? [];

    const activeCases = requests.filter(r => r.status === "approved").length
        + posts.filter(p => {
            const reached = (p.raised_amount ?? 0) >= (p.goal_amount ?? Infinity);
            return !p.goal_amount || !reached;
        }).length;

    const verifiedPosts =
        posts.filter(isVerified).length
        + requests.filter(isVerified).length;

    const linkedCases = new Set(
        posts.filter(p => p.case_id).map(p => p.case_id as string),
    );
    let totalRaised = posts.reduce((sum, p) => sum + (p.raised_amount ?? 0), 0);
    for (const r of requests) {
        if (!r.case_id || !linkedCases.has(r.case_id)) {
            totalRaised += r.raised_amount ?? 0;
        }
    }

    const completedRequests = requests.filter(r => r.status === "completed").length;

    return {
        activeCases,
        verifiedPosts,
        totalRaised,
        completedRequests,
        activeVolunteers: profiles.count ?? 0,
        totalPosts: posts.length,
        totalRequests: requests.length,
    };
}

export async function fetchPartners(): Promise<Partner[]> {
    const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("active", true)
        .order("sort_order");
    return (data ?? []) as Partner[];
}

export async function fetchLinkedCase(caseId: string) {
    const [caseRes, reqRes, sosRes] = await Promise.all([
        supabase.from("cases").select("*").eq("id", caseId).maybeSingle(),
        supabase.from("help_requests").select("*").eq("case_id", caseId).maybeSingle(),
        supabase.from("sos_posts").select("*").eq("case_id", caseId).maybeSingle(),
    ]);
    return {
        caseRecord: caseRes.data as CaseRecord | null,
        helpRequest: reqRes.data,
        sosPost: sosRes.data,
    };
}

export function verificationLabel(status?: VerificationStatus | string | null, lang: "ge" | "en" = "ge") {
    const map = {
        ge: { pending: "მოლოდინში", verified: "გადამოწმებული", rejected: "უარყოფილი" },
        en: { pending: "Pending", verified: "Verified", rejected: "Rejected" },
    };
    const key = (status ?? "pending") as VerificationStatus;
    return map[lang][key] ?? map[lang].pending;
}

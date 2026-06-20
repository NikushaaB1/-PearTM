export type NotifyPayload = {
    type?: string;
    title?: string;
    message?: string;
    url?: string;
    meta?: Record<string, unknown>;
};

function buildText(body: NotifyPayload) {
    const lines = [
        `📢 ${body.title ?? "შეტყობინება"}`,
        body.message ?? "",
        body.type ? `ტიპი: ${body.type}` : "",
        body.url ? `🔗 ${body.url}` : "",
    ].filter(Boolean);
    return lines.join("\n");
}

export async function sendTelegram(body: NotifyPayload): Promise<boolean> {
    const token = process.env.ADMIN_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (!token || !chatId) return false;

    const text = buildText(body);
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: false,
        }),
    });
    return res.ok;
}

export async function sendResendEmail(body: NotifyPayload): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.ADMIN_EMAIL ?? "admin@imedisruka.ge";
    const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
    if (!apiKey) return false;

    const text = buildText(body);
    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            from,
            to: [to],
            subject: body.title ?? "იმედის რუკა — შეტყობინება",
            text,
        }),
    });
    return res.ok;
}

export async function sendWebhook(body: NotifyPayload): Promise<boolean> {
    const webhook = process.env.ADMIN_WEBHOOK_URL;
    if (!webhook) return false;
    const text = buildText(body);
    const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, ...body }),
    });
    return res.ok;
}

export async function dispatchAdminNotify(body: NotifyPayload) {
    const results = await Promise.allSettled([
        sendTelegram(body),
        sendResendEmail(body),
        sendWebhook(body),
    ]);
    const sent = results.some(r => r.status === "fulfilled" && r.value === true);
    console.log(`[notify] telegram/email/webhook sent=${sent}`, buildText(body));
    return { ok: true, sent };
}

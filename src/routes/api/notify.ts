import { createFileRoute } from "@tanstack/react-router";
import { dispatchAdminNotify } from "@/lib/notify-server";

export const Route = createFileRoute("/api/notify")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                try {
                    const body = await request.json() as {
                        type?: string;
                        title?: string;
                        message?: string;
                        url?: string;
                        meta?: Record<string, unknown>;
                    };

                    const siteUrl = process.env.SITE_URL ?? "";
                    const enriched = {
                        ...body,
                        url: body.url ?? (siteUrl ? `${siteUrl}/admin` : undefined),
                    };

                    const result = await dispatchAdminNotify(enriched);

                    return new Response(JSON.stringify(result), {
                        status: 200,
                        headers: { "content-type": "application/json" },
                    });
                }
                catch (e) {
                    return new Response(JSON.stringify({
                        ok: false,
                        error: e instanceof Error ? e.message : "notify failed",
                    }), { status: 500, headers: { "content-type": "application/json" } });
                }
            },
        },
    },
});

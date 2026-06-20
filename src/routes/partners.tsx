import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { fetchPartners, type Partner } from "@/lib/platform";

export const Route = createFileRoute("/partners")({
    component: PartnersPage,
    head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — პარტნიორები" }] }),
});

const FALLBACK_PARTNERS: Partner[] = [
    { name: "PearTM", role: "ტექნოლოგიური პარტნიორი", description: "პლატფორმის ტექნიკური მხარდაჭერა და განვითარება", sort_order: 1 },
    { name: "იმედის რუკა", role: "ქველმოქმედი ინიციატივა", description: "საქართველოს ბავშვების დახმარების რუკა", sort_order: 2 },
    { name: "ჩერნოვეცკის ფონდი", role: "პარტნიორი ფონდი", description: "სოციალური დახმარების პროექტები", sort_order: 3 },
];

function PartnersPage() {
    const { t } = useApp();
    const [partners, setPartners] = useState<Partner[]>(FALLBACK_PARTNERS);

    useEffect(() => {
        fetchPartners().then(list => {
            if (list.length) setPartners(list);
        });
    }, []);

    return (
        <main className="page">
            <section className="page-hero page-hero--warm">
                <div className="page-hero__inner" style={{ textAlign: "center" }}>
                    <p className="e-label">{t.partners.kicker}</p>
                    <h1 className="e-heading" style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", marginBottom: 12 }}>
                        {t.partners.title}
                    </h1>
                    <p className="page-hero__lead" style={{ maxWidth: 520, margin: "0 auto" }}>
                        {t.partners.subtitle}
                    </p>
                </div>
            </section>

            <section className="page-body">
                <div className="page-wrap">
                    <div className="partners-grid">
                        {partners.map((p, i) => (
                            <article key={p.id ?? i} className="partners-card">
                                <div className="partners-card__icon">
                                    {p.logo_url ? <img src={p.logo_url} alt="" /> : "🤝"}
                                </div>
                                <h2 className="partners-card__name">{p.name}</h2>
                                <span className="partners-card__role">{p.role}</span>
                                {p.description && <p className="partners-card__desc">{p.description}</p>}
                            </article>
                        ))}
                    </div>

                    <div className="partners-process page-card" style={{ marginTop: 48 }}>
                        <h2 className="e-heading" style={{ fontSize: 20, marginBottom: 20 }}>{t.partners.processTitle}</h2>
                        <div className="partners-steps">
                            {t.partners.steps.map((step, i) => (
                                <div key={i} className="partners-step">
                                    <span className="partners-step__num">{String(i + 1).padStart(2, "0")}</span>
                                    <div>
                                        <h3>{step.title}</h3>
                                        <p>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

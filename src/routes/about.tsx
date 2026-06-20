import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/about")({
    component: AboutPage,
    head: () => ({
        meta: [
            { title: "ჩვენ შესახებ — იმედის რუკა × PearTM" },
            { name: "description", content: "იმედის რუკა × PearTM — ქართული ქველმოქმედი პლატფორმა." },
        ],
    }),
});

function useReveal() {
    const ref = useRef<HTMLDivElement>(null);
    const [on, setOn] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setOn(true); }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, on };
}

function AboutPage() {
    const s1 = useReveal();
    const s2 = useReveal();
    const s3 = useReveal();

    return (
        <main className="page">
            <section className="page-hero page-hero--dark">
                <div className="page-hero__bg-glow" style={{
                    background: "radial-gradient(ellipse 60% 50% at 70% 20%, rgba(74,111,165,0.2) 0%, transparent 60%)",
                }} />
                <div className="page-hero__inner" style={{
                    opacity: s1.on ? 1 : 0,
                    transform: s1.on ? "none" : "translateY(20px)",
                    transition: "all .8s cubic-bezier(.4,0,.2,1)",
                }}>
                    <span className="pill pill--light" style={{ marginBottom: 20 }}>ჩვენ შესახებ</span>
                    <h1 className="e-heading e-heading--light" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", margin: "0 0 16px" }}>
                        სიკეთის <em>რუკა</em> საქართველოსთვის
                    </h1>
                    <p className="page-hero__lead">
                        ვაკავშირებთ მათ, ვისაც დახმარება სჭირდება, მათთან, ვისაც დახმარება შეუძლია —
                        ერთ რუკაზე, ერთ პლატფორმაზე.
                    </p>
                </div>
            </section>

            <section className="e-section e-section--white">
                <div ref={s1.ref} className="e-container e-container--narrow" style={{ textAlign: "center" }}>
                    <p className="e-label">მისია</p>
                    <h2 className="e-heading" style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)", marginBottom: 16 }}>
                        არ არსებობს მცირედი <em>დახმარება</em>
                    </h2>
                    <p style={{ color: "var(--ink-muted)", fontSize: 15, lineHeight: 1.9, fontWeight: 300 }}>
                        იმედის რუკა × PearTM შეიქმნა იმისთვის, რომ დახმარების პროცესი გამჭვირვალე,
                        სწრაფი და ხელმისაწვდომი გავხადოთ ყველასთვის.
                    </p>
                </div>
            </section>

            <section className="page-body" style={{ paddingTop: 0 }}>
                <div ref={s2.ref} className="page-wrap">
                    <div className="page-grid-3" style={{
                        opacity: s2.on ? 1 : 0,
                        transform: s2.on ? "none" : "translateY(20px)",
                        transition: "all .7s cubic-bezier(.4,0,.2,1)",
                    }}>
                        {[
                            { n: "01", title: "გამჭვირვალობა", desc: "ყველა მოთხოვნა ხილვადია რუკაზე — ნახე ვის და სად სჭირდება დახმარება." },
                            { n: "02", title: "სისწრაფე", desc: "მოთხოვნა მაშინვე ქვეყნდება. დახმარება იწყება წამებში, არა დღეებში." },
                            { n: "03", title: "ნდობა", desc: "გადამოწმებული მოწოდებები და უსაფრთხო შემოწირულობა kisa.ge-ის მეშვეობით." },
                            { n: "04", title: "ერთობა", desc: "340+ ადამიანი, ვინც ყოველდღე ირჩევს სიკეთეს და ეხმარება სხვებს." },
                        ].map(v => (
                            <div key={v.n} className="e-card" style={{ border: "none" }}>
                                <p className="e-card__num">{v.n}</p>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, margin: "0 0 10px" }}>{v.title}</h3>
                                <p style={{ color: "var(--ink-muted)", fontSize: 14, lineHeight: 1.8, margin: 0, fontWeight: 300 }}>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="e-section e-section--warm">
                <div ref={s3.ref} className="e-container">
                    <div style={{
                        textAlign: "center", marginBottom: 56,
                        opacity: s3.on ? 1 : 0,
                        transform: s3.on ? "none" : "translateY(20px)",
                        transition: "all .7s cubic-bezier(.4,0,.2,1)",
                    }}>
                        <p className="e-label">როგორ მუშაობს</p>
                        <h2 className="e-heading" style={{ fontSize: "clamp(1.5rem,3vw,2.2rem)" }}>სამი მარტივი ნაბიჯი</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24 }}>
                        {[
                            { n: "1", title: "დაამატე მოთხოვნა", desc: "შეავსე მარტივი ფორმა — მიუთითე ვის და რა სჭირდება." },
                            { n: "2", title: "გამოჩნდი რუკაზე", desc: "მოთხოვნა მაშინვე ჩნდება რუკაზე და სიკეთის ფორუმში." },
                            { n: "3", title: "მიიღე დახმარება", desc: "დონორები გხედავენ, ეხმარებიან და აზიარებენ." },
                        ].map((s, i) => (
                            <div key={s.n} className="page-card" style={{
                                opacity: s3.on ? 1 : 0,
                                transform: s3.on ? "none" : "translateY(20px)",
                                transition: `all .6s cubic-bezier(.4,0,.2,1) ${i * 100}ms`,
                            }}>
                                <span style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "var(--ink-faint)", letterSpacing: "0.15em" }}>ნაბიჯი {s.n}</span>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, margin: "12px 0 8px" }}>{s.title}</h3>
                                <p style={{ color: "var(--ink-muted)", fontSize: 14, lineHeight: 1.75, margin: 0, fontWeight: 300 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="e-section e-section--dark" style={{ textAlign: "center", padding: "80px 2rem" }}>
                <div className="e-container--narrow">
                    <p className="e-label e-label--light">შემოუერთდი</p>
                    <h2 className="e-heading e-heading--light" style={{ fontSize: "clamp(1.4rem,3vw,2rem)", marginBottom: 14 }}>
                        მზად ხარ დასახმარებლად?
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.85, marginBottom: 32, fontWeight: 300 }}>
                        ნახე ვის სჭირდება დახმარება ან დაამატე საკუთარი მოწოდება.
                    </p>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                        <Link to="/map" className="e-btn e-btn--white">რუკის ნახვა</Link>
                        <Link to="/forum" className="e-btn e-btn--outline">სიკეთის ფორუმი</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase, type HelpRequest } from "@/lib/supabase";

export const Route = createFileRoute("/request")({
  component: RequestPage,
  head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — დახმარება" }] }),
});

const CITIES = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "გორი", "ზუგდიდი", "ფოთი", "თელავი", "ახალციხე", "სხვა"];

function RequestPage() {
  const { t, user } = useApp();
  const [form, setForm] = useState<Omit<HelpRequest, "id" | "firebase_uid" | "status" | "created_at">>({
    user_name: user?.displayName ?? "",
    user_email: user?.email ?? "",
    user_phone: "",
    child_name: "",
    child_age: undefined,
    diagnosis: "",
    medicines_needed: "",
    amount_needed: undefined,
    city: "თბილისი",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { error: err } = await supabase.from("help_requests").insert({
      ...form,
      firebase_uid: user?.uid ?? null,
      status: "pending",
    });
    if (err) { setError("შეცდომა. სცადეთ თავიდან."); setLoading(false); return; }
    setSuccess(true); setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="size-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 text-4xl grid place-items-center mx-auto mb-5">✓</div>
          <h2 className="font-display text-2xl font-bold text-foreground dark:text-white mb-2">{t.request.successMsg}</h2>
          <p className="text-muted-foreground dark:text-gray-400 mb-6">ჩვენ მალე დაგიკავშირდებით</p>
          <button onClick={() => { setSuccess(false); setForm({ user_name: "", user_email: "", user_phone: "", child_name: "", child_age: undefined, diagnosis: "", medicines_needed: "", amount_needed: undefined, city: "თბილისი", description: "" }); }}
            className="px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:brightness-110 transition">
            კიდევ ერთი განაცხადი
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">❤ დახმარება</span>
          <h1 className="font-display text-3xl font-bold text-foreground dark:text-white mt-2">{t.request.title}</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">{t.request.subtitle}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-border dark:border-gray-800 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t.request.yourName}>
                <input required className={inputCls} value={form.user_name} onChange={(e) => set("user_name", e.target.value)} placeholder="სახელი გვარი" />
              </Field>
              <Field label={t.request.yourEmail}>
                <input required type="email" className={inputCls} value={form.user_email} onChange={(e) => set("user_email", e.target.value)} placeholder="mail@example.com" />
              </Field>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t.request.yourPhone}>
                <input type="tel" className={inputCls} value={form.user_phone} onChange={(e) => set("user_phone", e.target.value)} placeholder="+995 5xx xxx xxx" />
              </Field>
              <Field label={t.request.city}>
                <select className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)}>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <div className="h-px bg-border dark:bg-gray-800" />

            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t.request.childName}>
                <input required className={inputCls} value={form.child_name} onChange={(e) => set("child_name", e.target.value)} placeholder="ბავშვის სახელი" />
              </Field>
              <Field label={t.request.childAge}>
                <input type="number" min={0} max={18} className={inputCls} value={form.child_age ?? ""} onChange={(e) => set("child_age", e.target.value ? +e.target.value : undefined)} placeholder="ასაკი" />
              </Field>
            </div>
            <Field label={t.request.diagnosis}>
              <input required className={inputCls} value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} placeholder="მაგ. დიუშენი, ლეიკემია..." />
            </Field>
            <Field label={t.request.medicines}>
              <textarea required rows={3} className={inputCls + " resize-none"} value={form.medicines_needed} onChange={(e) => set("medicines_needed", e.target.value)} placeholder="საჭირო წამლები ან მკურნალობა..." />
            </Field>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t.request.amount}>
                <input type="number" min={0} className={inputCls} value={form.amount_needed ?? ""} onChange={(e) => set("amount_needed", e.target.value ? +e.target.value : undefined)} placeholder="0" />
              </Field>
            </div>
            <Field label={t.request.description}>
              <textarea rows={4} className={inputCls + " resize-none"} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="მოგვიყევით მეტი..." />
            </Field>

            {error && <p className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base hover:brightness-110 transition disabled:opacity-60 shadow-lg">
              {loading ? "იგზავნება..." : "❤ " + t.request.submit}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-border dark:border-gray-700 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-500 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition";

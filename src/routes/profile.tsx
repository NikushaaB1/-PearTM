import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase, type Profile } from "@/lib/supabase";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "იმედის რუკა × PearTM — პროფილი" }] }),
});

function ProfilePage() {
  const { t, user } = useApp();
  const [profile, setProfile] = useState<Omit<Profile, "firebase_uid">>({
    name: "", email: "", phone: "", city: "", bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("firebase_uid", user.uid)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            name: data.name ?? "",
            email: data.email ?? user.email ?? "",
            phone: data.phone ?? "",
            city: data.city ?? "",
            bio: data.bio ?? "",
          });
        } else {
          setProfile((p) => ({ ...p, email: user.email ?? "" }));
        }
        setFetching(false);
      });
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setSaved(false);
    await supabase.from("profiles").upsert({
      firebase_uid: user.uid,
      ...profile,
      updated_at: new Date().toISOString(),
    }, { onConflict: "firebase_uid" });
    setLoading(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center dark:bg-gray-950">
        <div className="text-center">
          <p className="text-muted-foreground dark:text-gray-400 mb-4">შესვლა საჭიროა</p>
          <Link to="/" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold">მთავარი</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Avatar */}
        <div className="text-center mb-8">
          <div className="size-20 rounded-full bg-primary/20 text-primary grid place-items-center text-3xl font-bold mx-auto mb-3">
            {(user.displayName || user.email || "?")[0].toUpperCase()}
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground dark:text-white">{t.profile.title}</h1>
          <p className="text-muted-foreground dark:text-gray-400 text-sm mt-1">{user.email}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-border dark:border-gray-800 p-6">
          {fetching ? (
            <div className="text-center py-8 text-muted-foreground">იტვირთება...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <Field label={t.profile.name}>
                <input value={profile.name ?? ""} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={inputCls} placeholder={t.profile.name} />
              </Field>
              <Field label={t.profile.phone}>
                <input value={profile.phone ?? ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  type="tel" className={inputCls} placeholder="+995 5xx xxx xxx" />
              </Field>
              <Field label={t.profile.city}>
                <input value={profile.city ?? ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className={inputCls} placeholder="თბილისი" />
              </Field>
              <Field label={t.profile.bio}>
                <textarea value={profile.bio ?? ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3} className={inputCls + " resize-none"} placeholder="რამდენიმე სიტყვა თქვენ შესახებ..." />
              </Field>

              {saved && (
                <p className="text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  ✓ {t.profile.savedMsg}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:brightness-110 transition disabled:opacity-60">
                {loading ? "..." : t.profile.saveBtn}
              </button>
            </form>
          )}
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

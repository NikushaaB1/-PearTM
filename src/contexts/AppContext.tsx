import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { auth, onAuthStateChanged, signOut, type User } from "@/lib/firebase";

/* ── Types ──────────────────────────────────────────── */
type Theme = "light" | "dark";
type Lang = "ge" | "en";

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)["ge"];
  user: User | null;
  authLoading: boolean;
  logout: () => Promise<void>;
}

/* ── Translations ───────────────────────────────────── */
export const translations = {
  ge: {
    siteName: "იმედის რუკა",
    siteSub: "× PearTM",
    nav: {
      home: "მთავარი",
      map: "რუკა",
      request: "დახმარება",
      profile: "პროფილი",
      admin: "ადმინი",
      login: "შესვლა",
      logout: "გამოსვლა",
    },
    hero: {
      title: "ერთად შევცვალოთ\nმათი ხვალინდელი დღე",
      subtitle:
        "საქართველოს ყველაზე მძიმე სენით დაავადებული ბავშვები გვჭირდება ჩვენი მხარდაჭერა",
      mapBtn: "იხილეთ რუკა",
      helpBtn: "დახმარების თხოვნა",
    },
    stories: {
      title: "ჩვენი ისტორიები",
      subtitle: "ყოველი ბავშვის მიღმა — ოჯახის სიძლიერე",
    },
    duchenne: {
      title: "დიუშენის სინდრომი",
      subtitle: "ისინი ებრძვიან. ჩვენ ვეხმარებით.",
      body: "დიუშენის კუნთოვანი დისტროფია — ერთ-ერთი ყველაზე მძიმე მემკვიდრეობითი დაავადებაა. ეს ბავშვები ყოველდღე იბრძვიან ყველაზე რთული ბრძოლის — სიცოცხლისათვის. შენი ყოველი ლარი — ახლობელია მათი ოცნებასთან.",
      donateBtn: "შეწირე ახლავე",
    },
    profile: {
      title: "ჩემი პროფილი",
      name: "სახელი და გვარი",
      phone: "ტელეფონი",
      city: "ქალაქი",
      bio: "ჩემ შესახებ",
      saveBtn: "შენახვა",
      savedMsg: "პროფილი შენახულია!",
    },
    request: {
      title: "დახმარების თხოვნა",
      subtitle: "შეავსეთ ფორმა და ჩვენ მოგიგვარებთ",
      yourName: "თქვენი სახელი",
      yourEmail: "ელფოსტა",
      yourPhone: "ტელეფონი",
      childName: "ბავშვის სახელი",
      childAge: "ასაკი",
      diagnosis: "დიაგნოზი",
      medicines: "საჭირო წამლები",
      amount: "სავარაუდო თანხა (₾)",
      city: "ქალაქი",
      description: "დამატებითი ინფორმაცია",
      submit: "გაგზავნა",
      successMsg: "თქვენი განაცხადი მიღებულია!",
    },
    admin: {
      title: "ადმინ პანელი",
      videosTitle: "ვიდეოები",
      video1: "ვიდეო 1 (YouTube URL)",
      video2: "ვიდეო 2 (YouTube URL)",
      saveVideos: "ვიდეოების შენახვა",
      requestsTitle: "დახმარების განაცხადები",
      status: {
        pending: "მოლოდინში",
        approved: "დამტკიცებული",
        completed: "დასრულებული",
      },
    },
  },
  en: {
    siteName: "Map of Hope",
    siteSub: "× PearTM",
    nav: {
      home: "Home",
      map: "Map",
      request: "Get Help",
      profile: "Profile",
      admin: "Admin",
      login: "Sign In",
      logout: "Sign Out",
    },
    hero: {
      title: "Together We Can Change\nTheir Tomorrow",
      subtitle:
        "Children with serious illnesses in Georgia need our support every day",
      mapBtn: "View Map",
      helpBtn: "Request Help",
    },
    stories: {
      title: "Our Stories",
      subtitle: "Behind every child — a family's strength",
    },
    duchenne: {
      title: "Duchenne Syndrome",
      subtitle: "They fight. We help.",
      body: "Duchenne muscular dystrophy is one of the most severe hereditary diseases. These children fight the hardest battle every day — for life itself. Your every Lari brings them closer to their dream.",
      donateBtn: "Donate Now",
    },
    profile: {
      title: "My Profile",
      name: "Full Name",
      phone: "Phone",
      city: "City",
      bio: "About Me",
      saveBtn: "Save",
      savedMsg: "Profile saved!",
    },
    request: {
      title: "Request Help",
      subtitle: "Fill the form and we will assist you",
      yourName: "Your Name",
      yourEmail: "Email",
      yourPhone: "Phone",
      childName: "Child's Name",
      childAge: "Age",
      diagnosis: "Diagnosis",
      medicines: "Medicines Needed",
      amount: "Estimated Amount (₾)",
      city: "City",
      description: "Additional Info",
      submit: "Submit",
      successMsg: "Your request has been received!",
    },
    admin: {
      title: "Admin Panel",
      videosTitle: "Videos",
      video1: "Video 1 (YouTube URL)",
      video2: "Video 2 (YouTube URL)",
      saveVideos: "Save Videos",
      requestsTitle: "Help Requests",
      status: {
        pending: "Pending",
        approved: "Approved",
        completed: "Completed",
      },
    },
  },
} as const;

/* ── Context ────────────────────────────────────────── */
const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("theme") as Theme) ?? "light";
  });
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "ge";
    return (localStorage.getItem("lang") as Lang) ?? "ge";
  });
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  function toggleTheme() {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }

  function setLang(l: Lang) {
    setLangState(l);
  }

  async function logout() {
    await signOut(auth);
  }

  const t = translations[lang];

  return (
    <AppContext.Provider
      value={{ theme, toggleTheme, lang, setLang, t, user, authLoading, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

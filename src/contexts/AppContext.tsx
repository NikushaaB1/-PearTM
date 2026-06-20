import { createContext, useContext, useState, useEffect, type ReactNode, } from "react";
import { auth, onAuthStateChanged, signOut, type User } from "@/lib/firebase";
import { applyColorTheme, getStoredColorTheme, type ColorThemeId } from "@/lib/color-themes";

type Theme = "light" | "dark";
type Lang = "ge" | "en";
interface AppContextValue {
    theme: Theme;
    toggleTheme: () => void;
    colorTheme: ColorThemeId;
    setColorTheme: (id: ColorThemeId) => void;
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (typeof translations)["ge"];
    user: User | null;
    authLoading: boolean;
    logout: () => Promise<void>;
}
export const translations = {
    ge: {
        siteName: "იმედის რუკა",
        siteSub: "× PearTM",
        nav: {
            home: "მთავარი",
            map: "რუკა",
            request: "დახმარება",
            forum: "ფორუმი",
            partners: "პარტნიორები",
            profile: "პროფილი",
            admin: "ადმინი",
            login: "შესვლა",
            logout: "გამოსვლა",
        },
        common: {
            loading: "იტვირთება...",
            updated: "განახლება",
            search: "ძებნა",
            all: "ყველა",
            save: "შენახვა",
            cancel: "გაუქმება",
        },
        hero: {
            title: "ერთად შევცვალოთ\nმათი ხვალინდელი დღე",
            subtitle: "საქართველოს ყველაზე მძიმე სენით დაავადებული ბავშვები გვჭირდება ჩვენი მხარდაჭერა",
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
            reportsTitle: "რეპორტები",
            partnersTitle: "პარტნიორები",
            verifyNote: "შენიშვნა",
            status: {
                pending: "მოლოდინში",
                approved: "დამტკიცებული",
                completed: "დასრულებული",
            },
            verification: {
                pending: "მოლოდინში",
                verified: "გადამოწმებული",
                rejected: "უარყოფილი",
            },
        },
        forum: {
            title: "სიკეთის ფორუმი",
            back: "ფორუმში დაბრუნება",
            notFound: "მოწოდება ვერ მოიძებნა",
            addPost: "დაამატე მოწოდება",
            empty: "ჯერ არცერთი მოწოდება არ არის",
            emptySub: "იყავი პირველი — დაამატე მოწოდება",
            filters: { all: "ყველა", verified: "გადამოწმებული", active: "აქტიური" },
            docs: "დოკუმენტები (სურვილისამებრ)",
        },
        donation: {
            howTo: "როგორ გადავიხადო",
            step1: "აირჩიე გადახდის მეთოდი ან დააკოპირე IBAN",
            step2: "დანიშნულებაში მიუთითე",
            step3: "გადარიცხე თანხა და დააჭირე „გადავიხადე“",
            copy: "კოპირება",
            iPaid: "გადავიხადე",
            amount: "თანხა (₾)",
            yourName: "სახელი (სურვილისამებრ)",
            confirm: "დადასტურება",
            paidThanks: "გმადლობთ! პროგრესი განახლდა.",
            paidError: "შეცდომა — სცადეთ თავიდან",
            goal: "მიზანი",
            collected: "შეგროვდა",
            history: "შეგროვების ისტორია",
        },
        report: {
            btn: "რეპორტი",
            placeholder: "აღწერეთ პრობლემა...",
            send: "გაგზავნა",
            cancel: "გაუქმება",
            sent: "რეპორტი მიღებულია",
        },
        caseLinks: {
            label: "დაკავშირებული:",
            map: "რუკა",
            forum: "ფორუმი",
        },
        map: {
            title: "იმედის რუკა",
            requestHelp: "მოითხოვე დახმარება",
            filters: "ფილტრი",
            city: "ქალაქი",
            type: "ტიპი",
            medicine: "წამალი",
            money: "თანხა",
            status: "სტატუსი",
            active: "აქტიური",
            completed: "დასრულებული",
            noResults: "ვერაფერი მოიძებნა",
        },
        partners: {
            kicker: "ჩვენი გუნდი",
            title: "პარტნიორები და პროცესი",
            subtitle: "ვინ უზრუნველყოფს ნდობას, გამჭვირვალობას და დახმარების მიწოდებას",
            processTitle: "როგორ მუშაობს",
            steps: [
                { title: "განაცხადი", desc: "ოჯახი ავსებს ფორმას ან ამატებს SOS პოსტს" },
                { title: "გადამოწმება", desc: "ადმინი ამოწმებს დოკუმენტებს და ადასტურებს" },
                { title: "გაზიარება", desc: "ქეისი ჩანს რუკაზე და ფორუმში" },
                { title: "დახმარება", desc: "საზოგადოება ეხმარება ფულით ან სიკეთით" },
            ],
        },
        stats: {
            activeCases: "აქტიური შემთხვევა",
            verified: "გადამოწმებული",
            raised: "შეგროვებული ₾",
            completed: "დასრულებული",
            volunteers: "დამხმარე",
        },
    },
    en: {
        siteName: "Map of Hope",
        siteSub: "× PearTM",
        nav: {
            home: "Home",
            map: "Map",
            request: "Get Help",
            forum: "Forum",
            partners: "Partners",
            profile: "Profile",
            admin: "Admin",
            login: "Sign In",
            logout: "Sign Out",
        },
        common: {
            loading: "Loading...",
            updated: "Updated",
            search: "Search",
            all: "All",
            save: "Save",
            cancel: "Cancel",
        },
        hero: {
            title: "Together We Can Change\nTheir Tomorrow",
            subtitle: "Children with serious illnesses in Georgia need our support every day",
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
            reportsTitle: "Reports",
            partnersTitle: "Partners",
            verifyNote: "Note",
            status: {
                pending: "Pending",
                approved: "Approved",
                completed: "Completed",
            },
            verification: {
                pending: "Pending",
                verified: "Verified",
                rejected: "Rejected",
            },
        },
        forum: {
            title: "SOS Forum",
            back: "Back to forum",
            notFound: "Post not found",
            addPost: "Add request",
            empty: "No requests yet",
            emptySub: "Be the first — add a request",
            filters: { all: "All", verified: "Verified", active: "Active" },
            docs: "Documents (optional)",
        },
        donation: {
            howTo: "How to donate",
            step1: "Choose payment method or copy IBAN",
            step2: "Use purpose",
            step3: "Transfer and click \"I paid\"",
            copy: "Copy",
            iPaid: "I paid",
            amount: "Amount (₾)",
            yourName: "Your name (optional)",
            confirm: "Confirm",
            paidThanks: "Thank you! Progress updated.",
            paidError: "Error — try again",
            goal: "Goal",
            collected: "collected",
            history: "Donation history",
        },
        report: {
            btn: "Report",
            placeholder: "Describe the issue...",
            send: "Send",
            cancel: "Cancel",
            sent: "Report submitted",
        },
        caseLinks: {
            label: "Linked:",
            map: "Map",
            forum: "Forum",
        },
        map: {
            title: "Map of Hope",
            requestHelp: "Request help",
            filters: "Filter",
            city: "City",
            type: "Type",
            medicine: "Medicine",
            money: "Money",
            status: "Status",
            active: "Active",
            completed: "Completed",
            noResults: "Nothing found",
        },
        partners: {
            kicker: "Our team",
            title: "Partners & process",
            subtitle: "Who ensures trust, transparency and delivery of help",
            processTitle: "How it works",
            steps: [
                { title: "Application", desc: "Family fills form or adds SOS post" },
                { title: "Verification", desc: "Admin checks documents and approves" },
                { title: "Sharing", desc: "Case appears on map and forum" },
                { title: "Help", desc: "Community helps with money or goods" },
            ],
        },
        stats: {
            activeCases: "Active cases",
            verified: "Verified",
            raised: "Raised ₾",
            completed: "Completed",
            volunteers: "Volunteers",
        },
    },
} as const;
const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: {
    children: ReactNode;
}) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === "undefined")
            return "light";
        return (localStorage.getItem("theme") as Theme) ?? "light";
    });
    const [lang, setLangState] = useState<Lang>(() => {
        if (typeof window === "undefined")
            return "ge";
        return (localStorage.getItem("lang") as Lang) ?? "ge";
    });
    const [colorTheme, setColorThemeState] = useState<ColorThemeId>(() => getStoredColorTheme());
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    useEffect(() => {
        const root = document.documentElement;
        if (theme === "dark")
            root.classList.add("dark");
        else
            root.classList.remove("dark");
        localStorage.setItem("theme", theme);
    }, [theme]);
    useEffect(() => {
        applyColorTheme(colorTheme);
    }, [colorTheme]);
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
    function setColorTheme(id: ColorThemeId) {
        setColorThemeState(id);
    }
    async function logout() {
        await signOut(auth);
    }
    const t = translations[lang];
    return (<AppContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme, lang, setLang, t, user, authLoading, logout }}>
      {children}
    </AppContext.Provider>);
}
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error("useApp must be inside AppProvider");
    return ctx;
}

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jdappmibueyankfaqkvl.supabase.co";
const SUPABASE_KEY = "sb_publishable_kaBT3lom8JhgHg34ExEk-w_jXUH7DAv";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export type HelpRequest = {
  id?: string;
  firebase_uid?: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
  child_name: string;
  child_age?: number;
  diagnosis: string;
  medicines_needed: string;
  amount_needed?: number;
  city: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  donation_url?: string;
  status?: "pending" | "approved" | "completed";
  created_at?: string;
};

export type Profile = {
  id?: string;
  firebase_uid: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  bio?: string;
  avatar_url?: string;
  updated_at?: string;
};

export type SiteVideo = {
  id?: string;
  title?: string;
  url: string;
  position: 1 | 2 | 3 | 4;
  created_at?: string;
};

export type SosPost = {
  id?: string;
  firebase_uid?: string;
  recipient: string;        // მიმღები
  personal_id?: string;     // პირადი ნომერი
  account_number: string;   // ანგარიშის ნომერი
  bank_name?: string;       // ბანკი
  purpose: string;          // დანიშნულება / რა სჭირდება
  description?: string;     // დამატებითი ტექსტი
  address?: string;         // მისამართი
  phone?: string;
  media_url?: string;
  media_type?: "image" | "video";
  created_at?: string;
};

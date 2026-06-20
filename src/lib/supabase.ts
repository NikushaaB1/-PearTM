import { createClient } from "@supabase/supabase-js";
import type { VerificationStatus } from "./platform";

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
    goal_amount?: number;
    raised_amount?: number;
    verified?: boolean;
    status?: "pending" | "approved" | "completed";
    case_id?: string;
    verification_status?: VerificationStatus;
    verification_note?: string;
    document_urls?: string[];
    bog_link?: string;
    tbc_link?: string;
    paypal_link?: string;
    sos_post_id?: string;
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
    recipient: string;
    personal_id?: string;
    account_number: string;
    bank_name?: string;
    purpose: string;
    description?: string;
    address?: string;
    phone?: string;
    media_url?: string;
    media_type?: "image" | "video";
    goal_amount?: number;
    raised_amount?: number;
    verified?: boolean;
    facebook_post_id?: string;
    facebook_url?: string;
    source?: "manual" | "facebook";
    ai_imported?: boolean;
    case_id?: string;
    help_request_id?: string;
    verification_status?: VerificationStatus;
    verification_note?: string;
    document_urls?: string[];
    bog_link?: string;
    tbc_link?: string;
    paypal_link?: string;
    kisa_link?: string;
    last_updated_at?: string;
    created_at?: string;
};

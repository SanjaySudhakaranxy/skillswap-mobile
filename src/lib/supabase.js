// IMPORTANT: this polyfill MUST be the first import in this file.
// React Native has no browser URL API and Supabase will crash without it.
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// PASTE YOUR REAL SUPABASE VALUES HERE.
// Supabase dashboard -> Project Settings -> API
// Use the SAME project as the web app.
// Use the "anon public" key, never the service_role key.
// These are hardcoded on purpose: React Native does not read .env
// files the way Next.js does.
// ============================================================
const SUPABASE_URL = "https://savzaqadhikedwyrquvi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhdnphcWFkaGlrZWR3eXJxdXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2OTk0MTAsImV4cCI6MjEwMDI3NTQxMH0.wYLC_kg9t7ngMRIu-T5oBBdPfw3tA4sVRXhVK7vDztg";

if (SUPABASE_URL.includes("YOUR-PROJECT-REF")) {
  console.warn(
    "SkillSwap: Supabase keys are still placeholders in src/lib/supabase.js. The app will not connect."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PUBLIC_SUPABASE_URL;
const ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(URL, ROLE_KEY);
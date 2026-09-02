/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ebqwttztruufvwuvenqg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_MLipiCX6RP7K7aSpBlKiIQ_V8Be6N4Q';

export const supabase = createClient(supabaseUrl, supabaseKey);

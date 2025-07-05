import { app_name, model, supabaseUrl } from '@/constants/constants';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_KEY ?? ''
);

export const logAppUsage = async (input: string, output: string) => {
  const { error } = await supabase.from('app_usage').insert([
    {
      input,
      output,
      model,
      app_name,
    },
  ]);

  if (error) {
    console.error('Error inserting data to Supabase:', error);
  }
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jaeapucjemytuuzjdvsq.supabase.co';
const supabase = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_KEY ?? ''
);

const model = 'gemini-2.5-flash';
const app_name = 'behavior';

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

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://zeucxjaecgsvsigzgyzy.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldWN4amFlY2dzdnNpZ3pneXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTQ5MTUsImV4cCI6MjA5ODA3MDkxNX0.vjBlFBIwFED_BPiXNXzXFUes5VS6lqE44eJjMoMO0rM';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const saveChatMessage = async (
  role: 'user' | 'assistant' | 'system',
  content: string,
  userEmail: string = 'guest'
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        { role, content, userEmail }
      ])
      .select();

    if (error) {
      console.error("Error adding message to Supabase: ", error);
      return null;
    }
    
    console.log(`Saved message to Supabase`);
    return data && data[0] ? data[0].id : 'inserted';
  } catch (e) {
    console.error("Error adding message to Supabase: ", e);
    return null;
  }
};

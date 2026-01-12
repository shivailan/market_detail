import { supabase } from '../lib/supabase';

export const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `uploads/${fileName}`;
  const { error: uploadError } = await supabase.storage.from('portfolio').upload(filePath, file);
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from('portfolio').getPublicUrl(filePath);
  return data.publicUrl;
};
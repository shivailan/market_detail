// src/utils/storage.js
import { supabase } from '../lib/supabase'; // <--- VÉRIFIE BIEN CETTE LIGNE

export const uploadImage = async (file) => {
  if (!file) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // C'est ici que "supabase" est appelé
    const { error: uploadError } = await supabase.storage
      .from('portfolio') 
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('portfolio')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Erreur Storage:', error.message);
    throw error;
  }
};
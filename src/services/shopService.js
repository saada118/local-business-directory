import { supabase } from './supabaseClient';

export const addShop = async (shopData) => {
  const { data, error } = await supabase
    .from('shops')
    .insert([shopData]);

  if (error) {
    console.error('Error adding shop:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
};

export const deleteShop = async (id) => {
  const { error } = await supabase
    .from('shops')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting shop:', error.message);
    return { success: false, error };
  }

  return { success: true };
};

export const updateShop = async (id, shopData) => {
  const { data, error } = await supabase
    .from('shops')
    .update(shopData)
    .eq('id', id);

  if (error) {
    console.error('Error updating shop:', error.message);
    return { success: false, error };
  }

  return { success: true, data };
};


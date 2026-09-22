import { supabase, type SignRecord } from '../database/supabase.js';
import { getPublicVideoUrl } from './storageService.js';

export async function getLearnCategories(): Promise<Array<{ category: string; count: number }>> {
  const { data, error } = await supabase.from('signs').select('category');
  if (error) throw new Error(`Could not load sign categories: ${error.message}`);
  const counts = new Map<string, number>();
  for (const row of (data ?? []) as unknown as Array<{ category: string }>) {
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }
  return [...counts.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => a.category.localeCompare(b.category));
}

export async function getLearnSigns(category?: string): Promise<Array<SignRecord & { videoUrl: string }>> {
  let query = supabase.from('signs').select('*').order('word', { ascending: true });
  if (category?.trim()) query = query.eq('category', category.trim());
  const { data, error } = await query;
  if (error) throw new Error(`Could not load signs: ${error.message}`);
  return ((data ?? []) as unknown as SignRecord[]).map((sign) => ({ ...sign, videoUrl: getPublicVideoUrl(sign.video_path) }));
}
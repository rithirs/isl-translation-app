import { supabase } from '../database/supabase.js';

const BUCKET_NAME = 'isl-videos';

export function getPublicVideoUrl(filePath: string): string {
  return supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
}

export async function uploadTranslationVideo(
  translationId: string,
  videoBuffer: Buffer,
): Promise<{ path: string; publicUrl: string }> {
  const path = `${translationId}.mp4`;
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, videoBuffer, {
    contentType: 'video/mp4',
    upsert: true,
  });
  if (error) throw new Error(`Video upload failed: ${error.message}`);

  return { path, publicUrl: getPublicVideoUrl(path) };
}

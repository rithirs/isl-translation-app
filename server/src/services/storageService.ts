import { supabase } from '../database/supabase.js';

const BUCKET_NAME = 'isl-videos';

export function getPublicVideoUrl(filePath: string): string {
  return supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
}

export async function videoExists(filePath: string): Promise<boolean> {
  const lastSlash = filePath.lastIndexOf('/');
  const directory = lastSlash >= 0 ? filePath.slice(0, lastSlash) : '';
  const filename = lastSlash >= 0 ? filePath.slice(lastSlash + 1) : filePath;
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(directory, {
    limit: 100,
    search: filename,
  });
  if (error) throw new Error(`Video asset lookup failed: ${error.message}`);
  return data.some((file) => file.name === filename);
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

import { supabase } from '../database/supabase.js';
import { randomUUID } from 'node:crypto';

const BUCKET_NAME = 'isl-videos';

export function getPublicVideoUrl(filePath: string): string {
  return supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath).data.publicUrl;
}

export async function uploadVideoBuffer(
  buffer: Buffer,
  mimeType = 'video/mp4',
): Promise<{ path: string; publicUrl: string }> {
  const extension = mimeType.split('/')[1]?.split(';')[0] || 'mp4';
  const path = `${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(path, buffer, {
    contentType: mimeType,
    upsert: true,
  });
  if (error) throw new Error(`Video upload failed: ${error.message}`);

  return { path, publicUrl: getPublicVideoUrl(path) };
}

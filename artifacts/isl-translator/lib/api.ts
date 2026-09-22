import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? `http://${expoHost ?? 'localhost'}:5050/api`;
const DEVICE_KEY = '@isl-translator/device-id';

export interface TranslationItem {
  id: string;
  input_text: string;
  normalized_text: string;
  sign_sequence: unknown;
  video_path: string;
  created_at: string;
  videoUrl?: string;
}

export interface HistoryItem { id: string; viewed_at: string; videoUrl?: string; translation?: TranslationItem; }
export interface SavedItem { id: string; created_at: string; videoUrl?: string; translation?: TranslationItem; }
export interface SignItem { id: string; word: string; category: string; description: string | null; videoUrl: string; }

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const created = `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(DEVICE_KEY, created);
  return created;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) throw new Error((await response.json().catch(() => null))?.error ?? `Request failed (${response.status})`);
  return response.status === 204 ? (undefined as T) : response.json() as Promise<T>;
}

export const api = {
  history: async () => request<HistoryItem[]>(`/history?userId=${encodeURIComponent(await getDeviceId())}`),
  recordHistory: async (translationId: string) => request('/history', { method: 'POST', body: JSON.stringify({ userId: await getDeviceId(), translationId }) }),
  saved: async () => request<SavedItem[]>(`/saved?userId=${encodeURIComponent(await getDeviceId())}`),
  save: async (translationId: string) => request('/saved', { method: 'POST', body: JSON.stringify({ userId: await getDeviceId(), translationId }) }),
  unsave: (id: string) => request<void>(`/saved/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  categories: () => request<Array<{ category: string; count: number }>>('/learn/categories'),
  signs: (category?: string) => request<SignItem[]>(`/learn/signs${category ? `?category=${encodeURIComponent(category)}` : ''}`),
};

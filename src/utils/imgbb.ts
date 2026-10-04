/**
 * ImgBB Image Upload Service
 * Allows users to upload real travel photos to ImgBB cloud storage
 * via https://api.imgbb.com/1/upload
 */

const STORAGE_KEY_IMGBB = 'malaysia_imgbb_key';

export function getStoredImgBBKey(): string {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_IMGBB_API_KEY || '';
  return (
    localStorage.getItem(STORAGE_KEY_IMGBB) ||
    process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
    ''
  );
}

export function setStoredImgBBKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_IMGBB, key.trim());
}

export interface ImgBBUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadToImgBB(
  fileOrBase64: File | string,
  apiKeyOverride?: string
): Promise<ImgBBUploadResponse> {
  const apiKey = (apiKeyOverride || getStoredImgBBKey()).trim();

  if (!apiKey) {
    return {
      success: false,
      error: 'No ImgBB API key provided. Go to Settings to enter your ImgBB key.',
    };
  }

  try {
    const formData = new FormData();
    if (typeof fileOrBase64 === 'string') {
      // If base64 data URL, strip header if needed or send raw base64
      const base64Data = fileOrBase64.replace(/^data:image\/\w+;base64,/, '');
      formData.append('image', base64Data);
    } else {
      formData.append('image', fileOrBase64);
    }

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (json.success && json.data) {
      const publicUrl = json.data.display_url || json.data.url;
      return { success: true, url: publicUrl };
    } else {
      return {
        success: false,
        error: json.error?.message || 'ImgBB upload failed',
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error uploading to ImgBB';
    return { success: false, error: message };
  }
}

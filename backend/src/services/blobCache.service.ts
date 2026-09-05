import { ENV } from '../config/env';

export class BlobCacheService {
  private urlMap: Map<string, string> = new Map();

  /**
   * Stores the known public URL for a given blob filename
   */
  setUrl(filename: string, url: string): void {
    this.urlMap.set(filename, url);
  }

  /**
   * Attempts to fetch pre-compiled JSON listing from Vercel Blob.
   * Returns null if token is missing, blob does not exist, or request fails.
   */
  async getBlobData<T>(filename: string): Promise<T | null> {
    if (!ENV.BLOB_READ_WRITE_TOKEN || ENV.BLOB_READ_WRITE_TOKEN.includes('vercel_blob_rw_xxx')) {
      return null;
    }

    try {
      let url = this.urlMap.get(filename);

      // If URL not cached in memory, discover it via @vercel/blob list()
      if (!url) {
        const { list } = await import('@vercel/blob');
        const res = await list({
          prefix: filename,
          token: ENV.BLOB_READ_WRITE_TOKEN,
          limit: 10,
        });

        const match = res.blobs.find(
          (b) => b.pathname === filename || b.pathname.startsWith(filename)
        );

        if (match) {
          url = match.downloadUrl || match.url;
          this.urlMap.set(filename, url);
        }
      }

      if (url) {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
        });

        if (response.ok) {
          const data = (await response.json()) as T;
          return data;
        }
      }
    } catch (err: any) {
      console.warn(`[BlobCache] Failed to fetch '${filename}' from Vercel Blob: ${err.message}. Falling back to Firestore DB.`);
    }

    return null;
  }
}

export const blobCacheService = new BlobCacheService();

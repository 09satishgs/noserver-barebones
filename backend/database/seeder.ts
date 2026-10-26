// Remote GZ SQLite downloader and decompressor using browser native DecompressionStream

export const DEFAULT_SQLITE_GZ_URL: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REMOTE_SQLITE_GZ_URL) || '';

export interface ProgressCallback {
  (stage: 'downloading' | 'extracting' | 'complete', detail?: string): void;
}

export async function downloadAndDecompressSqliteGz(
  url: string = DEFAULT_SQLITE_GZ_URL,
  onProgress?: ProgressCallback
): Promise<Uint8Array> {
  if (!url) {
    throw new Error('Remote database URL is missing');
  }

  onProgress?.('downloading', `Fetching remote database archive from ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch database archive from ${url}: ${response.status} ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null, cannot stream decompress');
  }

  onProgress?.('extracting', 'Decompressing gzip archive in Web Worker...');

  // Decompress using Web Streams DecompressionStream
  const decompressedStream = response.body.pipeThrough(new DecompressionStream('gzip'));
  const reader = decompressedStream.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      totalBytes += value.length;
    }
  }

  // Concatenate all chunks into a single Uint8Array
  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  onProgress?.('complete', `Extracted database (${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);
  return combined;
}

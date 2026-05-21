import { http } from '@shared/api/http';

/**
 * Downloads a blob from a JWT-protected URL and triggers a browser save dialog.
 * Filename is taken from Content-Disposition; falls back to `fallback` arg.
 */
export async function downloadFile(
  url: string,
  params: Record<string, unknown>,
  fallback: string,
): Promise<void> {
  const res = await http.get<Blob>(url, {
    params,
    responseType: 'blob',
  });

  let filename = fallback;
  const cd = res.headers['content-disposition'] as string | undefined;
  if (cd) {
    const m = /filename="?([^"]+)"?/i.exec(cd);
    if (m) filename = m[1];
  }

  const blobUrl = window.URL.createObjectURL(res.data);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

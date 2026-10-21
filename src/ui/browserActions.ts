/** Triggers a browser file download of text content with the specified filename and MIME type. */
export function downloadTextFile(filename: string, mime: string, content: string): void {
  if (typeof document === 'undefined' || typeof URL === 'undefined' || typeof Blob === 'undefined') {
    return;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/** Copies plain text to the system clipboard, returning false if unavailable or permission denied. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Invokes the browser native print dialog. */
export function printPage(): void {
  if (typeof window !== 'undefined' && typeof window.print === 'function') {
    window.print();
  }
}

/** Reads the text content of a user-selected File up to maxBytes. */
export async function readFileText(
  file: File,
  maxBytes: number,
): Promise<{ ok: true; text: string } | { ok: false; reason: string }> {
  if (file.size > maxBytes) {
    return { ok: false, reason: 'File exceeds maximum allowed size (1 MB).' };
  }
  try {
    const text = await file.text();
    return { ok: true, text };
  } catch {
    return { ok: false, reason: 'Unable to read the chosen file.' };
  }
}

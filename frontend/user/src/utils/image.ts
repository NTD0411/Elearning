export function ensureAbsoluteUrl(src?: string): string | undefined {
  if (!src) return src;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const base = process.env.NEXT_PUBLIC_FILES_BASE?.replace(/\/$/, '') || 'http://localhost:5074';
  if (src.startsWith('/')) return `${base}${src}`;
  return `${base}/${src}`;
}


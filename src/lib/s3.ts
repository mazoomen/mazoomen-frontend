export const S3_BASE_URL = (
  process.env.NEXT_PUBLIC_CLOUDFRONT_URL ||
  process.env.NEXT_PUBLIC_S3_BASE_URL ||
  ''
).replace(/\/+$/, '');

export function getS3Url(path?: string | null): string {
  if (!path) return '';
  // Strip any presigned query string parameters (e.g. ?X-Amz-Algorithm=...)
  const clean = path.split('?')[0];

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    if (clean.includes('.s3.') && clean.includes('.amazonaws.com/')) {
      const parts = clean.split('.amazonaws.com/');
      if (parts.length === 2 && S3_BASE_URL) {
        return `${S3_BASE_URL}/${parts[1].replace(/^\/+/, '')}`;
      }
    }
    return clean;
  }
  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return S3_BASE_URL ? `${S3_BASE_URL}${cleanPath}` : cleanPath;
}

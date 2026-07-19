export const S3_BASE_URL = (
  process.env.NEXT_PUBLIC_CLOUDFRONT_URL ||
  process.env.NEXT_PUBLIC_S3_BASE_URL ||
  'https://d2d6zix8q0a7b9.cloudfront.net'
).replace(/\/+$/, '');

export function getS3Url(path?: string | null): string {
  if (!path) return '';
  // Strip any presigned query string parameters (e.g. ?X-Amz-Algorithm=...)
  const clean = path.split('?')[0];

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const directS3Domain = 'https://mazoom-media-storage-645819132086-eu-central-1-an.s3.eu-central-1.amazonaws.com';
    if (clean.startsWith(directS3Domain)) {
      return clean.replace(directS3Domain, S3_BASE_URL);
    }
    if (clean.includes('.s3.') && clean.includes('.amazonaws.com/')) {
      const parts = clean.split('.amazonaws.com/');
      if (parts.length === 2) {
        return `${S3_BASE_URL}/${parts[1].replace(/^\/+/, '')}`;
      }
    }
    return clean;
  }
  const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
  return `${S3_BASE_URL}${cleanPath}`;
}

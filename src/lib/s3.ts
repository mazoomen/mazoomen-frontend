export const S3_BASE_URL = (
  process.env.NEXT_PUBLIC_S3_BASE_URL ||
  'https://mazoom-media-storage-645819132086-eu-central-1-an.s3.eu-central-1.amazonaws.com'
).replace(/\/+$/, '');

export function getS3Url(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${S3_BASE_URL}${cleanPath}`;
}

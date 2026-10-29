export function isSafeImageUrl(value) {
  if (typeof value !== 'string' || !value) return false;
  if (/^data:image\/(?:png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value)) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value, window.location.origin).protocol);
  } catch {
    return false;
  }
}

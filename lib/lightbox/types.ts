export type LightboxItem = {
  src: string;
  alt: string;
};

export function isLightboxExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

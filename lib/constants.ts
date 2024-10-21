export type Format = 'webp' | 'jpeg' | 'png';
export const formats: Format[] = ['webp', 'jpeg', 'png'];

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: Format;
}

export const imageOptionKeys: (keyof ImageOptions)[] = [
  'width',
  'height',
  'quality',
  'format',
];

export const imageNumberOptionKeys: (keyof ImageOptions)[] = [
  'width',
  'height',
  'quality',
];

export interface ImgproxyConfig{
  endpoint: string;
  salt: string;
  key: string;
}

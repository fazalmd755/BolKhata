import { describe, it, expect } from 'vitest';
import { generateQrSvgDataUrl } from '../src/utils/qrCode.js';

describe('qrCode.js Client-Side QR Generator', () => {
  it('generates a data:image/svg+xml URI without external network URLs', () => {
    const uri = generateQrSvgDataUrl('http://192.168.1.15:5173/');
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    const svg = decodeURIComponent(uri.split(',')[1]);
    expect(svg).toContain('<svg ');
    expect(svg).toContain('<path ');
    expect(svg).toContain('viewBox="0 0 33 33"'); // Version 2 (25 + 8 quiet zone) for 26-byte URL
  });

  it('scales up cleanly for longer HTTPS URLs', () => {
    const uri = generateQrSvgDataUrl('https://bolkhata-kirana-ledger-demo.loca.lt/app?lang=hi');
    expect(uri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    const svg = decodeURIComponent(uri.split(',')[1]);
    expect(svg).toContain('<svg ');
    expect(svg).toContain('viewBox="0 0 41 41"'); // Version 4 (33 + 8 quiet zone) for 54-byte URL
  });
});

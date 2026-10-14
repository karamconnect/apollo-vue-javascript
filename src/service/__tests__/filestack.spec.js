import { describe, expect, it } from 'vitest';
import { avatarUrl, isDemoFilestackKey } from '../filestack';

describe('filestack service', () => {
    it('builds a square face-centred avatar URL, resizing before converting', () => {
        expect(avatarUrl('abc123')).toBe('https://cdn.filestackcontent.com/resize=width:256,height:256,fit:crop,align:faces/output=format:webp/abc123');
        expect(avatarUrl('abc123', 64)).toContain('resize=width:64,height:64');
    });

    it('falls back to the demo key when VITE_FILESTACK_API_KEY is unset', () => {
        expect(isDemoFilestackKey).toBe(!import.meta.env.VITE_FILESTACK_API_KEY);
    });
});

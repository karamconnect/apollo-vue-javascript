import Aura from '@primeuix/themes/aura';
import { describe, expect, it } from 'vitest';
import { accessibleComponents, accessibleShade, contrastRatio, getPresetExt, primaryColors } from '../theme';

const palettes = primaryColors.filter((color) => color.name !== 'noir');
const resolve = (palette, token) => palette[token.match(/\{primary\.(\d+)\}/)[1]];

describe('theme contrast', () => {
    it('computes WCAG contrast ratios', () => {
        expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
        expect(contrastRatio('#10b981', '#ffffff')).toBeCloseTo(2.54, 1);
    });

    // Regression: light mode used the 500 shade, e.g. emerald at 2.5:1 behind white text and as text on white.
    it.each(palettes.map((color) => [color.name, color.palette]))('%s: the light-mode primary has 4.5:1 with white', (name, palette) => {
        const { primary, highlight } = getPresetExt(name).semantic.colorScheme.light;
        const color = resolve(palette, primary.color);

        expect(contrastRatio(color, primary.contrastColor)).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(color, '#f1f5f9')).toBeGreaterThanOrEqual(4.5);
        expect(contrastRatio(resolve(palette, highlight.color), palette[50])).toBeGreaterThanOrEqual(4.5);
    });

    it('keeps the brightest shade that passes', () => {
        const byName = Object.fromEntries(palettes.map((color) => [color.name, accessibleShade(color.palette)]));

        expect(byName).toMatchObject({ emerald: 700, blue: 600, rose: 700, yellow: 800 });
    });

    it('gives severity buttons (filled, outlined, text) and toggle labels 4.5:1 in light mode', () => {
        const primitive = (token) => {
            const [palette, shade] = token.slice(1, -1).split('.');
            return Aura.primitive[palette][shade];
        };

        for (const [severity, tokens] of Object.entries(accessibleComponents.button.colorScheme.light.root)) {
            expect(contrastRatio(primitive(tokens.background), tokens.color), severity).toBeGreaterThanOrEqual(4.5);
        }
        for (const variant of ['outlined', 'text']) {
            for (const [severity, tokens] of Object.entries(accessibleComponents.button.colorScheme.light[variant])) {
                expect(contrastRatio(primitive(tokens.color), '#ffffff'), `${variant} ${severity}`).toBeGreaterThanOrEqual(4.5);
            }
        }
        expect(contrastRatio(Aura.primitive.slate[600], Aura.primitive.slate[100])).toBeGreaterThanOrEqual(4.5);
    });
});

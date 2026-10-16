import { mount } from '@vue/test-utils';
import { useFlags } from 'flagsmith-vue';
import { describe, expect, it } from 'vitest';
import { defineComponent, h } from 'vue';
import { DEFAULT_FLAGS, flagsIdentityChanged, installFlags, isFlagsmithConnected } from '..';

describe('feature flags', () => {
    it('serves the default flags to components when Flagsmith is not configured', () => {
        const Probe = defineComponent({
            setup() {
                const { profile_photo_upload: flag } = useFlags(['profile_photo_upload']);

                return () => h('span', flag.value?.enabled ? 'on' : 'off');
            }
        });

        const wrapper = mount(Probe, { global: { plugins: [{ install: installFlags }] } });

        expect(isFlagsmithConnected).toBe(false);
        expect(DEFAULT_FLAGS.profile_photo_upload.enabled).toBe(true);
        expect(wrapper.text()).toBe('on');
    });

    // Regression: only the id was compared, so a refreshed session with a new role kept the old targeting trait.
    it('re-identifies when the user or their role changes', () => {
        const ana = { id: 'u1', role: 'user' };

        expect(flagsIdentityChanged(ana, undefined)).toBe(true);
        expect(flagsIdentityChanged({ ...ana }, ana)).toBe(false);
        expect(flagsIdentityChanged({ ...ana, role: 'admin' }, ana)).toBe(true);
        expect(flagsIdentityChanged(undefined, ana)).toBe(true);
    });
});

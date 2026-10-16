/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended', 'plugin:@intlify/vue-i18n/recommended', '@vue/eslint-config-prettier'],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    settings: {
        'vue-i18n': {
            localeDir: './src/i18n/locales/*.json',
            messageSyntaxVersion: '^11.0.0'
        }
    },
    // Locale files are linted too, so unused or badly named keys are caught.
    ignorePatterns: ['/*.json', '.vscode/'],
    overrides: [{ files: ['*.json'], parser: 'jsonc-eslint-parser' }],
    rules: {
        'vue/multi-word-component-names': 'off',
        // Every user-facing string goes through vue-i18n (see src/i18n).
        '@intlify/vue-i18n/no-raw-text': [
            'error',
            {
                ignorePattern: '^[-#:()&|.,/·•@+*%!?\\s\\d]*$',
                attributes: { '/.+/': ['label', 'placeholder', 'title', 'header', 'subheader', 'description', 'message', 'aria-label', 'alt', 'empty-message', 'accept-label', 'reject-label'] }
            }
        ],
        '@intlify/vue-i18n/no-missing-keys': 'error',
        // Keys are found through t()/$t()/<i18n-t> calls. These groups are referenced indirectly instead:
        // nav.* from route meta and menu models, validation.* from Zod schemas, auth.errors.* by error code.
        '@intlify/vue-i18n/no-unused-keys': ['error', { src: './src', extensions: ['.js', '.vue'], ignores: ['/^nav\\./', '/^validation\\./', '/^auth\\.errors\\./'] }],
        '@intlify/vue-i18n/key-format-style': ['error', 'camelCase', { allowArray: false }],
        'vue/no-reserved-component-names': 'off',
        'vue/component-tags-order': [
            'error',
            {
                order: ['script', 'template', 'style']
            }
        ]
    }
};

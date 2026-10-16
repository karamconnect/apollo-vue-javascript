// Kept apart from tolgee.js, which reads the Tolgee API key and must stay out of production builds.

/** Turns Tolgee's flat `{ 'a.b': 'text' }` records into vue-i18n's nested messages, skipping empty translations. */
export function toMessages(flat) {
    const messages = {};

    for (const [key, value] of Object.entries(flat ?? {})) {
        if (typeof value !== 'string' || value === '') continue;

        const path = key.split('.');
        let node = messages;
        for (const part of path.slice(0, -1)) {
            if (typeof node[part] !== 'object') node[part] = {};
            node = node[part];
        }
        node[path.at(-1)] = value;
    }

    return messages;
}

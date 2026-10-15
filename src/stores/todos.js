import { acceptHMRUpdate, defineStore } from 'pinia';
import { computed } from 'vue';
import { usePersistedRef } from './persisted';

export const useTodoStore = defineStore('todos', () => {
    const items = usePersistedRef('todos', [
        { id: 1, text: 'Review pull requests', done: false },
        { id: 2, text: 'Update project roadmap', done: false },
        { id: 3, text: 'Reply to support tickets', done: true }
    ]);

    const openCount = computed(() => items.value.filter((todo) => !todo.done).length);
    const hasCompleted = computed(() => items.value.some((todo) => todo.done));

    function add(text) {
        const trimmed = text.trim();

        if (!trimmed) return;

        items.value.push({ id: Date.now(), text: trimmed, done: false });
    }

    function toggle(id, done) {
        const todo = items.value.find((item) => item.id === id);

        if (todo) todo.done = done;
    }

    function remove(id) {
        items.value = items.value.filter((todo) => todo.id !== id);
    }

    function clearCompleted() {
        items.value = items.value.filter((todo) => !todo.done);
    }

    return { items, openCount, hasCompleted, add, toggle, remove, clearCompleted };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useTodoStore, import.meta.hot));
}

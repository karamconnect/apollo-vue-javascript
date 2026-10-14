import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTodoStore } from '../todos';

describe('todos store', () => {
    let todos;

    beforeEach(() => {
        localStorage.clear();
        setActivePinia(createPinia());
        todos = useTodoStore();
    });

    it('starts with the sample tasks', () => {
        expect(todos.items).toHaveLength(3);
        expect(todos.openCount).toBe(2);
        expect(todos.hasCompleted).toBe(true);
    });

    it('add trims the text and appends an open task', () => {
        todos.add('  Write tests  ');

        expect(todos.items.at(-1)).toMatchObject({ text: 'Write tests', done: false });
        expect(todos.openCount).toBe(3);
    });

    it('add ignores blank text', () => {
        todos.add('   ');

        expect(todos.items).toHaveLength(3);
    });

    it('toggle marks a task done or open', () => {
        todos.toggle(1, true);
        expect(todos.items.find((todo) => todo.id === 1).done).toBe(true);

        todos.toggle(1, false);
        expect(todos.items.find((todo) => todo.id === 1).done).toBe(false);
    });

    it('toggle ignores unknown ids', () => {
        const before = JSON.parse(JSON.stringify(todos.items));
        todos.toggle(999, true);

        expect(todos.items).toEqual(before);
    });

    it('remove deletes a task by id', () => {
        todos.remove(2);

        expect(todos.items.map((todo) => todo.id)).toEqual([1, 3]);
    });

    it('clearCompleted removes only finished tasks', () => {
        todos.clearCompleted();

        expect(todos.items.every((todo) => !todo.done)).toBe(true);
        expect(todos.items).toHaveLength(2);
        expect(todos.hasCompleted).toBe(false);
    });

    it('persists under app.todos and restores on the next load', async () => {
        todos.add('Persist me');
        await nextTick();

        expect(JSON.parse(localStorage.getItem('app.todos')).at(-1).text).toBe('Persist me');

        setActivePinia(createPinia());

        expect(useTodoStore().items.at(-1).text).toBe('Persist me');
    });

    it('loads tasks saved before the Pinia migration (same key)', () => {
        localStorage.setItem('app.todos', JSON.stringify([{ id: 7, text: 'Old task', done: false }]));
        setActivePinia(createPinia());

        expect(useTodoStore().items).toEqual([{ id: 7, text: 'Old task', done: false }]);
    });
});

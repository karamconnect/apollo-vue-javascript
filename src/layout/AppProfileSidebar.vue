<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, ref, watch } from 'vue';

const { layoutState } = useLayout();

const TODO_STORAGE_KEY = 'app.todos';

const todos = ref(loadTodos());
const newTodo = ref('');

const openTodoCount = computed(() => todos.value.filter((todo) => !todo.done).length);

function loadTodos() {
    try {
        const stored = JSON.parse(localStorage.getItem(TODO_STORAGE_KEY));

        if (Array.isArray(stored)) return stored;
    } catch {
        // ignore malformed storage and fall back to defaults
    }

    return [
        { id: 1, text: 'Review pull requests', done: false },
        { id: 2, text: 'Update project roadmap', done: false },
        { id: 3, text: 'Reply to support tickets', done: true }
    ];
}

function addTodo() {
    const text = newTodo.value.trim();

    if (!text) return;

    todos.value.push({ id: Date.now(), text, done: false });
    newTodo.value = '';
}

function removeTodo(id) {
    todos.value = todos.value.filter((todo) => todo.id !== id);
}

function clearCompleted() {
    todos.value = todos.value.filter((todo) => !todo.done);
}

watch(todos, (value) => localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(value)), { deep: true });

// Placeholder data until a calendar source is connected.
function todayAt(hours, minutes = 0) {
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date;
}

const events = ref([
    { id: 1, title: 'Team stand-up', location: 'Zoom', start: todayAt(9), end: todayAt(9, 15) },
    { id: 2, title: 'Design review', location: 'Room 4B', start: todayAt(11), end: todayAt(12) },
    { id: 3, title: 'Lunch with Alex', location: 'Cafe', start: todayAt(12, 30), end: todayAt(13, 30) },
    { id: 4, title: 'Sprint planning', location: 'Zoom', start: todayAt(15), end: todayAt(16) }
]);

const now = ref(new Date());

watch(
    () => layoutState.profileSidebarVisible,
    (visible) => {
        if (visible) now.value = new Date();
    }
);

const todayLabel = computed(() => now.value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

function eventStatus(event) {
    if (event.end <= now.value) return 'past';
    if (event.start <= now.value) return 'now';

    return 'upcoming';
}

function closeSidebar() {
    layoutState.profileSidebarVisible = false;
}
</script>

<template>
    <Drawer v-model:visible="layoutState.profileSidebarVisible" position="right" class="layout-profile-sidebar w-full sm:w-[25rem]">
        <template #header>
            <div class="flex flex-col">
                <span class="font-semibold text-lg">Today</span>
                <span class="text-surface-500 dark:text-surface-400 text-sm">{{ todayLabel }}</span>
            </div>
        </template>

        <div class="flex flex-col gap-8">
            <section>
                <div class="flex items-center justify-between mb-4">
                    <span class="font-semibold">To-Do</span>
                    <span class="text-surface-500 dark:text-surface-400 text-sm">{{ openTodoCount }} open</span>
                </div>

                <form class="flex gap-2 mb-4" @submit.prevent="addTodo">
                    <InputText v-model="newTodo" placeholder="Add a task" aria-label="New task" fluid />
                    <Button type="submit" icon="pi pi-plus" aria-label="Add task" :disabled="!newTodo.trim()" />
                </form>

                <ul class="list-none m-0 p-0 flex flex-col gap-1">
                    <li v-for="todo in todos" :key="todo.id" class="group flex items-center gap-3 px-2 py-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800">
                        <Checkbox v-model="todo.done" :inputId="`todo-${todo.id}`" binary />
                        <label :for="`todo-${todo.id}`" :class="['flex-1 cursor-pointer', { 'line-through text-surface-400 dark:text-surface-500': todo.done }]">{{ todo.text }}</label>
                        <Button icon="pi pi-times" text rounded size="small" severity="secondary" aria-label="Remove task" class="opacity-0 group-hover:opacity-100 focus:opacity-100" @click="removeTodo(todo.id)" />
                    </li>
                    <li v-if="!todos.length" class="text-surface-500 dark:text-surface-400 text-sm px-2">Nothing to do.</li>
                </ul>

                <Button v-if="todos.length > openTodoCount" label="Clear completed" text size="small" class="mt-2" @click="clearCompleted" />
            </section>

            <section>
                <div class="flex items-center justify-between mb-4">
                    <span class="font-semibold">Schedule</span>
                    <span class="text-surface-500 dark:text-surface-400 text-sm">{{ events.length }} events</span>
                </div>

                <ul class="list-none m-0 p-0 flex flex-col gap-3">
                    <li v-for="event in events" :key="event.id" :class="['flex gap-4 p-3 rounded border border-surface-200 dark:border-surface-700', { 'opacity-50': eventStatus(event) === 'past', 'border-primary!': eventStatus(event) === 'now' }]">
                        <div class="w-20 shrink-0 text-sm text-surface-500 dark:text-surface-400">
                            <div>{{ timeFormatter.format(event.start) }}</div>
                            <div>{{ timeFormatter.format(event.end) }}</div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-medium truncate">{{ event.title }}</div>
                            <div class="text-sm text-surface-500 dark:text-surface-400"><i class="pi pi-map-marker text-xs! mr-1"></i>{{ event.location }}</div>
                        </div>
                        <Tag v-if="eventStatus(event) === 'now'" value="Now" class="self-start" />
                    </li>
                </ul>
            </section>

            <router-link to="/settings" class="flex items-center gap-2 text-surface-500 dark:text-surface-400 hover:text-primary" @click="closeSidebar">
                <i class="pi pi-cog"></i>
                <span>Settings</span>
            </router-link>
        </div>
    </Drawer>
</template>

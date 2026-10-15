<script setup>
import { authClient } from '@/auth/client';
import { useSignOut } from '@/auth/useSignOut';
import { useLayoutStore } from '@/stores/layout';
import { useTodoStore } from '@/stores/todos';
import { useIntervalFn, useNow } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const layout = useLayoutStore();
const todos = useTodoStore();
const session = authClient.useSession();
const { t, locale } = useI18n();

const newTodo = ref('');

function addTodo() {
    todos.add(newTodo.value);
    newTodo.value = '';
}

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

// Ticks once a minute (useNow defaults to every animation frame), so event statuses stay current while open.
const now = useNow({ scheduler: (update) => useIntervalFn(update, 60_000) });

// Dates and times follow the UI language.
const todayLabel = computed(() => now.value.toLocaleDateString(locale.value, { weekday: 'long', month: 'long', day: 'numeric' }));

const timeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { hour: 'numeric', minute: '2-digit' }));

function eventStatus(event) {
    if (event.end <= now.value) return 'past';
    if (event.start <= now.value) return 'now';

    return 'upcoming';
}

function closeSidebar() {
    layout.ui.profileSidebarVisible = false;
}

const signOutAndRedirect = useSignOut();

function signOut() {
    closeSidebar();
    signOutAndRedirect();
}
</script>

<template>
    <Drawer v-model:visible="layout.ui.profileSidebarVisible" position="right" class="layout-profile-sidebar w-full sm:w-[25rem]">
        <template #header>
            <div class="flex flex-col">
                <span class="font-semibold text-lg">{{ t('today.title') }}</span>
                <span class="text-surface-500 dark:text-surface-400 text-sm">{{ todayLabel }}</span>
            </div>
        </template>

        <div class="flex flex-col gap-8">
            <section>
                <div class="flex items-center justify-between mb-4">
                    <span class="font-semibold">{{ t('today.todo') }}</span>
                    <span class="text-surface-500 dark:text-surface-400 text-sm">{{ t('today.open', { n: todos.openCount }) }}</span>
                </div>

                <form class="flex gap-2 mb-4" @submit.prevent="addTodo">
                    <InputText v-model="newTodo" :placeholder="t('today.addTask')" :aria-label="t('today.newTask')" fluid />
                    <Button type="submit" icon="pi pi-plus" :aria-label="t('today.addTaskButton')" :disabled="!newTodo.trim()" />
                </form>

                <ul class="list-none m-0 p-0 flex flex-col gap-1">
                    <li v-for="todo in todos.items" :key="todo.id" class="group flex items-center gap-3 px-2 py-2 rounded hover:bg-surface-100 dark:hover:bg-surface-800">
                        <Checkbox :modelValue="todo.done" :inputId="`todo-${todo.id}`" binary @update:modelValue="(done) => todos.toggle(todo.id, done)" />
                        <label :for="`todo-${todo.id}`" :class="['flex-1 cursor-pointer', { 'line-through text-surface-400 dark:text-surface-500': todo.done }]">{{ todo.text }}</label>
                        <Button icon="pi pi-times" text rounded size="small" severity="secondary" :aria-label="t('today.removeTask')" class="opacity-0 group-hover:opacity-100 focus:opacity-100" @click="todos.remove(todo.id)" />
                    </li>
                    <li v-if="!todos.items.length" class="text-surface-500 dark:text-surface-400 text-sm px-2">{{ t('today.nothingToDo') }}</li>
                </ul>

                <Button v-if="todos.hasCompleted" :label="t('today.clearCompleted')" text size="small" class="mt-2" @click="todos.clearCompleted()" />
            </section>

            <section>
                <div class="flex items-center justify-between mb-4">
                    <span class="font-semibold">{{ t('today.schedule') }}</span>
                    <span class="text-surface-500 dark:text-surface-400 text-sm">{{ t('today.events', events.length) }}</span>
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
                        <Tag v-if="eventStatus(event) === 'now'" :value="t('today.now')" class="self-start" />
                    </li>
                </ul>
            </section>

            <div class="flex flex-col gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                <span v-if="session.data" class="text-sm text-surface-500 dark:text-surface-400 truncate">{{ t('today.signedInAs', { email: session.data.user.email }) }}</span>
                <Button asChild v-slot="slotProps" severity="secondary" outlined fluid>
                    <RouterLink to="/settings" :class="slotProps.class" @click="closeSidebar"><i class="pi pi-cog"></i>{{ t('nav.settings') }}</RouterLink>
                </Button>
                <Button :label="t('today.signOut')" icon="pi pi-sign-out" severity="secondary" outlined fluid @click="signOut" />
            </div>
        </div>
    </Drawer>
</template>

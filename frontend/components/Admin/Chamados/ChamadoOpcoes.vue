<template>
    <select
    :id="id"
    class="block py-2 px-1 w-full rounded-xs text-sm text-black-500 border-2 border-black-200 appearance-none dark:text-black-400 dark:border-black-700 focus:outline-none focus:ring-0 focus:border-black-200 peer"
    >
    <option disabled selected>{{ placeholder }}</option>
    <option
        v-for="(item, index) in options"
        :key="index"
        :value="item?.value"
        >
        {{ item.label }}
    </option>
    </select>
</template>

<script setup lang="ts">
defineProps<{
    id?: string
    placeholder: string
    options: { label: string, value: string }[]
}>()

</script>
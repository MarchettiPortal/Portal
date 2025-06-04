<template>
    <div class="flex h-screen">
            <Sidebar />

        <div class="flex-1 flex flex-col">
            <Navbar />

            <div class="p-4 bg-gray-100 flex-1 overflow-auto min-h-0">
  <slot />
</div>
        </div>
    </div>
</template>

<script lang="ts">
import Navbar from '~/components/Navbar.vue'
import Sidebar from '~/components/Sidebar.vue';

</script>
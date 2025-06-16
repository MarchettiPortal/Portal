<template>
  <div>
    <div
      class="hover:bg-red-700 cursor-pointer rounded-xs p-1 flex items-center gap-2 justify-between"
      @click="toggleSubmenu"
    >
      <div class="flex items-center gap-1">
        <div class="w-6 h-6 flex items-center justify-center shrink-0">
          <Icon :name="icon" size="24" />
        </div>
        <span
          class="transition-all duration-300 text-sm ease-in-out text-white whitespace-nowrap"
          :class="labelClass"
        >
          {{ label }}
        </span>
      </div>

      <Icon
        v-if="expanded"
        name="material-symbols:arrow-drop-down-rounded"
        size="24"
        :class="['transition-transform duration-300', showSubmenu ? 'rotate-180' : '']"
      />
    </div>

    <div
      class="ml-10 flex flex-col gap-1 text-sm overflow-hidden transition-all duration-500 ease-in-out"
      :class="submenuClass"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  label: string
  icon: string
  expanded: boolean
}>()

const showSubmenu = ref(false)

watch(() => props.expanded, (newVal) => {
  if (!newVal) showSubmenu.value = false
})

const toggleSubmenu = () => {
  if (props.expanded) {
    showSubmenu.value = !showSubmenu.value
  }
}

const labelClass = computed(() =>
  props.expanded
    ? 'opacity-100 ml-2 w-auto'
    : 'opacity-0 ml-0 w-0 pointer-events-none'
)

const submenuClass = computed(() =>
  showSubmenu.value
    ? 'max-h-[1000px] opacity-100 mt-1'
    : 'max-h-0 opacity-0'
)
</script>

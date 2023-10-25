<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = defineProps<{
  text: string
}>()

const isPwd = ref(true)

const textPassword = computed(() => '*'.repeat(props.text.length))
</script>

<template>
  <span>
    {{ isPwd ? textPassword : props.text }}
    <q-icon
      :name="isPwd ? 'visibility' : 'visibility_off'"
      @click="isPwd = !isPwd"
      size="sm"
      class="cursor-pointer"
    />
  </span>
</template>

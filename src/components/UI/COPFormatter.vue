<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '../../utils/format'

interface Props {
  valor: number
  mostrarSigno?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mostrarSigno: true
})

const formatoMoneda = computed(() => {
  return formatCurrency(props.valor)
})
</script>

<template>
  <span>{{ formatoMoneda }}</span>
</template>
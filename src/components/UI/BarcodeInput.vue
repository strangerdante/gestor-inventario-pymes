<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  placeholder?: string
  disabled?: boolean
  modelValue: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Escanee un código de barras o ingréselo manualmente',
  disabled: false,
  modelValue: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'scan': [code: string]
}>()

const inputValue = ref(props.modelValue)

// Sincronizar el valor del input con el v-model
watch(() => props.modelValue, (newValue) => {
  inputValue.value = newValue
})

watch(inputValue, (newValue) => {
  emit('update:modelValue', newValue)
})

const inputRef = ref<HTMLInputElement | null>(null)

// Manejar evento de tecla para detectar cuando se presiona Enter
function handleKeyUp(e: KeyboardEvent) {
  if (e.key === 'Enter' && inputValue.value.trim()) {
    emit('scan', inputValue.value.trim())
  }
}

// Función para simular escaneo (para demostración)
function simularEscaneo() {
  const codigosDemo = [
    '7701234567890',
    '7701234567891',
    '7701234567892',
    '7701234567893',
    '7701234567894'
  ]
  
  const codigo = codigosDemo[Math.floor(Math.random() * codigosDemo.length)]
  inputValue.value = codigo
  emit('update:modelValue', codigo)
  
  // Simular entrada durante 500ms y luego enviar
  setTimeout(() => {
    emit('scan', codigo)
  }, 500)
}

// Enfocar el campo de entrada al montar
onMounted(() => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
})
</script>

<template>
  <div class="relative">
    <div class="flex rounded-md shadow-sm">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :disabled="disabled"
        :placeholder="placeholder"
        class="input flex-1 rounded-l-md"
        @keyup="handleKeyUp"
      />
      <button
        type="button"
        class="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="simularEscaneo"
        :disabled="disabled"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span class="ml-2">Simular</span>
      </button>
    </div>
    <p class="mt-1 text-xs text-gray-500">
      Presione Enter después de ingresar el código manualmente
    </p>
  </div>
</template>
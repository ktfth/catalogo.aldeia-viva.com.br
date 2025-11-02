<template>
  <div class="space-y-3">
    <!-- Label -->
    <label v-if="label" class="text-sm opacity-80">{{ label }}</label>

    <!-- Upload Area -->
    <div
      class="relative border-2 border-dashed rounded-lg transition-colors"
      :class="[
        isDragging
          ? 'border-accent bg-accent/10'
          : 'border-white/20 hover:border-white/40',
        uploading ? 'opacity-50 pointer-events-none' : '',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <!-- Preview Image (if exists) -->
      <div v-if="previewUrl" class="relative">
        <img
          :src="previewUrl"
          :alt="label || 'Preview'"
          class="w-full h-48 object-contain bg-white/5 rounded-lg"
          @error="handleImageError"
        />
        <!-- Remove button -->
        <button
          v-if="!uploading"
          type="button"
          @click="removeImage"
          class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition"
          title="Remover imagem"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Upload Button Area -->
      <div
        v-else
        class="flex flex-col items-center justify-center p-8 space-y-3 cursor-pointer"
        @click="triggerFileInput"
      >
        <!-- Upload Icon -->
        <svg
          class="w-12 h-12 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>

        <!-- Instructions -->
        <div class="text-center">
          <p class="text-sm">
            <span class="text-accent font-medium">Clique para fazer upload</span>
            ou arraste a imagem aqui
          </p>
          <p class="text-xs opacity-60 mt-1">
            {{ allowedTypesText }} • Máximo {{ maxSizeMB }}MB
          </p>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        ref="fileInput"
        type="file"
        :accept="acceptAttribute"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Loading Overlay -->
      <div
        v-if="uploading"
        class="absolute inset-0 flex flex-col items-center justify-center bg-ink-900/80 rounded-lg"
      >
        <div class="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-3 text-sm">Fazendo upload...</p>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="text-xs opacity-60">{{ helpText }}</p>

    <!-- Alternative: URL Input (Optional) -->
    <div v-if="allowUrlInput" class="space-y-2">
      <div class="flex items-center gap-2">
        <div class="flex-1 h-px bg-white/10"></div>
        <span class="text-xs opacity-60">ou</span>
        <div class="flex-1 h-px bg-white/10"></div>
      </div>
      <input
        v-model="urlInput"
        type="url"
        placeholder="Cole a URL da imagem"
        class="w-full bg-ink-700 border border-white/10 rounded-md px-3 py-2 text-sm"
        @input="handleUrlInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageBucket } from '~/composables/useImageUpload'

interface Props {
  modelValue?: string | null
  bucket: ImageBucket
  folder?: string
  label?: string
  helpText?: string
  maxSizeMB?: number
  allowedTypes?: string[]
  allowUrlInput?: boolean
  generateUniqueName?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | null): void
  (e: 'upload', result: { url: string; path: string }): void
  (e: 'remove'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  allowUrlInput: false,
  generateUniqueName: true,
})

const emit = defineEmits<Emits>()

const { uploadImage, validateFile, maxSizes } = useImageUpload()

// State
const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)
const urlInput = ref('')
const imageError = ref(false)

// Computed
const previewUrl = computed(() => {
  if (imageError.value) return null
  return props.modelValue || urlInput.value || null
})

const maxSizeMB = computed(() => props.maxSizeMB || maxSizes[props.bucket])

const allowedTypesText = computed(() => {
  const types = props.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return types.map((t) => t.split('/')[1].toUpperCase()).join(', ')
})

const acceptAttribute = computed(() => {
  const types = props.allowedTypes || ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return types.join(',')
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    handleFile(file)
  }
}

const handleFile = async (file: File) => {
  error.value = null
  imageError.value = false

  // Validate file
  const validation = validateFile(file, {
    bucket: props.bucket,
    maxSizeMB: maxSizeMB.value,
    allowedTypes: props.allowedTypes,
  })

  if (!validation.valid) {
    error.value = validation.error
    return
  }

  // Upload file
  uploading.value = true
  const result = await uploadImage(file, {
    bucket: props.bucket,
    folder: props.folder,
    maxSizeMB: maxSizeMB.value,
    allowedTypes: props.allowedTypes,
    generateUniqueName: props.generateUniqueName,
  })
  uploading.value = false

  if (result.error) {
    error.value = result.error
    return
  }

  if (result.url && result.path) {
    emit('update:modelValue', result.url)
    emit('upload', { url: result.url, path: result.path })
  }
}

const handleUrlInput = () => {
  if (urlInput.value) {
    error.value = null
    imageError.value = false
    emit('update:modelValue', urlInput.value)
  }
}

const removeImage = () => {
  emit('update:modelValue', null)
  emit('remove')
  urlInput.value = ''
  error.value = null
  imageError.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleImageError = () => {
  imageError.value = true
  error.value = 'Erro ao carregar a imagem'
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      urlInput.value = ''
      imageError.value = false
    }
  }
)
</script>

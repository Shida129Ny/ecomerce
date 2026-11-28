<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  product: { type: Object, required: true },
  size: { type: String, default: 'card' } // 'card' | 'detail' | 'thumb'
})

const imageFailed = ref(false)

watch(
  () => props.product.imageUrl,
  () => {
    imageFailed.value = false
  }
)
</script>

<template>
  <div class="product-visual" :class="`size-${size}`" :style="{ '--visual-accent': product.accent || '#315fce' }">
    <img
      v-if="product.imageUrl && !imageFailed"
      :src="product.imageUrl"
      :alt="product.name"
      class="product-visual-img"
      @error="imageFailed = true"
    />
    <div v-else class="product-visual-art" aria-hidden="true">
      <svg v-if="product.visualType === 'lamp'" viewBox="0 0 120 120" fill="none">
        <path d="M35 54C35 38 46 28 60 28C74 28 85 38 85 54H35Z" fill="currentColor" opacity="0.9" />
        <rect x="57" y="54" width="6" height="36" rx="3" fill="#334155" />
        <rect x="42" y="88" width="36" height="8" rx="4" fill="#1e293b" />
        <path d="M44 54L36 70H84L76 54" fill="currentColor" opacity="0.18" />
      </svg>
      <svg v-else-if="product.visualType === 'speaker'" viewBox="0 0 120 120" fill="none">
        <rect x="34" y="24" width="52" height="72" rx="14" fill="#1e293b" />
        <circle cx="60" cy="48" r="10" fill="currentColor" opacity="0.9" />
        <circle cx="60" cy="74" r="14" fill="currentColor" opacity="0.35" />
        <circle cx="60" cy="74" r="7" fill="currentColor" />
      </svg>
      <svg v-else-if="product.visualType === 'tote'" viewBox="0 0 120 120" fill="none">
        <path d="M46 42V34C46 26.268 52.268 20 60 20C67.732 20 74 26.268 74 34V42" stroke="#1e293b" stroke-width="5" stroke-linecap="round" />
        <path d="M32 42H88L82 94H38L32 42Z" fill="currentColor" opacity="0.85" />
        <rect x="46" y="56" width="28" height="20" rx="3" fill="#fff" opacity="0.35" />
      </svg>
      <svg v-else-if="product.visualType === 'vase'" viewBox="0 0 120 120" fill="none">
        <path d="M52 28H68L65 44C75 52 80 65 76 80C73 90 66 94 60 94C54 94 47 90 44 80C40 65 45 52 55 44L52 28Z" fill="currentColor" opacity="0.85" />
        <circle cx="60" cy="64" r="5" fill="#fff" opacity="0.4" />
      </svg>
      <svg v-else-if="product.visualType === 'keyboard'" viewBox="0 0 120 120" fill="none">
        <rect x="18" y="42" width="84" height="40" rx="8" fill="#1e293b" />
        <rect x="25" y="49" width="10" height="8" rx="2" fill="#e2e8f0" />
        <rect x="38" y="49" width="10" height="8" rx="2" fill="#e2e8f0" />
        <rect x="51" y="49" width="10" height="8" rx="2" fill="#e2e8f0" />
        <rect x="64" y="49" width="10" height="8" rx="2" fill="#e2e8f0" />
        <rect x="77" y="49" width="18" height="8" rx="2" fill="currentColor" />
        <rect x="25" y="61" width="14" height="8" rx="2" fill="#e2e8f0" />
        <rect x="42" y="61" width="34" height="8" rx="2" fill="#e2e8f0" />
        <rect x="79" y="61" width="16" height="8" rx="2" fill="#e2e8f0" />
      </svg>
      <svg v-else-if="product.visualType === 'watch'" viewBox="0 0 120 120" fill="none">
        <rect x="50" y="18" width="20" height="84" rx="4" fill="#334155" />
        <circle cx="60" cy="60" r="22" fill="#fff" stroke="#1e293b" stroke-width="5" />
        <path d="M60 47V60L69 65" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
      </svg>
      <svg v-else-if="product.visualType === 'deskmat'" viewBox="0 0 120 120" fill="none">
        <rect x="20" y="38" width="80" height="44" rx="6" fill="currentColor" opacity="0.25" stroke="currentColor" stroke-width="3" />
        <rect x="30" y="48" width="38" height="24" rx="3" fill="#fff" opacity="0.8" />
        <circle cx="82" cy="60" r="8" fill="currentColor" opacity="0.7" />
      </svg>
      <svg v-else viewBox="0 0 120 120" fill="none">
        <rect x="28" y="34" width="64" height="52" rx="10" fill="currentColor" opacity="0.2" stroke="currentColor" stroke-width="3" />
        <path d="M28 50H92" stroke="currentColor" stroke-width="3" />
        <circle cx="60" cy="68" r="8" fill="currentColor" opacity="0.85" />
      </svg>
    </div>
  </div>
</template>

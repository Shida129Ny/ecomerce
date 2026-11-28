<script setup>
import { ref, watch } from 'vue'
import { formatCurrency, useEcommerceStore } from '../store/useEcommerceStore'
import ProductVisual from '../components/ProductVisual.vue'

const props = defineProps({
  product: { type: Object, default: null }
})

const emit = defineEmits(['close'])

const { getCategoryName, addToCart, getCartQuantity, isInWishlist, toggleWishlist } = useEcommerceStore()
const quantity = ref(1)

watch(
  () => props.product,
  () => {
    quantity.value = 1
  }
)

function handleAdd() {
  if (!props.product) return
  const added = addToCart(props.product.id, quantity.value)
  if (added) {
    emit('close')
  }
}
</script>

<template>
  <div v-if="product" class="modal-backdrop" @click.self="emit('close')">
    <section class="modal modal-wide" role="dialog" aria-modal="true" :aria-label="product.name">
      <div class="modal-heading">
        <span class="product-category">{{ getCategoryName(product.categoryId) }}</span>
        <button class="close-button" aria-label="Close product details" @click="emit('close')">×</button>
      </div>

      <div class="product-detail-layout">
        <div class="product-detail-media">
          <ProductVisual :product="product" size="detail" />
        </div>

        <div class="product-detail-info">
          <h2>{{ product.name }}</h2>
          <div class="product-meta-row">
            <span class="sku-tag">SKU: {{ product.sku }}</span>
            <span class="product-rating">★ {{ Number(product.rating || 4.7).toFixed(1) }} ({{ product.reviewsCount || 0 }} reviews)</span>
          </div>

          <div class="detail-price-row">
            <strong>{{ formatCurrency(product.price) }}</strong>
            <span v-if="product.compareAtPrice && product.compareAtPrice > product.price" class="compare-price">
              {{ formatCurrency(product.compareAtPrice) }}
            </span>
          </div>

          <p class="detail-description">
            {{ product.description || 'Crafted for everyday durability and clean design.' }}
          </p>

          <p class="stock-status" :class="product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'in'">
            <template v-if="product.stock === 0">Currently out of stock</template>
            <template v-else-if="product.stock < 10">Low stock — only {{ product.stock }} left</template>
            <template v-else>In stock ({{ product.stock }} available)</template>
          </p>

          <div class="detail-actions">
            <div v-if="product.stock > 0" class="qty-stepper">
              <button type="button" aria-label="Decrease quantity" @click="quantity = Math.max(1, quantity - 1)">−</button>
              <span>{{ quantity }}</span>
              <button type="button" aria-label="Increase quantity" @click="quantity = Math.min(product.stock, quantity + 1)">+</button>
            </div>

            <button
              type="button"
              class="primary-button flex-1"
              :disabled="product.stock === 0"
              @click="handleAdd"
            >
              {{ product.stock === 0 ? 'Out of stock' : `Add to cart · ${formatCurrency(product.price * quantity)}` }}
            </button>

            <button
              type="button"
              class="secondary-button"
              @click="toggleWishlist(product.id)"
            >
              {{ isInWishlist(product.id) ? '♥ Saved' : '♡ Save' }}
            </button>
          </div>

          <p v-if="getCartQuantity(product.id) > 0" class="in-cart-hint">
            You currently have {{ getCartQuantity(product.id) }} in your cart.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

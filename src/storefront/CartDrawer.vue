<script setup>
import { ref } from 'vue'
import { formatCurrency, useEcommerceStore } from '../store/useEcommerceStore'
import ProductVisual from '../components/ProductVisual.vue'

defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'checkout'])

const {
  store,
  cartItemsDetailed,
  cartCount,
  cartSubtotal,
  promoDiscount,
  shippingCost,
  cartTotal,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  applyPromoCode
} = useEcommerceStore()

const promoInput = ref(store.value.promoCode || '')
const promoMessage = ref('')
const promoOk = ref(true)

function handlePromo() {
  const result = applyPromoCode(promoInput.value)
  promoOk.value = result.ok
  promoMessage.value = result.message
}
</script>

<template>
  <div v-if="open" class="drawer-backdrop" @click.self="emit('close')">
    <aside class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div class="drawer-header">
        <h2>Your cart <span class="nav-count">({{ cartCount }})</span></h2>
        <button class="close-button" aria-label="Close cart" @click="emit('close')">×</button>
      </div>

      <div v-if="cartItemsDetailed.length" class="drawer-body">
        <ul class="cart-items-list">
          <li v-for="item in cartItemsDetailed" :key="item.productId" class="cart-item">
            <ProductVisual :product="item.product" size="thumb" />
            <div class="cart-item-info">
              <div class="cart-item-top">
                <strong>{{ item.product.name }}</strong>
                <button
                  type="button"
                  class="remove-link"
                  aria-label="Remove item"
                  @click="removeFromCart(item.productId)"
                >
                  Remove
                </button>
              </div>
              <small>{{ formatCurrency(item.product.price) }} each</small>
              <div class="cart-item-bottom">
                <div class="qty-stepper small">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    @click="updateCartQuantity(item.productId, item.quantity - 1)"
                  >
                    −
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    :disabled="item.quantity >= item.product.stock"
                    @click="updateCartQuantity(item.productId, item.quantity + 1)"
                  >
                    +
                  </button>
                </div>
                <strong>{{ formatCurrency(item.lineTotal) }}</strong>
              </div>
            </div>
          </li>
        </ul>

        <form class="promo-form" @submit.prevent="handlePromo">
          <input
            v-model="promoInput"
            aria-label="Promo code"
            placeholder="Promo code (e.g. WELCOME10)"
          />
          <button type="submit" class="secondary-button">Apply</button>
        </form>
        <p v-if="promoMessage" class="promo-msg" :class="{ error: !promoOk }">{{ promoMessage }}</p>
      </div>

      <div v-else class="drawer-empty">
        <p>Your cart is empty.</p>
        <small>Add products from the storefront to get started.</small>
        <button type="button" class="primary-button" @click="emit('close')">Continue shopping</button>
      </div>

      <div v-if="cartItemsDetailed.length" class="drawer-footer">
        <div class="summary-rows">
          <div><span>Subtotal</span><span>{{ formatCurrency(cartSubtotal) }}</span></div>
          <div v-if="promoDiscount > 0" class="discount-row">
            <span>Discount ({{ store.promoCode }})</span>
            <span>−{{ formatCurrency(promoDiscount) }}</span>
          </div>
          <div>
            <span>Shipping</span>
            <span>{{ shippingCost === 0 ? 'Free' : formatCurrency(shippingCost) }}</span>
          </div>
          <div class="summary-total">
            <strong>Total</strong>
            <strong>{{ formatCurrency(cartTotal) }}</strong>
          </div>
        </div>
        <div class="drawer-actions">
          <button type="button" class="secondary-button" @click="clearCart">Clear</button>
          <button type="button" class="primary-button flex-1" @click="emit('checkout')">
            Checkout · {{ formatCurrency(cartTotal) }}
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

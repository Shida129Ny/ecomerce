<script setup>
import { ref } from 'vue'
import { useEcommerceStore } from './store/useEcommerceStore'
import StorefrontView from './storefront/StorefrontView.vue'
import ProductDetailModal from './storefront/ProductDetailModal.vue'
import CartDrawer from './storefront/CartDrawer.vue'
import CheckoutModal from './storefront/CheckoutModal.vue'
import CustomerOrdersModal from './storefront/CustomerOrdersModal.vue'
import AdminView from './admin/AdminView.vue'

const { store, toasts, dismissToast, cartCount } = useEcommerceStore()

const mode = ref('storefront') // 'storefront' | 'admin'
const storeSearch = ref('')
const selectedProduct = ref(null)
const cartOpen = ref(false)
const checkoutOpen = ref(false)
const ordersOpen = ref(false)

function openCheckout() {
  cartOpen.value = false
  checkoutOpen.value = true
}
</script>

<template>
  <div v-if="mode === 'storefront'" class="storefront-shell">
    <header class="store-header">
      <div class="store-header-inner">
        <a class="store-brand" href="#" @click.prevent="storeSearch = ''">
          <span class="brand-mark" aria-hidden="true">G</span>
          <span>Goodsly</span>
        </a>

        <label class="store-search">
          <span aria-hidden="true">⌕</span>
          <input
            v-model="storeSearch"
            aria-label="Search store products"
            placeholder="Search lamps, speakers, workspace..."
          />
          <button
            v-if="storeSearch"
            type="button"
            class="clear-search"
            aria-label="Clear search"
            @click="storeSearch = ''"
          >
            ×
          </button>
        </label>

        <nav class="store-nav" aria-label="Store actions">
          <button type="button" class="nav-pill" @click="ordersOpen = true">
            Orders <span v-if="store.orders.length" class="badge-count">{{ store.orders.length }}</span>
          </button>
          <button type="button" class="nav-pill cart-pill" @click="cartOpen = true">
            Cart <span class="badge-count">{{ cartCount }}</span>
          </button>
          <button type="button" class="secondary-button admin-switch" @click="mode = 'admin'">
            Store Admin
          </button>
        </nav>
      </div>
    </header>

    <main class="store-main">
      <StorefrontView v-model:search-query="storeSearch" @open-product="selectedProduct = $event" />
    </main>

    <footer class="store-footer">
      <div class="store-footer-inner">
        <span>Goodsly E-Commerce · Curated everyday goods</span>
        <span>All catalog, cart, and order data persists locally in your browser.</span>
      </div>
    </footer>

    <ProductDetailModal :product="selectedProduct" @close="selectedProduct = null" />
    <CartDrawer :open="cartOpen" @close="cartOpen = false" @checkout="openCheckout" />
    <CheckoutModal :open="checkoutOpen" @close="checkoutOpen = false" />
    <CustomerOrdersModal :open="ordersOpen" @close="ordersOpen = false" />
  </div>

  <AdminView v-else @open-storefront="mode = 'storefront'" />

  <div class="toast-stack" aria-live="polite">
    <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
      <span>{{ toast.message }}</span>
      <button type="button" aria-label="Dismiss notification" @click="dismissToast(toast.id)">×</button>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency, useEcommerceStore } from '../store/useEcommerceStore'

defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const { store } = useEcommerceStore()

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="emit('close')">
    <section class="modal modal-wide" role="dialog" aria-modal="true" aria-label="Order history">
      <div class="modal-heading">
        <h2>Your orders ({{ store.orders.length }})</h2>
        <button class="close-button" aria-label="Close orders" @click="emit('close')">×</button>
      </div>

      <div v-if="store.orders.length" class="orders-modal-list">
        <article v-for="order in store.orders" :key="order.id" class="order-card">
          <div class="order-card-head">
            <div>
              <strong>{{ order.orderNumber }}</strong>
              <small>{{ formatDate(order.createdAt) }} · {{ order.paymentMethod }}</small>
            </div>
            <span class="status-pill" :class="`status-${order.status.toLowerCase()}`">{{ order.status }}</span>
          </div>
          <ul class="order-items-mini">
            <li v-for="item in order.items" :key="item.productId">
              <span>{{ item.name }} × {{ item.quantity }}</span>
              <span>{{ formatCurrency(item.price * item.quantity) }}</span>
            </li>
          </ul>
          <div class="order-card-foot">
            <span>Ship to: {{ order.customer.name }}, {{ order.customer.city }}</span>
            <strong>Total: {{ formatCurrency(order.total) }}</strong>
          </div>
        </article>
      </div>

      <p v-else class="empty-state">No orders placed yet.</p>
    </section>
  </div>
</template>

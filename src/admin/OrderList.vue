<script setup>
import { computed, ref } from 'vue'
import { formatCurrency } from '../store/useEcommerceStore'

const props = defineProps({
  orders: { type: Array, required: true }
})

const emit = defineEmits(['update-status'])

const searchQuery = ref('')
const statusFilter = ref('all')

const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return props.orders.filter((order) => {
    if (statusFilter.value !== 'all' && order.status !== statusFilter.value) {
      return false
    }
    if (!query) return true
    return [order.orderNumber, order.customer.name, order.customer.email, order.customer.city].some((v) =>
      String(v || '').toLowerCase().includes(query)
    )
  })
})

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
  <section class="panel">
    <div class="toolbar">
      <label class="search-box">
        <span aria-hidden="true">⌕</span>
        <input v-model="searchQuery" aria-label="Search orders" placeholder="Search order #, customer, city" />
      </label>
      <label class="sort-control">
        Status
        <select v-model="statusFilter" aria-label="Filter orders by status">
          <option value="all">All statuses</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <span class="item-count">{{ filteredOrders.length }} orders</span>
    </div>

    <div class="table-scroll">
      <table class="product-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id">
            <td>
              <strong>{{ order.orderNumber }}</strong>
              <div class="table-sub">{{ formatDate(order.createdAt) }}</div>
            </td>
            <td>
              <strong>{{ order.customer.name }}</strong>
              <div class="table-sub">{{ order.customer.email }} · {{ order.customer.city }}</div>
            </td>
            <td>
              <span v-for="(item, idx) in order.items" :key="item.productId">
                {{ item.name }} ×{{ item.quantity }}<template v-if="idx < order.items.length - 1">, </template>
              </span>
            </td>
            <td><strong>{{ formatCurrency(order.total) }}</strong></td>
            <td>
              <select
                class="status-select"
                :aria-label="`Update status for ${order.orderNumber}`"
                :value="order.status"
                @change="emit('update-status', order.id, $event.target.value)"
              >
                <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
              </select>
            </td>
          </tr>
          <tr v-if="filteredOrders.length === 0">
            <td colspan="5" class="empty-state">No orders found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

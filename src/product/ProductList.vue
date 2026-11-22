<script setup>
defineProps({
  products: { type: Array, required: true },
  totalProducts: { type: Number, required: true },
  categories: { type: Array, required: true }
})

const emit = defineEmits(['edit', 'delete'])

function getCategoryName(categoryId, categories) {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorized'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}
</script>

<template>
  <div class="table-scroll">
    <table class="product-table">
      <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
      <tbody>
        <tr v-for="item in products" :key="item.id">
          <td>{{ item.name }}</td>
          <td>{{ item.sku }}</td>
          <td>{{ getCategoryName(item.categoryId, categories) }}</td>
          <td>{{ formatCurrency(item.price) }}</td>
          <td>{{ item.stock }}</td>
          <td>
            <div class="actions">
              <button type="button" @click="emit('edit', item)">Edit</button>
              <button type="button" class="delete-button" @click="emit('delete', item)">Delete</button>
            </div>
          </td>
        </tr>
        <tr v-if="products.length === 0"><td colspan="6" class="empty-state">No products found.</td></tr>
      </tbody>
    </table>
    <p class="list-summary">Showing {{ products.length }} of {{ totalProducts }} products</p>
  </div>
</template>

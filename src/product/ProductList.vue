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
  <div class="table-wrap">
    <table class="product-table">
      <thead><tr><th>PRODUCT</th><th>SKU</th><th>CATEGORY</th><th>PRICE</th><th>STOCK</th><th></th></tr></thead>
      <tbody>
        <tr v-for="(item, index) in products" :key="item.id">
          <td><div class="product-cell"><div class="product-thumb" :class="`thumb-${index % 4}`">{{ item.name.slice(0, 1).toUpperCase() }}</div><strong>{{ item.name }}</strong></div></td>
          <td class="sku">{{ item.sku }}</td>
          <td><span class="category-pill">{{ getCategoryName(item.categoryId, categories) }}</span></td>
          <td class="price">{{ formatCurrency(item.price) }}</td>
          <td><span class="stock-state" :class="item.stock === 0 ? 'stock-out' : item.stock < 10 ? 'stock-low' : 'stock-ok'"><i></i>{{ item.stock === 0 ? 'Out of stock' : `${item.stock} in stock` }}</span></td>
          <td><div class="row-actions"><button :aria-label="`Edit ${item.name}`" @click="emit('edit', item)">Edit</button><button :aria-label="`Delete ${item.name}`" @click="emit('delete', item)">Delete</button></div></td>
        </tr>
        <tr v-if="products.length === 0"><td colspan="6" class="empty-state"><span class="empty-icon">⌕</span><strong>No products found</strong><span>Try a different search or add your first product.</span></td></tr>
      </tbody>
    </table>
    <div class="table-footer"><span>Showing <strong>{{ products.length }}</strong> of {{ totalProducts }} products</span><span class="table-page">Page 1 of 1 <button disabled aria-label="Previous page">‹</button><button disabled aria-label="Next page">›</button></span></div>
  </div>
</template>

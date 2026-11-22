<script setup>
defineProps({
  categories: { type: Array, required: true }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="category-grid">
    <article v-for="(item, index) in categories" :key="item.id" class="category-card">
      <div class="category-card-top">
        <div class="category-art" :class="`art-${index % 3}`">{{ item.name.slice(0, 1).toUpperCase() }}</div>
        <div class="row-actions"><button :aria-label="`Edit ${item.name}`" @click="emit('edit', item)">Edit</button><button :aria-label="`Delete ${item.name}`" @click="emit('delete', item)">Delete</button></div>
      </div>
      <h3>{{ item.name }}</h3>
      <p>{{ item.description || 'No description added yet.' }}</p>
      <div class="category-card-footer"><span>{{ item.productCount }} products</span><span class="category-arrow">↗</span></div>
    </article>
    <div v-if="categories.length === 0" class="empty-state category-empty"><span class="empty-icon">⌕</span><strong>No categories found</strong><span>Try a different search or create a category.</span></div>
  </div>
</template>

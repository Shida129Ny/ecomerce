<script setup>
defineProps({
  categories: { type: Array, required: true }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="category-grid">
    <article v-for="item in categories" :key="item.id" class="category-card">
      <div class="category-info">
        <h2>{{ item.name }}</h2>
        <p>{{ item.description || 'No description.' }}</p>
        <span>{{ item.productCount }} products</span>
      </div>
      <div class="actions">
        <button type="button" @click="emit('edit', item)">Edit</button>
        <button type="button" class="delete-button" @click="emit('delete', item)">Delete</button>
      </div>
    </article>
    <p v-if="categories.length === 0" class="empty-state">No categories found.</p>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true },
  totalCategories: { type: Number, required: true },
  searchQuery: { type: String, default: '' },
  error: { type: String, default: '' }
})

const emit = defineEmits(['update:searchQuery', 'edit', 'delete', 'dismiss-error'])
</script>

<template>
  <section class="panel">
    <div class="toolbar">
      <label class="search-box">
        <span aria-hidden="true">⌕</span>
        <input
          :value="searchQuery"
          aria-label="Search categories"
          placeholder="Search categories"
          @input="emit('update:searchQuery', $event.target.value)"
        />
      </label>
      <span class="item-count">{{ categories.length }} categories</span>
    </div>

    <div v-if="error" class="inline-alert" role="alert">
      <span>{{ error }}</span>
      <button aria-label="Dismiss message" @click="emit('dismiss-error')">×</button>
    </div>

    <div class="category-grid">
      <article v-for="item in categories" :key="item.id" class="category-card">
        <div class="category-info">
          <h2>{{ item.name }}</h2>
          <p>{{ item.description || 'No description.' }}</p>
          <span>{{ item.productCount }} {{ item.productCount === 1 ? 'product' : 'products' }}</span>
        </div>
        <div class="actions">
          <button type="button" @click="emit('edit', item)">Edit</button>
          <button type="button" class="delete-button" @click="emit('delete', item)">Delete</button>
        </div>
      </article>
      <p v-if="categories.length === 0" class="empty-state">
        {{ totalCategories === 0 ? 'No categories yet.' : 'No categories found.' }}
      </p>
    </div>
  </section>
</template>
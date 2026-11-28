<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  productForm: { type: Object, required: true },
  categories: { type: Array, required: true },
  error: { type: String, default: '' },
  editing: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'cancel'])
const form = ref({ ...props.productForm })

watch(
  () => props.productForm,
  (value) => {
    form.value = { ...value }
  },
  { deep: true }
)
</script>

<template>
  <form @submit.prevent="emit('save', form)">
    <label class="form-field">
      Product name
      <input v-model="form.name" autofocus required maxlength="100" placeholder="e.g. Studio Table Lamp" />
    </label>
    <div class="form-row">
      <label class="form-field">
        SKU
        <input v-model="form.sku" required maxlength="40" placeholder="e.g. HOM-2048" />
      </label>
      <label class="form-field">
        Category
        <select v-model="form.categoryId" required :disabled="categories.length === 0">
          <option value="" disabled>Select category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </label>
    </div>
    <div class="form-row">
      <label class="form-field">
        Price (USD)
        <input v-model="form.price" required type="number" min="0" step="0.01" placeholder="0.00" />
      </label>
      <label class="form-field">
        Compare-at price <span class="optional">(optional)</span>
        <input v-model="form.compareAtPrice" type="number" min="0" step="0.01" placeholder="0.00" />
      </label>
    </div>
    <div class="form-row">
      <label class="form-field">
        Stock quantity
        <input v-model="form.stock" required type="number" min="0" step="1" placeholder="0" />
      </label>
      <label class="form-field">
        Image URL <span class="optional">(optional)</span>
        <input v-model="form.imageUrl" type="url" placeholder="https://..." />
      </label>
    </div>
    <label class="form-field">
      Description <span class="optional">(optional)</span>
      <textarea
        v-model="form.description"
        maxlength="300"
        rows="3"
        placeholder="Short product description shown in the storefront"
      ></textarea>
    </label>
    <label class="checkbox-field">
      <input v-model="form.featured" type="checkbox" />
      <span>Feature this product at the top of the storefront</span>
    </label>
    <p v-if="categories.length === 0" class="form-hint">Create a category before adding a product.</p>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div class="modal-actions">
      <button type="button" class="secondary-button" @click="emit('cancel')">Cancel</button>
      <button class="primary-button" :disabled="categories.length === 0">
        {{ editing ? 'Save changes' : 'Add product' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CategoryForm from './category/CategoryForm.vue'
import CategoryList from './category/CategoryList.vue'
import ProductForm from './product/ProductForm.vue'
import ProductList from './product/ProductList.vue'

const storageKey = 'goodsly-store-data'
const starterData = {
  categories: [
    { id: 'cat-home', name: 'Home & Living', description: 'Thoughtful pieces for everyday spaces' },
    { id: 'cat-tech', name: 'Technology', description: 'Useful tools for work and play' },
    { id: 'cat-style', name: 'Accessories', description: 'Finishing touches, made to last' }
  ],
  products: [
    { id: 'prd-lamp', name: 'Studio Table Lamp', sku: 'HOM-2048', price: 89, stock: 24, categoryId: 'cat-home' },
    { id: 'prd-speaker', name: 'Portable Speaker', sku: 'TEC-1102', price: 129, stock: 8, categoryId: 'cat-tech' },
    { id: 'prd-tote', name: 'Everyday Canvas Tote', sku: 'ACC-0307', price: 32, stock: 46, categoryId: 'cat-style' },
    { id: 'prd-vase', name: 'Ceramic Bud Vase', sku: 'HOM-2051', price: 38, stock: 0, categoryId: 'cat-home' }
  ]
}

function loadStore() {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return starterData
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed.categories) && Array.isArray(parsed.products)) return parsed
  } catch (error) {
    console.warn('Saved store data could not be loaded.', error)
  }
  return starterData
}

const store = ref(loadStore())
const activeTab = ref('products')
const searchQuery = ref('')
const productSort = ref('name')
const modalOpen = ref(false)
const editingItem = ref(null)
const formError = ref('')
const categoryError = ref('')
const productForm = ref(emptyProductForm())
const categoryForm = ref(emptyCategoryForm())

function emptyProductForm() {
  return { name: '', sku: '', price: '', stock: '', categoryId: '' }
}

function emptyCategoryForm() {
  return { name: '', description: '' }
}

watch(store, (value) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
  } catch (error) {
    console.warn('Store changes could not be saved in this browser.', error)
  }
}, { deep: true })

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return store.value.products.filter((item) => {
    const category = getCategoryName(item.categoryId)
    return !query || [item.name, item.sku, category].some((value) => value.toLowerCase().includes(query))
  })
})

const sortedProducts = computed(() => {
  const products = [...filteredProducts.value]
  if (productSort.value === 'price') return products.sort((a, b) => a.price - b.price)
  if (productSort.value === 'stock') return products.sort((a, b) => a.stock - b.stock)
  return products.sort((a, b) => a.name.localeCompare(b.name))
})

const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return store.value.categories.filter((item) =>
    !query || `${item.name} ${item.description}`.toLowerCase().includes(query)
  ).map((category) => ({ ...category, productCount: getProductCount(category.id) }))
})

function getCategoryName(categoryId) {
  return store.value.categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorized'
}

function getProductCount(categoryId) {
  return store.value.products.filter((product) => product.categoryId === categoryId).length
}

function openCreate() {
  editingItem.value = null
  formError.value = ''
  if (activeTab.value === 'products') {
    productForm.value = { ...emptyProductForm(), categoryId: store.value.categories[0]?.id ?? '' }
  } else {
    categoryForm.value = emptyCategoryForm()
  }
  modalOpen.value = true
}

function openEdit(item) {
  editingItem.value = item.id
  formError.value = ''
  if (activeTab.value === 'products') {
    productForm.value = { ...item, price: String(item.price), stock: String(item.stock) }
  } else {
    categoryForm.value = { name: item.name, description: item.description }
  }
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  formError.value = ''
}

function saveProduct(form) {
  const name = form.name.trim()
  const sku = form.sku.trim()
  const price = Number(form.price)
  const stock = Number(form.stock)
  if (!name || !sku || form.price === '' || form.stock === '' || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0 || !form.categoryId) {
    formError.value = 'Enter a name, SKU, valid price and stock, and choose a category.'
    return
  }
  const duplicateSku = store.value.products.some((item) =>
    item.sku.toLowerCase() === sku.toLowerCase() && item.id !== editingItem.value
  )
  if (duplicateSku) {
    formError.value = 'That SKU is already in use.'
    return
  }
  const item = { id: editingItem.value ?? `prd-${crypto.randomUUID()}`, name, sku, price, stock, categoryId: form.categoryId }
  if (editingItem.value) {
    store.value.products = store.value.products.map((product) => product.id === editingItem.value ? item : product)
  } else {
    store.value.products.unshift(item)
  }
  closeModal()
}

function saveCategory(form) {
  const name = form.name.trim()
  const description = form.description.trim()
  if (!name) {
    formError.value = 'Enter a category name.'
    return
  }
  const duplicateName = store.value.categories.some((item) =>
    item.name.toLowerCase() === name.toLowerCase() && item.id !== editingItem.value
  )
  if (duplicateName) {
    formError.value = 'A category with that name already exists.'
    return
  }
  const item = { id: editingItem.value ?? `cat-${crypto.randomUUID()}`, name, description }
  if (editingItem.value) {
    store.value.categories = store.value.categories.map((category) => category.id === editingItem.value ? item : category)
  } else {
    store.value.categories.unshift(item)
  }
  closeModal()
}

function deleteProduct(item) {
  if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
  store.value.products = store.value.products.filter((product) => product.id !== item.id)
}

function deleteCategory(item) {
  if (getProductCount(item.id) > 0) {
    categoryError.value = `Move or delete the products in "${item.name}" before deleting this category.`
    return
  }
  categoryError.value = ''
  if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
  store.value.categories = store.value.categories.filter((category) => category.id !== item.id)
}
</script>

<template>
  <div class="app-shell">
    <header class="site-header">
      <a class="brand" href="#" @click.prevent="activeTab = 'products'; searchQuery = ''">Store Admin</a>
      <nav class="main-nav" aria-label="Main navigation">
        <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'; searchQuery = ''; categoryError = ''">
          Products <span>{{ store.products.length }}</span>
        </button>
        <button :class="{ active: activeTab === 'categories' }" @click="activeTab = 'categories'; searchQuery = ''; categoryError = ''">
          Categories <span>{{ store.categories.length }}</span>
        </button>
      </nav>
    </header>

    <main class="content">
      <div class="page-heading">
        <div>
          <h1>{{ activeTab === 'products' ? 'Products' : 'Categories' }}</h1>
          <p>Manage your store {{ activeTab }}.</p>
        </div>
        <button class="primary-button" @click="openCreate">Add {{ activeTab === 'products' ? 'product' : 'category' }}</button>
      </div>

      <section class="panel">
        <div class="toolbar">
          <label class="search-box">
            <span aria-hidden="true">⌕</span>
            <input v-model="searchQuery" :aria-label="`Search ${activeTab}`" :placeholder="`Search ${activeTab}`" />
          </label>
          <label v-if="activeTab === 'products'" class="sort-control">
            Sort by
            <select v-model="productSort" aria-label="Sort products">
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="stock">Stock</option>
            </select>
          </label>
          <span class="item-count">{{ activeTab === 'products' ? filteredProducts.length : filteredCategories.length }} {{ activeTab }}</span>
        </div>

        <div v-if="categoryError" class="inline-alert" role="alert">
          <span>{{ categoryError }}</span><button aria-label="Dismiss message" @click="categoryError = ''">×</button>
        </div>

        <ProductList
          v-if="activeTab === 'products'"
          :products="sortedProducts"
          :total-products="store.products.length"
          :categories="store.categories"
          @edit="openEdit"
          @delete="deleteProduct"
        />
        <CategoryList
          v-else
          :categories="filteredCategories"
          @edit="openEdit"
          @delete="deleteCategory"
        />
      </section>
    </main>

    <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
      <section class="modal" role="dialog" aria-modal="true" :aria-labelledby="'modal-title'">
        <div class="modal-heading">
          <h2 id="modal-title">{{ editingItem ? 'Edit' : 'Add' }} {{ activeTab === 'products' ? 'product' : 'category' }}</h2>
          <button class="close-button" aria-label="Close dialog" @click="closeModal">×</button>
        </div>
        <ProductForm
          v-if="activeTab === 'products'"
          :product-form="productForm"
          :categories="store.categories"
          :error="formError"
          :editing="Boolean(editingItem)"
          @save="saveProduct"
          @cancel="closeModal"
        />
        <CategoryForm
          v-else
          :category-form="categoryForm"
          :error="formError"
          :editing="Boolean(editingItem)"
          @save="saveCategory"
          @cancel="closeModal"
        />
      </section>
    </div>
  </div>
</template>

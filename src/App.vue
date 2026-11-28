<script setup>
import { computed, ref, watch } from 'vue'
import CategoryForm from './category/CategoryForm.vue'
import ProductForm from './product/ProductForm.vue'
import ProductList from './product/ProductList.vue'
import ProductCat from './product/productcat.vue'

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
const activeTab = ref('dashboard')
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

const inventoryValue = computed(() => store.value.products.reduce((total, item) => total + item.price * item.stock, 0))
const inventoryUnits = computed(() => store.value.products.reduce((total, item) => total + item.stock, 0))
const lowStockCount = computed(() => store.value.products.filter((item) => item.stock < 10).length)
const recentProducts = computed(() => store.value.products.slice(0, 5))

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

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)
}

function navigateTo(tab) {
  activeTab.value = tab
  searchQuery.value = ''
  categoryError.value = ''
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
    <aside class="sidebar">
      <a class="brand" href="#" @click.prevent="navigateTo('dashboard')">Store Admin</a>
      <nav class="sidebar-nav" aria-label="Main navigation">
        <button :class="{ active: activeTab === 'dashboard' }" @click="navigateTo('dashboard')">
          <span aria-hidden="true">⌂</span> Dashboard
        </button>
        <button :class="{ active: activeTab === 'products' }" @click="navigateTo('products')">
          <span aria-hidden="true">▤</span> Products <span class="nav-count">{{ store.products.length }}</span>
        </button>
        <button :class="{ active: activeTab === 'categories' }" @click="navigateTo('categories')">
          <span aria-hidden="true">◫</span> Categories <span class="nav-count">{{ store.categories.length }}</span>
        </button>
      </nav>
      <p class="sidebar-note">Catalog data is saved in this browser.</p>
    </aside>

    <div class="main-content">
      <header class="topbar"><span>Store management</span><span class="topbar-status">Local data</span></header>
      <main class="content">
        <div class="page-heading">
          <div>
            <h1>{{ activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'products' ? 'Products' : 'Categories' }}</h1>
            <p v-if="activeTab === 'dashboard'">A quick overview of your store.</p>
            <p v-else>Manage your store {{ activeTab }}.</p>
          </div>
          <button v-if="activeTab !== 'dashboard'" class="primary-button" @click="openCreate">
            Add {{ activeTab === 'products' ? 'product' : 'category' }}
          </button>
        </div>

        <section v-if="activeTab === 'dashboard'" class="dashboard-view">
          <div class="summary-grid">
            <button class="summary-card" @click="navigateTo('products')">
              <span>Total products</span><strong>{{ store.products.length }}</strong><small>View products</small>
            </button>
            <button class="summary-card" @click="navigateTo('categories')">
              <span>Categories</span><strong>{{ store.categories.length }}</strong><small>View categories</small>
            </button>
            <article class="summary-card">
              <span>Units in stock</span><strong>{{ inventoryUnits }}</strong><small>{{ formatCurrency(inventoryValue) }} inventory value</small>
            </article>
            <button class="summary-card" @click="navigateTo('products')">
              <span>Low stock</span><strong>{{ lowStockCount }}</strong><small>Products under 10 units</small>
            </button>
          </div>

          <div class="dashboard-columns">
            <section class="panel">
              <div class="panel-heading">
                <h2>Recent products</h2>
                <button class="text-button" @click="navigateTo('products')">View all</button>
              </div>
              <ul v-if="recentProducts.length" class="recent-list">
                <li v-for="item in recentProducts" :key="item.id">
                  <span><strong>{{ item.name }}</strong><small>{{ getCategoryName(item.categoryId) }}</small></span>
                  <span class="recent-price">{{ formatCurrency(item.price) }}</span>
                </li>
              </ul>
              <p v-else class="empty-state">No products yet.</p>
            </section>

            <section class="panel quick-links">
              <h2>Quick links</h2>
              <button @click="navigateTo('products')">Manage products <span>→</span></button>
              <button @click="navigateTo('categories')">Manage categories <span>→</span></button>
            </section>
          </div>
        </section>

        <section v-else-if="activeTab === 'products'" class="panel">
          <div class="toolbar">
            <label class="search-box">
              <span aria-hidden="true">⌕</span>
              <input v-model="searchQuery" :aria-label="`Search ${activeTab}`" :placeholder="`Search ${activeTab}`" />
            </label>
            <label class="sort-control">
              Sort by
              <select v-model="productSort" aria-label="Sort products">
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
              </select>
            </label>
            <span class="item-count">{{ filteredProducts.length }} products</span>
          </div>

          <ProductList
            :products="sortedProducts"
            :total-products="store.products.length"
            :categories="store.categories"
            @edit="openEdit"
            @delete="deleteProduct"
          />
        </section>

        <ProductCat
          v-else
          v-model:search-query="searchQuery"
          :categories="filteredCategories"
          :total-categories="store.categories.length"
          :error="categoryError"
          @edit="openEdit"
          @delete="deleteCategory"
          @dismiss-error="categoryError = ''"
        />
      </main>
    </div>

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

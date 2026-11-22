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

const totalValue = computed(() => store.value.products.reduce((total, item) => total + item.price * item.stock, 0))
const lowStockCount = computed(() => store.value.products.filter((item) => item.stock > 0 && item.stock < 10).length)
const outOfStockCount = computed(() => store.value.products.filter((item) => item.stock === 0).length)

const filteredProducts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return store.value.products.filter((item) => {
    const category = getCategoryName(item.categoryId)
    return !query || [item.name, item.sku, category].some((value) => value.toLowerCase().includes(query))
  })
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
      <a class="brand" href="#" aria-label="Goodsly home" @click.prevent="activeTab = 'products'">
        <span class="brand-mark">g.</span>
        <span>goodsly</span>
      </a>
      <div class="side-label">WORKSPACE</div>
      <nav class="side-nav" aria-label="Main navigation">
        <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'; searchQuery = ''; categoryError = ''">
          <span class="nav-icon">▦</span> Products
          <span class="nav-count">{{ store.products.length }}</span>
        </button>
        <button :class="{ active: activeTab === 'categories' }" @click="activeTab = 'categories'; searchQuery = ''; categoryError = ''">
          <span class="nav-icon">◫</span> Categories
          <span class="nav-count">{{ store.categories.length }}</span>
        </button>
      </nav>
      <div class="sidebar-note">
        <span class="note-icon">✦</span>
        <p>Your store,<br /><strong>all in one place.</strong></p>
        <span class="note-caption">A little more organized every day.</span>
      </div>
      <div class="profile">
        <div class="avatar">S</div>
        <div class="profile-copy"><strong>Store admin</strong><span>Administrator</span></div>
        <span class="profile-menu" aria-hidden="true">···</span>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="breadcrumbs"><span>Workspace</span><b>/</b><strong>{{ activeTab === 'products' ? 'Products' : 'Categories' }}</strong></div>
        <div class="topbar-right"><span class="live-dot"></span><span>Store is live</span><div class="top-avatar">S</div></div>
      </header>

      <section class="page-content">
        <div class="welcome-row">
          <div>
            <div class="eyebrow">YOUR STORE AT A GLANCE</div>
            <h1>Good morning <span class="wave">✳</span></h1>
            <p class="page-subtitle">Here’s what’s happening with your store today.</p>
          </div>
          <div class="today-chip"><span>◷</span> Store overview</div>
        </div>

        <section class="stats-grid" aria-label="Store overview">
          <article class="stat-card">
            <div class="stat-heading"><span>Total products</span><span class="stat-icon purple">▦</span></div>
            <div class="stat-value">{{ store.products.length }}</div>
            <div class="stat-foot"><span class="stat-muted">Across</span> {{ store.categories.length }} categories</div>
          </article>
          <article class="stat-card">
            <div class="stat-heading"><span>Inventory value</span><span class="stat-icon green">$</span></div>
            <div class="stat-value">{{ formatCurrency(totalValue) }}</div>
            <div class="stat-foot"><span class="stat-muted">Based on current</span> stock</div>
          </article>
          <article class="stat-card">
            <div class="stat-heading"><span>Low stock</span><span class="stat-icon amber">⌁</span></div>
            <div class="stat-value">{{ lowStockCount }}</div>
            <div class="stat-foot"><span class="stat-muted">Products below</span> 10 units</div>
          </article>
          <article class="stat-card">
            <div class="stat-heading"><span>Out of stock</span><span class="stat-icon rose">⊘</span></div>
            <div class="stat-value">{{ outOfStockCount }}</div>
            <div class="stat-foot"><span class="stat-muted">Need</span> replenishing</div>
          </article>
        </section>

        <section class="catalog-card">
          <div class="catalog-header">
            <div>
              <h2>Catalog</h2>
              <p>Manage your products and the categories that organize them.</p>
            </div>
            <button class="primary-button" @click="openCreate"><span>＋</span> Add {{ activeTab === 'products' ? 'product' : 'category' }}</button>
          </div>
          <div class="catalog-toolbar">
            <div class="tab-list" role="tablist" aria-label="Catalog sections">
              <button role="tab" :aria-selected="activeTab === 'products'" :class="{ selected: activeTab === 'products' }" @click="activeTab = 'products'; searchQuery = ''; categoryError = ''">Products <span>{{ store.products.length }}</span></button>
              <button role="tab" :aria-selected="activeTab === 'categories'" :class="{ selected: activeTab === 'categories' }" @click="activeTab = 'categories'; searchQuery = ''; categoryError = ''">Categories <span>{{ store.categories.length }}</span></button>
            </div>
            <label class="search-box">
              <span class="search-icon">⌕</span>
              <input v-model="searchQuery" :aria-label="`Search ${activeTab}`" :placeholder="`Search ${activeTab}...`" />
            </label>
          </div>

          <div v-if="categoryError" class="inline-alert" role="alert">
            <span>{{ categoryError }}</span><button aria-label="Dismiss message" @click="categoryError = ''">×</button>
          </div>

          <ProductList
            v-if="activeTab === 'products'"
            :products="filteredProducts"
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
        <footer class="page-footer"><span>Made for the little things that make a store.</span><span>Goodsly <b>·</b> Store dashboard</span></footer>
      </section>
    </main>

    <div v-if="modalOpen" class="modal-backdrop" @click.self="closeModal">
      <section class="modal" role="dialog" aria-modal="true" :aria-labelledby="'modal-title'">
        <div class="modal-heading">
          <div><div class="eyebrow">{{ editingItem ? 'UPDATE YOUR CATALOG' : 'GROW YOUR CATALOG' }}</div><h2 id="modal-title">{{ editingItem ? 'Edit' : 'Add' }} {{ activeTab === 'products' ? 'product' : 'category' }}</h2></div>
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

<script setup>
import { computed, ref } from 'vue'
import { formatCurrency, useEcommerceStore } from '../store/useEcommerceStore'
import CategoryForm from '../category/CategoryForm.vue'
import CategoryList from '../category/CategoryList.vue'
import ProductForm from '../product/ProductForm.vue'
import ProductList from '../product/ProductList.vue'
import OrderList from './OrderList.vue'

const emit = defineEmits(['open-storefront'])

const {
  store,
  notify,
  getCategoryName,
  getProductCount,
  updateOrderStatus,
  totalRevenue,
  inventoryValue,
  inventoryUnits,
  lowStockCount
} = useEcommerceStore()

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
  return {
    name: '',
    sku: '',
    price: '',
    compareAtPrice: '',
    stock: '',
    categoryId: '',
    description: '',
    imageUrl: '',
    featured: false
  }
}

function emptyCategoryForm() {
  return { name: '', description: '' }
}

const recentProducts = computed(() => store.value.products.slice(0, 5))
const recentOrders = computed(() => store.value.orders.slice(0, 4))

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
  return store.value.categories
    .filter((item) => !query || `${item.name} ${item.description}`.toLowerCase().includes(query))
    .map((category) => ({ ...category, productCount: getProductCount(category.id) }))
})

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
    productForm.value = {
      ...item,
      price: String(item.price),
      compareAtPrice: item.compareAtPrice ? String(item.compareAtPrice) : '',
      stock: String(item.stock),
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      featured: Boolean(item.featured)
    }
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
  const compareAtPrice = form.compareAtPrice === '' ? null : Number(form.compareAtPrice)
  const stock = Number(form.stock)
  if (
    !name ||
    !sku ||
    form.price === '' ||
    form.stock === '' ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !form.categoryId
  ) {
    formError.value = 'Enter a name, SKU, valid price and stock, and choose a category.'
    return
  }
  const duplicateSku = store.value.products.some(
    (item) => item.sku.toLowerCase() === sku.toLowerCase() && item.id !== editingItem.value
  )
  if (duplicateSku) {
    formError.value = 'That SKU is already in use.'
    return
  }

  const existing = store.value.products.find((p) => p.id === editingItem.value)
  const item = {
    id: editingItem.value ?? `prd-${crypto.randomUUID()}`,
    name,
    sku,
    price,
    compareAtPrice: Number.isFinite(compareAtPrice) && compareAtPrice > price ? compareAtPrice : null,
    stock,
    categoryId: form.categoryId,
    description: (form.description || '').trim(),
    imageUrl: (form.imageUrl || '').trim(),
    featured: Boolean(form.featured),
    rating: existing?.rating ?? 4.8,
    reviewsCount: existing?.reviewsCount ?? 0,
    visualType: existing?.visualType ?? 'box',
    accent: existing?.accent ?? '#315fce'
  }
  if (editingItem.value) {
    store.value.products = store.value.products.map((product) => (product.id === editingItem.value ? item : product))
    notify(`Updated "${item.name}".`, 'success')
  } else {
    store.value.products.unshift(item)
    notify(`Added "${item.name}".`, 'success')
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
  const duplicateName = store.value.categories.some(
    (item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingItem.value
  )
  if (duplicateName) {
    formError.value = 'A category with that name already exists.'
    return
  }
  const item = { id: editingItem.value ?? `cat-${crypto.randomUUID()}`, name, description }
  if (editingItem.value) {
    store.value.categories = store.value.categories.map((category) => (category.id === editingItem.value ? item : category))
    notify(`Updated category "${item.name}".`, 'success')
  } else {
    store.value.categories.unshift(item)
    notify(`Added category "${item.name}".`, 'success')
  }
  closeModal()
}

function deleteProduct(item) {
  if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
  store.value.products = store.value.products.filter((product) => product.id !== item.id)
  notify(`Deleted "${item.name}".`)
}

function deleteCategory(item) {
  if (getProductCount(item.id) > 0) {
    categoryError.value = `Move or delete the products in "${item.name}" before deleting this category.`
    return
  }
  categoryError.value = ''
  if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return
  store.value.categories = store.value.categories.filter((category) => category.id !== item.id)
  notify(`Deleted category "${item.name}".`)
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" @click.prevent="navigateTo('dashboard')">Goodsly Admin</a>
      <nav class="sidebar-nav" aria-label="Admin navigation">
        <button :class="{ active: activeTab === 'dashboard' }" @click="navigateTo('dashboard')">
          <span aria-hidden="true">⌂</span> Dashboard
        </button>
        <button :class="{ active: activeTab === 'orders' }" @click="navigateTo('orders')">
          <span aria-hidden="true">☰</span> Orders <span class="nav-count">{{ store.orders.length }}</span>
        </button>
        <button :class="{ active: activeTab === 'products' }" @click="navigateTo('products')">
          <span aria-hidden="true">▤</span> Products <span class="nav-count">{{ store.products.length }}</span>
        </button>
        <button :class="{ active: activeTab === 'categories' }" @click="navigateTo('categories')">
          <span aria-hidden="true">◫</span> Categories <span class="nav-count">{{ store.categories.length }}</span>
        </button>
      </nav>
      <button type="button" class="secondary-button sidebar-store-btn" @click="emit('open-storefront')">
        ← View Storefront
      </button>
      <p class="sidebar-note">Changes sync live with the storefront in local storage.</p>
    </aside>

    <div class="main-content">
      <header class="topbar">
        <span>Store management</span>
        <button type="button" class="text-button" @click="emit('open-storefront')">Open Storefront →</button>
      </header>

      <main class="content">
        <div class="page-heading">
          <div>
            <h1>
              {{
                activeTab === 'dashboard'
                  ? 'Dashboard'
                  : activeTab === 'orders'
                    ? 'Orders'
                    : activeTab === 'products'
                      ? 'Products'
                      : 'Categories'
              }}
            </h1>
            <p v-if="activeTab === 'dashboard'">Store revenue, inventory health, and recent activity.</p>
            <p v-else>Manage your store {{ activeTab }}.</p>
          </div>
          <button v-if="activeTab === 'products' || activeTab === 'categories'" class="primary-button" @click="openCreate">
            Add {{ activeTab === 'products' ? 'product' : 'category' }}
          </button>
        </div>

        <section v-if="activeTab === 'dashboard'" class="dashboard-view">
          <div class="summary-grid">
            <button class="summary-card" @click="navigateTo('orders')">
              <span>Total revenue</span>
              <strong>{{ formatCurrency(totalRevenue) }}</strong>
              <small>{{ store.orders.length }} orders placed</small>
            </button>
            <button class="summary-card" @click="navigateTo('products')">
              <span>Total products</span>
              <strong>{{ store.products.length }}</strong>
              <small>{{ store.categories.length }} categories</small>
            </button>
            <article class="summary-card">
              <span>Units in stock</span>
              <strong>{{ inventoryUnits }}</strong>
              <small>{{ formatCurrency(inventoryValue) }} inventory value</small>
            </article>
            <button class="summary-card" @click="navigateTo('products')">
              <span>Low stock</span>
              <strong>{{ lowStockCount }}</strong>
              <small>Products under 10 units</small>
            </button>
          </div>

          <div class="dashboard-columns">
            <section class="panel">
              <div class="panel-heading">
                <h2>Recent orders</h2>
                <button class="text-button" @click="navigateTo('orders')">View all</button>
              </div>
              <ul v-if="recentOrders.length" class="recent-list">
                <li v-for="order in recentOrders" :key="order.id">
                  <span>
                    <strong>{{ order.orderNumber }} · {{ order.customer.name }}</strong>
                    <small>{{ order.items.length }} item(s) · {{ order.status }}</small>
                  </span>
                  <span class="recent-price">{{ formatCurrency(order.total) }}</span>
                </li>
              </ul>
              <p v-else class="empty-state">No orders yet.</p>
            </section>

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
          </div>
        </section>

        <OrderList
          v-else-if="activeTab === 'orders'"
          :orders="store.orders"
          @update-status="updateOrderStatus"
        />

        <section v-else-if="activeTab === 'products'" class="panel">
          <div class="toolbar">
            <label class="search-box">
              <span aria-hidden="true">⌕</span>
              <input v-model="searchQuery" aria-label="Search products" placeholder="Search products" />
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

        <section v-else class="panel">
          <div class="toolbar">
            <label class="search-box">
              <span aria-hidden="true">⌕</span>
              <input v-model="searchQuery" aria-label="Search categories" placeholder="Search categories" />
            </label>
            <span class="item-count">{{ filteredCategories.length }} categories</span>
          </div>

          <div v-if="categoryError" class="inline-alert" role="alert">
            <span>{{ categoryError }}</span>
            <button aria-label="Dismiss message" @click="categoryError = ''">×</button>
          </div>

          <CategoryList :categories="filteredCategories" @edit="openEdit" @delete="deleteCategory" />
        </section>
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

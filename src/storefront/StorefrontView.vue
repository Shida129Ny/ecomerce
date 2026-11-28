<script setup>
import { computed, ref } from 'vue'
import { formatCurrency, useEcommerceStore } from '../store/useEcommerceStore'
import ProductVisual from '../components/ProductVisual.vue'

const props = defineProps({
  searchQuery: { type: String, default: '' }
})

const emit = defineEmits(['open-product', 'update:searchQuery'])

const {
  store,
  getCategoryName,
  getCartQuantity,
  addToCart,
  isInWishlist,
  toggleWishlist
} = useEcommerceStore()

const selectedCategory = ref('all')
const sortBy = ref('featured')
const inStockOnly = ref(false)
const wishlistOnly = ref(false)

const visibleProducts = computed(() => {
  const query = props.searchQuery.trim().toLowerCase()
  let list = store.value.products.filter((product) => {
    if (selectedCategory.value !== 'all' && product.categoryId !== selectedCategory.value) {
      return false
    }
    if (inStockOnly.value && product.stock <= 0) {
      return false
    }
    if (wishlistOnly.value && !isInWishlist(product.id)) {
      return false
    }
    if (!query) return true
    const categoryName = getCategoryName(product.categoryId)
    return [product.name, product.description, product.sku, categoryName].some((val) =>
      String(val || '').toLowerCase().includes(query)
    )
  })

  if (sortBy.value === 'price-asc') {
    list = [...list].sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-desc') {
    list = [...list].sort((a, b) => b.price - a.price)
  } else if (sortBy.value === 'rating') {
    list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (sortBy.value === 'name') {
    list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  } else {
    list = [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
  }

  return list
})

function scrollToCatalog() {
  document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth' })
}

function resetFilters() {
  selectedCategory.value = 'all'
  inStockOnly.value = false
  wishlistOnly.value = false
  sortBy.value = 'featured'
  emit('update:searchQuery', '')
}
</script>

<template>
  <div class="storefront">
    <section class="hero-banner">
      <div class="hero-copy">
        <span class="hero-eyebrow">Curated Everyday Goods</span>
        <h1>Thoughtful objects for home, work, and travel.</h1>
        <p>
          Free shipping on orders over $100, or use code <strong>WELCOME10</strong> at checkout for 10% off your first order.
        </p>
        <div class="hero-actions">
          <button type="button" class="primary-button hero-cta" @click="scrollToCatalog">Shop collection</button>
          <button
            type="button"
            class="secondary-button"
            @click="wishlistOnly = !wishlistOnly; scrollToCatalog()"
          >
            {{ wishlistOnly ? 'Showing saved' : `Saved items (${store.wishlist.length})` }}
          </button>
        </div>
      </div>
      <div class="hero-highlights">
        <div class="hero-stat">
          <strong>{{ store.products.filter((p) => p.stock > 0).length }}</strong>
          <span>Ready to ship</span>
        </div>
        <div class="hero-stat">
          <strong>{{ store.categories.length }}</strong>
          <span>Curated collections</span>
        </div>
        <div class="hero-stat">
          <strong>4.8 ★</strong>
          <span>Average rating</span>
        </div>
      </div>
    </section>

    <section id="store-catalog" class="catalog-section">
      <div class="catalog-controls">
        <div class="category-pills" role="tablist" aria-label="Filter by category">
          <button
            type="button"
            class="pill"
            :class="{ active: selectedCategory === 'all' }"
            @click="selectedCategory = 'all'"
          >
            All ({{ store.products.length }})
          </button>
          <button
            v-for="cat in store.categories"
            :key="cat.id"
            type="button"
            class="pill"
            :class="{ active: selectedCategory === cat.id }"
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>

        <div class="catalog-filters">
          <label class="toggle-chip">
            <input v-model="inStockOnly" type="checkbox" />
            <span>In stock only</span>
          </label>
          <label class="toggle-chip">
            <input v-model="wishlistOnly" type="checkbox" />
            <span>Wishlist</span>
          </label>
          <label class="sort-control">
            Sort
            <select v-model="sortBy" aria-label="Sort storefront products">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </label>
        </div>
      </div>

      <div v-if="visibleProducts.length" class="product-grid">
        <article v-for="product in visibleProducts" :key="product.id" class="product-card">
          <div class="product-card-media" @click="emit('open-product', product)">
            <ProductVisual :product="product" size="card" />
            <div class="product-badges">
              <span v-if="product.stock === 0" class="badge badge-danger">Out of stock</span>
              <span v-else-if="product.stock < 10" class="badge badge-warn">Only {{ product.stock }} left</span>
              <span v-if="product.compareAtPrice && product.compareAtPrice > product.price" class="badge badge-sale">
                Sale
              </span>
            </div>
            <button
              type="button"
              class="wishlist-button"
              :class="{ saved: isInWishlist(product.id) }"
              :aria-label="isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'"
              @click.stop="toggleWishlist(product.id)"
            >
              {{ isInWishlist(product.id) ? '♥' : '♡' }}
            </button>
          </div>

          <div class="product-card-body">
            <div class="product-meta-row">
              <span class="product-category">{{ getCategoryName(product.categoryId) }}</span>
              <span class="product-rating" :aria-label="`Rated ${product.rating} out of 5`">
                ★ {{ Number(product.rating || 4.7).toFixed(1) }}
                <small>({{ product.reviewsCount || 0 }})</small>
              </span>
            </div>

            <h2 class="product-title" @click="emit('open-product', product)">{{ product.name }}</h2>
            <p class="product-desc">{{ product.description || 'Crafted for everyday durability and clean design.' }}</p>

            <div class="product-card-footer">
              <div class="price-block">
                <strong>{{ formatCurrency(product.price) }}</strong>
                <span v-if="product.compareAtPrice && product.compareAtPrice > product.price" class="compare-price">
                  {{ formatCurrency(product.compareAtPrice) }}
                </span>
              </div>

              <button
                type="button"
                class="primary-button add-cart-btn"
                :disabled="product.stock === 0"
                @click="addToCart(product.id, 1)"
              >
                <span v-if="product.stock === 0">Sold out</span>
                <span v-else-if="getCartQuantity(product.id) > 0">
                  Add ({{ getCartQuantity(product.id) }} in cart)
                </span>
                <span v-else>Add to cart</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="panel empty-catalog">
        <p>No products match your current filters.</p>
        <button type="button" class="secondary-button" @click="resetFilters">Reset filters</button>
      </div>
    </section>
  </div>
</template>

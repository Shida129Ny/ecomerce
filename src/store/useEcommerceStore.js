import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'goodsly-store-data'

const starterData = {
  categories: [
    { id: 'cat-home', name: 'Home & Living', description: 'Thoughtful pieces for everyday spaces' },
    { id: 'cat-tech', name: 'Technology', description: 'Useful tools for work and play' },
    { id: 'cat-style', name: 'Accessories', description: 'Finishing touches, made to last' },
    { id: 'cat-desk', name: 'Workspace', description: 'Calm, functional essentials for focused work' }
  ],
  products: [
    {
      id: 'prd-lamp',
      name: 'Studio Table Lamp',
      sku: 'HOM-2048',
      price: 89,
      compareAtPrice: 110,
      stock: 24,
      categoryId: 'cat-home',
      description: 'Warm diffused ambient lighting with a spun-aluminum shade and weighted matte base.',
      featured: true,
      rating: 4.8,
      reviewsCount: 42,
      visualType: 'lamp',
      accent: '#f59e0b',
      imageUrl: ''
    },
    {
      id: 'prd-speaker',
      name: 'Portable Acoustic Speaker',
      sku: 'TEC-1102',
      price: 129,
      compareAtPrice: null,
      stock: 8,
      categoryId: 'cat-tech',
      description: '360-degree balanced sound with 18-hour battery life and woven acoustic fabric.',
      featured: true,
      rating: 4.9,
      reviewsCount: 67,
      visualType: 'speaker',
      accent: '#3b82f6',
      imageUrl: ''
    },
    {
      id: 'prd-tote',
      name: 'Everyday Canvas Tote',
      sku: 'ACC-0307',
      price: 32,
      compareAtPrice: 40,
      stock: 46,
      categoryId: 'cat-style',
      description: 'Heavyweight 16oz organic cotton canvas with reinforced handles and interior pocket.',
      featured: false,
      rating: 4.7,
      reviewsCount: 29,
      visualType: 'tote',
      accent: '#10b981',
      imageUrl: ''
    },
    {
      id: 'prd-vase',
      name: 'Ceramic Bud Vase',
      sku: 'HOM-2051',
      price: 38,
      compareAtPrice: null,
      stock: 0,
      categoryId: 'cat-home',
      description: 'Hand-glazed stoneware vase with a tactile speckled finish for single stems.',
      featured: false,
      rating: 4.6,
      reviewsCount: 18,
      visualType: 'vase',
      accent: '#ec4899',
      imageUrl: ''
    },
    {
      id: 'prd-keyboard',
      name: 'Compact Mechanical Keyboard',
      sku: 'TEC-1189',
      price: 145,
      compareAtPrice: 169,
      stock: 15,
      categoryId: 'cat-tech',
      description: 'Wireless 75% tactile keyboard with hot-swappable switches and CNC aluminum frame.',
      featured: true,
      rating: 4.9,
      reviewsCount: 94,
      visualType: 'keyboard',
      accent: '#6366f1',
      imageUrl: ''
    },
    {
      id: 'prd-deskmat',
      name: 'Merino Wool Desk Mat',
      sku: 'WRK-4012',
      price: 54,
      compareAtPrice: null,
      stock: 19,
      categoryId: 'cat-desk',
      description: 'Soft felt surface that cushions wrists, dampens sound, and anchors your workspace.',
      featured: true,
      rating: 4.8,
      reviewsCount: 31,
      visualType: 'deskmat',
      accent: '#8b5cf6',
      imageUrl: ''
    },
    {
      id: 'prd-watch',
      name: 'Minimalist Field Watch',
      sku: 'ACC-0419',
      price: 165,
      compareAtPrice: 195,
      stock: 6,
      categoryId: 'cat-style',
      description: 'Brushed stainless steel case, sapphire crystal, and vegetable-tanned leather strap.',
      featured: true,
      rating: 4.9,
      reviewsCount: 53,
      visualType: 'watch',
      accent: '#0ea5e9',
      imageUrl: ''
    },
    {
      id: 'prd-stand',
      name: 'Anodized Laptop Stand',
      sku: 'WRK-4055',
      price: 68,
      compareAtPrice: null,
      stock: 30,
      categoryId: 'cat-desk',
      description: 'Ergonomic 15-degree elevation crafted from a single block of recycled aluminum.',
      featured: false,
      rating: 4.7,
      reviewsCount: 37,
      visualType: 'stand',
      accent: '#64748b',
      imageUrl: ''
    }
  ],
  cart: [],
  wishlist: [],
  orders: [
    {
      id: 'ord-1001',
      orderNumber: 'GDS-1001',
      createdAt: '2026-11-26T14:22:00.000Z',
      customer: {
        name: 'Maya Lin',
        email: 'maya.lin@example.com',
        address: '420 Cedar Avenue',
        city: 'Portland',
        postalCode: '97205',
        country: 'United States'
      },
      paymentMethod: 'Credit Card',
      items: [
        { productId: 'prd-lamp', name: 'Studio Table Lamp', sku: 'HOM-2048', price: 89, quantity: 1 },
        { productId: 'prd-tote', name: 'Everyday Canvas Tote', sku: 'ACC-0307', price: 32, quantity: 2 }
      ],
      subtotal: 153,
      discount: 0,
      shipping: 0,
      total: 153,
      status: 'Shipped'
    }
  ],
  promoCode: ''
}

function normalizeProduct(product) {
  return {
    description: '',
    compareAtPrice: null,
    featured: false,
    rating: 4.7,
    reviewsCount: 12,
    visualType: 'box',
    accent: '#315fce',
    imageUrl: '',
    ...product
  }
}

function loadStore() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return structuredClone(starterData)
    const parsed = JSON.parse(saved)
    if (Array.isArray(parsed.categories) && Array.isArray(parsed.products)) {
      return {
        categories: parsed.categories,
        products: parsed.products.map(normalizeProduct),
        cart: Array.isArray(parsed.cart) ? parsed.cart : [],
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        promoCode: typeof parsed.promoCode === 'string' ? parsed.promoCode : ''
      }
    }
  } catch (error) {
    console.warn('Saved store data could not be loaded.', error)
  }
  return structuredClone(starterData)
}

const store = ref(loadStore())
const toasts = ref([])

watch(
  store,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch (error) {
      console.warn('Store changes could not be saved in this browser.', error)
    }
  },
  { deep: true }
)

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(Number(value) || 0)
}

export function useEcommerceStore() {
  function notify(message, type = 'info') {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 3200)
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function getCategoryName(categoryId) {
    return store.value.categories.find((c) => c.id === categoryId)?.name ?? 'Uncategorized'
  }

  function getProductCount(categoryId) {
    return store.value.products.filter((p) => p.categoryId === categoryId).length
  }

  function getProductById(productId) {
    return store.value.products.find((p) => p.id === productId) ?? null
  }

  // Cart computations
  const cartItemsDetailed = computed(() => {
    return store.value.cart
      .map((entry) => {
        const product = getProductById(entry.productId)
        if (!product) return null
        return {
          ...entry,
          product,
          lineTotal: product.price * entry.quantity
        }
      })
      .filter(Boolean)
  })

  const cartCount = computed(() =>
    store.value.cart.reduce((total, entry) => total + entry.quantity, 0)
  )

  const cartSubtotal = computed(() =>
    cartItemsDetailed.value.reduce((total, item) => total + item.lineTotal, 0)
  )

  const promoDiscount = computed(() => {
    const code = store.value.promoCode.trim().toUpperCase()
    if (code === 'WELCOME10') return Number((cartSubtotal.value * 0.1).toFixed(2))
    if (code === 'SAVE20' && cartSubtotal.value >= 100) return 20
    return 0
  })

  const shippingCost = computed(() => {
    if (cartItemsDetailed.value.length === 0) return 0
    const code = store.value.promoCode.trim().toUpperCase()
    if (code === 'FREESHIP' || cartSubtotal.value - promoDiscount.value >= 100) return 0
    return 8
  })

  const cartTotal = computed(() =>
    Math.max(0, Number((cartSubtotal.value - promoDiscount.value + shippingCost.value).toFixed(2)))
  )

  function getCartQuantity(productId) {
    return store.value.cart.find((item) => item.productId === productId)?.quantity ?? 0
  }

  function addToCart(productId, quantity = 1) {
    const product = getProductById(productId)
    if (!product) return false
    if (product.stock <= 0) {
      notify(`"${product.name}" is currently out of stock.`, 'error')
      return false
    }
    const existing = store.value.cart.find((item) => item.productId === productId)
    const currentQty = existing ? existing.quantity : 0
    const nextQty = Math.min(product.stock, currentQty + quantity)
    if (nextQty === currentQty) {
      notify(`Maximum available stock (${product.stock}) already in cart.`, 'error')
      return false
    }
    if (existing) {
      existing.quantity = nextQty
    } else {
      store.value.cart.push({ productId, quantity: nextQty })
    }
    notify(`Added "${product.name}" to cart.`, 'success')
    return true
  }

  function updateCartQuantity(productId, quantity) {
    const product = getProductById(productId)
    if (!product) return
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    const clamped = Math.min(product.stock, quantity)
    const existing = store.value.cart.find((item) => item.productId === productId)
    if (existing) {
      existing.quantity = clamped
    }
  }

  function removeFromCart(productId) {
    store.value.cart = store.value.cart.filter((item) => item.productId !== productId)
  }

  function clearCart() {
    store.value.cart = []
    store.value.promoCode = ''
  }

  function applyPromoCode(code) {
    const normalized = code.trim().toUpperCase()
    if (!normalized) {
      store.value.promoCode = ''
      return { ok: true, message: 'Promo code cleared.' }
    }
    if (normalized === 'WELCOME10') {
      store.value.promoCode = normalized
      return { ok: true, message: 'WELCOME10 applied: 10% off your order!' }
    }
    if (normalized === 'FREESHIP') {
      store.value.promoCode = normalized
      return { ok: true, message: 'FREESHIP applied: Free shipping!' }
    }
    if (normalized === 'SAVE20') {
      if (cartSubtotal.value < 100) {
        return { ok: false, message: 'SAVE20 requires a subtotal of at least $100.' }
      }
      store.value.promoCode = normalized
      return { ok: true, message: 'SAVE20 applied: $20 off your order!' }
    }
    return { ok: false, message: 'Invalid promo code. Try WELCOME10, FREESHIP, or SAVE20.' }
  }

  // Wishlist
  function isInWishlist(productId) {
    return store.value.wishlist.includes(productId)
  }

  function toggleWishlist(productId) {
    const product = getProductById(productId)
    if (!product) return
    if (isInWishlist(productId)) {
      store.value.wishlist = store.value.wishlist.filter((id) => id !== productId)
      notify(`Removed "${product.name}" from saved items.`)
    } else {
      store.value.wishlist.push(productId)
      notify(`Saved "${product.name}" to wishlist.`, 'success')
    }
  }

  // Checkout & Orders
  function placeOrder(customer, paymentMethod) {
    if (cartItemsDetailed.value.length === 0) {
      return { ok: false, error: 'Your cart is empty.' }
    }

    // Verify stock availability
    for (const item of cartItemsDetailed.value) {
      if (item.quantity > item.product.stock) {
        return {
          ok: false,
          error: `Only ${item.product.stock} unit(s) of "${item.product.name}" remaining.`
        }
      }
    }

    const orderItems = cartItemsDetailed.value.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      price: item.product.price,
      quantity: item.quantity
    }))

    const orderNumber = `GDS-${1001 + store.value.orders.length}`
    const order = {
      id: `ord-${crypto.randomUUID()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: { ...customer },
      paymentMethod,
      items: orderItems,
      subtotal: cartSubtotal.value,
      discount: promoDiscount.value,
      shipping: shippingCost.value,
      total: cartTotal.value,
      status: 'Pending'
    }

    // Decrement stock
    for (const item of orderItems) {
      const product = getProductById(item.productId)
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity)
      }
    }

    store.value.orders.unshift(order)
    clearCart()
    notify(`Order ${orderNumber} placed successfully!`, 'success')
    return { ok: true, order }
  }

  function updateOrderStatus(orderId, status) {
    const order = store.value.orders.find((o) => o.id === orderId)
    if (!order) return
    order.status = status
    notify(`Order ${order.orderNumber} marked as ${status}.`, 'success')
  }

  // Metrics
  const totalRevenue = computed(() =>
    store.value.orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0)
  )

  const inventoryValue = computed(() =>
    store.value.products.reduce((total, item) => total + item.price * item.stock, 0)
  )

  const inventoryUnits = computed(() =>
    store.value.products.reduce((total, item) => total + item.stock, 0)
  )

  const lowStockCount = computed(() =>
    store.value.products.filter((item) => item.stock < 10).length
  )

  return {
    store,
    toasts,
    notify,
    dismissToast,
    getCategoryName,
    getProductCount,
    getProductById,
    cartItemsDetailed,
    cartCount,
    cartSubtotal,
    promoDiscount,
    shippingCost,
    cartTotal,
    getCartQuantity,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    isInWishlist,
    toggleWishlist,
    placeOrder,
    updateOrderStatus,
    totalRevenue,
    inventoryValue,
    inventoryUnits,
    lowStockCount
  }
}

<script setup>
import { ref } from 'vue'
import { formatCurrency, useEcommerceStore } from '../store/useEcommerceStore'

defineProps({
  open: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const {
  cartItemsDetailed,
  cartSubtotal,
  promoDiscount,
  shippingCost,
  cartTotal,
  placeOrder
} = useEcommerceStore()

const customer = ref({
  name: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'United States'
})

const paymentMethod = ref('Credit Card')
const error = ref('')
const confirmedOrder = ref(null)

function handleSubmit() {
  error.value = ''
  const c = customer.value
  if (!c.name.trim() || !c.email.trim() || !c.address.trim() || !c.city.trim() || !c.postalCode.trim()) {
    error.value = 'Please fill in all required shipping fields.'
    return
  }
  const result = placeOrder(
    {
      name: c.name.trim(),
      email: c.email.trim(),
      address: c.address.trim(),
      city: c.city.trim(),
      postalCode: c.postalCode.trim(),
      country: c.country.trim() || 'United States'
    },
    paymentMethod.value
  )
  if (!result.ok) {
    error.value = result.error
    return
  }
  confirmedOrder.value = result.order
}

function handleClose() {
  confirmedOrder.value = null
  error.value = ''
  emit('close')
}
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="handleClose">
    <section class="modal modal-wide" role="dialog" aria-modal="true" aria-label="Checkout">
      <div class="modal-heading">
        <h2>{{ confirmedOrder ? 'Order confirmed' : 'Checkout' }}</h2>
        <button class="close-button" aria-label="Close checkout" @click="handleClose">×</button>
      </div>

      <div v-if="confirmedOrder" class="order-confirmation">
        <div class="confirmation-badge">✓</div>
        <h3>Thank you, {{ confirmedOrder.customer.name }}!</h3>
        <p>
          Order <strong>{{ confirmedOrder.orderNumber }}</strong> has been placed and stock has been updated.
        </p>
        <div class="confirmation-box">
          <div><span>Status</span><strong>{{ confirmedOrder.status }}</strong></div>
          <div><span>Payment</span><strong>{{ confirmedOrder.paymentMethod }}</strong></div>
          <div><span>Total paid</span><strong>{{ formatCurrency(confirmedOrder.total) }}</strong></div>
        </div>
        <button type="button" class="primary-button" @click="handleClose">Back to store</button>
      </div>

      <form v-else class="checkout-layout" @submit.prevent="handleSubmit">
        <div class="checkout-fields">
          <h3>Shipping details</h3>
          <label class="form-field">
            Full name
            <input v-model="customer.name" required placeholder="Alex Morgan" />
          </label>
          <label class="form-field">
            Email address
            <input v-model="customer.email" type="email" required placeholder="alex@example.com" />
          </label>
          <label class="form-field">
            Street address
            <input v-model="customer.address" required placeholder="123 Market Street" />
          </label>
          <div class="form-row">
            <label class="form-field">
              City
              <input v-model="customer.city" required placeholder="San Francisco" />
            </label>
            <label class="form-field">
              Postal code
              <input v-model="customer.postalCode" required placeholder="94105" />
            </label>
          </div>
          <label class="form-field">
            Country
            <input v-model="customer.country" required placeholder="United States" />
          </label>

          <h3>Payment method</h3>
          <div class="payment-options">
            <label class="payment-option">
              <input v-model="paymentMethod" type="radio" value="Credit Card" />
              <span>Credit / Debit Card</span>
            </label>
            <label class="payment-option">
              <input v-model="paymentMethod" type="radio" value="Express Pay" />
              <span>Express Pay</span>
            </label>
            <label class="payment-option">
              <input v-model="paymentMethod" type="radio" value="Cash on Delivery" />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        <div class="checkout-summary">
          <h3>Order summary</h3>
          <ul class="checkout-items">
            <li v-for="item in cartItemsDetailed" :key="item.productId">
              <span>{{ item.product.name }} × {{ item.quantity }}</span>
              <strong>{{ formatCurrency(item.lineTotal) }}</strong>
            </li>
          </ul>
          <div class="summary-rows">
            <div><span>Subtotal</span><span>{{ formatCurrency(cartSubtotal) }}</span></div>
            <div v-if="promoDiscount > 0" class="discount-row">
              <span>Discount</span><span>−{{ formatCurrency(promoDiscount) }}</span>
            </div>
            <div><span>Shipping</span><span>{{ shippingCost === 0 ? 'Free' : formatCurrency(shippingCost) }}</span></div>
            <div class="summary-total">
              <strong>Total</strong>
              <strong>{{ formatCurrency(cartTotal) }}</strong>
            </div>
          </div>

          <p v-if="error" class="form-error" role="alert">{{ error }}</p>

          <div class="modal-actions">
            <button type="button" class="secondary-button" @click="handleClose">Cancel</button>
            <button type="submit" class="primary-button">Place order</button>
          </div>
        </div>
      </form>
    </section>
  </div>
</template>

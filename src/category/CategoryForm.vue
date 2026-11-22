<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  categoryForm: { type: Object, required: true },
  error: { type: String, default: '' },
  editing: { type: Boolean, default: false }
})

const emit = defineEmits(['save', 'cancel'])
const form = ref({ ...props.categoryForm })

watch(() => props.categoryForm, (value) => {
  form.value = { ...value }
}, { deep: true })
</script>

<template>
  <form @submit.prevent="emit('save', form)">
    <label class="form-field">Category name<input v-model="form.name" autofocus required maxlength="60" placeholder="e.g. Home & Living" /></label>
    <label class="form-field">Description <span class="optional">(optional)</span><textarea v-model="form.description" maxlength="180" rows="3" placeholder="A short description of this category"></textarea></label>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div class="modal-actions"><button type="button" class="secondary-button" @click="emit('cancel')">Cancel</button><button class="primary-button">{{ editing ? 'Save changes' : 'Add category' }}</button></div>
  </form>
</template>

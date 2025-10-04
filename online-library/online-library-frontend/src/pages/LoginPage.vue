<template>
  <v-container class="d-flex justify-center align-center" style="height: 80vh">
    <v-card width="400">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSubmit">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
            outlined
            class="mb-2"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            outlined
            class="mb-4"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-3">
            {{ error }}
          </v-alert>

          <v-btn :loading="loading" type="submit" color="primary" block>Login</v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <RouterLink to="/register">Need an account? Register</RouterLink>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login({email: email.value, password: password.value})
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.msg || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

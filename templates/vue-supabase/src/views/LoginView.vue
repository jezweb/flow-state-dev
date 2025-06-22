<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title class="text-h5 text-center">
            {{ isSignUp ? 'Create Account' : 'Sign In' }}
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                :rules="emailRules"
                prepend-icon="mdi-email"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                required
                :rules="passwordRules"
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
              ></v-text-field>

              <v-alert
                v-if="errorMessage"
                type="error"
                dismissible
                @click:close="errorMessage = ''"
                class="mb-4"
              >
                {{ errorMessage }}
              </v-alert>

              <v-alert
                v-if="successMessage"
                type="success"
                dismissible
                @click:close="successMessage = ''"
                class="mb-4"
              >
                {{ successMessage }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="loading"
              >
                {{ isSignUp ? 'Sign Up' : 'Sign In' }}
              </v-btn>
            </v-form>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="isSignUp = !isSignUp"
            >
              {{ isSignUp ? 'Already have an account?' : 'Need an account?' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Form state
const form = ref(null)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSignUp = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
]

// Handle form submission
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (isSignUp.value) {
      // Sign up
      const { error } = await authStore.signUp(email.value, password.value)
      if (error) throw error
      successMessage.value = 'Account created! Please check your email to verify your account.'
    } else {
      // Sign in
      const { error } = await authStore.signIn(email.value, password.value)
      if (error) throw error
      
      // Redirect to dashboard or previous page
      const redirect = route.query.redirect || '/dashboard'
      router.push(redirect)
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}
</script>
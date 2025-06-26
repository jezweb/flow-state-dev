<template>
  <div class="form-examples pa-4">
    <h2 class="text-h4 mb-4">Vuetify Form Examples</h2>
    
    <v-row>
      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title>Contact Form</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid">
              <v-text-field
                v-model="contactForm.name"
                :rules="nameRules"
                label="Full Name"
                prepend-inner-icon="$account"
                required
              ></v-text-field>

              <v-text-field
                v-model="contactForm.email"
                :rules="emailRules"
                label="Email"
                prepend-inner-icon="$email"
                type="email"
                required
              ></v-text-field>

              <v-text-field
                v-model="contactForm.phone"
                label="Phone Number"
                prepend-inner-icon="$phone"
                type="tel"
              ></v-text-field>

              <v-select
                v-model="contactForm.subject"
                :items="subjects"
                label="Subject"
                prepend-inner-icon="$menu"
                required
              ></v-select>

              <v-textarea
                v-model="contactForm.message"
                :rules="messageRules"
                label="Message"
                rows="4"
                required
              ></v-textarea>

              <v-checkbox
                v-model="contactForm.newsletter"
                label="Subscribe to newsletter"
                color="primary"
              ></v-checkbox>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="resetForm">Reset</v-btn>
            <v-btn
              :disabled="!valid"
              color="primary"
              @click="submitForm"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card>
          <v-card-title>Login Form</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="loginForm.username"
                label="Username or Email"
                prepend-inner-icon="$account"
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                prepend-inner-icon="$lock"
                :append-inner-icon="showPassword ? '$eyeOff' : '$eye'"
                @click:append-inner="showPassword = !showPassword"
                variant="outlined"
              ></v-text-field>

              <v-switch
                v-model="loginForm.rememberMe"
                label="Remember me"
                color="primary"
                inset
              ></v-switch>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" color="primary">Forgot Password?</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" block>Login</v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mt-4">
          <v-card-title>Form Inputs Showcase</v-card-title>
          <v-card-text>
            <v-slider
              v-model="sliderValue"
              label="Slider"
              min="0"
              max="100"
              step="1"
              thumb-label
              color="primary"
            ></v-slider>

            <v-range-slider
              v-model="rangeValue"
              label="Range Slider"
              min="0"
              max="100"
              step="5"
              thumb-label
              color="primary"
              class="mt-4"
            ></v-range-slider>

            <v-switch
              v-model="switchValue"
              label="Switch"
              color="primary"
              inset
            ></v-switch>

            <v-checkbox
              v-model="checkboxValue"
              label="Checkbox"
              color="primary"
            ></v-checkbox>

            <v-radio-group v-model="radioValue" inline>
              <template #label>
                <div>Radio Group:</div>
              </template>
              <v-radio label="Option 1" value="1" color="primary"></v-radio>
              <v-radio label="Option 2" value="2" color="primary"></v-radio>
              <v-radio label="Option 3" value="3" color="primary"></v-radio>
            </v-radio-group>

            <v-autocomplete
              v-model="autocompleteValue"
              :items="countries"
              label="Autocomplete"
              prepend-inner-icon="$magnify"
              variant="outlined"
              clearable
            ></v-autocomplete>

            <v-combobox
              v-model="comboboxValue"
              :items="tags"
              label="Combobox (Tags)"
              multiple
              chips
              variant="outlined"
            ></v-combobox>

            <v-file-input
              v-model="fileValue"
              label="File Input"
              prepend-icon="$attachment"
              variant="outlined"
              show-size
            ></v-file-input>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      color="success"
    >
      Form submitted successfully!
      <template #actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const form = ref()
const valid = ref(false)
const showPassword = ref(false)
const snackbar = ref(false)

// Contact form
const contactForm = ref({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  newsletter: false
})

// Login form
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

// Form inputs showcase
const sliderValue = ref(50)
const rangeValue = ref([20, 80])
const switchValue = ref(false)
const checkboxValue = ref(false)
const radioValue = ref('1')
const autocompleteValue = ref('')
const comboboxValue = ref([])
const fileValue = ref([])

// Data
const subjects = [
  'General Inquiry',
  'Technical Support',
  'Sales',
  'Partnership',
  'Other'
]

const countries = [
  'Australia',
  'United States',
  'United Kingdom',
  'Canada',
  'Germany',
  'France',
  'Japan',
  'New Zealand'
]

const tags = [
  'Vue.js',
  'Vuetify',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'React',
  'Angular'
]

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => (v && v.length >= 2) || 'Name must be at least 2 characters'
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const messageRules = [
  (v: string) => !!v || 'Message is required',
  (v: string) => (v && v.length >= 10) || 'Message must be at least 10 characters'
]

const submitForm = async () => {
  const { valid } = await form.value.validate()
  
  if (valid) {
    console.log('Form submitted:', contactForm.value)
    snackbar.value = true
  }
}

const resetForm = () => {
  form.value.reset()
  contactForm.value = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    newsletter: false
  }
}
</script>

<style scoped>
.form-examples {
  max-width: 1200px;
}
</style>
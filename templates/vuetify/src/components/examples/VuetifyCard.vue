<template>
  <div class="card-examples pa-4">
    <h2 class="text-h4 mb-4">Vuetify Card Examples</h2>
    
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Basic Card</v-card-title>
          <v-card-text>
            This is a basic card with title and text content.
            Cards can contain various types of content and actions.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary">Learn More</v-btn>
            <v-spacer></v-spacer>
            <v-btn icon="$heart" variant="text"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-img
            src="https://picsum.photos/400/200"
            height="200"
            cover
          ></v-img>
          <v-card-title>Card with Image</v-card-title>
          <v-card-subtitle>Beautiful landscape</v-card-subtitle>
          <v-card-text>
            Cards can include images at the top, making them perfect
            for showcasing visual content.
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="text">Share</v-btn>
            <v-btn color="primary" variant="text">Explore</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="text-center" color="primary" dark>
          <v-card-text>
            <v-icon size="48" class="mb-2">$home</v-icon>
            <div class="text-h6">Colored Card</div>
            <div>Cards can have background colors and themes</div>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn variant="outlined" color="white">Action</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="outlined">
          <v-card-title>
            <v-icon start>$information</v-icon>
            Outlined Card
          </v-card-title>
          <v-card-text>
            This card uses the outlined variant for a subtle border effect.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="tonal" color="success">
          <v-card-title>Tonal Card</v-card-title>
          <v-card-text>
            Tonal cards provide a subtle background color based on the theme.
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>
            Interactive Card
            <v-spacer></v-spacer>
            <v-btn
              :icon="expanded ? '$chevronUp' : '$chevronDown'"
              @click="expanded = !expanded"
            ></v-btn>
          </v-card-title>
          <v-expand-transition>
            <div v-show="expanded">
              <v-divider></v-divider>
              <v-card-text>
                This card can be expanded and collapsed. Click the chevron
                button to toggle the expanded content. This is useful for
                showing additional details on demand.
              </v-card-text>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Card with List</v-card-title>
          <v-list>
            <v-list-item
              v-for="(item, index) in listItems"
              :key="index"
              :prepend-icon="item.icon"
              :title="item.title"
              :subtitle="item.subtitle"
            ></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Progress Card</v-card-title>
          <v-card-text>
            <div class="mb-2">Loading Progress</div>
            <v-progress-linear
              :model-value="progress"
              color="primary"
              height="8"
              rounded
            ></v-progress-linear>
            <div class="text-caption mt-1">{{ progress }}% complete</div>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="updateProgress" color="primary">Update</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const expanded = ref(false)
const progress = ref(65)

const listItems = ref([
  {
    icon: '$home',
    title: 'Home',
    subtitle: 'Navigate to home page'
  },
  {
    icon: '$account',
    title: 'Profile',
    subtitle: 'View your profile'
  },
  {
    icon: '$magnify',
    title: 'Search',
    subtitle: 'Search for content'
  }
])

const updateProgress = () => {
  progress.value = Math.floor(Math.random() * 100)
}
</script>

<style scoped>
.card-examples {
  max-width: 1200px;
}
</style>
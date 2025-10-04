<template>
  <v-container>
    <v-text-field
      v-model="search"
      label="Search books..."
      append-inner-icon="mdi-magnify"
      @keyup.enter="fetchBooks"
      clearable
    />

    <v-row>
      <v-col v-for="book in books" :key="book.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title>{{ book.title }}</v-card-title>
          <v-card-subtitle>By {{ book.author }}</v-card-subtitle>
          <v-card-text>
            Available: {{ book.available_copies }}
          </v-card-text>
          <v-card-actions>
            <v-btn :to="`/books/${book.id}`" text>View</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-pagination
      v-model="page"
      :length="pages"
      class="mt-4"
      @update:modelValue="fetchBooks"
    />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../axios/api.js'

const books = ref([])
const search = ref('')
const page = ref(1)
const perPage = 6
const pages = ref(1)

async function fetchBooks() {
  const res = await api.get('/books', {
    params: { title: search.value, page: page.value, per_page: perPage }
  })
  books.value = res.data.books || res.data.data || []
  pages.value = res.data.pages || 1
}

onMounted(fetchBooks)
</script>

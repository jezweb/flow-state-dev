<template>
  <div class="home">
    <h1>Welcome to test-project</h1>
    <p>Your Vue 3 application is ready!</p>
    
    <div class="features">
      <h2>Features included:</h2>
      <ul>
        <li>Vue 3 with Composition API</li>
        <li>Vue Router for navigation</li>
        <li>Vite for fast development</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.features {
  margin-top: 2rem;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.features ul {
  list-style-type: none;
  padding: 0;
}

.features li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}

.features li:last-child {
  border-bottom: none;
}
</style>
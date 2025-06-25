<template>
  <div class="about">
    <h1>About test-project</h1>
    <p>This is an about page for your Vue 3 application.</p>
    
    <div class="info">
      <h2>Project Information</h2>
      <p>Built with Flow State Dev - the fastest way to start a modern web project.</p>
      <p>Visit <a href="https://github.com/jezweb/flow-state-dev" target="_blank">our GitHub</a> for more information.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView'
}
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.info {
  margin-top: 2rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.info a {
  color: #1976d2;
  text-decoration: none;
}

.info a:hover {
  text-decoration: underline;
}
</style>
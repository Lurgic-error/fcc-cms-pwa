<template>
  <div class="error-layout">
    <router-view />
  </div>
</template>

<style scoped>
.error-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(circle at 8% 10%, rgba(15, 118, 110, 0.2), transparent 32%),
    radial-gradient(circle at 90% 8%, rgba(191, 90, 36, 0.15), transparent 30%), var(--fcc-app-bg);
}
</style>

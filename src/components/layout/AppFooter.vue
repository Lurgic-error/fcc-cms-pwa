<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <p class="app-footer__copy">© {{ currentYear }} Fair Competition Commission</p>

    <div class="app-footer__links">
      <button type="button" class="app-footer__link">Support</button>
      <button type="button" class="app-footer__link">Privacy Policy</button>
      <button type="button" class="app-footer__link">Terms of Service</button>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 2rem;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--fcc-border);
}

.app-footer__copy {
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.app-footer__links {
  display: flex;
  align-items: center;
  gap: 1.8rem;
}

.app-footer__link {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
}

.app-footer__link:hover {
  color: #2563eb;
}

@media (max-width: 820px) {
  .app-footer {
    padding-inline: 1rem;
    justify-content: center;
  }

  .app-footer__copy {
    display: none;
  }

  .app-footer__links {
    gap: 1rem;
    overflow-x: auto;
  }
}
</style>

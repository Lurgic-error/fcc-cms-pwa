<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <p class="app-footer__copy">© {{ currentYear }} Fair Competition Commission</p>

    <div class="app-footer__links">
      <el-button text class="app-footer__link">Support</el-button>
      <el-button text class="app-footer__link">Privacy Policy</el-button>
      <el-button text class="app-footer__link">Terms of Service</el-button>
    </div>
  </footer>
</template>

<template>
  <footer class="footer">
    <div class="container-fluid">
      <div class="copyright">
        © {{year}} <a href="https://www.open-pool.com" target="_blank" rel="noopener">Open Pool</a>
      </div>
    </div>
  </footer>
</template>
<script>
  export default {
    data() {
      return {
        year: new Date().getFullYear()
      }
    }
  };
</script>
<style scoped>
a {
  color: #2196f3 !important;
}
</style>


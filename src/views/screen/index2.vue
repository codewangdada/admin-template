<template>
  <div class="container">
    <div class="screen" ref="screen"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const screen = ref()
onMounted(() => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
})
function getScale(w = 1920, h = 1080) {
  const ww = window.innerWidth / w
  const wh = window.innerHeight / h
  return ww < wh ? ww : wh
}
window.onresize = () => {
  screen.value.style.transform = `scale(${getScale()}) translate(-50%,-50%)`
}
</script>
<style scoped lang="scss">
.container {
  width: 100vw;
  height: 100vh;
  background-color: aquamarine;
  .screen {
    position: fixed;
    width: 1920px;
    height: 1080px;
    background: #964949;
    left: 50%;
    top: 50%;
    transform-origin: left top;
  }
}
</style>

<template>
  <div id="app">
    <router-view />
    <AiRobot />
  </div>
</template>

<script setup>
import AiRobot from './components/AiRobot.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
}

#app {
  min-height: 100vh;
}
</style>
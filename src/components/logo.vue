<script setup lang="ts">

</script>

<template>
  <svg  width="35px" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="path1" d="M65.124 107.364L71.874 102.614L78.624 97.8641C87.9573 91.8641 107.124 86.5641 109.124 113.364C111.624 146.864 95.624 170.364 85.624 182.364C75.624 194.364 51.624 217.364 40.124 223.864C28.624 230.364 20.124 230.864 11.624 227.364C3.124 223.864 -9.376 206.364 32.124 189.864C73.624 173.364 110.124 167.364 141.624 143.864C173.124 120.364 176.124 84.3641 134.624 118.364C93.124 152.364 93.624 180.364 91.624 187.364C89.624 194.364 81.124 234.364 99.124 254.864C107.274 264.146 113.477 264.697 119.124 263.364C125.949 261.754 131.963 256.393 139.624 247.364C150.824 234.164 184.291 186.364 199.624 165.364C209.583 152.076 232.6 116.5 245 80.5C260.5 35.5 254.5 -36.8641 225.5 30.5C196.5 97.8641 164 230 161 300C158 370 202.5 421.5 193.5 285C186.3 175.8 166.167 147.833 157 147.5L221 196.5"
           stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

</template>

<style scoped>
.flex-grow {
  flex-grow: 1;
}

@media (prefers-reduced-motion) {
  path {
    animation: none !important;
    stroke-dasharray: unset !important;
  }
}
@keyframes grow {
  0% {
    stroke-dashoffset: 1px;
    stroke-dasharray: 0 1673.24px;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  40% {
    stroke-dasharray: 1673.24
  }
  /* Moving back */
  85% {
    stroke-dasharray: 1673.24px 0;
  }
  95%,
  to {
    stroke-dasharray: 0 1673.24px;
  }
}
.path1 {
  stroke-dashoffset: 0px;
  stroke-dasharray: 1673.24px 0;
  animation: grow 10s ease forwards infinite;
  transform-origin: center;
  stroke: #303030;
  animation-delay: 0s;
}
.dark .path1 {
  stroke: #ffffff;
}
</style>

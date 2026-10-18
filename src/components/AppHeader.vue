<template>
  <header class="w-full fixed z-100 top-0">

    <nav class="h-16">
      <div class="nav h-16" :class="{ top: isTop }">
        <RouterLink class="w-12 h-12  m-5 select-none outline-none pt-1 logo" to="/" title="back to home">
          <!--        <router-link class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none" to="/">-->
          <Logo/>
        </RouterLink>

        <div class="spacer"/>
        <div class="right">
          <RouterLink to="/blogs">
            Blog
          </RouterLink>

<!--          <RouterLink to="/projects">-->
<!--            Projects-->
<!--          </RouterLink>-->


          <div class="divider"></div>
          <RouterLink to="/email">
            <CiMail/>
          </RouterLink>
          <div class="divider"></div>

          <a href="https://github.com/kintong3000" title="Github">
            <SkillIconsGithubDark class="icon1"/>
            <SkillIconsGithubLight class="icon2"/>
          </a>

          <div class="divider"></div>

          <ToggleDarkSwitch/>
        </div>
      </div>
    </nav>


  </header>
  <div class="h-16"></div>
  <button
      title="Scroll to top"
      class="fixed right-3 bottom-3 w-10 h-10 hover:opacity-100 rounded-full
      hover:bg-[#8883] transition duration-300 z-100 print:hidden bg-transparent border-0"
      :class="scroll > 300 ? 'opacity-30 scroll-to-top ' : 'opacity-0! pointer-events-none  scroll-to-top' "
      @click="toTop()"
  >
    <div class="icon-[material-symbols--arrow-upward-rounded] size-[1em]"></div>
  </button>
</template>

<script  lang="ts" setup>

const { y: scroll } = useWindowScroll()
const isTop = computed(() => scroll.value === 0)
function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<style scoped>
.nav .logo{
  opacity: 1;
}
.divider {
  margin-right: 8px;
  margin-left: 8px;
  width: 1px;
  height: 24px;
  background-color: var(--vp-c-divider);
  content: "";
}

.nav {
  padding: 0 32px;
  width: 100%;
  display: grid;
  grid-template-columns: max-content auto max-content;
  box-sizing: border-box;
  border-bottom: 1px solid transparent;
}

.nav > * {
  margin: auto;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}

@media (min-width: 960px) {
  .nav {
    background-color: transparent;
    transition: background-color 0.3s, border-color 0.3s;
  }

  .nav:not(.top) {
    background-color: hsla(0, 0%, 100%, 0.5); /* 亮色模式下的半透明背景 */

    -webkit-backdrop-filter: blur(12px); /* 兼容旧版 Safari */
    backdrop-filter: blur(12px); /* 关键属性，数值越大越模糊 */

    border-bottom-color: var(--vp-c-divider);
  }
}

.dark .nav:not(.top) {
  background-color: rgba(30, 30, 30, 0.5); /* 暗色模式下的半透明背景 */
}


html:not(.dark) .icon2 {
  display: none;
}

.dark .icon1 {
  display: none;
}



</style>

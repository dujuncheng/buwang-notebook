<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
      name: 'nana-notebook',
      created () {
          this.$store.dispatch('LISTEN_FOR_EDIT')
          this.$store.dispatch('LISTEN_FOR_PARAGRAPH_INLINE_STYLE')
      }
  }
</script>

<style>
    p {
        margin: 0;
        padding: 0;
    }
    input {
        outline: none;
        border: 0px;
    }
    html body {
        margin: 0;
        padding: 0;
        width: 100vw;
        height: 100vh;
        font: caption;
        overflow: hidden;
    }
    #app {
        width: 100%;
        height: 100%;
    }
    :not(input):not(textarea),
    :not(input):not(textarea)::after,
    :not(input):not(textarea)::before {
        -webkit-user-select: none;
        user-select: none;
    }
    input, button, textarea, :focus {
        outline: none;
    }
</style>

<template>
  <button :class="[props.color, theme,]">
    <span style="display: inline-flex;line-height: 40px;align-items: center">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
import {inject} from "vue";

const theme = inject("theme");
const props = defineProps({
  color: {
    type: String,
    default: 'blue'
  },
  active: {
    type: Boolean,
    default: false
  }
})

</script>

<style scoped>
  button {
    height: 40px;
    border-radius: 40px;
    border: none;
    filter: brightness(1);
    transition: all .2s cubic-bezier(.4, 0, .2, 1), color .3s cubic-bezier(.4, 0, .2, 1);
    font-family: "PingFang SC",serif;
    font-size: 15px;
  }
  .dark.blue {
    background: #374450;
    color: rgb(112, 192, 232);
  }
  .dark.blue:hover, .dark.blue:focus {
    background: #41505e;
  }

  .light.blue {
    background: #dbebfd;
    color: #2080f0;
  }
  .light.blue:hover, .light.blue:focus {
    background: #cee3fc;
  }


  .dark.green {
    background: #243936;
    color: rgb(99, 226, 183);
  }

  .dark.green:hover, .dark.green:focus {
    background: #2a4a3e;
  }

  .light.green {
    background: #d9f0e4;
    color: rgb(31, 166, 97);
  }
  .light.green:hover, .light.green:focus {
    background: #c6e5d9;
  }

  .dark:active {
  /*  点击时 糊一个遮罩*/
    filter: brightness(0.9);
  }
  .light:active {
    filter: brightness(.93);
  }
  button:focus {
    outline: none;
  }
</style>

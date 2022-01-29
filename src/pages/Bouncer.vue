<template>

</template>

<script setup>
import {onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  router.go()
});
</script>

<style scoped>

</style>

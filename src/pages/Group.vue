<template>
  <GroupCard v-if="group_id" class="group-card" :group_id="group_id"/>
</template>

<script setup>
import GroupCard from "../components/GroupCard.vue";
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";

const route = useRoute();
const group_id = ref(undefined);

onMounted(() => {
  group_id.value = route.params.id;
})

</script>

<style scoped>
  .group-card {
    max-width: 77rem;
    margin: 30px auto;
  }
</style>

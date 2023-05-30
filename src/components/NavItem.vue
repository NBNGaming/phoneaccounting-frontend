<script>
import {defineComponent} from 'vue';

export default defineComponent({
  props: {
    routeName: {
      type: String,
      required: true,
    },
  },
  computed: {
    isActive() {
      return this.$route.name === this.routeName;
    },
  },
});
</script>

<template>
  <v-list-item :to="{ name: routeName }" :active="isActive"></v-list-item>
</template>

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
  <v-btn :to="{ name: routeName }" :active="isActive">
    <slot></slot>
  </v-btn>
</template>

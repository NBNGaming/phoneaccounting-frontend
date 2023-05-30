<script>
import {defineComponent} from 'vue';
import NavButton from '@/components/NavButton.vue';
import NavItem from '@/components/NavItem.vue';

export default defineComponent({
  components: {
    NavItem,
    NavButton,
  },
  data() {
    return {
      drawer: false,
      items: [
        {
          title: 'Устройства',
          value: 'Devices',
        },
        {
          title: 'Уведомления',
          value: 'Notifications'
        },
      ],
    };
  },
  computed: {
    mobile() {
      return this.$vuetify.display.mobile;
    },
  },
});
</script>

<template>
  <v-app-bar border="b" flat>
    <v-app-bar-nav-icon v-if="mobile" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    <v-app-bar-title>Phone Accounting</v-app-bar-title>
    <nav-button v-if="!mobile" v-for="item in items" :route-name="item.value">
      {{ item.title }}
    </nav-button>
  </v-app-bar>

  <v-navigation-drawer v-if="mobile" v-model="drawer" temporary>
    <v-list>
      <nav-item v-for="item in items" :title="item.title" :route-name="item.value"></nav-item>
    </v-list>
  </v-navigation-drawer>
</template>

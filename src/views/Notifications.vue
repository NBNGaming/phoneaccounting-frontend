<script>
import {defineComponent} from 'vue';
import axios from 'axios';

export default defineComponent({
  data() {
    return {
      search: '',
      notifications: [],
      headers: [
        {title: 'Приложение', key: 'packageName'},
        {title: 'Заголовок', key: 'title'},
        {
          title: 'Текст',
          key: 'notificationText',
          sortable: false,
        },
      ],
      polling: null,
    };
  },
  created() {
    this.fetchData();
    this.polling = setInterval(() => {
      this.fetchData();
    }, 3000);
  },
  beforeUnmount() {
    clearInterval(this.polling);
  },
  methods: {
    fetchData() {
      axios.get('/notifications/all').then(response => {
        this.notifications = response.data;
      }).catch(error => {
        console.error(error);
      });
    },
  },
});
</script>

<template>
  <v-text-field
    class="mb-4"
    v-model="search"
    prepend-icon="mdi-magnify"
    label="Поиск"
    single-line
    hide-details
  ></v-text-field>
  <v-data-table
    :headers="headers"
    :items="notifications"
    :search="search"
    :sort-by="[{ key: 'notificationId', order: 'desc' }]"
    item-value="notificationId"
    class="elevation-1"
  >
    <template v-slot:no-data>
      Загрузка...
    </template>
  </v-data-table>
</template>

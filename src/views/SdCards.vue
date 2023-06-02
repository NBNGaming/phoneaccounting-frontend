<script>
import axios from 'axios';
import {defineComponent} from 'vue';

export default defineComponent({
  data() {
    return {
      search: '',
      sdcards: [],
      headers: [
        {title: 'Имя', key: 'name'},
        {
          title: 'Серийный номер',
          key: 'serialNumber',
          sortable: false,
        },
        {title: 'Размер', key: 'size'},
        {title: 'В устройстве', key: 'inPhone'},
        {
          title: 'Действия',
          key: 'actions',
          sortable: false,
        },
      ],
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        name: '',
        serialNumber: '',
        size: '',
        inPhone: '',
      },
      defaultItem: {
        name: '',
        serialNumber: '',
        size: '',
        inPhone: '',
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get('/sdcards/all').then(response => {
        this.sdcards = response.data;
      }).catch(error => {
        console.error(error);
      });
    },

    // editItem(item) {
    //   this.editedIndex = this.sdcards.indexOf(item);
    //   this.editedItem = Object.assign({}, item);
    //   this.dialog = true;
    // },

    deleteItem(item) {
      this.editedIndex = this.sdcards.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      axios.delete('/sdcards/delete/sdcard/' + this.sdcards[this.editedIndex].sdcardId).then(() => {
        this.sdcards.splice(this.editedIndex, 1);
        this.closeDelete();
      }).catch(error => {
        console.error(error);
      });
    },

    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {
      if (this.editedIndex > -1) {
        // axios.put('/sdcards/update/sdcard/' + this.sdcards[this.editedIndex].sdcardId, this.editedItem.locked, {
        //   headers: {'Content-Type': 'text/plain'},
        // }).then(() => {
        //   this.sdcards[this.editedIndex].locked = this.editedItem.locked;
        //   this.close();
        // }).catch(error => {
        //   console.error(error);
        // });
      } else {
        axios.post('/sdcards/add/sdcard', this.editedItem).then(() => {
          this.close();
          this.fetchData();
        }).catch(error => {
          console.error(error);
        });
      }
    },
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? 'Новая запись' : 'Редактирование записи';
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.closeDelete();
    },
  },
});
</script>

<template>
  <div class="d-flex mb-4 align-center">
    <v-text-field
      v-model="search"
      prepend-icon="mdi-magnify"
      label="Поиск"
      single-line
      hide-details
    ></v-text-field>
    <div class="flex-grow-1"></div>
    <v-btn @click="dialog = !dialog">Добавить</v-btn>
  </div>

  <v-data-table
    :headers="headers"
    :items="sdcards"
    :search="search"
    item-value="sdcardId"
    class="elevation-1"
  >
    <template v-slot:item.inPhone="{ item }">
      {{ item.raw.inPhone === '1' ? 'Да' : (item.raw.inPhone === '-1' ? 'Нет' : item.raw.inPhone) }}
    </template>
    <template v-slot:item.actions="{ item }">
<!--      <v-icon-->
<!--        size="small"-->
<!--        class="me-2"-->
<!--        title="Изменить статус блокировки"-->
<!--        @click="editItem(item.raw)"-->
<!--      >-->
<!--        mdi-lock-->
<!--      </v-icon>-->
      <v-icon
        size="small"
        title="Удалить"
        @click="deleteItem(item.raw)"
      >
        mdi-delete
      </v-icon>
    </template>
    <template v-slot:no-data>
      Загрузка...
    </template>
  </v-data-table>

  <v-dialog v-model="dialog" max-width="1000px">
    <v-card>
      <v-card-title class="text-h5">{{ formTitle }}</v-card-title>

      <v-card-text>
        <v-container v-show="dialog">
          <v-text-field
            v-model="editedItem.locked"
            label="Заблокирована"
            v-if="editedIndex > -1"
          ></v-text-field>
          <v-row v-else>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.name"
                label="Имя"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.serialNumber"
                label="Серийный номер"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.size"
                label="Размер"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.inPhone"
                label="В устройстве"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogDelete" max-width="500px">
    <v-card>
      <v-card-title class="text-h5">Удалить запись?</v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="closeDelete">Отмена</v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="deleteItemConfirm">Удалить</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

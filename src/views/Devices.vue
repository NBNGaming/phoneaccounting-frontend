<script>
import axios from 'axios';
import {defineComponent} from 'vue';

export default defineComponent({
  data() {
    return {
      search: '',
      phones: [],
      headers: [
        {title: 'Производитель', key: 'manufacturer'},
        {title: 'Модель', key: 'model'},
        {
          title: 'SIM',
          key: 'simcards',
          sortable: false,
        },
        {
          title: 'SD',
          key: 'sdcard',
          sortable: false,
        },
        {title: 'У кого', key: 'user'},
        {title: 'Версия ОС', key: 'osVersion'},
        {title: 'Прошивка', key: 'firmware'},
        {title: 'Архитектуры', key: 'supportedArch'},
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
        model: '',
        manufacturer: '',
        osVersion: '',
        firmware: '',
        supportedArch: '',
        user: '',
        simSlotsCount: 0,
        simcard1: '',
        simcard2: '',
        sdSlotsCount: 0,
        sdcard: '',
      },
      defaultItem: {
        model: '',
        manufacturer: '',
        osVersion: '',
        firmware: '',
        supportedArch: '',
        user: '',
        simSlotsCount: 0,
        simcard1: '',
        simcard2: '',
        sdSlotsCount: 0,
        sdcard: '',
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get('/phones/all').then(response => {
        response.data.forEach(phone => {
          phone.simcards = [phone.simcard1, phone.simcard2];
        });
        this.phones = response.data;
      }).catch(error => {
        console.error(error);
      });
    },

    editItem(item) {
      this.editedIndex = this.phones.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.phones.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      axios.delete('/phones/delete/phone/' + this.phones[this.editedIndex].phoneId).then(() => {
        this.phones.splice(this.editedIndex, 1);
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
        axios.put('/phones/update/user/' + this.phones[this.editedIndex].phoneId, this.editedItem.user, {
          headers: {'Content-Type': 'text/plain'},
        }).then(() => {
          this.phones[this.editedIndex].user = this.editedItem.user;
          this.close();
        }).catch(error => {
          console.error(error);
        });
      } else {
        axios.post('/phones/add/phone', this.editedItem).then(() => {
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
    :items="phones"
    :search="search"
    item-value="phoneId"
    class="elevation-1"
  >
    <template v-slot:item.simcards="{ item }">
      <div class="py-2" v-if="item.raw.simSlotsCount > 0">
        <v-chip class="mb-2 me-md-2 mb-md-0" v-if="item.raw.simSlotsCount >= 1">
          <v-icon size="small" class="me-2">mdi-sim</v-icon>
          {{ item.raw.simcard1 }}
        </v-chip>
        <v-chip v-if="item.raw.simSlotsCount >= 2">
          <v-icon size="small" class="me-2">mdi-sim</v-icon>
          {{ item.raw.simcard2 }}
        </v-chip>
      </div>
      <span v-else>&mdash;</span>
    </template>
    <template v-slot:item.sdcard="{ item }">
      <v-chip v-if="item.raw.sdSlotsCount > 0">
        <v-icon size="small" class="me-2">mdi-sd</v-icon>
        {{ item.raw.sdcard }}
      </v-chip>
      <span v-else>&mdash;</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        title="Изменить пользователя"
        @click="editItem(item.raw)"
      >
        mdi-account
      </v-icon>
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
            v-model="editedItem.user"
            label="У кого"
            v-if="editedIndex > -1"
          ></v-text-field>
          <v-row v-else>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.manufacturer"
                label="Производитель"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.model"
                label="Модель"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.user"
                label="У кого"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.osVersion"
                label="Версия ОС"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.firmware"
                label="Прошивка"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.supportedArch"
                label="Архитектуры"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model.number="editedItem.simSlotsCount"
                label="Количество лотков для SIM"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-show="editedItem.simSlotsCount >= 1">
              <v-text-field
                v-model.number="editedItem.simcard1"
                label="SIM 1"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-show="editedItem.simSlotsCount >= 2">
              <v-text-field
                v-model.number="editedItem.simcard2"
                label="SIM 2"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model.number="editedItem.sdSlotsCount"
                label="Количество лотков для SD"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-show="editedItem.sdSlotsCount > 0">
              <v-text-field
                v-model="editedItem.sdcard"
                label="SD"
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

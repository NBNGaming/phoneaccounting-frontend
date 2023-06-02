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
          key: 'sdcard_serial_number',
          sortable: false,
        },
        {title: 'У кого', key: 'user'},
        {title: 'Версия ОС', key: 'converted_os_version'},
        {title: 'Версия API', key: 'os_version'},
        {title: 'Прошивка', key: 'firmware'},
        {title: 'Архитектуры', key: 'supported_arch'},
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
        os_version: '',
        converted_os_version: '',
        firmware: '',
        supported_arch: '',
        user: '',
        sim_slots_count: 0,
        simcard1: '',
        simcard2: '',
        sd_slots_count: 0,
        sdcard_serial_number: '',
      },
      defaultItem: {
        model: '',
        manufacturer: '',
        os_version: '',
        converted_os_version: '',
        firmware: '',
        supported_arch: '',
        user: '',
        sim_slots_count: 0,
        simcard1: '',
        simcard2: '',
        sd_slots_count: 0,
        sdcard_serial_number: '',
      },
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      axios.get('/phones/').then(response => {
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
      axios.delete(`/phones/${this.phones[this.editedIndex].id}/`).then(() => {
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
        if (this.editedItem.sim_slots_count < 1) {
          this.editedItem.simcard1 = '';
          this.editedItem.simcard2 = '';
        } else if (this.editedItem.sim_slots_count < 2) {
          this.editedItem.simcard2 = '';
        }
        if (this.editedItem.sd_slots_count < 1) {
          this.editedItem.sdcard_serial_number = '';
        }
        axios.put(`/phones/${this.phones[this.editedIndex].id}/`, this.editedItem).then(() => {
          Object.assign(this.phones[this.editedIndex], this.editedItem);
          this.close();
        }).catch(error => {
          console.error(error);
        });
      } else {
        axios.post('/phones/', this.editedItem).then(() => {
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
    item-value="id"
    class="elevation-1"
  >
    <template v-slot:item.simcards="{ item }">
      <div class="py-2" v-if="item.raw.sim_slots_count > 0">
        <v-chip class="mb-2" v-if="item.raw.sim_slots_count >= 1">
          <v-icon size="small" class="me-2">mdi-sim</v-icon>
          {{ item.raw.simcard1 }}
        </v-chip>
        <br>
        <v-chip v-if="item.raw.sim_slots_count >= 2">
          <v-icon size="small" class="me-2">mdi-sim</v-icon>
          {{ item.raw.simcard2 }}
        </v-chip>
      </div>
      <span v-else>&mdash;</span>
    </template>
    <template v-slot:item.sdcard_serial_number="{ item }">
      <v-chip v-if="item.raw.sd_slots_count > 0">
        <v-icon size="small" class="me-2">mdi-sd</v-icon>
        {{ item.raw.sdcard_serial_number }}
      </v-chip>
      <span v-else>&mdash;</span>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon
        size="small"
        class="me-2"
        title="Редактировать"
        @click="editItem(item.raw)"
      >
        mdi-pencil
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
          <v-row>
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
                v-model="editedItem.converted_os_version"
                label="Версия ОС"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model="editedItem.os_version"
                label="Версия API"
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
                v-model="editedItem.supported_arch"
                label="Архитектуры"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model.number="editedItem.sim_slots_count"
                label="Количество лотков для SIM"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-show="editedItem.sim_slots_count >= 1">
              <v-text-field
                v-model.number="editedItem.simcard1"
                label="SIM 1"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-show="editedItem.sim_slots_count >= 2">
              <v-text-field
                v-model.number="editedItem.simcard2"
                label="SIM 2"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                v-model.number="editedItem.sd_slots_count"
                label="Количество лотков для SD"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4" v-show="editedItem.sd_slots_count > 0">
              <v-text-field
                v-model="editedItem.sdcard_serial_number"
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

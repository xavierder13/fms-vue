<template>
  <v-card>
    <v-card-title class="my-0">
      <div class="d-flex align-center py-2">

        <!-- LEFT SIDE -->
        <div class="d-flex align-center">
          <span class="text-h6 font-weight-medium mr-2">
            {{ title }}
          </span>
          <v-divider opacity="1" thickness="1" gradient vertical></v-divider>
        </div>

        <!-- RIGHT SIDE (Actions) -->
        <div class="d-flex align-center ga-2">
          <!-- Refresh -->
          <v-tooltip text="Refresh" location="top">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"  
                icon="mdi-refresh" 
                size="small" 
                @click="getData()" 
                color="purple" 
                class="ml-2"
              ></v-btn>
            </template>
          </v-tooltip>
          
          <!-- Add -->
            <v-tooltip text="Create New" location="top">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props"   
                icon="mdi-plus" 
                size="small" 
                @click="createData()" 
                color="primary"
                ></v-btn>
            </template>
          </v-tooltip>
        </div>
      </div>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="data"
      :search="search"
      :loading="loading"
      loading-text="Loading... Please wait"
    > 
      <template #top>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          single-line
          density="compact"
          hide-details=""
          ></v-text-field>
      </template>

      <!-- Forward all slots from parent -->
      <template v-for="(slotFn, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps" />
      </template>

      <!-- <template #item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          color="green"
          @click="editData(item)"
          v-if="edit_permission"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          color="red"
          @click="deleteData(item)"
          v-if="delete_permission"
        >
          mdi-delete
        </v-icon>
      </template> -->
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  props: [
    'data',
    'headers',
    'title',
    'edit_permission', 
    'delete_permission',
    'loading',
  ],
  data() {
    return {
      search: "",
    }
  },
  methods: {
    getData() {
      this.$emit('getData');
    },
    createData() {
      this.$emit('createData');
    },
    editData(item) {
      this.$emit('editData', item);
    },
    deleteData(item) {
      this.$emit('deleteData', item);
    }
  }
}
</script>
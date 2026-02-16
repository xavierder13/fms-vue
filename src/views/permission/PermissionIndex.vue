<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="flex column">
    <div id="_wrapper" class="pa-5">
      <v-main>
        <v-breadcrumbs :items="items">
          <template #item="{ item }">
            <v-breadcrumbs-item :to="item.link" :disabled="item.disabled">
              {{ item.text.toUpperCase() }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>

        <!-- Data Table -->
        <MainDataTable
          title="Permission List"
          :edit_permission="hasPermission('permission-edit')"
          :delete_permission="hasPermission('permission-delete')"
          :data="permissions"
          :headers="headers"
          :loading="loading"
          @getData="getPermission"
          @createData="dialog = true"
          @editData="editPermission"
          @deleteData="showConfirmAlert"
        >
        </MainDataTable>

        <v-dialog v-model="dialog" max-width="500px" persistent>
          <v-card>
            <v-card-title class="d-flex align-center bg-red-darken-4">
              <span class="headline">{{ formTitle }}</span>
              <v-spacer></v-spacer>
              <v-icon
                @click="close()"
                class="cursor-pointer"
                color="#f8a1a1"
              >
                mdi-close-circle
              </v-icon>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col>
                    <v-text-field
                      name="permission"
                      v-model="editedItem.name"
                      label="Permission"
                      required
                      :error-messages="permissionErrors + permissionError.name"
                      @input="vldtr.editedItem.name.$touch() + (permissionError.name = [])"
                      @blur="vldtr.editedItem.name.$touch()"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-divider class="mb-3 mt-0"></v-divider>
            <v-card-actions class="pa-0 pb-3">
              <v-spacer></v-spacer>
              <v-btn class="bg-grey-lighten-2" @click="close">
                Cancel
              </v-btn>
              <v-btn @click="save" class="bg-primary mr-4" :disabled="disabled">
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-main>
    </div>
  </div>
</template>
<script>

import axiosMain from "../../axiosMain";
import { required } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core';
import { mapGetters } from "vuex";
import MainDataTable from "../components/MainDataTable.vue";

export default {
  components: {
    MainDataTable,
  },
  data() {
    return {
      search: "",
      headers: [
        { title: "Permission", key: "name" },
        { title: "Actions", key: "actions", sortable: false, width: "90px" },
      ],
      disabled: false,
      dialog: false,
      permissions: [],
      editedIndex: -1,
      editedItem: {
        name: "",
      },
      defaultItem: {
        name: "",
      },
      items: [
        {
          text: "Home",
          disabled: false,
          link: "/",
        },
        {
          text: "Permission Lists",
          disabled: true,
        },
      ],
      loading: true,
      permissionError: {
        name: [],
      },
      vldtr: useVuelidate(),
    };
  },
  validations() {
    return {
      editedItem: {
        name: { required },
      },
    }
  },
  methods: {
    getPermission() {
      this.loading = true;
      axiosMain.get("/api/permission/index").then(
        (response) => {
          this.permissions = response.data.permissions;
          this.loading = false;
        },
        (error) => {
          this.isUnauthorized(error);
        }
      );
    },

    editPermission(item) {
      this.editedIndex = this.permissions.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deletePermission(permissionid) {
      const data = { permissionid: permissionid };
      this.loading = true;
      axiosMain.post("/api/permission/delete", data).then(
        (response) => {
          if (response.data.success) {
            // send data to Sockot.IO Server
            // this.$socket.emit("sendData", { action: "permission-delete" });
          }
          this.loading = false;
        },
        (error) => {
          this.isUnauthorized(error);
        }
      );
    },

    showAlert() {
      this.$swal({
        position: "center",
        icon: "success",
        title: "Record has been saved",
        showConfirmButton: false,
        timer: 2500,
      });
    },

    showConfirmAlert(item) {
      this.$swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Delete record!",
      }).then((result) => {
        // <--

        if (result.value) {
          // <-- if confirmed

          const permissionid = item.id;
          const index = this.permissions.indexOf(item);

          //Call delete Permission function
          this.deletePermission(permissionid);

          //Remove item from array permissions
          this.permissions.splice(index, 1);

          this.$swal({
            position: "center",
            icon: "success",
            title: "Record has been deleted",
            showConfirmButton: false,
            timer: 2500,
          });
        }
      });
    },

    close() {
      this.dialog = false;
      this.clear();
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

    save() {

      this.vldtr.$touch();
      this.permissionError = {
        name: []
      };

      if (!this.vldtr.$error) {
        this.disabled = true;

        if (this.editedIndex > -1) {
          const data = this.editedItem;
          const permissionid = this.editedItem.id;

          axiosMain.post("/api/permission/update/" + permissionid, data).then(
            (response) => {
              if (response.data.success) {
                // send data to Sockot.IO Server
                // this.$socket.emit("sendData", { action: "permission-edit" });

                Object.assign(
                  this.permissions[this.editedIndex],
                  this.editedItem
                );
                this.showAlert();
                this.close();

              }
              else
              {
                let errors = response.data;
                let errorNames = Object.keys(response.data);

                errorNames.forEach(value => {
                  this.permissionError[value].push(errors[value]);
                });
              }

              this.disabled = false;
            },
            (error) => {
              this.isUnauthorized(error);
              this.disabled = false;
            }
          );
        } else {
          const data = this.editedItem;

          axiosMain.post("/api/permission/store", data).then(
            (response) => {
              
              if (response.data.success) {
                // send data to Sockot.IO Server
                // this.$socket.emit("sendData", { action: "permission-create" });

                this.showAlert();
                this.close();

                //push recently added data from database
                this.permissions.push(response.data.permission);
              }
              else
              { 
                let errors = response.data;
                let errorNames = Object.keys(response.data);

                errorNames.forEach(value => {
                  this.permissionError[value].push(errors[value]);
                });
                
              }
              this.disabled = false;
            },
            (error) => {
              this.isUnauthorized(error);
              this.disabled = false;
            }
          );
        }
      }
    },

    clear() {
      this.vldtr.$reset();
      this.editedItem.name = "";
      this.permissionError = {
        name: []
      };
    },
    isUnauthorized(error) {
      // if unauthenticated (401)
      if (error.response.status == "401") {
        this.$router.push({ name: "unauthorize" });
      }
    }, 
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Permission" : "Edit Permission";
    },
    permissionErrors() {
      const field = this.vldtr.editedItem.name;
      if(!field.$dirty) return [];

      return field.$errors.map(err => {
        if(err.$validator == 'required') return 'Permission is required'
      })
    },
    ...mapGetters("auth", ["hasRole", "hasPermission"]),
  },
  mounted() {
    this.getPermission();
  },
};
</script>
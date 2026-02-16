<template>
  <div class="flex column">
    <div id="_wrapper" class="pa-5">
      <v-main>
        <v-breadcrumbs :items="items">
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item :to="item.link" :disabled="item.disabled">
              {{ item.text.toUpperCase() }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
         <!-- Data Table -->
        <MainDataTable
          title="Role List"
          :data="roles"
          :headers="headers"
          :loading="loading"
          @getData="getRole"
          @createData="dialog = true"
        >
          <template #item.actions="{ item }">
            <v-icon
              small
              class="mr-1"
              color="primary"
              @click="editRole(item)"
              v-if="item.name == 'Administrator'"
            >
              mdi-eye
            </v-icon>
            <template v-if="item.name != 'Administrator'">
              <v-icon
                small
                class="mr-1"
                color="green"
                @click="editRole(item)"
                v-if="hasPermission('role-edit')"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                color="red"
                @click="showConfirmAlert(item)"
                v-if="hasPermission('role-delete')"
              >
                mdi-delete
              </v-icon>
            </template>
          </template>
        </MainDataTable>
        <v-dialog v-model="dialog" max-width="1200px" persistent>
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
            <v-card-text height="50vh">
              <v-row class="mt-2">
                <v-col class="my-0 py-0">
                  <v-text-field
                    name="name"
                    v-model="editedItem.name"
                    :error-messages="roleErrors + roleError.name"
                    label="Role"
                    @input=" vldtr.editedItem.name.$touch(); (roleError.name = [])"
                    @blur="vldtr.editedItem.name.$touch()"
                    :readonly="editedItem.id == 1 ? true : false"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col class="pt-0">
                  <v-data-table
                    v-model="editedItem.permissions"
                    :headers="header_permissions"
                    :items="filteredPermissions"
                    :search="search_permission"
                    item-key="name"
                    show-select
                    height="calc(66vh - 135px)"
                    fixed-header
                    class="elevation-1"
                  >
                    <template #top>
                      <div class="d-flex align-center gap-4 px-4">
                        <v-switch v-model="switchFilter" hide-details inset color="primary">
                          <template #label>
                            <v-chip :color="switchFilter ? 'primary' : 'secondary'">Filter Selected Permission</v-chip>
                          </template>
                        </v-switch>
                        <v-divider class="mx-2" opacity="1" thickness="1" gradient vertical></v-divider>
                        <v-text-field v-model="search_permission" prepend-inner-icon="mdi-magnify" label="Search" single-line density="compact" hide-details />
                      </div>
                    </template>
                    <template #header.data-table-select="{ }">
                      <v-checkbox
                        v-model="selectAll"
                        color="primary"
                        :indeterminate="indeterminate"
                        density="compact"
                        hide-details=""
                        class="ml-2"
                        :readonly="editedItem.id == 1"
                      />
                    </template>
                    <template #header.name="{ }">
                      <span class="font-weight-bold">Permission</span>
                      ( <span class="text-red font-weight-bold">{{ editedItem.permissions.length }}</span> )
                    </template>
                    <template #item="{ item, isSelected, toggle }">
                      <tr :class="{ 'bg-red-lighten-5': editedItem.permissions.includes(item.name) }">
                        <!-- Custom checkbox -->
                        <td>
                          <v-checkbox
                            v-model="editedItem.permissions"
                            :value="item.name"
                            color="primary"
                            hide-details
                            density="compact"
                            class="ml-0 pl-0"
                          />
                        </td>
                        <!-- Other columns -->
                        <td>{{ item.name }}</td>
                      </tr>
                    </template>
                  </v-data-table>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider class="mb-3 mt-0"></v-divider>
            <v-card-actions class="pa-0">
              <v-spacer></v-spacer>
              <v-btn class="bg-grey-lighten-2" @click="close()" :class="editedItem.id != 1 ? 'mb-3' : 'mb-3 mr-4'">
                Cancel
              </v-btn>
              <v-btn
                @click="saveData()"
                :disabled="disabled"
                class="bg-primary mb-3 mr-4"
                v-if="editedItem.id != 1"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-main>
    </div>
  </div>
</template>
<style>
.permission-table table {
  width: 100%;
}

.permission-table thead,
.permission-table tbody,
.permission-table tr,
.permission-table td,
.permission-table th {
  display: block;
}

.permission-table tr::after {
  content: '';
  display: block;
  visibility: hidden;
  clear: both;
}

.permission-table tbody {
  height: calc(65vh - 135px);
  overflow-y: auto;
}

.permission-table tbody td,
.permission-table thead th {
  float: left;
}
</style>
<script>

import axiosMain from "../../axiosMain";
import { required } from '@vuelidate/validators';
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
        { title: "Role", key: "name" },
        { title: "Actions", key: "actions", sortable: false, width: "80px" },
      ],
      header_permissions: [
        { title: "Permision", key: "name" },
      ],
      disabled: false,
      dialog: false,
      permissions: [],
      roles: [],
      editedIndex: -1,
      editedItem: {
        name: "",
        permissions: [],
      },
      defaultItem: {
        name: "",
        permissions: [],
      },
      items: [
        {
          text: "Home",
          disabled: false,
          link: "/",
        },
        {
          text: "Roles List",
          disabled: true,
        },
      ],
      loading: true,
      roleError: {
        name: [],
        permissions: [],
      },
      search_permission: "",
      vldtr: useVuelidate(),
      selectAll: false,
      indeterminate: false,
      permissionComponentKey: -1,
      switchFilter: false,
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
    getRole() {
      this.loading = true;
      axiosMain.get("/api/role/index").then(
        (response) => {
          this.roles = response.data.roles;
          this.permissions = response.data.permissions;
          this.loading = false;
        },
        (error) => {
          this.isUnauthorized(error);
        }
      );
    },

    saveData() {
      this.vldtr.$touch();
      this.roleError = {
        name: [],
        permissions: []
      };

      if (!this.vldtr.$error) {
        this.disabled = true;
        
        const data = { name: this.editedItem.name, permission: this.editedItem.permissions};
        const roleid = this.editedItem.id;
        let url = this.editedIndex == -1 ? 'store' : `update/${roleid}`;

        axiosMain.post(`/api/role/${url}`, data).then(
          (response) => {
            if (response.data.success) {
              this.showAlert();
              this.getRole();
              this.close();
            }
            else
            {
              let errors = response.data;
              let errorNames = Object.keys(response.data);

              errorNames.forEach(value => {
                this.roleError[value].push(errors[value]);
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
    },

    addRole() {
      this.dialog = true;
    },

    editRole(item) {
      this.editedIndex = this.roles.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.permissions = item.permissions.map(value => value.name);
      this.dialog = true;
    },

    deleteRole(roleid) {
      const data = { roleid: roleid };
      this.loading = true;
      axiosMain.post("/api/role/delete", data).then(
        (response) => {
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

          const roleid = item.id;
          const index = this.roles.indexOf(item);

          //Call delete Role function
          this.deleteRole(roleid);

          //Remove item from array permissions
          this.roles.splice(index, 1);

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

    clear() {
      this.vldtr.$reset();
      this.editedItem.name = Object.assign({}, this.defaultItem);
      this.roleError = {
        name: [],
        permissions: [],
      }
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
      return this.editedIndex === -1
        ? "New Role"
        : this.editedItem.id === 1
        ? "Role"
        : "Edit Role";
    },
    roleErrors() {
      const field = this.vldtr.editedItem.name;
      if(!field.$dirty) return [];

      return field.$errors.map(err => {
        if(err.$validator == 'required') return 'Role is required';
      })
    },
    filteredPermissions() {
      let filteredPermissions = this.permissions;

      if(this.switchFilter)
      {
        filteredPermissions = this.permissions.filter(permission =>
          this.editedItem.permissions.some(p => p === permission.name)
        );
      }

      // return default list this.roles if search is null;
      return filteredPermissions;
    
    },
    ...mapGetters("auth", ["hasRole", "hasPermission"]),
  },
  watch: {
    selectAll()
    {
      let permissions = this.permissions.map(value => value.name);

      if(this.selectAll)
      { 
        this.editedItem.permissions = permissions;
      }
      else if(!this.indeterminate && !this.selectAll)
      {
        this.editedItem.permissions = [];
      }
    },
    "editedItem.permissions"() {

      if(this.editedItem.permissions.length == this.permissions.length && this.editedItem.permissions.length != 0)
      {
        this.selectAll = true;
        this.indeterminate = false;
      }
      else if(this.editedItem.permissions.length > 0 && this.editedItem.permissions.length != this.roles.length)
      {
        this.indeterminate = true;
        this.selectAll = false;
      }
    },
  },
  mounted() {
    this.getRole();
  },
};
</script>
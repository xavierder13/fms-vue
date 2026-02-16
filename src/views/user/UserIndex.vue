<!-- eslint-disable vue/valid-v-slot -->
<template>
  <div class="flex column">
    <div id="_wrapper" class="pa-5">
      <v-overlay :absolute="absolute" :value="overlay">
        <v-progress-circular
          :size="70"
          :width="7"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </v-overlay>
      <v-main>
        <v-breadcrumbs :items="items">
          <template #item="{ item }">
            <v-breadcrumbs-item :to="item.link" :disabled="item.disabled">
              {{ item.text.toUpperCase() }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
        
        <!-- Card with Title and Data Table -->
        <MainDataTable
          title="User Accounts"
          :data="users"
          :headers="headers"
          :loading="loading"
          @getData="getUser"
          @createData="dialog = true"
        >
          <template #item.roles="{ item }">
            <span v-for="(role, key) in item.roles" :key="key">
              <v-chip
                small
                class="bg-red-darken-4"
                v-if="key == 0"
                @click="viewRolesBreakdown(item.roles)"
              >
                {{ role.name }}
              </v-chip>

              <v-chip
                class="bg-red-lighten-5"
                ctext-color="#f8a1a1"
                small
                v-if="key == 0 && item.roles.length > 1"
                @click="viewRolesBreakdown(item.roles)"
              >
                {{ "+" }}
                {{
                  key == 0 && item.roles.length > 1
                    ? item.roles.length - 1
                    : role.name
                }}
                {{ "others" }}
              </v-chip>
            </span>
          </template>
          <template #item.actions="{ item }">
            <!-- Remove actions button if id == 1 (Administrator user) -->
            <template v-if="item.id != 1">
              <v-icon
                small
                class="mr-2"
                color="green"
                @click="editUser(item)"
                v-if="hasPermission('user-edit')"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                small
                color="red"
                @click="showConfirmAlert(item)"
                v-if="hasPermission('user-delete')"
              >
                mdi-delete
              </v-icon>
            </template>
            <v-icon
              small
              color="info"
              @click="editUser(item)"
              v-if="item.id == 1"
            >
              mdi-eye
            </v-icon>
          </template>
        </MainDataTable>
        <v-dialog v-model="dialog" max-width="1500px" persistent>
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
              <v-row  >
                <v-col>
                  <v-row class="mt-2">
                    <v-col class="my-0 py-0">
                      <v-text-field
                        name="name"
                        v-model="editedItem.name"
                        :error-messages="nameErrors + userError.name"
                        label="Full Name"
                        @input="
                          vldtr.editedItem.name.$touch() +
                            (userError.name = [])
                        "
                        @blur="vldtr.editedItem.name.$touch()"
                        :readonly="editedItem.id == 1 ? true : false"
                      ></v-text-field>
                    </v-col>
                    <v-col class="my-0 py-0">
                      <v-text-field
                        name="email"
                        v-model="editedItem.email"
                        :error-messages="emailErrors + userError.email"
                        label="E-mail"
                        @input="
                          vldtr.editedItem.email.$touch() +
                            (userError.email = [])
                        "
                        @blur="vldtr.editedItem.email.$touch()"
                        :readonly="
                          emailReadonly || editedItem.id == 1
                            ? true
                            : false
                        "
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="my-0 py-0">
                      <v-text-field
                        name="password"
                        v-model="password"
                        :error-messages="
                          passwordErrors + userError.password
                        "
                        label="Password"
                        required
                        @input="
                          vldtr.password.$touch() + (userError.password = [])
                        "
                        @blur="vldtr.password.$touch()"
                        @keyup="passwordChange()"
                        @focus="onFocus()"
                        type="password"
                        :readonly="editedItem.id == 1 ? true : false"
                      ></v-text-field>
                    </v-col>
                    <v-col class="my-0 py-0">
                      <v-text-field
                        name="confirm_password"
                        v-model="confirm_password"
                        :error-messages="
                          confirm_passwordErrors +
                          userError.confirm_password
                        "
                        label="Confirm Password"
                        required
                        @input="
                          vldtr.confirm_password.$touch() +
                            (userError.confirm_password = [])
                        "
                        @blur=" vldtr.confirm_password.$touch()"
                        @keyup="passwordChange()"
                        @focus="onFocus()"
                        type="password"
                        :readonly="editedItem.id == 1 ? true : false"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="my-0 py-0">
                      <v-autocomplete
                        v-model="editedItem.branch_id"
                        :items="branches"
                        item-title="name"
                        item-value="id"
                        label="Branch"
                        required
                        :error-messages="
                          branchErrors + userError.branch_id
                        "
                        @input="
                          vldtr.editedItem.branch_id.$touch() +
                            (userError.branch_id = [])
                        "
                        @blur="vldtr.editedItem.branch_id.$touch()"
                        :readonly="editedItem.id == 1 ? true : false"
                      >
                      </v-autocomplete>
                    </v-col>
                    <v-col class="my-0 py-0">
                      <v-autocomplete
                        v-model="editedItem.position_id"
                        :items="positions"
                        item-title="name"
                        item-value="id"
                        label="Position"
                        :readonly="editedItem.id == 1 ? true : false"
                      >
                      </v-autocomplete>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="2" class="my-0 py-0">
                      <v-switch
                        v-model="switch1"
                        :readonly="editedItem.id == 1 ? true : false"
                        hide-details=""
                        inset
                        color="primary"
                      >
                        <template #label>
                          <v-chip :color="switch1 ? 'primary' : 'secondary' " class="ml-1"> 
                              {{ activeStatus }}
                          </v-chip>
                        </template>
                      </v-switch>
                    </v-col>
                  </v-row>
                </v-col>
                <v-divider vertical></v-divider>
                <v-col cols="5" class="pt-0">
                  <v-table class="role-permission-table" fixed-header="" striped="even" density="compact">
                    <template #top>
                      <v-text-field
                        class="mt-2"
                        v-model="search_role"
                        prepend-inner-icon="mdi-magnify"
                        label="Search"
                        single-line
                        density="compact"
                        hide-details=""
                      ></v-text-field>
                    </template>
                    <template #default>
                      <thead>
                        <tr>
                          <th class="pb-2" style="width:10%">  
                            <v-checkbox
                              v-model="selectAll"
                              color="primary"
                              class="mb-8"
                              :indeterminate="indeterminate"
                              density="compact"
                              hide-details=""
                              :readonly="editedItem.id == 1"
                            />
                          </th>
                          <th class="pa-2 font-weight-bold" style="width:90%">Role</th>
                        </tr>
                      </thead>
                      <tbody :key="roleComponentKey">
                        <tr v-for="(role, key) in filteredRoles" :key="key" :class="{ 'bg-red-lighten-5': editedItem.roles.includes(role) }">
                          <td class="pb-2" style="width:10%"> 
                            <v-checkbox 
                              v-model="editedItem.roles"
                              :value="role"
                              multiple
                              color="primary" 
                              density="compact"
                              hide-details=""
                              :readonly="editedItem.id == 1"
                              class="mb-2 pb-2"
                            ></v-checkbox>
                          </td>
                          <td class="pa-2" style="width:90%"> {{ role }} </td>
                        </tr>
                      </tbody>
                    </template>
                  </v-table>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider class="mb-3 mt-0"></v-divider>
            <v-card-actions class="pa-0">
              <v-spacer></v-spacer>
              <v-btn class="bg-grey-lighten-2" @click="close" :class="editedItem.id != 1 ? 'mb-3' : 'mb-3 mr-4'">
                Cancel
              </v-btn>
              <v-btn
                @click="save"
                :disabled="disabled"
                class="bg-primary mb-3 mr-4"
                v-if="editedItem.id != 1"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
          v-model="dialogPermission"
          max-width="700px"
          persistent
        >
          <v-card>
            <v-card-title class="d-flex align-center bg-red-darken-4">
              <span class="headline">Roles & Permissions</span>
              <v-spacer></v-spacer>
              <v-icon
                @click="closeRolesBreakdown()"
                class="cursor-pointer"
                color="#f8a1a1"
              >
                mdi-close-circle
              </v-icon>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="roles_permissions_headers"
                :items="rolesBreakdown"
                :search="search_roles_permissions"
                :loading="loading"
                item-key="index"
                :group-by="rolesGroupBy"
                show-group-by
                class="elevation-1"
                v-model:expanded="expanded"
                loading-text="Loading... Please wait"
                fixed-header
              >
                <template #top>
                  <v-text-field
                    v-model="search_roles_permissions"
                    prepend-inner-icon="mdi-magnify"
                    label="Search"
                    single-line
                    density="compact"
                    hide-details=""
                  ></v-text-field>
                </template>
                <template #header.data-table-group>
                  <span class="font-weight-bold text-right ml-8 pl-8">Role</span>
                </template>
                <template #header.permission>
                  <span class="font-weight-bold">Permission</span>
                </template>
                <template #group-header="{ item, columns, toggleGroup, isGroupOpen }">
                  <tr class="group-row">
                    <td :colspan="columns.length" class="pa-0">
                      <div class="d-flex align-center w-100 px-4 py-2">
                        <v-btn
                          :icon="isGroupOpen(item) ? '$expand' : '$next'"
                          size="small"
                          variant="outlined"
                          @click="toggleGroup(item)"
                        />
                        
                        <v-chip class="bg-red-darken-4 ml-2">
                          {{ item.value }} ({{ item.items.length }})
                        </v-chip>
                      </div>
                    </td>
                  </tr>
                </template>
              </v-data-table>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-main>
    </div>
  </div>
</template>
<style scoped>
  /* table {
    width: 100%;
  } */

  .role-permission-table table {
    width: 100%;
  }

  .role-permission-table thead,
  .role-permission-table tbody,
  .role-permission-table tr,
  .role-permission-table td,
  .role-permission-table th {
    display: block;
  }

  .role-permission-table tr::after {
    content: '';
    display: block;
    visibility: hidden;
    clear: both;
  }

  .role-permission-table tbody {
    height: calc(65vh - 135px);
    overflow-y: auto;
  }

  .role-permission-table tbody td,
  .role-permission-table thead th {
    float: left;
  }

  
  .group-row td {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
</style>
<script>
import axiosMain from "../../axiosMain";
import { required, email as emailValidator, minLength, sameAs } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core';
import { mapGetters } from "vuex";
import MainDataTable from "../components/MainDataTable.vue";

export default {
  components: {
    MainDataTable,
  },  
  data() {
    return {
      absolute: true,
      overlay: false,
      items: [
        {
          text: "Home",
          disabled: false,
          link: "/",
        },
        {
          text: "Users Record",
          disabled: true,
        },
      ],
      search: "",
      search_role: "",
      search_roles_permissions: "",
      headers: [
        { title: "Full Name", key: "name" },
        { title: "E-mail", key: "email" },
        { title: "Active", key: "active" },
        { title: "Branch", key: "branch.name" },
        { title: "Position", key: "position.name" },
        { title: "Last Login", key: "last_login" },
        { title: "Roles", key: "roles" },
        { title: "Actions", key: "actions", sortable: false, width: "90px"},
      ],
      roles_permissions_headers: [
        { title: "Permission", key: "permission", width:"60%"},
      ],
      rolesGroupBy: [{ key: 'role', order: 'asc' }],
      expanded: [],
      switch1: true,
      disabled: false,
      emailReadonly: false,
      dialog: false,
      dialogPermission: false,
      users: [],
      branches: [],
      positions: [],
      roles: [],
      roles_permissions: [],
      editedIndex: -1,
      editedItem: {
        name: "",
        email: "",
        roles: [],
        branch_id: "",
        position_id: "",
        active: "Y",
      },
      defaultItem: {
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        roles: [],
        branch_id: "",
        position_id: "",
        active: "Y",
      },
      password: "",
      confirm_password: "",
      loading: true,
      passwordHasChanged: false,
      userError: {
        name: [],
        email: [],
        password: [],
        confirm_password: [],
        branch_id: [],
        position_id: [],
      },
      selectAll: false,
      indeterminate: false,
      roleComponentKey: -1,
      vldtr: useVuelidate(),
    };
  },

  validations() {
    return {
      editedItem: {
        name: { required },
        email: { required, emailValidator },
        branch_id: { required },
      },
      password: { required, minLength: minLength(8) },
      confirm_password: { required, sameAsPassword: sameAs("password") },
    }
  },

  methods: {
    getUser() {
      this.loading = true;
      axiosMain.get("/api/user/index").then(
        (response) => {
          let data = response.data;
          
          this.users = data.users;
          this.roles = data.roles;
          this.branches = data.branches;
          this.positions = data.positions;
          this.loading = false;
        },
        (error) => {
          this.isUnauthorized(error);
        }
      );
    },

    editUser(item) {
      this.editedIndex = this.users.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.roles = item.roles.map(value => value.name);
      this.dialog = true;
      this.emailReadonly = true;
      this.password = "password";
      this.confirm_password = "password";
      this.switch1 = true;
      if(this.editedItem.active === 'N')
      {
        this.switch1 = false;
      }

    },

    deleteUser(user_id) {
      const data = { user_id: user_id };

      axiosMain.post("/api/user/delete", data).then(
        (response) => {
          if (response.data.success) {
            // send data to Sockot.IO Server
            // this.$socket.emit("sendData", { action: "user-delete" });
          }
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

          const user_id = item.id;
          const index = this.users.indexOf(item);

          //Call delete User function
          this.deleteUser(user_id);

          //Remove item from array services
          this.users.splice(index, 1);

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
      this.userError = {
        name: [],
        email: [],
        password: [],
        confirm_password: [],
        branch_id: [],
      };

      if (!this.vldtr.$error) {
        this.disabled = true;
        this.overlay = true;

        if (this.editedIndex > -1) {
          if (this.passwordHasChanged) {
            this.editedItem.password = this.password;
            this.editedItem.confirm_password = this.confirm_password;
          }

          const data = this.editedItem;
          const user_id = this.editedItem.id;

          axiosMain.post("/api/user/update/" + user_id, data).then(
            (response) => {
              if (response.data.success) {
                // send data to Sockot.IO Server
                // this.$socket.emit("sendData", { action: "user-edit" });

                Object.assign(this.users[this.editedIndex], response.data.user);
                this.showAlert();
                this.close();
              } else {
                let errors = response.data;
                let errorNames = Object.keys(response.data);

                errorNames.forEach((value) => {
                  this.userError[value].push(errors[value]);
                });
              }
              this.overlay = false;
              this.disabled = false;
            },
            (error) => {
              this.isUnauthorized(error);

              this.overlay = false;
              this.disabled = false;
            }
          );
        } else {
          this.editedItem.password = this.password;
          this.editedItem.confirm_password = this.confirm_password;

          const data = this.editedItem;

          axiosMain.post("/api/user/store", data).then(
            (response) => {
              if (response.data.success) {
                // send data to Sockot.IO Server
                // this.$socket.emit("sendData", { action: "user-create" });

                this.showAlert();
                this.close();

                //push recently added data from database
                this.users.push(response.data.user);
              } else {
                let errors = response.data;
                let errorNames = Object.keys(response.data);

                errorNames.forEach((value) => {
                  this.userError[value].push(errors[value]);
                });
              }
              this.overlay = false;
              this.disabled = false;
            },
            (error) => {
              this.isUnauthorized(error);

              this.overlay = false;
              this.disabled = false;
            }
          );
        }
      }
    },
    clear() {
      this.vldtr.$reset();
      this.editedItem.email = "";
      this.emailReadonly = false;
      this.password = "";
      this.confirm_password = "";
      this.editedItem.active = "Y";
      this.passwordHasChanged = false;
      this.switch1 = true;
      this.userError = {
        name: [],
        email: [],
        password: [],
        confirm_password: [],
        branch_id: [],
      };
      this.search_role = "";
      this.selectAll = false;
      this.indeterminate = false;
    },
    onFocus() {
      if (this.editedIndex > -1 && this.editedItem.id != 1) {
        if (!this.passwordHasChanged) {
          this.password = "";
          this.confirm_password = "";
        }
      }
    },
    passwordChange() {
      if (this.password || this.confirm_password) {
        this.passwordHasChanged = true;
      } else {
        this.passwordHasChanged = false;
      }
    },
    viewRolesBreakdown(roles) {
      this.dialogPermission = true;
      this.roles_permissions = roles;
    },
    closeRolesBreakdown() {
      this.dialogPermission = false;
      this.search_roles_permissions = "";
    },
    dummyPassword() {
      if (this.editedIndex > -1) {
        if (!this.password && !this.confirm_password) {
          this.password = "password";
          this.confirm_password = "password";
        }
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
        ? "New User"
        : this.editedItem.id === 1
        ? "User"
        : "Edit User";
    },    
    nameErrors() {
      const field = this.vldtr.editedItem.name;
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Name is required';
        return ''
      })
    },
    emailErrors() {
      const field = this.vldtr.editedItem.email
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Email is required'
        if (err.$validator === 'email') return 'Invalid email'
        return ''
      })
    },
    passwordErrors() {
      const field = this.vldtr.password;
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Password is required';
        if (err.$validator === 'minLength') return 'Password must be at least 8 characters'
        return ''
      });
    },

    confirm_passwordErrors() {
      const field = this.vldtr.confirm_password;
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Password Confirmation is required';
        if (err.$validator === 'sameAsPassword') return 'Passwords did not match'
        return ''
      });
    },
    branchErrors() {
      const field = this.vldtr.editedItem.branch_id;
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Branch is required';
        return ''
      });
    },
    rolesBreakdown() {
      let roles_permissions = [];
      let index = 0;
      this.roles_permissions.forEach((value) => {
        value.permissions.forEach((val) => {
          roles_permissions.push({
            index: index,
            role: value.name,
            permission: val.name,
          });
          index++;
        });
      });

      return roles_permissions;
    },
    filteredRoles() {
      let search = this.search_role ? this.search_role.toLowerCase() : '';
      let roles = this.roles.filter((value) => {
        return value.name.toLowerCase().includes(search);
      }).map(value => value.name);

      // return default list this.roles if search is null;
      return search ? roles : this.roles.map(value => value.name);
    
    },
    activeStatus() {
      return this.switch1 ? "Active" : "Inactive";
    },
    ...mapGetters("auth", ["hasRole", "hasPermission"]),
  },
  watch: {
    selectAll()
    {
      let roles = this.roles.map(value => value.name) 

      if(this.selectAll)
      {
        this.editedItem.roles = roles;
      }
      else if(!this.indeterminate && !this.selectAll)
      {
        this.editedItem.roles = [];
      }
    },
    "editedItem.roles"() {

      if(this.editedItem.roles.length == this.roles.length && this.editedItem.roles.length != 0)
      {
        this.selectAll = true;
        this.indeterminate = false;
      }
      else if(this.editedItem.roles.length > 0 && this.editedItem.roles.length != this.roles.length)
      {
        this.indeterminate = true;
        this.selectAll = false;
      }
    },
    search_role() {
      this.roleComponentKey += 1;
    },
    password() {
      this.dummyPassword();
    },
    confirm_password() {
      this.dummyPassword();
    },
    switch1(val) {
      if (val) {
        this.editedItem.active = "Y";
      } else {
        this.editedItem.active = "N";
      }
    }
  },
  mounted() {
    this.getUser();
  },
};
</script>
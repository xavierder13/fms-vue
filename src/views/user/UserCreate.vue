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
          <template v-slot:item="{ item }">
            <v-breadcrumbs-item :to="item.link" :disabled="item.disabled">
              {{ item.text.toUpperCase() }}
            </v-breadcrumbs-item>
          </template>
        </v-breadcrumbs>
        <v-card>
          <v-card-title class="mb-0 pb-0">
            <span class="headline">Create User</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="ml-4">
            <v-row>
              <v-col>
                <v-row>
                  <v-col class="my-0 py-0">
                    <v-text-field
                      name="name"
                      v-model="editedItem.name"
                      :error-messages="nameErrors + userError.name"
                      label="Full Name"
                      @input="
                        $v.editedItem.name.$touch() +
                          (userError.name = [])
                      "
                      @blur="$v.editedItem.name.$touch()"
                    ></v-text-field>
                  </v-col>
                  <v-col class="my-0 py-0">
                    <v-text-field
                      name="email"
                      v-model="editedItem.email"
                      :error-messages="emailErrors + userError.email"
                      label="E-mail"
                      @input="
                        $v.editedItem.email.$touch() +
                          (userError.email = [])
                      "
                      @blur="$v.editedItem.email.$touch()"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="my-0 py-0">
                    <v-text-field
                      name="password"
                      v-model="editedItem.password"
                      :error-messages="
                        passwordErrors + userError.password
                      "
                      label="Password"
                      required
                      @input="
                        $v.editedItem.password.$touch() + (userError.password = [])
                      "
                      @blur="$v.editedItem.password.$touch()"
                      type="password"
                    ></v-text-field>
                  </v-col>
                  <v-col class="my-0 py-0">
                    <v-text-field
                      name="confirm_password"
                      v-model="editedItem.confirm_password"
                      :error-messages="
                        confirm_passwordErrors +
                        userError.confirm_password
                      "
                      label="Confirm Password"
                      required
                      @input="
                        $v.editedItem.confirm_password.$touch() +
                          (userError.confirm_password = [])
                      "
                      @blur="
                        $v.editedItem.confirm_password.$touch()
                      "
                      type="password"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="my-0 py-0">
                    <v-autocomplete
                      v-model="editedItem.branch_id"
                      :items="branches"
                      item-text="name"
                      item-value="id"
                      label="Branch"
                      required
                      :error-messages="
                        branchErrors + userError.branch_id
                      "
                      @input="
                        $v.editedItem.branch_id.$touch() +
                          (userError.branch_id = [])
                      "
                      @blur="$v.editedItem.branch_id.$touch()"
                    >
                    </v-autocomplete>
                  </v-col>
                  <v-col class="my-0 py-0">
                    <v-autocomplete
                      v-model="editedItem.position_id"
                      :items="positions"
                      item-text="name"
                      item-value="id"
                      label="Position"
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
                    >
                      <template v-slot:label>
                        <v-chip :color="switch1 ? 'primary' : 'secondary' " class="ml-1 mt-2"> 
                          {{ activeStatus }} 
                        </v-chip>
                      </template>
                    </v-switch>
                  </v-col>
                </v-row>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col cols="5" class="pt-0">
                <v-simple-table fixed-header class="pt-0">
                  <template v-slot:default>
                    <v-toolbar>
                      <v-spacer></v-spacer>
                      <v-text-field
                        v-model="search_role"
                        append-icon="mdi-magnify"
                        label="Search"
                        single-line
                        hide-details=""
                      ></v-text-field>
                      <v-spacer></v-spacer>
                    </v-toolbar>
                    <thead>
                      <tr>
                        <th class="pa-2" style="width:10%">  
                          <v-checkbox
                            v-model="selectAll"
                            color="primary"
                            class="ma-0 pa-0"
                            :indeterminate="indeterminate"

                          /></th>
                        <th class="pa-2" style="width:90%">Role</th>
                      </tr>
                    </thead>
                    <tbody :key="roleComponentKey">
                      <tr v-for="(role, index) in filteredRoles">
                        <td class="pa-2" style="width:10%"> 
                          <v-checkbox 
                            v-model="editedItem.roles"
                            :value="role"
                            multiple
                            color="primary" 
                            class="ma-0 pa-0"
                          ></v-checkbox>
                        </td>
                        <td class="pa-2" style="width:90%"> {{ role }} </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider class="mb-3 mt-4"></v-divider>
          <v-card-actions class="pa-0">
            <v-btn
              color="primary"
              @click="save"
              :disabled="disabled"
              class="ml-6 mb-4 mr-1"
            >
              Save
            </v-btn>
            <v-btn color="#E0E0E0" to="/" class="mb-4"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-main>
    </div>
  </div>
</template>
<style scoped>
  table {
    width: 100%;
  }

  thead, tbody, tr, td, th { display: block; }

  tr:after {
      content: ' ';
      display: block;
      visibility: hidden;
      clear: both;
  }

  tbody {
      height: calc(65vh - 135px);
      overflow-y: auto;
  }

  tbody td, thead th {
      float: left;
  }
</style>
<script>                                                                                                                                                                                                                                                                                                                                
import axios from "axios";
import { validationMixin } from "vuelidate";
import {
  required,
  maxLength,
  email,
  minLength,
  sameAs,
} from "vuelidate/lib/validators";

export default {
  mixins: [validationMixin],

  validations: {
    editedItem: {
      name: { required },
      email: { required, email },
      password: { required, minLength: minLength(8) },
      confirm_password: { required, sameAsPassword: sameAs("password") },
      branch_id: { required },
    },
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
          text: "Create User",
          disabled: true,
        },
      ],
      switch1: true,
      disabled: false,
      users: [],
      branches: [],
      positions: [],
      roles: [],
      roles_permissions: [],
      editedIndex: -1,
      editedItem: {
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        roles: [],
        active: "Y",
        branch_id: "",
        position_id: "",
      },
      defaultItem: {
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        roles: [],
        active: "Y",
        branch_id: "",
        position_id: "",
      },
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
      search_role: "",
    };
  },

  methods: {
    getRole() {
      axios.get("/api/user/create").then(
        (response) => {
          let data = response.data;

          this.roles = data.roles;
          this.branches = data.branches;
          this.positions = data.positions;
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

    save() {
      this.$v.$touch();
      this.userError = {
        name: [],
        email: [],
        password: [],
        confirm_password: [],
        branch_id: [],
      };

      if (!this.$v.$error) {
        this.disabled = true;
        this.overlay = true;

        const data = this.editedItem;

        axios.post("/api/user/store", data).then(
          (response) => {
            if (response.data.success) {
              // send data to Sockot.IO Server
              // this.$socket.emit("sendData", { action: "user-create" });

              this.showAlert();
              this.clear();

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
    },
    clear() {
      this.$v.$reset();
      this.editedItem = Object.assign({}, this.defaultItem);
      this.switch1 = true;
      this.selectAll = false;
      this.indeterminate = false;
    },

    isUnauthorized(error) {
      // if unauthenticated (401)
      if (error.response.status == "401") {
        this.$router.push({ name: "unauthorize" });
      }
    },
  },
  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("Name is required.");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.editedItem.email.$dirty) return errors;
      !this.$v.editedItem.email.required && errors.push("Email is required.");
      !this.$v.editedItem.email.email && errors.push("Must be valid e-mail");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.editedItem.password.$dirty) return errors;
      !this.$v.editedItem.password.required &&
        errors.push("Password is required.");
      !this.$v.editedItem.password.minLength &&
        errors.push("Password must be atleast 8 characters.");
      return errors;
    },

    confirm_passwordErrors() {
      const errors = [];
      if (!this.$v.editedItem.confirm_password.$dirty) return errors;
      !this.$v.editedItem.confirm_password.required &&
        errors.push("Password Confirmation is required.");
      !this.$v.editedItem.confirm_password.sameAsPassword &&
        errors.push("Passwords did not match");
      return errors;
    },

    activeStatus() {
      if (this.switch1) {
        this.editedItem.active = "Y";
        return " Active";
      } else {
        this.editedItem.active = "N";
        return " Inactive";
      }
    },
    branchErrors() {
      const errors = [];
      if (!this.$v.editedItem.branch_id.$dirty) return errors;
      !this.$v.editedItem.branch_id.required &&
        errors.push("Branch is required.");
      return errors;
    },
    filteredRoles() {
      let search = this.search_role ? this.search_role.toLowerCase() : '';
      let roles = this.roles.filter((value) => {
        return value.name.toLowerCase().includes(search);
      }).map(value => value.name);

      // return default list this.roles if search is null;
      return search ? roles : this.roles.map(value => value.name);
    
    },
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
      else if(!this.editedItem.roles.length)
      {
        this.indeterminate = false;
      }
    },
    search_role() {
      this.roleComponentKey += 1;
    }
  },
  mounted() {
    axios.defaults.headers.common["Authorization"] =
      "Bearer " + localStorage.getItem("access_token");
    this.getRole();
  },
};
</script>
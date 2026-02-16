<template>
  <div class="flex column">
    <div id="_wrapper" class="px-5">
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
            <span class="headline">My Profile</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="ml-4">
            <v-row class="mt-2">
              <v-col cols="12" xl="4" lg="4" md="6" sm="12" class="my-0 py-0">
                <v-text-field
                  name="name"
                  v-model="editedItem.name"
                  :error-messages="nameErrors + userError.name"
                  label="Full Name"
                  @input="vldtr.editedItem.name.$touch() + (userError.name = [])"
                  @blur="vldtr.editedItem.name.$touch()"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" xl="4" lg="4" md="6" sm="12" class="my-0 py-0">
                <v-text-field
                  name="email"
                  v-model="editedItem.email"
                  label="E-mail"
                  readonly
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" xl="4" lg="4" md="6" sm="12" class="my-0 py-0">
                <v-text-field
                  name="password"
                  v-model="password"
                  :error-messages="passwordErrors + userError.password"
                  label="Password"
                  required
                  @input="vldtr.password.$touch() + (userError.password = [])"
                  @blur="vldtr.password.$touch()"
                  @keyup="passwordChange()"
                  @focus="onFocus()"
                  type="password"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" xl="4" lg="4" md="6" sm="12" class="my-0 py-0">
                <v-text-field
                  name="confirm_password"
                  v-model="confirm_password"
                  :error-messages="
                    confirm_passwordErrors + userError.confirm_password
                  "
                  label="Confirm Password"
                  required
                  @input="
                    vldtr.confirm_password.$touch() +
                      (userError.confirm_password = [])
                  "
                  @blur="vldtr.confirm_password.$touch()"
                  @keyup="passwordChange()"
                  @focus="onFocus()"
                  type="password"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider class="mb-3 mt-4"></v-divider>
          <v-card-actions class="pa-0">
            <v-btn
              @click="save"
              :disabled="disabled"
              class="bg-primary ml-6 mb-4 mr-1"
            >
              Save
            </v-btn>
            <v-btn to="/" class="mb-4"> Cancel </v-btn>
          </v-card-actions>
        </v-card>
      </v-main>
    </div>
  </div>
</template>
<script>
import axiosMain from "../../axiosMain";
import { mapState } from "vuex";
import { required, minLength, sameAs } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core';

export default {
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
          text: "My Profile",
          disabled: true,
        },
      ],
      switch1: true,
      disabled: false,
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
      passwordHasChanged: false,
      password: "password",
      confirm_password: "password",
      vldtr: useVuelidate(), // will be initialized in created()  
    };
  },

  validations() {
    return {
      editedItem: {
        name: { required },
      },
      password: { required, minLength: minLength(8) },
      confirm_password: { required, sameAsPassword: sameAs("password") },
    }
  },

  watch: {
    userIsLoaded: {
      handler() {
        if (this.userIsLoaded) {
          this.editedItem.name = this.user.name;
          this.editedItem.email = this.user.email;
        }
      },
    },
    password() {
      this.dummyPassword();
    },
    confirm_password() {
      this.dummyPassword();
    },
    user() {
      this.editedItem.name = this.user?.name;
      this.editedItem.email = this.user?.email;
    }
  },

  methods: {
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
      this.vldtr.$touch();
      this.userError = {
        name: [],
        email: [],
        password: [],
        confirm_password: [],
      };

      if (!this.vldtr.$error) {
        this.disabled = true;
        this.overlay = true;

        if (this.passwordHasChanged) {
          this.editedItem.password = this.password;
          this.editedItem.confirm_password = this.confirm_password;
        } else {
          this.editedItem.password = "";
          this.editedItem.confirm_password = "";
        }

        const data = this.editedItem;
        const user_id = this.user.id;

        axiosMain.post("/api/user/update_profile/" + user_id, data).then(
          (response) => {
            if (response.data.success) {
              // send data to Sockot.IO Server
              // this.$socket.emit("sendData", { action: "user-edit" });

              this.showAlert();

              this.passwordHasChanged = false;
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

    onFocus() {
      if (!this.passwordHasChanged) {
        this.password = "";
        this.confirm_password = "";
      }
    },

    passwordChange() {
      if (this.password || this.confirm_password) {
        this.passwordHasChanged = true;
      } else {
        this.passwordHasChanged = false;
      }
    },
    clear() {
      this.vldtr.$reset();
      this.editedItem = Object.assign({}, this.defaultItem);
      this.switch1 = true;
    },

    dummyPassword() {
      if (!this.password && !this.confirm_password) {
        this.password = "password";
        this.confirm_password = "password";
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
    nameErrors() {
      const field = this.vldtr.editedItem.name;
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Name is required';
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
    ...mapState("auth", ["user"]),
  },
  mounted() {
    this.editedItem.name = this.user?.name;
    this.editedItem.email = this.user?.email;
  },
};
</script>
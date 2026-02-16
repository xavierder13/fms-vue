<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height ma-0 pa-0">
        <v-row class="fill-height" align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-overlay :absolute="absolute" :value="overlay">
              <v-progress-circular
                :size="70"
                :width="7"
                color="primary"
                indeterminate
              ></v-progress-circular>
            </v-overlay>
            <v-card class="elevation-12">
              <v-toolbar color="secondary" flat>
                <v-toolbar-title>Login</v-toolbar-title>
              </v-toolbar>

              <v-card-text>
                <v-alert v-if="isInvalid" type="error" dense outlined>
                  Invalid Credentials
                </v-alert>

                <v-form class="mx-5">
                  <v-text-field
                    label="Email"
                    v-model="email"
                    prepend-inner-icon="mdi-account"
                    :error-messages="emailErrors"
                    @change="vldtr.email.$touch()"
                    @blur="vldtr.email.$touch()"
                    @keyup="isInvalid = false"
                  />

                  <v-text-field
                    label="Password"
                    :type="password_visible ? 'text' : 'password'"
                    v-model="password"
                    prepend-inner-icon="mdi-key"
                    :error-messages="passwordErrors"
                    :append-inner-icon="password_visible ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="password_visible = !password_visible"
                    @change="vldtr.password.$touch()"
                    @blur="vldtr.password.$touch()"
                    @keyup="isInvalid = false"
                  />
                </v-form>
              </v-card-text>

              <v-card-actions class="px-5 pb-5">
                <v-btn color="primary" variant="elevated" block @click="login">
                  Login
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { required, email as emailValidator, minLength } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import axiosMain from '../axiosMain';

export default {
  name: "LoginView",

  data() {
    return {
      email: "",
      password: "",
      isInvalid: false,
      absolute: true,
      overlay: false,
      password_visible: false,
      vldtr: useVuelidate(), // will be initialized in created()
    }
  },

  validations() {
    return {
      email: { required, email: emailValidator },
      password: { required, minLength: minLength(8) },
    }
  },

  computed: {
    emailErrors() {
      const field = this.vldtr.email
      if (!field.$dirty) return []

      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Email is required'
        if (err.$validator === 'email') return 'Invalid email'
        return ''
      })
    },

    passwordErrors() {
      const field = this.vldtr.password;
      if (!field.$dirty) return [];
      
      return field.$errors.map(err => {
        if (err.$validator === 'required') return 'Password is required';
        if (err.$validator === 'minLength') return 'Password must be at least 8 characters'
        return ''
      });
    },
  },

  methods: {
    async login() {
      this.vldtr.$touch()
      if (!this.vldtr.$error) {
        this.overlay = true
        try {
          const res = await axiosMain.post('/api/auth/login', {
            email: this.email,
            password: this.password
          })
          
          if (res.data.access_token) {
            localStorage.setItem('access_token', res.data.access_token)
            this.$router.push('/dashboard')
          } else {
            this.isInvalid = true
          }
        } catch (err) {
          console.error(err)
          this.isInvalid = true
        } finally {
          this.overlay = false
        }
      }
    },

    touchEmail() {
      this.vldtr.email.$touch()
    },

    touchPassword() {
      this.vldtr.password.$touch()
    }
  },
  mounted() {
    let self = this;
    window.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) {
        self.login();
      }
    });
  }
}
</script>

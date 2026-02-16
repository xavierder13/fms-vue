<template>
  <v-main class="fill-height d-flex align-center justify-center">
    <v-container
      fluid
      class="d-flex align-center justify-center"
    >
      <v-card class="pa-10 text-center" flat max-width="700">
        <!-- Side-by-side code and message -->
        <v-row align="center" justify="center" class="mb-6" no-gutters>
          <v-col cols="auto">
            <div class="code">404</div>
          </v-col>
          <v-col cols="auto" class="pl-4">
            <div class="message">Not Found</div>
          </v-col>
        </v-row>

        <!-- Buttons -->
        <v-row justify="center" align="center" dense>
          <v-col cols="auto">
            <v-btn color="primary" variant="outlined" @click="goBack">
              <v-icon left>mdi-arrow-left-bold</v-icon> Back
            </v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" variant="outlined" to="/">
              <v-icon left>mdi-home</v-icon> Home Page
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  name: 'UnauthorizedView',
  setup() {
    const router = useRouter()
    const goBack = () => router.back()
    return { goBack }
  },
}
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px); /* 64px = default v-app-bar height */
}

.code {
  font-size: 96px;
  font-weight: 700;
  color: #424242;
}

.message {
  font-size: 32px;
  color: #616161;
}
</style>

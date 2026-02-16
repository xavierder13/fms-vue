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
        <v-card>
          <v-card-title> Dashboard </v-card-title>
        </v-card>
      </v-main>
    </div>
  </div>
</template>
<script>
export default {
  name: "DashboardView",
  data() {
    return {
      absolute: true,
      overlay: false,
      search: "",
      loading: true,
    };
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

  },
  mounted() {
 
  },
};
</script>
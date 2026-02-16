<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" theme="dark" app>
      <v-list class="bg-red-darken-3">
        <v-list-item
          :prepend-avatar="$apiBaseUrl + '/img/default-profile.png'"
          :subtitle="user.name"
          title="Admin Dashboard"
        ></v-list-item>
      </v-list>
      <v-divider class="mt-0 pt-0" />
      <v-list
        nav
        density="compact"
      >
        <template v-for="(group, gIndex) in filteredMenu" :key="gIndex">
          <!-- Group Header -->
          <v-list-subheader class="menu-group-header">
            <span>{{ group.group_header_title }}</span>
          </v-list-subheader>

          <!-- Group Items -->
          <template v-for="(item, index) in group.list_items" :key="index">
            <v-list-group :value="item.title" v-if="item.children.length">
              <template #activator="{ props }">
                <v-list-item v-bind="props" :title="item.title">
                  <template #prepend>
                    <v-icon color="red-darken-3">
                      {{ item.icon }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>

              <v-list-item
                v-for="child in item.children"
                :key="child.title"
                :title="child.title"
                :to="child.link"
              />
            </v-list-group>

            <!-- ITEM WITHOUT CHILDREN -->
            <v-list-item
              v-else
              :title="item.title"
              :to="item.link"
              :value="item.title"
            >
              <template #prepend>
                <v-icon color="red-darken-3">
                  {{ item.icon }}
                </v-icon>
              </template>
            </v-list-item>
          </template>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar dense density="compact" color="secondary " elevate-on-scroll>
      <v-app-bar-nav-icon @click="drawer = !drawer" color="#EF9A9A" />
      <v-spacer />
      <v-menu offset-y :nudge-width="200">
        <template v-slot:activator="{ props }">
          <v-btn
            icon
            v-bind="props"
          >
            <v-avatar size="small">
              <v-img
                alt="Avatar"
                :src="$apiBaseUrl + '/img/default-profile.png'"
              ></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-card color="grey-3" class="px-2" style="width: 250px">
          <!-- Card content -->
          <v-card-text class="text-center">
            <!-- Avatar -->
            <v-avatar size="150" class="mx-auto mb-3">
              <v-img
                :src="$apiBaseUrl + '/img/default-profile.png'"
                cover
              />
            </v-avatar>

            <!-- Name -->
            <div>
              <h3 class="text--secondary mb-1">{{ user.name }}</h3>
              <h5 :style="{ color: '#607D8B' }">
                {{ user.id === 1 ? "Administrator" : user.position ? user.position.name : "" }}
              </h5>
            </div>
          </v-card-text>

          <v-divider />

          <!-- Actions -->
          <v-card-actions class="d-flex justify-space-around">
            <v-btn text small color="primary" @click="userProfile">
              <v-icon small class="mr-1">mdi-account</v-icon>
              Profile
            </v-btn>

            <v-btn text small color="red" @click="confirmLogout">
              <v-icon small class="mr-1">mdi-logout</v-icon>
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>

      </v-menu>
    </v-app-bar>

    <!-- Page content -->
    <!-- Main Content -->
    <router-view />
    
    <!-- Footer -->
    <v-footer padless dense dark app>
      <v-col class="text-center" cols="12">
        Copyright © {{ new Date().getFullYear() }} — <strong>ADDESSA FILE MANAGER</strong>
      </v-col>
    </v-footer>
  </v-app>
</template>


<style>
  html { overflow-y: auto !important } /* show scrollbar when overflow */

  .menu-group-header {
    display: flex;
    align-items: center;
    width: 100%;              /* 🔑 THIS is the missing piece */
    gap: 8px;
    font-size: 0.875rem;      /* subtitle-2 */
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .menu-group-header span {
    color: #f8a1a1; /* muted red text */
  }

  .menu-group-header::before ,
  .menu-group-header::after {
    content: '';
    flex-grow: 1;
    height: 1px;
    background-color: #f8a1a1;
    opacity: 0.4;
  }
</style>

<script>

import axiosMain from "../axiosMain";
import { mapState, mapActions, mapGetters } from "vuex";
export default {
  name: "HomeView",
  data() {
    return {
      absolute: true,
      overlay: false,
      drawer: true,
      mini: false,
      right: null,
      selectedItem: 1,
      loading: null,
      initiated: false,
    };
  },

  methods: {
    userProfile() {
      this.$router.push({ name: "user.profile" }).catch((e) => {console.log(e)});
    },
    logout() {
      this.overlay = true;
      axiosMain.get("/api/auth/logout").then(
        (response) => {
          if (response.data.success) {
            this.overlay = false;

            // remove all local storage including access_token
            window.localStorage.clear();
            this.$store.commit("auth/setUser", {}); // clear user
            this.$router.push("/login").catch(() => {});
          }
        },
        (error) => {
          this.overlay = false;
          console.log(error);

          // if unauthenticated (401)
          if (error.response.status == "401") {

            // remove all local storage including access_token
            window.localStorage.clear();
            this.$router.push({ name: "login" });
          }
        }
      );
    },

    confirmLogout() {
      
      this.$swal({
        title: "Log Out",
        text: "Are you sure you want to log out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "primary",
        cancelButtonColor: "secondary",
        confirmButtonText: "Log Out",
      }).then((result) => {
        
        if (result.value) {
          this.overlay = true;
          this.logout();
        }
        
      });

    },

    sessionExpiredSwal(){
      this.$swal({
          title: "Session Expired",
          text: "You have been inactive for 30 Minutes(s)",
          showCancelButton: false,
          confirmButtonText: "Ok",
      });

      // this.logout();
    },
    menuList() {
      
      let menu = [
        { // START Dashboard
          group_header_title: 'Dashboard',
          hasPermission: true,
          list_items: [
            {
              title: 'Dashboard',
              icon: 'mdi-view-dashboard',
              link: '/dashboard',
              method: '',
              hasPermission: true,
              children: [],
            },
          ]
        }, // END Dashboard

        { // START Set Up & Athorization group menu
          group_header_title: 'Set Up & Authorizations',
          hasPermission: false,
          list_items: [
            {
              title: 'User Management',
              icon: 'mdi-account-arrow-right-outline',
              link: '',
              method: '',
              hasPermission: false,
              children: [
                { 
                  title: 'User Accounts',
                  link: '/user/index',
                  hasPermission: this.hasPermission('user-list'),
                },
              ],
            },
            {
              title: 'Settings',
              icon: 'mdi-cog',
              link: '',
              method: '',
              hasPermission: false,
              children: [
                { 
                  title: 'Role',
                  link: '/role/index',
                  hasPermission: this.hasAnyPermission('role-list', 'role-create'),
                },
                { 
                  title: 'Permission',
                  link: '/permission/index',
                  hasPermission: this.hasAnyPermission('permission-list', 'permission-create'),
                },
              ],
            },
          ],
        }, // END Set Up & Athorization group menu
      ];

      menu.forEach(item => {
        // Check if any list item has children with permission or is itself permitted
        item.hasPermission = item.list_items.some(list => {
          // Check if any child has permission
          const hasChildPermission = list.children.some(child => child.hasPermission)
          // If any child has permission, mark list as permitted
          list.hasPermission = hasChildPermission || list.hasPermission
          return list.hasPermission;
        })
      });

      return menu.filter(menu => menu.hasPermission);
    },
    ...mapActions("auth", ["getUser"]),
    ...mapActions("userRolesPermissions", ["userRolesPermissions"]),

  },

  computed: {
    
    filteredMenu() {
      const rawMenu = this.menuList();

      // Filter and map each group
      const menuWithFilteredItems = rawMenu.map(group => {
        // Filter children of each item
        const filteredItems = group.list_items
          .map(item => {
            const filteredChildren = item.children.filter(child => child.hasPermission);
            return {
              ...item,
              children: filteredChildren,
            };
          })
          // Keep items that either have permission themselves or have children
          .filter(item => item.hasPermission || item.children.length > 0);

        return {
          ...group,
          list_items: filteredItems,
        };
      });

      // Keep groups that either have permission themselves or have list items
      const finalFilteredMenu = menuWithFilteredItems.filter(
        group => group.hasPermission || group.list_items.length > 0
      );

      return finalFilteredMenu;
    },
    ...mapState("auth", ["user"]),
    ...mapGetters("auth", ["hasRole", "hasAnyRole", "hasPermission", "hasAnyPermission"]),
  },
  watch: {
    user() {
      this.getUser();
    }
  },

  mounted() {

  },
};
</script>
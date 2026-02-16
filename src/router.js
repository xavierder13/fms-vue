// src/router.js
import { createRouter, createWebHistory } from 'vue-router';

import store from './store'; // import your Vuex store
// import apiBaseUrl from './apiBaseUrl';
// import axiosMain from './axiosMain';

import Home from './views/Home.vue';
import Login from './auth/Login.vue';
import Dashboard from './views/dashboard/Dashboard.vue';
import UserIndex from './views/user/UserIndex.vue';
import UserProfile from './views/user/UserProfile.vue';
import PermissionIndex from './views/permission/PermissionIndex.vue';
import RoleIndex from './views/role/RoleIndex.vue';
import PageNotFound from './404/PageNotFound.vue';
import Unauthorize from './401/Unauthorize.vue';

const routes = [
  { 
    path: '/', 
    component: Home , 
    children: [
      { 
        path: '/dashboard', 
        name: 'dashboard', 
        component: Dashboard, 
        meta: { requiresAuth: true, permission: 'dashboard' } 
      },
      {
        path: '/user/index',
        name: 'user.index',
        component: UserIndex,
        meta: { requiresAuth: true, permission: 'user-list' }
      },
      {
        path: '/permission/index',
        name: 'permission.index',
        component: PermissionIndex,
        meta: { requiresAuth: true, permission: 'permission-list' }
      },
      {
        path: '/role/index',
        name: 'role.index',
        component: RoleIndex,
        meta: { requiresAuth: true, permission: 'role-list' }
      },
      {
        path: '/user/profile',
        name: 'user.profile',
        component: UserProfile
      },
      {
        path: '/unauthorize',
        name: 'unauthorize',
        component: Unauthorize,
        meta: { requiresAuth: true, permission: '' }
      },
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login, 
    meta: { public: true, onlyGuest: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not.found',
    component: PageNotFound,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ Global auth + permission guard
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('access_token');
  
  if (to.meta.public) {
    // Only redirect logged-in users if the page is meant for guests
    if (token && to.meta.onlyGuest) {
      return next({ name: 'dashboard' });
    }
    return next(); // allow public route
  }

  // Protected route → requires auth
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // load user + roles/permissions if not loaded
  if (!store.state.auth.isLoaded) {
    await store.dispatch('auth/getUser');
  }

  if (to.meta.permission && !store.getters['auth/hasPermission'](to.meta.permission)) {
    return next({ name: 'unauthorize' });
  }

  if (to.meta.role && !store.getters['auth/hasRole'](to.meta.role)) {
    return next({ name: 'unauthorize' });
  }

  next();
});


export default router;

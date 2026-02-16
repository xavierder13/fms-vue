import { createStore } from 'vuex'
import auth from './modules/auth'
import userRolesPermissions from './modules/userRolesPermissions'

export default createStore({
  modules: {
    auth,
    userRolesPermissions
  }
});
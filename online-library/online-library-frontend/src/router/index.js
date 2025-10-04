import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/LoginPage.vue';
import Register from '../views/RegisterPage.vue';
import { useAuthStore } from '../store/auth';

const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (auth.token && !auth.user) {
    await auth.fetchUser();
  }
  if (to.meta.requiresAuth && !auth.token) next('/');
  else next();
});

export default router;

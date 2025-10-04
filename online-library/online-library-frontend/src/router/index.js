import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// Pages
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'

import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: HomePage },
    ],
  },
  { path: '/login', name: 'login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterPage, meta: { guestOnly: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🧩 Route Guards
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Restore session if not loaded yet
  if (!auth.user && auth.token) {
    try {
      await auth.fetchMe()
    } catch {
      auth.logout()
    }
  }

  if (to.meta.requiresAuth && !auth.user) {
    // protected routes need auth
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (to.meta.librarianOnly && auth.user?.role !== 'librarian') {
    // librarian-only restriction
    return next({ name: 'home' })
  }

  if (to.meta.guestOnly && auth.user) {
    // prevent logged-in users from visiting login/register
    return next({ name: 'home' })
  }

  next()
})

export default router

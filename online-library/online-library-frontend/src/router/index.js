import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'

// Pages
import HomePage from '../pages/HomePage.vue'
import BookDetailPage from '../pages/BookDetailPage.vue'
import ReservationsPage from '../pages/ReservationsPage.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import NotificationsPage from '../pages/NotificationsPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'

import { useAuthStore } from '../store/auth.js'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '/', name: 'home', component: HomePage },
      { path: '/books/:id', name: 'book-detail', component: BookDetailPage },
      { path: '/reservations', name: 'reservations', component: ReservationsPage, meta: { requiresAuth: true, memberOnly: true } },
      { path: '/notifications', name: 'notifications', component: NotificationsPage, meta: { requiresAuth: true, memberOnly: true} },
      { path: '/admin', name: 'admin', component: AdminDashboard, meta: { librarianOnly: true } } 
    ]
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
  await auth.fetchUser()

  // Restore session if not loaded yet
  if (!auth.user && auth.token) {
    try {
      await auth.fetchUser()
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

  if (to.meta.memberOnly && auth.user?.role !== 'member') {
    // member-only restriction
    return next({ name: 'home' })
  }

  if (to.meta.guestOnly && auth.user) {
    // prevent logged-in users from visiting login/register
    return next({ name: 'home' })
  }

  next()
})

export default router

import { useAuthStore } from '@/stores/auth/auth.store'
import { useLayoutStore } from '@/stores/layout.store'
import { Role } from '@/types/oidc.types'
import { RouteName } from '@/types/route-name.enum'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const getDetailComponentForRole = () => {
  const authStore = useAuthStore()
  switch (authStore.singleKnownRole) {
    case Role.Researcher:
      return import('@/components/Proposals/Details/ResearcherDetails.vue')

    case Role.FdpgMember:
      return import('@/components/Proposals/Details/FdpgMemberDetails.vue')

    case Role.DizMember:
      return import('@/components/Proposals/Details/DizMemberDetails.vue')

    case Role.UacMember:
      return import('@/components/Proposals/Details/UacMemberDetails.vue')
  }
}

const getDashboardComponentForRole = () => {
  const authStore = useAuthStore()

  switch (authStore.singleKnownRole) {
    case Role.Researcher:
      return import('@/components/Dashboard/ResearcherDashboard.vue')

    case Role.FdpgMember:
      return import('@/components/Dashboard/FdpgMemberDashboard.vue')

    case Role.DizMember:
    case Role.UacMember:
      return import('@/components/Dashboard/LocationDashboard.vue')

    case Role.Admin:
      return import('@/components/Dashboard/AdminDashboard.vue')

    default:
      return import('@/components/Dashboard/NoRoleDashboard.vue')
  }
}
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    meta: {
      authName: 'main',
    },
    component: () => import('@/layouts/DashboardLayout.vue'),
    children: [
      {
        path: '/profile',
        name: RouteName.UserProfile,
        component: () => import('@/pages/UserProfile.vue'),
        meta: {
          resetBreadcrumbs: true,
        },
      },
      {
        path: '/',
        name: RouteName.Dashboard,
        component: () => getDashboardComponentForRole(),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
        },
      },
      {
        path: '/pending',
        name: RouteName.Pending,
        component: () => getDashboardComponentForRole(),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember],
        },
      },
      {
        path: '/current',
        name: RouteName.Ongoing,
        component: () => getDashboardComponentForRole(),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember],
        },
      },
      {
        path: '/completed',
        name: RouteName.Completed,
        component: () => getDashboardComponentForRole(),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember],
        },
      },
      {
        path: '/archive',
        name: RouteName.Archive,
        component: () => import('@/pages/ArchivePage.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember, Role.Researcher, Role.DizMember, Role.UacMember],
        },
      },
      {
        path: '/create-proposal',
        name: RouteName.CreateProposal,
        component: () => import('@/pages/Proposals/NewPage.vue'),
        meta: {
          resetBreadcrumbs: true,
          roles: [Role.Researcher],
        },
      },
      {
        path: '/proposals/:id',
        name: RouteName.EditProposal,
        component: () => import('@/pages/Proposals/NewPage.vue'),
        props: true,
        meta: {
          roles: [Role.Researcher],
        },
      },
      {
        path: '/proposals/:id/details',
        name: RouteName.ProposalDetails,
        component: () => getDetailComponentForRole(),
        props: true,
        meta: {
          roles: [Role.Researcher, Role.FdpgMember, Role.DizMember, Role.UacMember],
        },
      },
      {
        path: '/proposals/:id/review',
        name: RouteName.ReviewProposal,
        component: () => import('@/pages/Proposals/ReviewProposal.vue'),
        props: true,
      },
    ],
  },

  {
    path: '/no-permission',
    name: RouteName.NoPermission,
    component: () => import('@/pages/NoPermission.vue'),
    meta: {
      resetBreadcrumbs: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * Dashboard reset breadcrumbs
 * Save last dashboard to layout store for navigation via breadcrumbs
 */
router.beforeEach((to, from) => {
  // For now a little hacky to have it here
  const layoutStore = useLayoutStore()
  if (to.meta.resetBreadcrumbs) {
    layoutStore.setBreadcrumbs([])
  }
  if (from.meta.setLastDashboard) {
    layoutStore.setLastDashboard(from.name as RouteName)
  }
})

/**
 * Scroll page to top on every route change
 */
router.beforeEach(() => {
  setTimeout(() => {
    const mainWrapper = document.getElementById('main-scroll-top')
    if (mainWrapper) {
      mainWrapper.scrollTo(0, 0)
    }
  }, 100)
})

export default router

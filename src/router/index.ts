import { useLayoutStore } from '@/stores/layout.store'
import { Role } from '@/types/oidc.types'
import { RouteName } from '@/types/route-name.enum'
import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

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
        component: () => import('@/components/Dashboard/DashboardComponent.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
        },
      },
      {
        path: '/locations',
        name: RouteName.Locations,
        component: () => import('@/components/Locations/LocationOverview.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
        },
      },
      {
        path: '/data-sources',
        name: RouteName.DataSources,
        component: () => import('@/components/DataSource/DataSourceOverview.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember],
        },
      },
      {
        path: '/pending',
        name: RouteName.Pending,
        component: () => import('@/components/Dashboard/DashboardComponent.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember, Role.DataSourceMember],
        },
      },
      {
        path: '/current',
        name: RouteName.Ongoing,
        component: () => import('@/components/Dashboard/DashboardComponent.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember, Role.DataSourceMember],
        },
      },
      {
        path: '/completed',
        name: RouteName.Completed,
        component: () => import('@/components/Dashboard/DashboardComponent.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember, Role.DataSourceMember],
        },
      },
      {
        path: '/archived',
        name: RouteName.Archived,
        component: () => import('@/pages/ArchivePage.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [
            Role.FdpgMember,
            Role.DataSourceMember,
            Role.Researcher,
            Role.DizMember,
            Role.UacMember,
            Role.RegisteringMember,
          ],
        },
      },
      {
        path: '/published',
        name: RouteName.Published,
        component: () => import('@/pages/PublishedPage.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [
            Role.FdpgMember,
            Role.DataSourceMember,
            Role.RegisteringMember,
            Role.Researcher,
            Role.DizMember,
            Role.UacMember,
          ],
        },
      },
      {
        path: '/overview',
        name: RouteName.Overview,
        component: () => import('@/components/Dashboard/DashboardComponent.vue'),
        meta: {
          resetBreadcrumbs: true,
          setLastDashboard: true,
          roles: [Role.FdpgMember, Role.DataSourceMember],
        },
      },

      {
        path: '/proposals/:id/details',
        name: RouteName.ProposalDetails,
        component: () => import('@/components/Proposals/Details/DetailComponent.vue'),
        props: true,
        meta: {
          roles: [
            Role.Researcher,
            Role.FdpgMember,
            Role.DataSourceMember,
            Role.DizMember,
            Role.UacMember,
            Role.RegisteringMember,
            Role.DataManagementOffice,
          ],
        },
      },
      {
        path: '/proposals/:id/review',
        name: RouteName.ReviewProposal,
        component: () => import('@/pages/Proposals/ReviewProposal.vue'),
        props: true,
        meta: {
          roles: [
            Role.Researcher,
            Role.FdpgMember,
            Role.DataSourceMember,
            Role.DizMember,
            Role.UacMember,
            Role.RegisteringMember,
          ],
        },
      },
    ],
  },
  {
    path: '/proposals',
    meta: {
      authName: 'main',
    },
    component: () => import('@/layouts/ProposalLayout.vue'),
    children: [
      {
        path: 'create',
        name: RouteName.CreateProposal,
        component: () => import('@/pages/Proposals/NewPage.vue'),
        meta: {
          resetBreadcrumbs: true,
          roles: [Role.Researcher],
        },
      },
      {
        path: '/:id',
        name: RouteName.EditProposal,
        component: () => import('@/pages/Proposals/NewPage.vue'),
        props: true,
        meta: {
          roles: [Role.Researcher],
        },
      },
      {
        path: '/register/create',
        name: RouteName.RegisterNewProject,
        component: () => import('@/pages/Proposals/NewPage.vue'),
        meta: {
          roles: [
            Role.Researcher,
            Role.FdpgMember,
            Role.DataSourceMember,
            Role.DizMember,
            Role.UacMember,
            Role.RegisteringMember,
          ],
        },
      },
      {
        path: '/register/:id',
        name: RouteName.EditRegisteredProject,
        component: () => import('@/pages/Proposals/NewPage.vue'),
        meta: {
          roles: [
            Role.Researcher,
            Role.FdpgMember,
            Role.DataSourceMember,
            Role.DizMember,
            Role.UacMember,
            Role.RegisteringMember,
          ],
        },
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

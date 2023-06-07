import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/print',
    name: 'PrintLayout',
    component: () => import('../PrintLayout.vue'),
    children: [
      {
        path: '/print/proposal',
        name: 'PrintProposal',
        component: () => import('../pages/PrintProposal.vue'),
        props: true,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

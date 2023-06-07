import { ComponentCustomProperties } from 'vue'
import type { OidcAuth } from 'vue-oidc-client/vue3'
import 'pinia'
import type { IOidc } from '@/types/oidc.types'
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $oidc: OidcAuth & { user?: IOidc }
  }
}

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $oidc: OidcAuth & { user?: IOidc }
  }
  export interface PiniaCustomStateProperties<S> {
    $oidc: OidcAuth & { user?: IOidc }
  }
}

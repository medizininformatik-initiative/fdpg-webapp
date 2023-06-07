import type { AxiosInstance } from 'axios';
import axios from 'axios'
import { requestInterceptor, responseInterceptor } from './api.interceptors'

export class ApiClient {
  private baseUrl: string
  private timeout: number

  client: AxiosInstance

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_SERVER || ''

    try {
      this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT_SECONDS ?? '10000')
    } catch {
      this.timeout = 10_000
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'content-type': 'application/json',
      },
    })

    this.addInterceptors()
  }

  private addInterceptors = (): void => {
    this.client.interceptors.request.use(requestInterceptor.onFullfilled, requestInterceptor.onRejected)
    this.client.interceptors.response.use(responseInterceptor.onFullfilled, responseInterceptor.onRejected)
  }
}

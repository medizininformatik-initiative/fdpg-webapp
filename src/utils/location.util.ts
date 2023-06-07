export class LocationUtil {
  location = window.location
  protocol = this.location.protocol
  host = this.location.host
  basePath = import.meta.env.VITE_BASE_PATH
  baseUrl = `${this.protocol}//${this.host}${this.basePath ? this.basePath : '/'}`
}

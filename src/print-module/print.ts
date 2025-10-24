import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import AppPrint from '../App-Print.vue'
import router from './router'
import { i18n } from '@/plugins/i18n'

import 'element-plus/theme-chalk/index.css'
// In case Icons are needed
// import '@fortawesome/fontawesome-free/css/all.min.css'
// import 'bootstrap-icons/font/bootstrap-icons.css'
import '../fonts.css'
import '../assets/sass/style.scss'
import { createPinia } from 'pinia'

const main = async () => {
  const app = createApp(AppPrint)

  const pinia = createPinia()
  app.use(i18n).use(router).use(ElementPlus).use(pinia)

  /**
   * Creates and injects an error overlay onto the page.
   */
  function showErrorOverlay({ title, message, stack }) {
    // Remove any existing overlay
    const existingOverlay = document.getElementById('__dev-error-overlay')
    if (existingOverlay) {
      existingOverlay.remove()
    }

    // Create the overlay container
    const overlay = document.createElement('div')
    overlay.id = '__dev-error-overlay'

    // Basic styles for the overlay
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(10, 0, 0, 0.85)', // Dark semi-transparent
      zIndex: '99999',
      padding: '2rem',
      color: 'white',
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: '14px',
      overflow: 'auto',
      boxSizing: 'border-box',
    })

    // Format the content
    // We use <pre> to respect whitespace in the stack trace
    const content = `
      <h2 style="color: #ff5555; margin-top: 0; margin-bottom: 1rem;">${title}</h2>
      <h3 style="color: #ffaaaa; margin-bottom: 1rem;">${message}</h3>
      <pre style="color: #e0e0e0; white-space: pre-wrap; word-wrap: break-word;">${stack || 'No stack trace available.'}</pre>
    `

    overlay.innerHTML = content

    // Add a close button
    const closeButton = document.createElement('button')
    closeButton.innerText = 'Close (X)'
    Object.assign(closeButton.style, {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '8px 12px',
      cursor: 'pointer',
      backgroundColor: '#555',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
    })

    // When closed, remove the overlay from the DOM
    closeButton.onclick = () => {
      overlay.remove()
    }

    overlay.appendChild(closeButton)

    // Add the overlay to the page
    document.body.appendChild(overlay)
  }

  // 1. Catch Vue-specific errors
  app.config.errorHandler = (err, instance, info) => {
    // Still log to console for good measure
    console.error('Vue Error:', err, info)

    showErrorOverlay({
      title: `Vue Error in ${instance ? instance.$.type.name : 'Unknown'} Component`,
      message: err.message,
      stack: err.stack,
    })
  }

  // 2. Catch unhandled promise rejections (e.g., from async/await)
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Rejection:', event.reason)

    const reason = event.reason
    showErrorOverlay({
      title: 'Unhandled Promise Rejection',
      message: reason?.message || 'No message provided.',
      stack: reason?.stack || 'No stack trace available.',
    })
  })

  // 3. Catch general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error)

    showErrorOverlay({
      title: 'Global JavaScript Error',
      message: event.message,
      stack: event.error ? event.error.stack : `At ${event.filename}:${event.lineno}:${event.colno}`,
    })
  })

  // --- End of error overlay logic ---

  app.mount('#app')
}

;(async () => await main())()

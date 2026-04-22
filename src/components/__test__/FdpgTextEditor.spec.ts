import FdpgTextEditor from '../FdpgTextEditor.vue'
import { createTestingPinia } from '@pinia/testing'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'

/** Subset of the real backend payload for materialAndMethods, trimmed for readability */
const RICH_HTML =
  `<p><strong>Materialien:</strong> OCT-Bilddaten (DICOM-Metadaten), klinische Routinedaten.</p>` +
  `<p><br></p>` +
  `<ul>` +
  `<li>Wir werden U-Net-basierte Deep Learning-Modelle trainieren.</li>` +
  `<li>Wir werden interpretierbare Deep Survival-Modelle trainieren.</li>` +
  `<li>Wir werden die Deep Survival Modelle für demographische Parameter ergänzen.</li>` +
  `</ul>` +
  `<p><br></p>` +
  `<p><strong>Technischer Ablauf und Datenfluss:</strong></p>` +
  `<p>Die Datenverarbeitung erfolgt in einem klar definierten Ablauf.</p>`

function mountEditor(props: Record<string, unknown> = {}) {
  return mount(FdpgTextEditor, {
    props: {
      modelValue: '',
      disabled: false,
      ...props,
    },
    global: { plugins: [createTestingPinia()] },
    attachTo: document.body,
  })
}

async function settleQuill() {
  // Allow MutationObserver microtasks + Vue reactivity to flush
  await nextTick()
  await nextTick()
  await flushPromises()
}

describe('FdpgTextEditor.vue', () => {
  let wrapper: VueWrapper

  afterEach(() => {
    wrapper.unmount()
  })

  // ─── Mount with content ─────────────────────────────────────────────────────

  describe('when modelValue is provided at mount time', () => {
    beforeEach(async () => {
      wrapper = mountEditor({ modelValue: RICH_HTML, disabled: true })
      await settleQuill()
    })

    it('renders the editor element', () => {
      expect(wrapper.find('.ql-editor').exists()).toBe(true)
    })

    it('does NOT have ql-blank class', () => {
      // ql-blank is added by Quill when its internal delta is empty.
      // It must be absent when real content was loaded.
      expect(wrapper.find('.ql-editor').classes()).not.toContain('ql-blank')
    })

    it('renders all paragraphs from the HTML', () => {
      const text = wrapper.find('.ql-editor').text()
      expect(text).toContain('Materialien:')
      expect(text).toContain('Technischer Ablauf und Datenfluss:')
      expect(text).toContain('Die Datenverarbeitung erfolgt')
    })

    it('renders all list items', () => {
      const text = wrapper.find('.ql-editor').text()
      expect(text).toContain('U-Net-basierte Deep Learning-Modelle')
      expect(text).toContain('interpretierbare Deep Survival-Modelle')
      expect(text).toContain('demographische Parameter')
    })

    it('Quill delta length reflects actual content', () => {
      const quill = (wrapper.vm as any).textEditor?.getQuill()
      // A blank editor has length 1 (the trailing newline Quill always inserts).
      // Any real content pushes this well above 1.
      expect(quill?.getLength()).toBeGreaterThan(1)
    })
  })

  // ─── Async load: modelValue arrives after mount ──────────────────────────────

  describe('when modelValue is set asynchronously after mount (simulates API response)', () => {
    beforeEach(async () => {
      wrapper = mountEditor({ modelValue: '', disabled: true })
      await settleQuill()
    })

    it('editor starts blank', () => {
      expect(wrapper.find('.ql-editor').classes()).toContain('ql-blank')
    })

    it('renders all content after modelValue update', async () => {
      await wrapper.setProps({ modelValue: RICH_HTML })
      await settleQuill()

      const text = wrapper.find('.ql-editor').text()
      expect(text).toContain('Materialien:')
      expect(text).toContain('U-Net-basierte Deep Learning-Modelle')
      expect(text).toContain('Technischer Ablauf und Datenfluss:')
    })

    it('does NOT have ql-blank class after modelValue update', async () => {
      await wrapper.setProps({ modelValue: RICH_HTML })
      await settleQuill()

      expect(wrapper.find('.ql-editor').classes()).not.toContain('ql-blank')
    })

    it('Quill delta length > 1 after modelValue update', async () => {
      await wrapper.setProps({ modelValue: RICH_HTML })
      await settleQuill()

      const quill = (wrapper.vm as any).textEditor?.getQuill()
      expect(quill?.getLength()).toBeGreaterThan(1)
    })
  })

  // ─── Editable mode ──────────────────────────────────────────────────────────

  describe('when not disabled (editable)', () => {
    beforeEach(async () => {
      wrapper = mountEditor({ modelValue: RICH_HTML, disabled: false })
      await settleQuill()
    })

    it('renders all content in editable mode', () => {
      const text = wrapper.find('.ql-editor').text()
      expect(text).toContain('Materialien:')
      expect(text).toContain('U-Net-basierte Deep Learning-Modelle')
    })

    it('does NOT have ql-blank class in editable mode', () => {
      expect(wrapper.find('.ql-editor').classes()).not.toContain('ql-blank')
    })
  })

  // ─── Clearing content ───────────────────────────────────────────────────────

  describe('when modelValue is cleared', () => {
    beforeEach(async () => {
      wrapper = mountEditor({ modelValue: RICH_HTML })
      await settleQuill()
    })

    it('becomes blank after modelValue is set to empty string', async () => {
      await wrapper.setProps({ modelValue: '' })
      await settleQuill()

      expect(wrapper.find('.ql-editor').classes()).toContain('ql-blank')
    })
  })

  // ─── Cursor stability: hasFocus guard ─────────────────────────────────────

  describe('cursor stability while the editor has focus', () => {
    beforeEach(async () => {
      wrapper = mountEditor({ modelValue: '<p>abc</p>', disabled: false })
      await settleQuill()
    })

    it('should NOT overwrite editor content when the editor has focus and a stale modelValue arrives', async () => {
      const quill = (wrapper.vm as any).textEditor?.getQuill()
      expect(quill).toBeTruthy()

      // Simulate user actively editing: stub hasFocus to return true
      vi.spyOn(quill, 'hasFocus').mockReturnValue(true)

      // Capture current innerHTML after user has typed
      const contentBefore = wrapper.find('.ql-editor').html()

      // Simulate stale API response arriving via prop update
      await wrapper.setProps({ modelValue: '<p>stale value</p>' })
      await settleQuill()

      // Editor content should remain unchanged — the focus guard skips the update
      const contentAfter = wrapper.find('.ql-editor').html()
      expect(contentAfter).toBe(contentBefore)
    })

    it('should emit current content on blur to sync parent data', async () => {
      const quill = (wrapper.vm as any).textEditor?.getQuill()
      expect(quill).toBeTruthy()

      // While focused, a stale prop arrives — watcher skips it
      vi.spyOn(quill, 'hasFocus').mockReturnValue(true)
      await wrapper.setProps({ modelValue: '<p>stale value</p>' })
      await settleQuill()

      // Clear emitted events to isolate the blur behavior
      wrapper.emitted()['update:modelValue'] = []

      // Simulate blur: Quill fires selection-change(null)
      vi.spyOn(quill, 'hasFocus').mockReturnValue(false)
      quill.emitter.emit('selection-change', null, { index: 0, length: 0 }, 'user')
      await settleQuill()

      // On blur, the component should emit update:modelValue with the
      // editor's actual content (not the stale prop) before emitting blur.
      const modelEmits = wrapper.emitted('update:modelValue')
      expect(modelEmits).toBeTruthy()
      expect(modelEmits!.length).toBeGreaterThanOrEqual(1)
      const lastEmit = modelEmits![modelEmits!.length - 1][0] as string
      expect(lastEmit).toContain('abc')
      expect(lastEmit).not.toContain('stale value')

      // blur should also have been emitted
      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should apply external modelValue changes when the editor does NOT have focus', async () => {
      const quill = (wrapper.vm as any).textEditor?.getQuill()
      expect(quill).toBeTruthy()

      // Ensure hasFocus returns false
      vi.spyOn(quill, 'hasFocus').mockReturnValue(false)

      await wrapper.setProps({ modelValue: '<p>new value</p>' })
      await settleQuill()

      const text = wrapper.find('.ql-editor').text()
      expect(text).toContain('new value')
    })
  })
})

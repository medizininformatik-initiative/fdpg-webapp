export type DialogContent = {
  title: string
  content: string
  actions: {
    text: string
    attribute: any
    onClick: () => void
  }[]
}

import { CardType } from '@/types/component.types'
import type { PanelType } from '@/types/proposal.types'
import { PanelQuery } from '@/types/sort-filter.types'
import { computed } from 'vue'

const mockPanels = () => {
  const RESEARCHER_PANELS: PanelType[] = [
    { type: CardType.Draft, header: 'dashboard.draft', query: PanelQuery.Draft, hasClickAction: true },
    { type: CardType.Pending, header: 'general.pending', query: PanelQuery.ResearcherPending, hasClickAction: true },
    { type: CardType.Ongoing, header: 'dashboard.ongoing', query: PanelQuery.ResearcherOngoing, hasClickAction: true },
    {
      type: CardType.Completed,
      header: 'dashboard.completed',
      query: PanelQuery.ResearcherFinished,
      hasClickAction: true,
    },
  ]

  return RESEARCHER_PANELS
}
export default () => {
  const panels = computed(() => mockPanels())
  const proposalCount = computed(() => 7)

  return {
    panels,
    proposalCount,
  }
}

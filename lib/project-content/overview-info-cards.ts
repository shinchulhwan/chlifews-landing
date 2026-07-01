import type { OverviewInfoCard } from "@/lib/types/project-content";
import { DEFAULT_OVERVIEW_INFO_CARDS } from "@/lib/types/project-content";

export const DEFAULT_OVERVIEW_LABELS = DEFAULT_OVERVIEW_INFO_CARDS.map(
  (card) => card.label,
);

export function isDefaultOverviewLabel(label: string): boolean {
  return DEFAULT_OVERVIEW_LABELS.includes(label);
}

/** DB에 저장된 카드와 기본 5개 항목을 병합합니다. value는 가공하지 않습니다. */
export function mergeOverviewInfoCards(
  saved: OverviewInfoCard[] | undefined | null,
): OverviewInfoCard[] {
  const savedByLabel = new Map<string, OverviewInfoCard>();
  const customCards: OverviewInfoCard[] = [];

  for (const card of saved ?? []) {
    if (isDefaultOverviewLabel(card.label)) {
      savedByLabel.set(card.label, card);
    } else {
      customCards.push(card);
    }
  }

  const defaults = DEFAULT_OVERVIEW_INFO_CARDS.map((defaultCard) => {
    const existing = savedByLabel.get(defaultCard.label);
    if (existing) {
      return {
        id: existing.id,
        label: defaultCard.label,
        value: existing.value,
      };
    }
    return { ...defaultCard };
  });

  return [...defaults, ...customCards];
}

export function updateOverviewCardValue(
  cards: OverviewInfoCard[],
  label: string,
  value: string,
): OverviewInfoCard[] {
  return cards.map((card) => (card.label === label ? { ...card, value } : card));
}

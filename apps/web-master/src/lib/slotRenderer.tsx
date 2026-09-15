import { ReactNode } from "react";

type Slot = { slotName: string; slotType: string; contentBindings: Record<string, string> };

export function renderSlot(slot: Slot): ReactNode {
  throw new Error(`Unmapped required slot "${slot.slotName}"; fail closed (no placeholder shell)`);
}

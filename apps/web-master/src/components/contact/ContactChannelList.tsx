"use client";

import { CmsContactChannel } from "@/lib/contactTypes";
import { ContactChannelCard } from "./ContactChannelCard";

interface ContactChannelListProps {
  channels: CmsContactChannel[];
}

export function ContactChannelList({ channels }: ContactChannelListProps) {
  // Sort by priority weight
  const sortedChannels = [...channels].sort((a, b) => a.priorityWeight - b.priorityWeight);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sortedChannels.map((channel) => (
        <ContactChannelCard key={channel.id} channel={channel} />
      ))}
    </div>
  );
}

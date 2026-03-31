"use client";

import { useTranslations } from "next-intl";
import { CmsContactChannel } from "@/lib/contactTypes";
import * as LucideIcons from "lucide-react";

interface ContactChannelCardProps {
  channel: CmsContactChannel;
}

export function ContactChannelCard({ channel }: ContactChannelCardProps) {
  const t = useTranslations();
  // Dynamically get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[channel.icon] || LucideIcons.HelpCircle;

  const handleClick = () => {
    if (channel.channelType === "email") {
      window.location.href = `mailto:${channel.contactValue}`;
    } else if (channel.channelType === "calendar") {
      window.open(channel.contactValue, "_blank", "noopener,noreferrer");
    } else if (channel.channelType === "chat") {
      // Placeholder for future chat widget integration
      console.log("Chat widget would open here");
    }
  };

  const isClickable = channel.contactValue !== "#";

  return (
    <div className="p-6 bg-muted/30 rounded-lg border border-border flex flex-col">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">
              {channel.displayName}
            </h3>
            {channel.badgeText && (
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {channel.badgeText}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            {channel.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {channel.availabilityText}
          </p>
        </div>
      </div>
      {isClickable ? (
        <button
          onClick={handleClick}
          className="mt-auto px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
          aria-label={`${channel.displayName} - ${channel.channelType === "email" ? t("contact.channels.sendEmail") : channel.channelType === "calendar" ? t("contact.channels.scheduleNow") : t("contact.channels.startChat")}`}
        >
          {channel.channelType === "email" && t("contact.channels.sendEmail")}
          {channel.channelType === "calendar" && t("contact.channels.scheduleNow")}
          {channel.channelType === "chat" && t("contact.channels.startChat")}
        </button>
      ) : (
        <div className="mt-auto px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium text-center" role="status" aria-label={`${channel.displayName} - ${t("comingSoon")}`}>
          {t("comingSoon")}
        </div>
      )}
    </div>
  );
}

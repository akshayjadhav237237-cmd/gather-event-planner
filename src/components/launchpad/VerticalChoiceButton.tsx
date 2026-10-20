import { type ReactNode } from 'react';
import { CalendarHeart, PartyPopper, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';
import {
  EVENT_TYPE_BLURBS,
  EVENT_TYPE_LABELS,
} from '../../ui/labels';
import type { EventType } from '../../types/event';

export interface VerticalChoiceButtonProps {
  eventType: EventType;
  onClick: () => void;
  isFlagship?: boolean;
}

const TYPE_ICONS: Record<EventType, ReactNode> = {
  wedding: <CalendarHeart size={28} strokeWidth={1.5} aria-hidden="true" className="text-accent" />,
  birthday: <PartyPopper size={28} strokeWidth={1.5} aria-hidden="true" className="text-accent" />,
  community: <Users size={28} strokeWidth={1.5} aria-hidden="true" className="text-accent" />,
};

export function VerticalChoiceButton({
  eventType,
  onClick,
  isFlagship = false,
}: VerticalChoiceButtonProps) {
  const label = EVENT_TYPE_LABELS[eventType];
  const blurb = EVENT_TYPE_BLURBS[eventType];
  const icon = TYPE_ICONS[eventType];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col items-start p-6 text-left bg-surface border border-line rounded-card transition-all duration-150 ease-out hover:border-line-control hover:bg-sunken focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 min-h-[140px] cursor-pointer w-full"
    >
      <div className="flex items-center justify-between w-full mb-3">
        <div className="p-2 rounded-control bg-sunken group-hover:bg-surface border border-line transition-colors">
          {icon}
        </div>
        {isFlagship && <Badge tone="accent">Flagship</Badge>}
      </div>

      <span className="font-serif text-2xl text-ink font-normal mb-1">
        {label}
      </span>

      <span className="text-sm text-muted leading-relaxed">
        {blurb}
      </span>
    </button>
  );
}

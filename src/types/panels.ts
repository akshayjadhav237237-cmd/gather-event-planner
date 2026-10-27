import type { PlanBundle } from './engine';

export interface PanelProps {
  bundle: PlanBundle;
  today: string;
}

export interface IdeasPanelProps extends PanelProps {
  hasLiveKey: boolean;
  onOpenAiSettings: () => void;
}

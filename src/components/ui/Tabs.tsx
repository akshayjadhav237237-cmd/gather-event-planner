import { useRef, type ReactNode } from 'react';
import { nextTabIndex } from '../../ui/tabNav';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  panel: ReactNode;
}

export interface TabsProps {
  label: string;
  tabs: ReadonlyArray<TabItem>;
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({
  label,
  tabs,
  activeId,
  onChange,
  className = '',
}: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = tabs.findIndex((tab) => tab.id === activeId);
  const currentIdx = activeIndex >= 0 ? activeIndex : 0;
  const activeTab = tabs[currentIdx];

  return (
    <div className={`flex flex-col ${className}`.trim()}>
      <div
        role="tablist"
        aria-label={label}
        className="flex border-b border-line overflow-x-auto gap-2"
      >
        {tabs.map((tab, idx) => {
          const isSelected = tab.id === activeTab?.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[idx] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => {
                const nextIdx = nextTabIndex(idx, tabs.length, e.key);
                if (nextIdx !== null && nextIdx !== idx) {
                  e.preventDefault();
                  const nextTab = tabs[nextIdx];
                  if (nextTab) {
                    onChange(nextTab.id);
                    tabRefs.current[nextIdx]?.focus();
                  }
                }
              }}
              className={`min-h-[44px] px-4 py-2.5 inline-flex items-center gap-2 text-sm font-medium border-b-2 transition-colors duration-150 ease-out whitespace-nowrap cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2 ${
                isSelected
                  ? 'border-accent text-ink'
                  : 'border-transparent text-muted hover:text-ink hover:border-line'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab && (
        <div
          role="tabpanel"
          id={`panel-${activeTab.id}`}
          aria-labelledby={`tab-${activeTab.id}`}
          tabIndex={0}
          className="pt-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
        >
          {activeTab.panel}
        </div>
      )}
    </div>
  );
}

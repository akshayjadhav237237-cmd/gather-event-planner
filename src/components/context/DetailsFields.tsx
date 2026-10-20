import { SEASONS, VENUE_SETTINGS } from '../../config/constants';
import type { Season, VenueSetting } from '../../types/event';
import type { FieldErrors, FieldKey, FormDraft } from '../../ui/formModel';
import { SEASON_LABELS, SETTING_LABELS } from '../../ui/labels';
import { FormField } from '../ui/FormField';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Textarea } from '../ui/Textarea';

export interface DetailsFieldsProps {
  draft: FormDraft;
  errors: FieldErrors;
  onChange: <K extends FieldKey>(key: K, value: FormDraft[K]) => void;
  idPrefix?: string;
}

export function DetailsFields({
  draft,
  errors,
  onChange,
  idPrefix = 'context',
}: DetailsFieldsProps) {
  const settingOptions = VENUE_SETTINGS.map((val) => ({
    value: val,
    label: SETTING_LABELS[val],
  }));

  const seasonOptions = SEASONS.map((val) => ({
    value: val,
    label: SEASON_LABELS[val],
  }));

  const charsLeft = Math.max(0, 300 - draft.userNotes.length);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <SegmentedControl<VenueSetting>
            name={`${idPrefix}-setting`}
            legend="Venue setting"
            value={draft.setting}
            options={settingOptions}
            onChange={(val) => onChange('setting', val)}
          />
        </div>

        <div>
          <SegmentedControl<Season>
            name={`${idPrefix}-season`}
            legend="Season / climate"
            value={draft.season}
            options={seasonOptions}
            onChange={(val) => onChange('season', val)}
          />
        </div>
      </div>

      <FormField
        id={`${idPrefix}-userNotes`}
        label="Notes or special considerations"
        hint={`${charsLeft} characters remaining`}
        error={errors.userNotes}
      >
        {(aria) => (
          <Textarea
            {...aria}
            rows={3}
            maxLength={300}
            value={draft.userNotes}
            onChange={(e) => onChange('userNotes', e.target.value)}
            placeholder="Add any specific cultural rituals, family requirements, or preferences for your celebration..."
          />
        )}
      </FormField>
    </div>
  );
}

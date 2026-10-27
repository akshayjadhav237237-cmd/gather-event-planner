import { useEffect, useRef, useState, type FC, type FormEvent } from 'react';
import type { VendorCategoryGuide, VendorQuote } from '../../types/event';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { createId } from '../../utils/id';
import {
  draftFromQuote,
  emptyQuoteDraft,
  parseQuoteDraft,
  type QuoteDraft,
} from '../../ui/quoteForm';

export interface QuoteFormProps {
  guides: readonly VendorCategoryGuide[];
  editingQuote?: VendorQuote | null;
  onSave: (quote: VendorQuote) => void;
  onCancel?: () => void;
}

export const QuoteForm: FC<QuoteFormProps> = ({
  guides,
  editingQuote,
  onSave,
  onCancel,
}) => {
  const [draft, setDraft] = useState<QuoteDraft>(() =>
    editingQuote ? draftFromQuote(editingQuote) : emptyQuoteDraft(guides[0]?.id ?? '')
  );
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteDraft, string>>>({});
  const [announcement, setAnnouncement] = useState<string>('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingQuote) {
      setDraft(draftFromQuote(editingQuote));
      setErrors({});
    } else {
      setDraft(emptyQuoteDraft(guides[0]?.id ?? ''));
      setErrors({});
    }
  }, [editingQuote, guides]);

  const updateField = <K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const id = editingQuote?.id ?? createId();
    const result = parseQuoteDraft(draft, id);

    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    onSave(result.value);
    setDraft(emptyQuoteDraft(guides[0]?.id ?? ''));
    setAnnouncement('Quote saved');
    nameInputRef.current?.focus();
  };

  return (
    <Card padding="md" as="section" aria-labelledby="quote-form-heading">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 id="quote-form-heading" className="text-lg font-serif text-ink font-normal">
          {editingQuote ? 'Edit Vendor Quote' : 'Add Vendor Quote'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="quote-category-select" label="Category" error={errors.categoryId}>
            {(aria) => (
              <Select
                {...aria}
                value={draft.categoryId}
                onChange={(e) => updateField('categoryId', e.target.value)}
              >
                <option value="">Select a category</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </Select>
            )}
          </FormField>

          <FormField id="vendor-name-input" label="Vendor name" error={errors.vendorName}>
            {(aria) => (
              <Input
                {...aria}
                ref={nameInputRef}
                value={draft.vendorName}
                placeholder="e.g. Pavilion Hall Co."
                onChange={(e) => updateField('vendorName', e.target.value)}
              />
            )}
          </FormField>

          <FormField id="quote-base-input" label="Base quote" error={errors.baseQuote}>
            {(aria) => (
              <Input
                {...aria}
                inputMode="numeric"
                value={draft.baseQuote}
                placeholder="0"
                onChange={(e) => updateField('baseQuote', e.target.value)}
              />
            )}
          </FormField>

          <FormField
            id="quote-tax-input"
            label="Service and tax %"
            hint="If the quote leaves out service charge or tax, enter the percentage so totals are comparable."
            error={errors.serviceAndTaxPct}
          >
            {(aria) => (
              <Input
                {...aria}
                inputMode="numeric"
                value={draft.serviceAndTaxPct}
                placeholder="0"
                onChange={(e) => updateField('serviceAndTaxPct', e.target.value)}
              />
            )}
          </FormField>

          <FormField id="quote-deposit-input" label="Deposit paid" error={errors.depositPaid}>
            {(aria) => (
              <Input
                {...aria}
                inputMode="numeric"
                value={draft.depositPaid}
                placeholder="0"
                onChange={(e) => updateField('depositPaid', e.target.value)}
              />
            )}
          </FormField>

          <div className="flex flex-col justify-end">
            <div className="flex flex-wrap gap-4 py-2">
              <div className="flex items-center gap-2">
                <span className="min-w-[24px] min-h-[24px] flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="quote-contract-signed"
                    checked={draft.contractSigned}
                    onChange={(e) => updateField('contractSigned', e.target.checked)}
                    className="h-4 w-4 rounded border-line-control text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus cursor-pointer"
                  />
                </span>
                <label htmlFor="quote-contract-signed" className="text-sm text-ink cursor-pointer select-none py-1">
                  Contract signed
                </label>
              </div>

              <div className="flex items-center gap-2">
                <span className="min-w-[24px] min-h-[24px] flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="quote-insurance-verified"
                    checked={draft.insuranceVerified}
                    onChange={(e) => updateField('insuranceVerified', e.target.checked)}
                    className="h-4 w-4 rounded border-line-control text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus cursor-pointer"
                  />
                </span>
                <label htmlFor="quote-insurance-verified" className="text-sm text-ink cursor-pointer select-none py-1">
                  Insurance or licences verified
                </label>
              </div>
            </div>
          </div>
        </div>

        <FormField
          id="quote-backup-plan"
          label="Backup plan"
          hint={`${draft.backupPlan.length}/200 characters`}
          error={errors.backupPlan}
        >
          {(aria) => (
            <Textarea
              {...aria}
              maxLength={200}
              rows={2}
              value={draft.backupPlan}
              placeholder="e.g. Indoor hall on standby with 2hr callout"
              onChange={(e) => updateField('backupPlan', e.target.value)}
            />
          )}
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="primary">
            {editingQuote ? 'Update quote' : 'Save quote'}
          </Button>
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        {announcement && <VisuallyHidden role="status">{announcement}</VisuallyHidden>}
      </form>
    </Card>
  );
};

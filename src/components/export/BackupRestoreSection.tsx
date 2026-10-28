import { useRef, useState, type ChangeEvent, type FC } from 'react';
import { parseBackup, type BackupPayload } from '../../export';
import { readFileText } from '../../ui/browserActions';
import { AlertCard } from '../shared/AlertCard';
import { Button } from '../ui/Button';

export interface BackupRestoreSectionProps {
  onRestored: (backup: BackupPayload) => void;
}

export const BackupRestoreSection: FC<BackupRestoreSectionProps> = ({ onRestored }) => {
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreError(null);
    setPendingBackup(null);
    const readRes = await readFileText(file, 1_000_000);
    if (!readRes.ok) return setRestoreError(readRes.reason);
    const parsed = parseBackup(readRes.text);
    if (!parsed.ok) return setRestoreError(parsed.reason);
    setPendingBackup(parsed.value);
  };

  const handleConfirm = () => {
    if (!pendingBackup) return;
    onRestored(pendingBackup);
    setPendingBackup(null);
    setRestoreError(null);
    resetFileInput();
  };

  const handleCancel = () => {
    setPendingBackup(null);
    setRestoreError(null);
    resetFileInput();
  };

  return (
    <section
      aria-labelledby="restore-section-heading"
      className="border-t border-line pt-4 space-y-3"
    >
      <h3 id="restore-section-heading" className="text-sm font-semibold text-ink">
        Restore from a backup
      </h3>
      <p className="text-xs text-muted">
        Load a previously exported Gather JSON backup file to replace your current plan.
      </p>
      <div>
        <label htmlFor="backup-file" className="block text-xs font-medium text-ink-soft mb-1.5">
          Select backup file
        </label>
        <input
          ref={fileInputRef}
          id="backup-file"
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-control file:border-0 file:text-xs file:font-medium file:bg-sunken file:text-ink hover:file:bg-line cursor-pointer"
        />
      </div>
      {restoreError && (
        <AlertCard tone="warning" title="Backup restore failed">
          {restoreError}
        </AlertCard>
      )}
      {pendingBackup && (
        <div className="p-3 bg-sunken border border-line rounded-card space-y-3">
          <p className="text-xs text-ink font-medium">
            Replace your current plan with the backup of &ldquo;{pendingBackup.context.title}
            &rdquo;?
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleConfirm}>
              Replace plan
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

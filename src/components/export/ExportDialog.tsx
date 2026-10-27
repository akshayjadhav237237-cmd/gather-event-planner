import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { buildPlanBrief, parseBackup, type BackupPayload } from '../../export';
import { useExportState } from '../../hooks/useExportState';
import { usePlanStore } from '../../store/planStore';
import {
  copyTextToClipboard,
  downloadTextFile,
  printPage,
  readFileText,
} from '../../ui/browserActions';
import { describeExports, type ExportActionItem } from '../../ui/exportActions';
import { AlertCard } from '../shared/AlertCard';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { VisuallyHidden } from '../ui/VisuallyHidden';

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const exportState = useExportState();
  const restoreBackup = usePlanStore((s) => s.restoreBackup);
  const [statusMessage, setStatusMessage] = useState('');
  const [copyAlert, setCopyAlert] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<BackupPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    };
  }, []);

  const exportMap = useMemo(() => {
    if (!open || !exportState) return new Map<string, ExportActionItem>();
    return new Map(describeExports(exportState, new Date()).map((item) => [item.id, item]));
  }, [open, exportState]);

  const announce = (msg: string) => {
    setStatusMessage('');
    if (announceTimerRef.current) clearTimeout(announceTimerRef.current);
    announceTimerRef.current = setTimeout(() => setStatusMessage(msg), 50);
  };

  const handleCopySummary = async () => {
    if (!exportState) return;
    const ok = await copyTextToClipboard(buildPlanBrief(exportState));
    if (ok) {
      setCopyAlert(null);
      announce('Summary copied to clipboard.');
    } else {
      setCopyAlert('Copying is not available here. Use a download instead.');
    }
  };

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

  const handleConfirmRestore = () => {
    if (!pendingBackup) return;
    restoreBackup(pendingBackup);
    setPendingBackup(null);
    setRestoreError(null);
    resetFileInput();
    announce('Backup restored.');
    onClose();
  };

  const icsItem = exportMap.get('ics');
  const budgetItem = exportMap.get('budgetCsv');
  const vendorItem = exportMap.get('vendorCsv');
  const backupItem = exportMap.get('backup');

  const rows = [
    {
      key: 'print',
      title: 'Print or save as PDF',
      description: "Opens your browser's print window. Choose Save as PDF there.",
      label: 'Print',
      disabled: false,
      reason: null,
      run: () => { printPage(); announce('Print window opened.'); },
    },
    ...(icsItem ? [{
      key: 'ics',
      title: 'Calendar file (.ics)',
      description: 'Adds the event day and open task deadlines to Google, Apple or Outlook calendars.',
      label: 'Download',
      disabled: icsItem.disabled,
      reason: icsItem.reason,
      run: () => { downloadTextFile(icsItem.filename, icsItem.mime, icsItem.content); announce('Calendar file downloaded.'); },
    }] : []),
    ...(budgetItem ? [{
      key: 'budget',
      title: 'Budget spreadsheet (.csv)',
      description: 'Spreadsheet with categories, allocations, actual spend, and variance.',
      label: 'Download',
      disabled: budgetItem.disabled,
      reason: budgetItem.reason,
      run: () => { downloadTextFile(budgetItem.filename, budgetItem.mime, budgetItem.content); announce('Budget spreadsheet downloaded.'); },
    }] : []),
    ...(vendorItem ? [{
      key: 'vendor',
      title: 'Vendor quotes (.csv)',
      description: 'Shortlisted vendor quotes, contract status, and payment schedules.',
      label: 'Download',
      disabled: vendorItem.disabled,
      reason: vendorItem.reason,
      run: () => { downloadTextFile(vendorItem.filename, vendorItem.mime, vendorItem.content); announce('Vendor quotes spreadsheet downloaded.'); },
    }] : []),
    {
      key: 'summary',
      title: 'Copy plan summary',
      description: 'Summary of budget, timeline, and adaptations formatted for pasting.',
      label: 'Copy',
      disabled: false,
      reason: null,
      run: handleCopySummary,
    },
    ...(backupItem ? [{
      key: 'backup',
      title: 'Backup (.json)',
      description: 'Complete snapshot of your celebration plan and progress.',
      label: 'Download',
      disabled: backupItem.disabled,
      reason: backupItem.reason,
      run: () => { downloadTextFile(backupItem.filename, backupItem.mime, backupItem.content); announce('Backup downloaded.'); },
    }] : []),
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export & Backup"
      footer={<Button variant="ghost" size="sm" onClick={onClose}>Done</Button>}
    >
      <div className="space-y-4">
        <VisuallyHidden as="div" role="status" aria-live="polite">{statusMessage}</VisuallyHidden>
        <div className="p-3 bg-info-soft border border-line rounded-card text-xs text-ink">
          Everything is created on your device. Nothing is uploaded.
        </div>
        {copyAlert && <AlertCard tone="warning" title="Clipboard notice">{copyAlert}</AlertCard>}

        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-card bg-surface border border-line">
              <div className="space-y-0.5">
                <h3 className="text-sm font-medium text-ink">{r.title}</h3>
                <p className="text-xs text-muted">{r.description}</p>
                {r.disabled && r.reason && <p className="text-xs text-warning">{r.reason}</p>}
              </div>
              <Button size="sm" variant="secondary" onClick={r.run} disabled={r.disabled} className="shrink-0 self-start sm:self-center">
                {r.label}
              </Button>
            </div>
          ))}
        </div>

        <section aria-labelledby="restore-section-heading" className="border-t border-line pt-4 space-y-3">
          <h3 id="restore-section-heading" className="text-sm font-semibold text-ink">Restore from a backup</h3>
          <p className="text-xs text-muted">Load a previously exported Gather JSON backup file to replace your current plan.</p>
          <div>
            <label htmlFor="backup-file" className="block text-xs font-medium text-ink-soft mb-1.5">Select backup file</label>
            <input
              ref={fileInputRef}
              id="backup-file"
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="block w-full text-xs text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-control file:border-0 file:text-xs file:font-medium file:bg-sunken file:text-ink hover:file:bg-line cursor-pointer"
            />
          </div>
          {restoreError && <AlertCard tone="warning" title="Backup restore failed">{restoreError}</AlertCard>}
          {pendingBackup && (
            <div className="p-3 bg-sunken border border-line rounded-card space-y-3">
              <p className="text-xs text-ink font-medium">
                Replace your current plan with the backup of &ldquo;{pendingBackup.context.title}&rdquo;?
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => { setPendingBackup(null); setRestoreError(null); resetFileInput(); }}>Cancel</Button>
                <Button size="sm" variant="primary" onClick={handleConfirmRestore}>Replace plan</Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </Dialog>
  );
}

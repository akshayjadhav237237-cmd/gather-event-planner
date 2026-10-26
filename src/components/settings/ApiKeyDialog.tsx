import { useEffect, useState, type FC } from 'react';
import { clearApiKey, hasApiKey, setApiKey } from '../../ai/apiKeyStorage';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

export interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  onKeyChange: () => void;
}

export const ApiKeyDialog: FC<ApiKeyDialogProps> = ({
  open,
  onClose,
  onKeyChange,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKeyInput('');
      setError(null);
      setStatusMsg(null);
    }
  }, [open]);

  const isConfigured = hasApiKey();

  const handleSaveKey = () => {
    if (!keyInput.trim()) {
      setError('That does not look like a valid key.');
      return;
    }
    const success = setApiKey(keyInput);
    if (!success) {
      setError('That does not look like a valid key.');
      return;
    }
    setKeyInput('');
    setError(null);
    setStatusMsg('Key saved. Live ideas are on.');
    onKeyChange();
  };

  const handleRemoveKey = () => {
    clearApiKey();
    setKeyInput('');
    setError(null);
    setStatusMsg('Key removed. Operating in offline mode.');
    onKeyChange();
  };

  const footer = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
      <div>
        {isConfigured && (
          <Button variant="secondary" onClick={handleRemoveKey}>
            Remove key
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
        <Button variant="primary" onClick={handleSaveKey}>
          Save key
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="AI settings"
      description="Configure optional live intelligence from Google Gemini."
      footer={footer}
    >
      <div className="flex flex-col gap-4 text-sm text-ink-soft">
        <p>
          Live ideas are completely optional. Without a key, Gather generates
          personalized celebration ideas offline using our curated local banks.
        </p>

        <div className="rounded-control bg-sunken p-3 text-xs text-muted flex flex-col gap-2">
          <p>
            Your API key is stored only in this temporary browser session and is
            discarded when the tab closes.
          </p>
          <p>
            When enabled, event parameters (format, guest count, season, setting, days remaining,
            total budget, currency, budget tier, feature flags, active adaptation rules, and your
            optional notes) are sent to Google&apos;s Gemini API to generate ideas. Your event title,
            calendar date, vendor quotes, actual spend, task progress, and previous ideas never leave your device.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveKey();
          }}
          className="flex flex-col gap-3"
        >
          <FormField
            id="gemini-api-key"
            label="Gemini API key"
            hint="Begins with AIzaSy... or standard Google API key format."
            error={error}
          >
            {(aria) => (
              <Input
                {...aria}
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="AIzaSy..."
              />
            )}
          </FormField>
        </form>

        {statusMsg && (
          <p role="status" className="text-sm text-success">
            {statusMsg}
          </p>
        )}
      </div>
    </Dialog>
  );
};

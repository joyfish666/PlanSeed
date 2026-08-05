import { useState, useCallback } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { aiService } from '../../services/ai';
import { useT, format } from '../../i18n';

const KEY_MASK = '***';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const apiKey = useAppStore((s) => s.apiKey);
  const apiEndpoint = useAppStore((s) => s.apiEndpoint);
  const model = useAppStore((s) => s.model);
  const language = useAppStore((s) => s.language);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const setApiEndpoint = useAppStore((s) => s.setApiEndpoint);
  const setModel = useAppStore((s) => s.setModel);
  const t = useT();

  // Track whether user has actually edited the key input (state, not ref,
  // so the helper text below updates correctly on every change).
  const [keyModified, setKeyModified] = useState(false);
  const [key, setKey] = useState(apiKey ? KEY_MASK : '');
  const [endpoint, setEndpoint] = useState(apiEndpoint);
  const [mdl, setMdl] = useState(model);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleKeyChange = useCallback((value: string) => {
    setKeyModified(true);
    setKey(value);
  }, []);

  const handleKeyFocus = useCallback(() => {
    // When user focuses the masked input, clear it for editing
    if (key === KEY_MASK && apiKey) {
      setKeyModified(true);
      setKey('');
    }
  }, [key, apiKey]);

  if (!open) return null;

  const handleSave = () => {
    // Only overwrite the key if the user actually typed a new one —
    // prevents accidentally wiping a cached key by focusing and saving.
    if (keyModified && key.trim()) {
      setApiKey(key.trim());
    }
    setApiEndpoint(endpoint);
    setModel(mdl);
    onClose();
  };

  const handleTest = async () => {
    // Determine which key to use:
    // - User modified input -> use input value
    // - User didn't modify -> use cached store value
    const effectiveKey = keyModified ? key.trim() : apiKey;

    if (!effectiveKey) {
      setTestResult({ ok: false, message: t.settings.needKey });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const response = await aiService.testConnection({
        apiKey: effectiveKey,
        apiEndpoint: endpoint.trim() || 'https://api.deepseek.com',
        model: mdl.trim() || 'deepseek-v4-flash',
        language,
      });
      setTestResult({ ok: true, message: response });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        ok: false,
        message: format(t.settings.testFailed, { msg }),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">{t.settings.title}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.apiKeyLabel}</label>
            <input
              type={key === KEY_MASK ? 'text' : 'password'}
              value={key}
              onChange={(e) => handleKeyChange(e.target.value)}
              onFocus={handleKeyFocus}
              placeholder={apiKey ? t.settings.keyPlaceholderCached : t.settings.keyPlaceholderNew}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            {apiKey && !keyModified && (
              <p className="text-xs text-gray-400 mt-1">{t.settings.keyCachedHint}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.endpointLabel}</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.settings.modelLabel}</label>
            <input
              type="text"
              value={mdl}
              onChange={(e) => setMdl(e.target.value)}
              placeholder="deepseek-v4-flash"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Test connection */}
        <div className="border-t border-gray-200 pt-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                {t.settings.testing}
              </>
            ) : (
              t.settings.test
            )}
          </button>
          {testResult && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm whitespace-pre-wrap ${
                testResult.ok
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.message}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {t.settings.cancel}
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            {t.settings.save}
          </button>
        </div>
      </div>
    </div>
  );
}

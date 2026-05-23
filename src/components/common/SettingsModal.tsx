import { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { aiService } from '../../services/ai';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const apiKey = useAppStore((s) => s.apiKey);
  const apiEndpoint = useAppStore((s) => s.apiEndpoint);
  const model = useAppStore((s) => s.model);
  const setApiKey = useAppStore((s) => s.setApiKey);
  const setApiEndpoint = useAppStore((s) => s.setApiEndpoint);
  const setModel = useAppStore((s) => s.setModel);

  const [key, setKey] = useState(apiKey);
  const [endpoint, setEndpoint] = useState(apiEndpoint);
  const [mdl, setMdl] = useState(model);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  if (!open) return null;

  const handleSave = () => {
    setApiKey(key);
    setApiEndpoint(endpoint);
    setModel(mdl);
    onClose();
  };

  const handleTest = async () => {
    if (!key.trim()) {
      setTestResult({ ok: false, message: '请先填写 API Key' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const response = await aiService.testConnection({
        apiKey: key.trim(),
        apiEndpoint: endpoint.trim() || 'https://api.deepseek.com',
        model: mdl.trim() || 'deepseek-v4-flash',
      });
      setTestResult({ ok: true, message: response });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        ok: false,
        message: `连接失败：${msg}\n\n请检查：\n- API Key 是否正确\n- API Endpoint 是否可访问\n- 模型名称是否有效`,
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
        <h2 className="text-lg font-semibold text-gray-800">API 设置</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.deepseek.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">模型</label>
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
                检测中...
              </>
            ) : (
              '检测模型连接'
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
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

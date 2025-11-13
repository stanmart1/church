import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export default function ButtInstructions() {
  const [config, setConfig] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await api.get('/livestreams/icecast/butt-config');
      setConfig(data);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!config) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-broadcast-line text-white text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Connect with Butt</h3>
          <p className="text-sm text-gray-600 mt-1">
            Use Butt (Broadcast Using This Tool) to stream audio from your computer
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-gray-500">Server</label>
              <p className="text-sm font-mono text-gray-900">{config.server}</p>
            </div>
            <button
              onClick={() => copyToClipboard(config.server, 'server')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {copied === 'server' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-gray-500">Port</label>
              <p className="text-sm font-mono text-gray-900">{config.port}</p>
            </div>
            <button
              onClick={() => copyToClipboard(config.port, 'port')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {copied === 'port' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-gray-500">Password</label>
              <p className="text-sm font-mono text-gray-900">{config.password}</p>
            </div>
            <button
              onClick={() => copyToClipboard(config.password, 'password')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {copied === 'password' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-gray-500">Mount Point</label>
              <p className="text-sm font-mono text-gray-900">{config.mount}</p>
            </div>
            <button
              onClick={() => copyToClipboard(config.mount, 'mount')}
              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
            >
              {copied === 'mount' ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Setup:</h4>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Download Butt from <a href="https://danielnoethen.de/butt/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">danielnoethen.de/butt</a></li>
          <li>Open Butt → Settings → Main</li>
          <li>Add Server with the details above</li>
          <li>Select your microphone in Audio settings</li>
          <li>Click "Play" button to start streaming</li>
        </ol>
      </div>
    </div>
  );
}

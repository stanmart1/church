import { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';
import RichTextEditor from '@/components/RichTextEditor';

export default function AboutContent() {
  const { getContent, updateContent } = useContent();
  const [leadershipText, setLeadershipText] = useState('');
  const [scriptureText, setScriptureText] = useState('');
  const [historyText, setHistoryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const data = await getContent();
      const contentMap = Array.isArray(data) ? data.reduce((acc: any, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {}) : data;
      setLeadershipText(contentMap.leadership_text || '');
      setScriptureText(contentMap.scripture_text || '"But in the days of the voice of the seventh angel, when he shall begin to sound, the mystery of God should be finished, as he hath declared to His servants the prophets" - Revelation 10:7 King James Version');
      setHistoryText(contentMap.history_text || '');
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updateContent('leadership_text', leadershipText),
        updateContent('scripture_text', scriptureText),
        updateContent('history_text', historyText)
      ]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loadingContent) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <i className="ri-check-circle-line text-green-400 text-lg mr-3"></i>
            <p className="text-sm font-medium text-green-800">About content saved successfully!</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Leadership Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership Section</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Leadership Text</label>
            <RichTextEditor
              value={leadershipText}
              onChange={setLeadershipText}
              placeholder="Since 1984, hundreds of people have darkened our doors..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Text about church leadership and pastor
            </p>
          </div>
        </div>

        {/* Scripture Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Scripture Card</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scripture Text</label>
            <RichTextEditor
              value={scriptureText}
              onChange={setScriptureText}
              placeholder="Scripture verse and reference..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Scripture displayed in the blue card on the right side
            </p>
          </div>
        </div>

        {/* Brief History Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Brief History Section</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Church History</label>
            <RichTextEditor
              value={historyText}
              onChange={setHistoryText}
              placeholder="Bibleway Fellowship Tabernacle is a church situated in the heartland of Lagos..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Complete history of the church
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          <i className="ri-save-line mr-2"></i>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

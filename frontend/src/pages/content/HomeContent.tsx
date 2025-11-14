import { useState, useEffect } from 'react';
import { useContent } from '@/hooks/useContent';
import RichTextEditor from '@/components/RichTextEditor';

export default function HomeContent() {
  const { getContent, updateContent } = useContent();
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [aboutText, setAboutText] = useState('');
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
      setHeroTitle(contentMap.hero_title || 'Welcome to Bibleway Fellowship Tabernacle');
      setHeroSubtitle(contentMap.hero_subtitle || 'Join us in worship, fellowship, and service as we grow together in faith and love.');
      setAboutText(contentMap.about_text || '');
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
        updateContent('hero_title', heroTitle),
        updateContent('hero_subtitle', heroSubtitle),
        updateContent('about_text', aboutText)
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
            <p className="text-sm font-medium text-green-800">Home content saved successfully!</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Welcome to Bibleway Fellowship Tabernacle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
              <RichTextEditor
                value={heroSubtitle}
                onChange={setHeroSubtitle}
                placeholder="Join us in worship, fellowship, and service..."
              />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="border-b border-gray-200 pb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Section</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About Text</label>
            <RichTextEditor
              value={aboutText}
              onChange={setAboutText}
              placeholder="We are honored that you are visiting our website..."
            />
            <p className="mt-1 text-sm text-gray-500">
              This text will be displayed in the About section on the landing page
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

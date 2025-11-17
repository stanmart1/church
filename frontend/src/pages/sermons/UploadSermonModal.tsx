import { useState, useEffect } from 'react';
import { useSermons } from '@/hooks/useSermons';
import { useSeries } from '@/hooks/useSeries';
import { SermonSeries } from '@/types';

interface UploadSermonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UploadSermonModal({ isOpen, onClose, onSuccess }: UploadSermonModalProps) {
  const { createSermon } = useSermons();
  const { getSeries } = useSeries();
  const [series, setSeries] = useState<SermonSeries[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSeries, setLoadingSeries] = useState(false);
  const [step, setStep] = useState(1);
  const [rawTitle, setRawTitle] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: '',
    series: '',
    isPartOfSeries: false,
    description: '',
    audioFile: null as File | null,
    thumbnail: null as File | null
  });

  useEffect(() => {
    if (isOpen) {
      fetchSeries();
    }
  }, [isOpen]);

  const fetchSeries = async () => {
    try {
      setLoadingSeries(true);
      const data = await getSeries();
      setSeries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setLoadingSeries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('speaker', formData.speaker);
      data.append('date', formData.date);
      data.append('description', formData.description);
      if (formData.isPartOfSeries && formData.series) {
        data.append('series_id', formData.series);
      }
      if (formData.audioFile) {
        data.append('audio', formData.audioFile);
      }
      if (formData.thumbnail) {
        data.append('thumbnail', formData.thumbnail);
      }

      await createSermon(data);
      onSuccess?.();
      onClose();
      setFormData({
        title: '',
        speaker: '',
        date: '',
        series: '',
        isPartOfSeries: false,
        description: '',
        audioFile: null,
        thumbnail: null
      });
      setStep(1);
    } catch (error) {
      console.error('Error uploading sermon:', error);
      alert('Failed to upload sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'audioFile' | 'thumbnail') => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
    
    // Auto-parse from audio filename
    if (field === 'audioFile' && file) {
      const filename = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setRawTitle(filename);
      parseFilename(filename);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData(prev => ({
      ...prev,
      [target.name]: value
    }));
  };

  const parseFilename = (filename: string) => {
    const parts = filename.split(' - ');
    if (parts.length >= 3) {
      const dateStr = parts[0].trim();
      const title = parts.slice(1, -1).join(' - ').trim();
      const speaker = parts[parts.length - 1].trim().replace(/^(Rev|Pastor|Dr|Evangelist)\s+/i, '');
      
      // Parse date (DD-MM-YY format)
      const dateMatch = dateStr.match(/(\d{2})-(\d{2})-(\d{2})/);
      let formattedDate = '';
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        formattedDate = `20${year}-${month}-${day}`;
      }
      
      setFormData(prev => ({
        ...prev,
        title,
        speaker,
        date: formattedDate
      }));
    }
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-middle bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Upload New Sermon</h3>
              <p className="text-sm text-gray-500 mt-1">Step {step} of 2: {step === 1 ? 'File Uploads' : 'Sermon Details'}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {step > 1 ? <i className="ri-check-line"></i> : '1'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>

          <form id="upload-sermon-form" onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (<>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Audio File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, 'audioFile')}
                  className="hidden"
                  id="audio-upload"
                  required
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <div className="text-center">
                    <i className="ri-upload-cloud-line text-gray-400 text-3xl mb-2"></i>
                    <p className="text-sm text-gray-600">
                      {formData.audioFile ? formData.audioFile.name : 'Click to upload audio file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">MP3, WAV files supported (max 500MB)</p>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Filename format: DATE - TITLE - SPEAKER NAME</p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thumbnail Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'thumbnail')}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <div className="text-center">
                    <i className="ri-image-line text-gray-400 text-3xl mb-2"></i>
                    <p className="text-sm text-gray-600">
                      {formData.thumbnail ? formData.thumbnail.name : 'Click to upload thumbnail'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG files supported (recommended: 400x300px)</p>
                  </div>
                </label>
              </div>
            </div>
            </>
            )}

            {step === 2 && (<>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sermon Title *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="ri-book-open-line text-gray-400"></i>
                </div>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter sermon title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Speaker *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-user-voice-line text-gray-400"></i>
                  </div>
                  <input
                    type="text"
                    name="speaker"
                    required
                    value={formData.speaker}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Speaker name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sermon Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i className="ri-calendar-line text-gray-400"></i>
                  </div>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPartOfSeries"
                  checked={formData.isPartOfSeries}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">This sermon is part of a series</span>
              </label>
            </div>

            {formData.isPartOfSeries && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Series
                </label>
                <select
                  name="series"
                  value={formData.series}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  required={formData.isPartOfSeries}
                  disabled={loadingSeries}
                >
                  <option value="">
                    {loadingSeries ? 'Loading...' : 'Select a series'}
                  </option>
                  {series.length === 0 && !loadingSeries ? (
                    <option value="" disabled>No series available</option>
                  ) : (
                    series.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  )}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                maxLength={500}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Brief description of the sermon..."
              />
              <p className="text-xs text-gray-500 mt-1.5">{formData.description.length}/500 characters</p>
            </div>
            </>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => step === 1 ? onClose() : setStep(1)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>
              {step === 1 ? (
                <button
                  type="submit"
                  disabled={!formData.audioFile}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm cursor-pointer whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center">
                    Next Step
                    <i className="ri-arrow-right-line ml-2"></i>
                  </span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <i className="ri-upload-cloud-line mr-2"></i>
                      Upload Sermon
                    </span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

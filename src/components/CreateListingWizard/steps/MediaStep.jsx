import { useState, useRef } from 'react';
import { Upload, Image, Video, X, Star, GripVertical } from 'lucide-react';

/**
 * Step 5: Photos and Media
 * Hero image, gallery, video upload
 */
export function MediaStep({ formData, updateFormData }) {
  const heroInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // In production, this would upload to S3/cloudinary
  // For now, we'll use data URLs for preview
  const handleFileSelect = async (files, isHero = false) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const processedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                url: e.target.result,
                name: file.name,
                type: file.type,
                size: file.size
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      if (isHero) {
        updateFormData({ heroImage: processedFiles[0].url });
      } else {
        updateFormData({
          gallery: [...formData.gallery, ...processedFiles.map(f => f.url)]
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index) => {
    updateFormData({
      gallery: formData.gallery.filter((_, i) => i !== index)
    });
  };

  const setAsHero = (galleryUrl, galleryIndex) => {
    // Move current hero to gallery, set new hero
    const newGallery = [...formData.gallery];
    if (formData.heroImage) {
      newGallery[galleryIndex] = formData.heroImage;
    } else {
      newGallery.splice(galleryIndex, 1);
    }
    updateFormData({
      heroImage: galleryUrl,
      gallery: newGallery
    });
  };

  const handleDrop = (e, isHero = false) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files, isHero);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Photos & Media</h2>
        <p className="mt-2 text-slate-600">
          Add high quality photos to showcase your listing
        </p>
      </div>

      {/* Hero Image */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Star className="h-5 w-5 text-orange-500" />
          Primary Photo <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-slate-600">
          This will be the main image shown in search results
        </p>

        {formData.heroImage ? (
          <div className="relative aspect-[16/9] max-w-xl overflow-hidden rounded-2xl">
            <img
              src={formData.heroImage}
              alt="Hero"
              className="h-full w-full object-cover"
            />
            <button
              onClick={() => updateFormData({ heroImage: null })}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
              Primary Photo
            </div>
          </div>
        ) : (
          <div
            onDrop={(e) => handleDrop(e, true)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => heroInputRef.current?.click()}
            className={`
              flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-colors
              ${dragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}
            `}
          >
            <div className="rounded-full bg-slate-100 p-4">
              <Image className="h-8 w-8 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={heroInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files, true)}
          className="hidden"
        />
      </section>

      {/* Gallery */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Image className="h-5 w-5 text-orange-500" />
          Gallery
        </h3>
        <p className="text-sm text-slate-600">
          Add additional photos to give renters a complete view
        </p>

        {formData.gallery.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.gallery.map((url, index) => (
              <div key={index} className="relative group aspect-square overflow-hidden rounded-xl">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setAsHero(url, index)}
                    className="rounded-full bg-white p-1.5 text-slate-700 hover:bg-orange-100"
                    title="Set as primary"
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="rounded-full bg-white p-1.5 text-slate-700 hover:bg-red-100 hover:text-red-600"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="h-5 w-5 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-colors"
        >
          <Upload className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">
            {uploading ? 'Uploading...' : 'Add more photos'}
          </span>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files, false)}
          className="hidden"
        />
      </section>

      {/* Video URL */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Video className="h-5 w-5 text-orange-500" />
          Video (Optional)
        </h3>
        <p className="text-sm text-slate-600">
          Add a YouTube or Vimeo link to showcase your listing
        </p>

        <input
          type="url"
          value={formData.videoUrl || ''}
          onChange={(e) => updateFormData({ videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </section>

      {/* Live Preview */}
      {formData.heroImage && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
          <div className="rounded-2xl border border-slate-200 overflow-hidden max-w-sm">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
              <img
                src={formData.heroImage}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-slate-900 truncate">
                {formData.title || 'Your listing title'}
              </h4>
              <p className="text-sm text-slate-500">
                {formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Location'}
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900">
                {formData.salePrice
                  ? `$${formData.salePrice.toLocaleString()}`
                  : formData.baseDailyPrice
                    ? `$${formData.baseDailyPrice}/day`
                    : formData.baseHourlyPrice
                      ? `$${formData.baseHourlyPrice}/hr`
                      : 'Price'
                }
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tips */}
      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Photo Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting when possible</li>
          <li>• Show the exterior from multiple angles</li>
          <li>• Include interior shots of the kitchen/equipment</li>
          <li>• Capture any unique features or upgrades</li>
          <li>• Minimum 3 photos recommended</li>
        </ul>
      </div>
    </div>
  );
}

export default MediaStep;

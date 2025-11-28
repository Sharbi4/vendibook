import { useState, useRef } from 'react';
import { FileText, Upload, X, Shield, AlertCircle, Check } from 'lucide-react';

/**
 * Step 6: Documents and Compliance
 * Insurance, permits, licenses, title documents
 */
export function ComplianceStep({ formData, updateFormData }) {
  const { listingMode } = formData;
  const isForSale = listingMode === 'for_sale';
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const documentCategories = [
    { id: 'compliance', label: 'Compliance', description: 'Health permits, inspections' },
    { id: 'legal', label: 'Legal', description: 'Licenses, registrations' },
    { id: 'marketing', label: 'Marketing', description: 'Branding, menus' }
  ];

  const handleFileUpload = async (files, docType) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const processedFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                id: Date.now() + Math.random(),
                url: e.target.result,
                name: file.name,
                type: docType,
                size: file.size,
                uploadedAt: new Date().toISOString()
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      updateFormData({
        documentUploads: [...formData.documentUploads, ...processedFiles]
      });
    } catch (error) {
      console.error('Document upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (docId) => {
    updateFormData({
      documentUploads: formData.documentUploads.filter(d => d.id !== docId)
    });
  };

  const handleSpecialDocUpload = async (file, field) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateFormData({ [field]: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Documents & Compliance</h2>
        <p className="mt-2 text-slate-600">
          Upload required documents and certifications
        </p>
      </div>

      {/* For Sale Documents */}
      {isForSale && (
        <>
          {/* Title Document */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <FileText className="h-5 w-5 text-orange-500" />
              Title Document
            </h3>
            <p className="text-sm text-slate-600">
              Upload the vehicle title or proof of ownership
            </p>

            {formData.titleDocument ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-800">Title document uploaded</span>
                </div>
                <button
                  onClick={() => updateFormData({ titleDocument: null })}
                  className="text-slate-500 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-50">
                <Upload className="h-8 w-8 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Upload title document</span>
                <span className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleSpecialDocUpload(e.target.files[0], 'titleDocument')}
                  className="hidden"
                />
              </label>
            )}
          </section>

          {/* VIN/Serial Number */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">VIN or Serial Number</h3>
            <input
              type="text"
              value={formData.vinOrSerialNumber || ''}
              onChange={(e) => updateFormData({ vinOrSerialNumber: e.target.value })}
              placeholder="Enter VIN or serial number"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </section>

          {/* Inspection Report */}
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Shield className="h-5 w-5 text-orange-500" />
              Inspection Report (Optional)
            </h3>
            <p className="text-sm text-slate-600">
              A recent inspection report can increase buyer confidence
            </p>

            {formData.inspectionReport ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-800">Inspection report uploaded</span>
                </div>
                <button
                  onClick={() => updateFormData({ inspectionReport: null })}
                  className="text-slate-500 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-50">
                <Upload className="h-6 w-6 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Upload inspection report</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleSpecialDocUpload(e.target.files[0], 'inspectionReport')}
                  className="hidden"
                />
              </label>
            )}
          </section>
        </>
      )}

      {/* Requirements for Rentals */}
      {!isForSale && (
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Shield className="h-5 w-5 text-orange-500" />
            Requirements
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.insuranceRequired}
                onChange={(e) => updateFormData({ insuranceRequired: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-slate-900">Insurance Required</span>
                <p className="text-sm text-slate-500">Renters must provide proof of insurance</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.permitRequired}
                onChange={(e) => updateFormData({ permitRequired: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <span className="font-medium text-slate-900">Permit Required</span>
                <p className="text-sm text-slate-500">Renters must have valid operating permits</p>
              </div>
            </label>
          </div>
        </section>
      )}

      {/* Document Category */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Document Category</h3>
        <p className="text-sm text-slate-600">
          Select how your documents should be categorized
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {documentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFormData({ documentCategoryGroup: cat.id })}
              className={`
                p-4 rounded-xl border-2 text-left transition-colors
                ${formData.documentCategoryGroup === cat.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
                }
              `}
            >
              <span className="font-medium text-slate-900">{cat.label}</span>
              <p className="text-sm text-slate-500 mt-1">{cat.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* General Document Uploads */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FileText className="h-5 w-5 text-orange-500" />
          Additional Documents
        </h3>
        <p className="text-sm text-slate-600">
          Upload any additional documentation (permits, insurance, certifications)
        </p>

        {formData.documentUploads.length > 0 && (
          <div className="space-y-2">
            {formData.documentUploads.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-900">{doc.name}</span>
                    <p className="text-xs text-slate-500">{doc.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:border-slate-400 hover:bg-slate-50">
          <Upload className="h-8 w-8 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">
            {uploading ? 'Uploading...' : 'Upload documents'}
          </span>
          <span className="text-xs text-slate-500">PDF, JPG, PNG up to 10MB each</span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => handleFileUpload(e.target.files, formData.documentCategoryGroup || 'compliance')}
            className="hidden"
          />
        </label>
      </section>

      {/* Info Box */}
      <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-900">Document Security</h4>
          <p className="text-sm text-amber-800 mt-1">
            All documents are securely stored and only shared with verified renters upon booking confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComplianceStep;

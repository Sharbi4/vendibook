/**
 * POST /api/host/upload - Upload a listing image
 * 
 * Prototype implementation returns placeholder URL.
 * Phase 3: Implement real S3/cloud storage integration
 * 
 * Request: multipart/form-data with 'file' field
 * 
 * Response: 200 OK
 * {
 *   success: true
 *   imageUrl: string (placeholder URL for now)
 *   fileName: string
 *   message: string
 * }
 * 
 * Phase 3 TODO:
 * - Replace placeholder with real S3 upload
 * - Add file size validation (max 5MB)
 * - Add MIME type validation (jpg, png, webp)
 * - Implement image optimization/resizing
 * - Add CDN URL generation
 */

const auth = require('../../_auth');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const user = auth.requireAuth(req, res);
  if (!user) return;
  
  try {
    // PHASE 2: Stub implementation - return placeholder
    // PHASE 3: Replace with real S3 upload logic
    
    // In production:
    // 1. Parse multipart form data using busboy/formidable
    // 2. Validate file: size < 5MB, type in [jpg, png, webp]
    // 3. Upload to S3 with presigned URL
    // 4. Return optimized CDN URL
    
    const fileName = `listing_${user.id}_${Date.now()}.jpg`;
    const placeholderUrl = `https://via.placeholder.com/800x500?text=Vendibook+Listing`;
    
    return res.status(200).json({
      success: true,
      imageUrl: placeholderUrl,
      fileName: fileName,
      message: '[PHASE 3] TODO: Implement real S3 upload - currently returns placeholder URL'
    });
    
  } catch (error) {
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}

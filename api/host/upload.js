/**
 * POST /api/host/upload - Upload an image (stub for now)
 * Returns a placeholder URL that can be replaced with real S3 upload later
 */

const { requireAuth } = require('../../_auth');

export default function handler(req, res) {
  if (req.method === 'POST') {
    const user = requireAuth(req, res);
    if (!user) return;
    
    // In a real implementation, you would:
    // 1. Parse multipart form data using a library like busboy or formidable
    // 2. Upload the file to S3 or another storage service
    // 3. Return the actual URL
    
    // For now, return a placeholder URL
    const placeholderUrl = `https://via.placeholder.com/800x500?text=Vendibook+${Date.now()}`;
    
    return res.status(200).json({
      imageUrl: placeholderUrl,
      message: 'Image upload stub - returns placeholder URL'
    });
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}

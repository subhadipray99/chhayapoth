import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2PublicUrl = process.env.NEXT_PUBLIC_R2_URL;

let s3Client = null;

function ensureStorageClient() {
  if (!r2AccessKeyId || !r2SecretAccessKey || !r2AccountId || !r2BucketName || !r2PublicUrl) {
    throw new Error(
      'Cloudflare R2 configuration error: Please define R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ACCOUNT_ID, and NEXT_PUBLIC_R2_URL inside your environment keys.'
    );
  }
  
  if (!s3Client) {
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });
  }
}

/**
 * Uploads a file buffer directly to Cloudflare R2.
 * @param {Buffer} fileBuffer The file buffer
 * @param {string} filename The original filename
 * @param {string} mimeType The mime-type of the file
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export async function uploadMedia(fileBuffer, filename, mimeType) {
  ensureStorageClient();
  
  const fileExtension = path.extname(filename) || '.jpg';
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExtension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: uniqueName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await s3Client.send(command);
    
    const baseUrl = r2PublicUrl.endsWith('/') ? r2PublicUrl : `${r2PublicUrl}/`;
    return `${baseUrl}${uniqueName}`;
  } catch (error) {
    console.error('Error uploading to Cloudflare R2:', error);
    throw new Error('Upload to Cloudflare R2 failed: ' + error.message);
  }
}

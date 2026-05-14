const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.MINIO_ENDPOINT 
    ? `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}` 
    : 'http://localhost:9000',
  accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'class-recordings';

const createBucket = async () => {
  try {
    await s3.createBucket({ Bucket: BUCKET_NAME }).promise();
    console.log(`Bucket ${BUCKET_NAME} created or already exists`);
  } catch (error) {
    console.error('Error creating bucket:', error);
  }
};

const uploadFile = async (key, buffer, contentType) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };
  
  return s3.upload(params).promise();
};

const getFileUrl = (key) => {
  return s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 3600,
  });
};

const deleteFile = async (key) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  
  return s3.deleteObject(params).promise();
};

module.exports = {
  s3,
  BUCKET_NAME,
  createBucket,
  uploadFile,
  getFileUrl,
  deleteFile,
};

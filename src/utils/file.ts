import axios from 'axios';

type PresignedPostUrlResponse = {
  url: string;
  fields: {
    key: string;
    acl: string;
    bucket: string;
  };
  filePath: string;
};

export async function uploadToS3({
  fileContents,
  presignedPostUrl,
}: {
  fileContents: File;
  presignedPostUrl: PresignedPostUrlResponse;
}) {
  const formData = new FormData();
  Object.entries(presignedPostUrl.fields).forEach(([k, v]) => {
    formData.append(k, v);
  });
  formData.append('file', fileContents); // The file has be the last element

  const instance = axios.create();
  delete instance.defaults.headers.common['Authorization'];

  await instance.post(presignedPostUrl.url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return presignedPostUrl.filePath;
}

export async function uploadFile(formData) {
  const upload = formData.get('upload');
  const contentType = upload.type;
  const filename = upload.name;
  formData.delete('upload');
  formData.append('filename', filename);
  formData.append('content_type', contentType);

  const result = await axios.post(
    `${import.meta.env.VITE_APP_API_BASE_URL}/files`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    },
  );

  await uploadToS3({
    fileContents: upload,
    presignedPostUrl: result.data.presigned_post_url,
  });

  return result;
}

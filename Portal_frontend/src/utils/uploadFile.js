/**
 * @param {File} file - The file object from input
 * @param {Array} allowedTypes - e.g., ['image/jpeg', 'application/pdf']
 */
export const uploadToCloudinary = async (file, allowedTypes) => {
  if (!file) return null;

  // Validate File Type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    
    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    throw new Error("Failed to upload file. Please try again.");
  }
};
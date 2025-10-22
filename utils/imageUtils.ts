
export const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({ base64Data, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const imageUrlToBase64 = async (url: string): Promise<{ base64Data: string; mimeType: string }> => {
  try {
    // Use fetch to get the image data, which handles CORS and network errors more robustly
    // than the `new Image()` approach.
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const blob = await response.blob();

    // Use FileReader to convert the blob to a base64 string.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!result) {
            return reject(new Error("FileReader returned null result."));
        }
        const base64Data = result.split(',')[1];
        resolve({ base64Data, mimeType: blob.type || 'image/png' }); // Provide a fallback mime type
      };
      reader.onerror = (error) => {
        reject(new Error(`FileReader failed to read blob: ${error}`));
      };
    });
  } catch (error) {
    console.error(`Failed to convert image URL to base64 for URL: ${url}`, error);
    // Provide a user-friendly message that covers common issues.
    throw new Error(`Could not load image from the URL. This can happen due to network issues or if the image server has cross-origin restrictions (CORS).`);
  }
};

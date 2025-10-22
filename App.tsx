
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageSelector } from './components/ImageSelector';
import { MemeEditor } from './components/MemeEditor';
import { ControlPanel } from './components/ControlPanel';
import { generateCaptions, editImage, analyzeImage } from './services/geminiService';
import { fileToBase64, imageUrlToBase64 } from './utils/imageUtils';
import { TRENDING_TEMPLATES } from './constants';
import type { ApiStatus, MemeTemplate } from './types';

interface SelectedImage {
  url: string;
  base64Data: string;
  mimeType: string;
}

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [activeCaption, setActiveCaption] = useState<string>('');
  const [captionSuggestions, setCaptionSuggestions] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [captionPosition, setCaptionPosition] = useState<'top' | 'bottom'>('bottom');
  const [templates, setTemplates] = useState<MemeTemplate[]>(TRENDING_TEMPLATES);
  
  const [captionStatus, setCaptionStatus] = useState<ApiStatus>('idle');
  const [editStatus, setEditStatus] = useState<ApiStatus>('idle');
  const [analysisStatus, setAnalysisStatus] = useState<ApiStatus>('idle');

  const handleImageSelect = useCallback(async (imageSource: string | File) => {
    // Reset everything when a new image is selected
    setActiveCaption('');
    setCaptionSuggestions([]);
    setAnalysisResult('');
    setCaptionStatus('idle');
    setEditStatus('idle');
    setAnalysisStatus('idle');
    setCaptionPosition('bottom');

    if (typeof imageSource === 'string') {
      // For templates, we set the URL immediately and convert to base64 later, on-demand.
      // This prevents the "Failed to fetch" error on selection.
      setSelectedImage({ url: imageSource, base64Data: '', mimeType: '' });
    } else {
      // For uploaded files, process them to base64 right away.
      const { base64Data, mimeType } = await fileToBase64(imageSource);
      const objectURL = URL.createObjectURL(imageSource);
      setSelectedImage({ url: objectURL, base64Data, mimeType });
    }
  }, []);
  
  const handleShuffleTemplates = useCallback(() => {
    setTemplates(currentTemplates =>
      currentTemplates.map(template => ({
        ...template,
        // Generate a new random image URL from picsum.photos.
        // The /seed/ endpoint returns a static image, so we use the random endpoint.
        // The query string ensures a new image is fetched each time.
        url: `https://picsum.photos/500/500?random=${Math.random()}`,
      }))
    );
  }, []);

  /**
   * Ensures the selected image has base64 data available for API calls.
   * If the data is missing (e.g., for a template), it converts the image URL to base64.
   * It then updates the image URL to a `data:` URL to prevent future CORS issues.
   */
  const ensureBase64Data = useCallback(async (): Promise<SelectedImage | null> => {
    if (!selectedImage) return null;
    // If we already have the base64 data, we're good to go.
    if (selectedImage.base64Data) return selectedImage;

    try {
      // If we only have a URL (e.g., from a template), fetch and convert it.
      const { base64Data, mimeType } = await imageUrlToBase64(selectedImage.url);
      
      // Create a data URL from the fetched data.
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Update the state with the full image data, including the new data URL.
      // Using a data URL from now on prevents repeated fetches and CORS issues (e.g., on download).
      const updatedImage = { url: dataUrl, base64Data, mimeType };
      setSelectedImage(updatedImage); 
      return updatedImage;
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred while preparing the image.";
      console.error("Error converting image URL to base64:", error);
      alert(message);
      return null;
    }
  }, [selectedImage]);


  const handleGenerateCaptions = useCallback(async () => {
    const image = await ensureBase64Data();
    if (!image?.base64Data) return;
    setCaptionStatus('loading');
    setCaptionSuggestions([]);
    try {
      const captions = await generateCaptions(image.base64Data, image.mimeType);
      setCaptionSuggestions(captions);
      setCaptionStatus('success');
    } catch (error) {
      console.error("Failed to generate captions:", error);
      setCaptionStatus('error');
    }
  }, [ensureBase64Data]);

  const handleEditImage = useCallback(async (prompt: string) => {
    const image = await ensureBase64Data();
    if (!image?.base64Data || !prompt) return;

    setEditStatus('loading');
    try {
      const newImageBase64 = await editImage(image.base64Data, image.mimeType, prompt);
      const newMimeType = 'image/png';
      const newImageUrl = `data:${newMimeType};base64,${newImageBase64}`;
      
      setSelectedImage({
        url: newImageUrl,
        base64Data: newImageBase64,
        mimeType: newMimeType,
      });
      setEditStatus('success');
      setCaptionSuggestions([]);
      setActiveCaption('');
    } catch (error) {
      console.error("Failed to edit image:", error);
      setEditStatus('error');
    }
  }, [ensureBase64Data]);

  const handleAnalyzeImage = useCallback(async () => {
    const image = await ensureBase64Data();
    if (!image?.base64Data) return;

    setAnalysisStatus('loading');
    setAnalysisResult('');
    try {
      const result = await analyzeImage(image.base64Data, image.mimeType);
      setAnalysisResult(result);
      setAnalysisStatus('success');
    } catch (error) {
      console.error("Failed to analyze image:", error);
      setAnalysisStatus('error');
    }
  }, [ensureBase64Data]);

  const handleDownloadMeme = useCallback(() => {
    if (!selectedImage?.url) return;

    const image = new Image();
    // Using a data: URL (set after ensureBase64Data) or blob: URL bypasses CORS issues here.
    image.crossOrigin = 'anonymous'; 
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);

      if (activeCaption) {
        const text = activeCaption.toUpperCase();
        const fontSize = Math.floor(image.naturalWidth / 12);
        ctx.font = `extrabold ${fontSize}px Impact, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 5;

        const x = canvas.width / 2;
        const maxWidth = canvas.width * 0.9;

        const words = text.split(' ');
        let line = '';
        const lines = [];

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        if (captionPosition === 'top') {
            ctx.textBaseline = 'top';
            const y = canvas.height * 0.05;
            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i].trim(), x, y + (i * (fontSize * 1.1)));
            }
        } else { // 'bottom'
            ctx.textBaseline = 'bottom';
            const y = canvas.height - (canvas.height * 0.05);
            for (let i = lines.length - 1; i >= 0; i--) {
                ctx.fillText(lines[i].trim(), x, y - ((lines.length - 1 - i) * (fontSize * 1.1)));
            }
        }
      }

      const link = document.createElement('a');
      link.download = 'ai-meme.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    image.onerror = () => {
        alert("Could not download the image. The source image might have CORS restrictions.");
    };

    image.src = selectedImage.url;
  }, [selectedImage, activeCaption, captionPosition]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-3">
            <ImageSelector 
              templates={templates} 
              onImageSelect={handleImageSelect} 
              onShuffle={handleShuffleTemplates}
            />
          </div>

          <div className="lg:col-span-6 flex items-center justify-center">
            <MemeEditor
              imageUrl={selectedImage?.url}
              captionText={activeCaption}
              isLoading={editStatus === 'loading'}
              captionPosition={captionPosition}
              onDownload={handleDownloadMeme}
            />
          </div>

          <div className="lg:col-span-3">
            <ControlPanel
              imageSelected={!!selectedImage}
              captionSuggestions={captionSuggestions}
              analysisResult={analysisResult}
              onCaptionSelect={setActiveCaption}
              onGenerateCaptions={handleGenerateCaptions}
              onEditImage={handleEditImage}
              onAnalyzeImage={handleAnalyzeImage}
              captionStatus={captionStatus}
              editStatus={editStatus}
              analysisStatus={analysisStatus}
              captionPosition={captionPosition}
              onCaptionPositionChange={setCaptionPosition}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

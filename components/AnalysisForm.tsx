import React, { useState, useCallback, useRef, useEffect } from 'react';
import { InputMode } from '../types';
import { AnalyzeIcon, CameraScanIcon } from './icons';

interface AnalysisFormProps {
  activeTab: InputMode;
  onAnalyze: (inputValue: string, inputMode: InputMode, image?: { base64: string; mimeType: string }) => void;
  isLoading: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({ activeTab, onAnalyze, isLoading }) => {
  const [textValue, setTextValue] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }, []);

  useEffect(() => {
    // Cleanup on unmount or tab change
    return () => {
      stopCamera();
    };
  }, [stopCamera, activeTab]);

  const startCamera = async () => {
     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setImageFile(null);
        setImagePreview(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                streamRef.current = stream;
            }
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Error accessing camera: ", err);
            // Consider showing an error message to the user
        }
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImagePreview(dataUrl);
            
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
                    setImageFile(file);
                });
        }
        stopCamera();
    }
  };


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            const mimeType = result.match(/:(.*?);/)?.[1] || 'application/octet-stream';
            resolve({ base64, mimeType });
        };
        reader.onerror = error => reject(error);
    });
  }

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;

    if (activeTab === InputMode.IMAGE && imageFile) {
      const { base64, mimeType } = await fileToBase64(imageFile);
      onAnalyze(textValue, InputMode.IMAGE, { base64, mimeType });
    } else if (activeTab === InputMode.TEXT) {
      onAnalyze(textValue, InputMode.TEXT);
    } else if (activeTab === InputMode.BARCODE) {
      onAnalyze(barcodeValue, InputMode.BARCODE);
    }
  }, [activeTab, barcodeValue, textValue, imageFile, isLoading, onAnalyze]);

  const renderContent = () => {
    switch (activeTab) {
      case InputMode.TEXT:
        return (
          <div>
            <label htmlFor="label-text" className="block text-sm font-medium text-gray-300">
              Paste Ingredients & Nutrition Facts
            </label>
            <textarea
              id="label-text"
              rows={8}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-gray-200 placeholder-gray-500"
              placeholder="e.g., Ingredients: Potatoes, Vegetable Oil (Sunflower, Corn, and/or Canola Oil), Salt..."
            />
          </div>
        );
      case InputMode.IMAGE:
        return (
          <div>
             {isCameraOpen ? (
                <div className="space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-md bg-gray-900"></video>
                    <div className="flex items-center justify-center space-x-4">
                        <button type="button" onClick={captureImage} className="px-8 py-2 bg-brand-primary text-white rounded-md font-semibold hover:bg-green-600 transition-colors">Capture</button>
                        <button type="button" onClick={stopCamera} className="px-8 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Cancel</button>
                    </div>
                </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload a photo of the label
                </label>
                <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-brand-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Label preview" className="mx-auto h-40 rounded-md object-contain" />
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 4v.01M28 8L20 16m-6-1.5L10 16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-400">
                            <p className="pl-1">Click to upload an image</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />

                <div className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-xs text-gray-400">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <button
                    type="button"
                    onClick={startCamera}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary transition-colors"
                    >
                    <CameraScanIcon className="-ml-1 mr-2 h-5 w-5" />
                    Use Camera
                </button>
              </>
            )}

            <div className="mt-4">
              <label htmlFor="image-text" className="block text-sm font-medium text-gray-300">
                  Optionally, add supplementary text
                </label>
              <textarea
                  id="image-text"
                  rows={3}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-gray-200 placeholder-gray-500"
                  placeholder="Add any text that's hard to read in the image..."
                />
            </div>
          </div>
        );
      case InputMode.BARCODE:
        return (
          <div>
            <label htmlFor="barcode" className="block text-sm font-medium text-gray-300">
              Enter Barcode
            </label>
            <input
              type="text"
              id="barcode"
              value={barcodeValue}
              onChange={(e) => setBarcodeValue(e.target.value)}
              className="mt-1 block w-full bg-gray-900 border-gray-700 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm text-gray-200 placeholder-gray-500"
              placeholder="e.g., 012345678905"
            />
            <p className="mt-2 text-xs text-gray-500">Use '012345678905' or '5449000054227' for a demo.</p>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="animate-fade-in">{renderContent()}</div>
      <div className="mt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-brand-primary disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            'Analyzing...'
          ) : (
            <>
              <AnalyzeIcon className="-ml-1 mr-3 h-5 w-5" />
              Analyze Product
            </>
          )}
        </button>
      </div>
    </form>
  );
};

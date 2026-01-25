'use client';
import { useState, useEffect } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { showSuccess, showError } from '../../../lib/toast';
import { X } from "lucide-react";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Remove a selected file by index
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      if (response.ok && Array.isArray(data.images)) {
        setImages(data.images);
      } else {
        throw new Error(data.message || 'Failed to fetch images or invalid data structure');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      showError('Failed to load gallery');
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      showError('Some files were skipped. Please select only image files.');
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showError('Please select images to upload');
      return;
    }

    try {
      setIsUploading(true);
      let successCount = 0;
      let errorCount = 0;

      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch('/api/gallery', {
            method: 'POST',
            body: formData,
          });

          const data = await response.json();

          if (response.ok) {
            successCount++;
          } else {
            throw new Error(data.message || 'Failed to upload image');
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showSuccess(`Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}`);
        if (errorCount > 0) {
          showError(`Failed to upload ${errorCount} image${errorCount > 1 ? 's' : ''}`);
        }
        setSelectedFiles([]);
        document.getElementById('file-upload').value = ''; // Reset file input
        fetchImages(); // Refresh the gallery
      } else {
        showError('Failed to upload any images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showError('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery/${imageId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Image deleted successfully');
        fetchImages(); // Refresh the gallery
      } else {
        throw new Error(data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      showError(error.message || 'Failed to delete image');
    }
  };

  return (
    <section className="relative min-h-screen pt-16 overflow-hidden text-black">

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-5 justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gallery Management</h1>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
            </label>
            {selectedFiles.length > 0 && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center"
              >
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Selected Images ({selectedFiles.length}):</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center relative w-fit">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-20 object-cover rounded-md"
                    />
                    <X
                      onClick={() => removeSelectedFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs p-[6px] cursor-pointer"
                      title="Remove image"
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
            <div key={image._id} className="relative group">
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-48 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => handleDelete(image._id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full transition-opacity hover:bg-red-600 cursor-pointer"
                title="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No images in the gallery yet. Upload some images to get started.</p>
          </div>
        )}
      </div>
    </section>
  );
}

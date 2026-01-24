'use client';
import { useState, useEffect } from 'react';
import GalleryCard from './GalleryCard';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Gallery can only be loaded in browser');
      }

      const response = await fetch('/api/gallery', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      if (!Array.isArray(data.images)) {
        console.warn('Gallery API response does not contain images array:', data);
        setGalleryItems([]);
        return;
      }

      // Transform API data to match GalleryCard expected format
      const transformedItems = data.images
        .filter(image => image && image.url) // Filter out invalid images
        .map((image, index) => ({
          id: image._id || `image-${index}`,
          title: image.name || `Gallery Image ${index + 1}`,
          image: image.url,
          location: 'Turf Booking Gallery', // Default location since API doesn't have this
          price: '0', // Default price since API doesn't have this
        }));

      setGalleryItems(transformedItems);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setError(error.message || 'Failed to fetch gallery images');
      setGalleryItems([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-green-600 to-green-800">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-4xl font-medium text-white">Gallery</h1>
              <p className="text-xl md:text-lg max-w-2xl mx-auto text-green-100">
                Loading amazing turf images...
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="h-72 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-green-600 to-green-800">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-4xl font-medium text-white">Gallery</h1>
              <p className="text-xl md:text-lg max-w-2xl mx-auto text-green-100">
                Error loading gallery images
              </p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchGalleryImages}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-800">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-4xl font-medium text-white">Gallery</h1>
            <p className="text-xl md:text-lg max-w-2xl mx-auto text-green-100">
              Explore our amazing turf and sports facilities
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="container mx-auto px-4 py-8">
        {galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No images in the gallery yet.</p>
            <p className="text-gray-400 mt-2">Check back later for amazing turf photos!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <GalleryCard key={item.id} {...item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;

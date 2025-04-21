import React from 'react';

interface ImageModalProps {
  imageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  altText?: string;
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  isOpen,
  onClose,
  altText = 'Enlarged image', // Default alt text
}) => {
  if (!isOpen || !imageUrl) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal on overlay click
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer" // Use a more generic label
    >
      <div
        className="relative max-w-4xl max-h-[85vh] bg-white p-1 rounded-md shadow-lg animate-fade-in-scale" // Added simple animation class
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <img
          src={imageUrl}
          alt={altText}
          className="block max-w-full max-h-[calc(85vh-0.5rem)] object-contain" // Adjusted max-height
        />
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50 transition-colors"
          aria-label="Close image viewer"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      {/* Basic Tailwind animation (add to your global CSS or Tailwind config if needed) */}
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ImageModal; 
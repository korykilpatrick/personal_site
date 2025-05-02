import React, { useState } from 'react';
import ImageModal from '../components/common/ImageModal';

const AboutPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const imageUrl = "https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg";
  const altText = "Kory Kilpatrick with his dog Winnie in the Canadian Rockies";

  const handleImageClick = () => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImageUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div
              className="w-full mb-4 cursor-pointer"
              onClick={handleImageClick}
              role="button"
              aria-label={`View larger image: ${altText}`}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleImageClick(); }}
            >
              <img
                src={imageUrl}
                alt={altText}
                className="w-full aspect-square rounded-lg object-cover shadow-sm pointer-events-none"
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                My dog Winnie and I in the Canadian Rockies
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Hey there 👋</h2>
            <p className="text-textSecondary mb-4">
              I'm Kory. I like solving problems, helping people, and cleaning the lens through which I see the world.
              When I'm not building stuff or studying, I'm doing physical activities, solving
              games with friends, trying to be a good role model to young people,
              listening to music, or kickin it with animals and people I love.
            </p>
            <p className="text-textSecondary mb-4">I built this site so there's a clearer picture of who I am and what I'm up to than what Google provides. Feel free to reach out!</p>
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        imageUrl={modalImageUrl}
        altText={altText}
      />
    </div>
  );
};

export default AboutPage;

import React, { useState } from 'react';
import ImageModal from '../components/common/ImageModal';
import Card from '@/components/common/Card';

const AboutPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
  const imageUrl =
    'https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg';
  const altText = 'Kory Kilpatrick with his dog Winnie in the Canadian Rockies';

  const handleImageClick = () => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalImageUrl(null);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">
      <Card padding="lg" className="border-primary/10 shadow-lg">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div
              className="w-full mb-4 cursor-pointer"
              onClick={handleImageClick}
              role="button"
              aria-label={`View larger image: ${altText}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleImageClick();
              }}
            >
              <img
                src={imageUrl}
                alt={altText}
                className="w-full aspect-square rounded-lg object-cover shadow-sm pointer-events-none"
              />
              <p className="text-xs text-center text-gray-500 mt-2 mb-0">
                My dog Winnie and I in the Canadian Rockies
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <p className="font-sans text-xs uppercase tracking-[0.22em] text-primary-light mb-3">
              About
            </p>
            <h1 className="text-3xl font-bold text-primary mb-4">Hey, I&apos;m Kory.</h1>
            <p className="text-textSecondary mb-4">
              I&apos;m a software engineer, product person, and consultant. I like figuring out what
              matters, making sense of messy situations, and helping people get unstuck.
            </p>
            <p className="text-textSecondary mb-4">
              A lot of my work lately has been around AI, but what interests me most is not the
              technology by itself. It&apos;s how people actually use it: where it helps, where it
              misleads, and how to build better judgment around it.
            </p>
            <p className="text-textSecondary mb-5">
              Outside of work, I read a lot, stay active, and try to show up well for the people in
              my life.
            </p>
          </div>
        </div>
      </Card>

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

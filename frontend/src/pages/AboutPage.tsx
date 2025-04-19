import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="w-full mb-4">
              <img
                src="https://korykilpatrick-bucket.s3.us-west-1.amazonaws.com/kory_winnie_mountains.jpg"
                alt="Kory Kilpatrick with his dog Winnie in the Canadian Rockies"
                className="w-full aspect-square rounded-lg object-cover shadow-sm"
              />
              <p className="text-xs text-center text-gray-500 mt-2">
                My dog Winnie and I in the Canadian Rockies
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">Hey there 👋 I'm Kory</h2>
            <p className="text-textSecondary mb-4">
              I like solving problems, helping people, and pushing the bounds of understanding.
              When I'm not building stuff or studying, I'm doing physical activities, solving
              games with friends, trying to be a good role model to young people that I love,
              listening to music, or kickin it with animal friends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

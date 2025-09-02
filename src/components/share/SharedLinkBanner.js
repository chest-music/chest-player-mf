import * as React from 'react';

/**
 * SharedLinkBanner component adapted from share repository
 * Displays promotional banner for Chest Music platform
 * @param {Object} props
 * @param {string} [props.title1] - First line of title
 * @param {string} [props.title2] - Second line of title  
 * @param {string} [props.title3] - Third line of title
 * @param {string} [props.signUpText] - Sign up button text
 * @param {string} [props.signUpUrl] - Sign up button URL
 * @param {string} [props.coverImage] - Cover image URL
 * @param {boolean} [props.isMobile] - Mobile layout flag
 */
export default function SharedLinkBanner({
  title1 = "Sube tus",
  title2 = "maquetas y",
  title3 = "compártelas",
  signUpText = "Regístrate",
  signUpUrl = "https://chestmusic.com",
  coverImage = "/assets/images/cover-track.png",
  isMobile = false
}) {
  if (isMobile) {
    return (
      <div className="p-4">
        <div className="bg-neutral-black p-6 rounded-2xl">
          <div className="flex flex-col gap-4 text-center">
            <h3 className="text-2xl font-thunder-bold text-neutral-silver-200 leading-tight">
              {title1} <br />
              {title2} <br />
              {title3}
            </h3>
            <div className="flex justify-center">
              <img
                src={coverImage}
                alt="cover"
                className="w-48 h-24 rounded-lg object-cover"
              />
            </div>
            <div className="w-full">
              <a 
                href={signUpUrl} 
                className="btn btn-primary w-full text-center block py-3 px-6 bg-brand-gold text-neutral-black font-semibold rounded-lg hover:bg-brand-gold-hover transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {signUpText}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-5 pb-20">
      <div className="p-10 bg-neutral-black flex gap-x-20 rounded-2xl">
        <div className="w-2/4 h-full flex flex-col gap-y-6">
          <h3 className="text-[64px] font-thunder-bold pr-10 leading-[58px] text-neutral-silver-200">
            {title1} <br />
            {title2} <br />
            {title3}
          </h3>
          <div className="w-1/3">
            <a 
              href={signUpUrl} 
              className="btn btn-primary inline-block py-3 px-6 bg-brand-gold text-neutral-black font-semibold rounded-lg hover:bg-brand-gold-hover transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {signUpText}
            </a>
          </div>
        </div>
        <div className="w-2/4">
          <img
            src={coverImage}
            alt="cover"
            className="w-[620px] h-[300px] rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
}
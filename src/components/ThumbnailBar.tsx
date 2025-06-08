import React from 'react';
import { preventAction } from '../utils/imageLoader';

type ThumbnailBarProps = {
  images: string[];
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
};

/**
 * 画面下部のサムネイル一覧コンポーネント
 */
export function ThumbnailBar({
  images,
  currentImageIndex,
  setCurrentImageIndex
}: ThumbnailBarProps) {
  return (
    <div className="flex-none w-full h-24 min-h-24 bg-gray-800/50 backdrop-blur-sm overflow-x-auto flex flex-row z-20 p-2 gap-2 rounded-b-2xl">
      {images.map((image, index) => {
        const isSelected = currentImageIndex === index;
        return (
          <button
            key={image + '-' + index}
            id={`thumbnail-${index}`}
            onMouseDown={() => setCurrentImageIndex(index)}
            onTouchStart={() => setCurrentImageIndex(index)}
            className={`aspect-square w-20 min-w-20 rounded-lg overflow-hidden transition-all duration-200 ${
              isSelected
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800 opacity-100 scale-95'
                : 'opacity-50 hover:opacity-100'
            }`}
            title={`Thumbnail ${index + 1}`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-contain select-none"
              loading="lazy"
              draggable={false}
              unselectable="on"
              onContextMenu={preventAction}
              style={{ userSelect: "none", WebkitUserSelect: "none" }}
            />
          </button>
        );
      })}
    </div>
  );
} 
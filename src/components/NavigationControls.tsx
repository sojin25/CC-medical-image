import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

type NavigationControlsProps = {
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  totalImages: number;
};

/**
 * 画像ナビゲーションコントロール（上下ボタン）
 */
export function NavigationControls({
  currentImageIndex,
  setCurrentImageIndex,
  totalImages
}: NavigationControlsProps) {
  return (
    <div className="flex-none flex flex-row justify-center items-center gap-4 h-16 min-h-16 z-10 bg-transparent">
      <button
        title="前の画像"
        onClick={() =>
          setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
        }
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition text-lg flex items-center justify-center min-w-16 min-h-16"
      >
        <ChevronUp className="w-8 h-8" />
      </button>
      <span className="text-white text-lg">
        {currentImageIndex + 1} / {totalImages}
      </span>
      <button
        title="次の画像"
        onClick={() =>
          setCurrentImageIndex((prev) =>
            prev < totalImages - 1 ? prev + 1 : prev
          )
        }
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold transition text-lg flex items-center justify-center min-w-16 min-h-16"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </div>
  );
} 
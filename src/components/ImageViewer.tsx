import React, { useCallback, useRef, useState } from 'react';
import { preventAction } from '../utils/imageLoader';

type ImageViewerProps = {
  currentImageUrl: string;
  previousImage: string | null;
  loadedImages: {[key: string]: boolean};
  handleImageLoaded: (url: string) => void;
  currentImageIndex: number;
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<number>>;
  totalImages: number;
  setTemporaryShowComment: React.Dispatch<React.SetStateAction<boolean>>;
  images: string[];
  comments: { [filename: string]: string };
};

/**
 * メイン画像表示エリアコンポーネント
 */
export function ImageViewer({
  currentImageUrl,
  previousImage,
  loadedImages,
  handleImageLoaded,
  currentImageIndex,
  setCurrentImageIndex,
  totalImages,
  setTemporaryShowComment,
  images,
  comments
}: ImageViewerProps) {
  // タッチイベント関連の状態
  const [isTapping, setIsTapping] = useState(false);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const lastWheelTime = useRef(0);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  // 画像をタップしたときの処理
  const handleImagePress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // スワイプ検出との競合を避けるため、ここではタイマーをセット
    if (tapTimer.current) clearTimeout(tapTimer.current);
    setIsTapping(true);
    
    tapTimer.current = setTimeout(() => {
      // 指が300ミリ秒以上離れなければ長押し判定
      if (isTapping && currentImageIndex >= 0 && currentImageIndex < images.length) {
        const currentImage = images[currentImageIndex];
        const filename = currentImage.split('/').pop() || '';
        
        if (filename && comments[filename]) {
          console.log(`画像${filename}を長押し: コメント表示ON`);
          setTemporaryShowComment(true);
        }
      }
    }, 300);
  }, [currentImageIndex, images, comments, isTapping, setTemporaryShowComment]);

  // タップ終了時の処理
  const handleImageRelease = useCallback(() => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
    }
    setIsTapping(false);
    setTemporaryShowComment(false);
  }, [setTemporaryShowComment]);

  // タッチ・ホイールによるナビゲーション処理
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 50) return;
    lastWheelTime.current = now;
    if (e.deltaY < -5) {
      // トラックパッド・ホイール「上」→次の画像
      setCurrentImageIndex(prev => (prev < totalImages - 1 ? prev + 1 : prev));
    } else if (e.deltaY > 5) {
      // トラックパッド・ホイール「下」→前の画像
      setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : prev));
    }
  };

  // タッチ開始処理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
      
      // 画像上でのタッチ開始を検出
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img') {
        handleImagePress(e);
      }
    }
  };

  // タッチ移動処理
  const handleTouchMove = (e: React.TouchEvent) => {
    // スワイプ中はタップタイマーをクリア
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      setIsTapping(false);
    }
    
    if (
      touchStartY.current !== null &&
      touchStartX.current !== null &&
      e.touches.length === 1
    ) {
      const dy = e.touches[0].clientY - touchStartY.current;
      const dx = e.touches[0].clientX - touchStartX.current;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
        // 横方向スワイプ
        if (dx < 0) {
          setCurrentImageIndex(prev => {
            const next = prev < totalImages - 1 ? prev + 1 : prev;
            if (next !== prev) {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }
            return next;
          });
        } else {
          setCurrentImageIndex(prev => {
            const next = prev > 0 ? prev - 1 : prev;
            if (next !== prev) {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }
            return next;
          });
        }
      } else if (Math.abs(dy) > 20) {
        // 縦方向スワイプ
        if (dy < 0) {
          setCurrentImageIndex(prev => {
            const next = prev < totalImages - 1 ? prev + 1 : prev;
            if (next !== prev) {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }
            return next;
          });
        } else {
          setCurrentImageIndex(prev => {
            const next = prev > 0 ? prev - 1 : prev;
            if (next !== prev) {
              touchStartX.current = e.touches[0].clientX;
              touchStartY.current = e.touches[0].clientY;
            }
            return next;
          });
        }
      }
    }
  };

  // タッチ終了処理
  const handleTouchEnd = () => {
    handleImageRelease();
    touchStartY.current = null;
    touchStartX.current = null;
  };

  return (
    <div
      className="flex-1 flex items-center justify-center min-h-[200px] w-full p-4 overflow-hidden bg-gray-900"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 前の画像（フェードアウト用） */}
        {previousImage && previousImage !== currentImageUrl && (
          <img
            src={previousImage}
            alt="Previous image"
            className="absolute w-auto h-[calc(100%-1rem)] max-h-full object-contain rounded-2xl select-none opacity-0 transition-opacity duration-300"
            style={{ 
              zIndex: 0, 
              userSelect: "none", 
              WebkitUserSelect: "none",
              opacity: loadedImages[currentImageUrl] ? 0 : 1 
            }}
            draggable={false}
            unselectable="on"
          />
        )}
        
        {/* メイン画像表示 */}
        <img
          src={currentImageUrl}
          alt={`Image ${currentImageIndex + 1}`}
          className="w-auto h-[calc(100%-1rem)] max-h-full object-contain rounded-2xl select-none"
          loading="eager"
          draggable={false}
          unselectable="on"
          onLoad={() => handleImageLoaded(currentImageUrl)}
          onContextMenu={preventAction}
          style={{ 
            zIndex: 1, 
            userSelect: "none", 
            WebkitUserSelect: "none", 
            cursor: "pointer",
            opacity: loadedImages[currentImageUrl] ? 1 : 0,
            transition: "opacity 300ms ease-in-out"
          }}
          onMouseDown={handleImagePress}
          onMouseUp={handleImageRelease}
          onMouseLeave={handleImageRelease}
        />
      </div>
    </div>
  );
} 
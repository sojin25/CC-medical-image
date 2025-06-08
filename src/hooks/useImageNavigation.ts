import { useState, useEffect, useCallback, useMemo } from 'react';
import { imageData, instTxtData } from '../utils/imageLoader';

export function useImageNavigation() {
  // フォルダ選択関連の状態
  const folderKeys = useMemo(() => {
    // 除外するフォルダ名のリスト
    const excludeFolders = ['comments', 'comments_new', 'new_comments'];
    
    // 除外フォルダを含まないキーのみをフィルタリング
    return Object.keys(imageData).filter(folder => 
      !excludeFolders.some(excludeFolder => folder.includes(excludeFolder))
    );
  }, []);
  
  const [selectedFolder, setSelectedFolder] = useState<string>(folderKeys[0] || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // コメント表示関連
  const [showComments, setShowComments] = useState(false);
  const [temporaryShowComment, setTemporaryShowComment] = useState(false);
  
  // 画像プリロード用の状態
  const [loadedImages, setLoadedImages] = useState<{[key: string]: boolean}>({});
  const [previousImage, setPreviousImage] = useState<string | null>(null);
  
  // キーボードナビゲーション
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 現在表示中の画像一覧を取得
    const images = selectedFolder ? imageData[selectedFolder]?.images ?? [] : [];
    
    if (e.key === 'ArrowUp') {
      setCurrentImageIndex((prev) =>
        prev > 0 ? prev - 1 : images.length - 1
      );
    } else if (e.key === 'ArrowDown') {
      setCurrentImageIndex((prev) =>
        prev < images.length - 1 ? prev + 1 : 0
      );
    }
  }, [selectedFolder]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // フォルダを変更したときだけ最初の画像に戻す
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedFolder]);

  // currentImageIndexがimages.lengthを超えた場合に補正
  useEffect(() => {
    const images = selectedFolder ? imageData[selectedFolder]?.images ?? [] : [];
    if (currentImageIndex > images.length - 1) {
      setCurrentImageIndex(images.length - 1 >= 0 ? images.length - 1 : 0);
    }
  }, [selectedFolder, currentImageIndex]);

  // Auto-scroll thumbnail into view when changing images
  useEffect(() => {
    const thumbnail = document.getElementById(`thumbnail-${currentImageIndex}`);
    if (thumbnail) {
      thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentImageIndex]);
  
  // 画像読み込み完了ハンドラ
  const handleImageLoaded = useCallback((url: string) => {
    setLoadedImages(prev => ({...prev, [url]: true}));
  }, []);

  // 選択中フォルダの画像リスト
  const images = selectedFolder ? imageData[selectedFolder]?.images ?? [] : [];
  // 選択中フォルダのコメント画像
  const comments = selectedFolder ? imageData[selectedFolder]?.comments ?? {} : {};
  // 各フォルダの「M3-1-000.txt」などの内容を表示
  const instText = selectedFolder
    ? instTxtData[`${selectedFolder}/${selectedFolder}.txt`] ?? ''
    : '';

  // 解説ボタンの状態に応じて表示する画像リスト
  const activeImages = useMemo(() => {
    if (showComments || temporaryShowComment) {
      // 解説モード：番号部分でc-画像を探し、なければ通常画像をfallback表示
      return images.map(imgUrl => {
        const filename = imgUrl.split('/').pop() || '';
        // image-0048.jpg, image-0048-xxxxxx.jpg どちらも image-0048 を抽出
        const baseNameMatch = filename.match(/(image-\d+)/);
        const baseName = baseNameMatch ? baseNameMatch[1] : filename;
        // commentsマップのキー一覧から番号部分が一致するものを探す
        const commentKey = Object.keys(comments).find(key => key.startsWith(baseName));
        return commentKey ? comments[commentKey] : imgUrl;
      });
    }
    // 通常モード
    return images;
  }, [images, comments, showComments, temporaryShowComment]);

  // 現在表示中の画像URL
  const currentImageUrl = activeImages[currentImageIndex] || '';

  // 画像プリロード
  useEffect(() => {
    // 現在の画像を保存
    if (currentImageUrl) {
      setPreviousImage(currentImageUrl);
    }
    
    // 現在と次の画像をプリロード
    const preloadImages = () => {
      if (!selectedFolder) return;
      
      // 現在の画像とその前後の画像のインデックスを計算
      const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : null;
      const nextIndex = currentImageIndex < activeImages.length - 1 ? currentImageIndex + 1 : null;
      
      // 現在の画像をプリロード
      if (currentImageUrl) {
        const img = new Image();
        img.onload = () => {
          handleImageLoaded(currentImageUrl);
          console.log(`✅ 現在の画像を読み込みました: ${currentImageUrl}`);
        };
        img.onerror = () => console.log(`❌ 現在の画像の読み込みに失敗: ${currentImageUrl}`);
        img.src = currentImageUrl;
      }
      
      // 次の画像をプリロード
      if (nextIndex !== null) {
        const nextImg = new Image();
        nextImg.onload = () => console.log(`✅ 次の画像をプリロード: ${activeImages[nextIndex]}`);
        nextImg.onerror = () => console.log(`❌ 次の画像のプリロードに失敗: ${activeImages[nextIndex]}`);
        nextImg.src = activeImages[nextIndex];
      }
      
      // 前の画像をプリロード
      if (prevIndex !== null) {
        const prevImg = new Image();
        prevImg.onload = () => console.log(`✅ 前の画像をプリロード: ${activeImages[prevIndex]}`);
        prevImg.onerror = () => console.log(`❌ 前の画像のプリロードに失敗: ${activeImages[prevIndex]}`);
        prevImg.src = activeImages[prevIndex];
      }
    };
    
    preloadImages();
  }, [selectedFolder, currentImageIndex, activeImages, currentImageUrl, handleImageLoaded]);

  return {
    folderKeys,
    selectedFolder,
    setSelectedFolder,
    currentImageIndex,
    setCurrentImageIndex,
    isSidebarOpen,
    setIsSidebarOpen,
    showComments,
    setShowComments,
    temporaryShowComment,
    setTemporaryShowComment,
    loadedImages,
    previousImage,
    handleImageLoaded,
    images,
    comments,
    instText,
    activeImages,
    currentImageUrl
  };
} 
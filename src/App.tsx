import React, { useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { DisplayModeToggle } from './components/DisplayModeToggle';
import { FolderList } from './components/FolderList';
import { ImageViewer } from './components/ImageViewer';
import { InstructionText } from './components/InstructionText';
import { NavigationControls } from './components/NavigationControls';
import { ThumbnailBar } from './components/ThumbnailBar';
import { useImageNavigation } from './hooks/useImageNavigation';
import { preventAction, imageData } from './utils/imageLoader';

function App() {
  const {
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
  } = useImageNavigation();

  // コンテンツ保護の設定
  useEffect(() => {
    // グローバルイベントリスナーを追加
    document.addEventListener('copy', preventAction);
    document.addEventListener('contextmenu', preventAction);
    document.addEventListener('dragstart', preventAction);
    
    // クリーンアップ関数
    return () => {
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('contextmenu', preventAction);
      document.removeEventListener('dragstart', preventAction);
    };
  }, []);
  
  return (
    <div 
      className="flex h-screen bg-gray-900"
      onCopy={preventAction}
      onCut={preventAction}
      onPaste={preventAction}
      onContextMenu={preventAction}
    >
      {/* Toggle Sidebar Button */}
      {/* 症例一覧ボタン＋解説ボタン（サイドバーが閉じているときのみ表示） */}
      {!isSidebarOpen && (
        <div className="fixed top-4 left-4 z-20 flex flex-row gap-2">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <PanelLeftOpen className="w-6 h-6 text-gray-300" />
            <span className="text-gray-300 text-base">症例一覧</span>
          </button>
          <DisplayModeToggle showComments={showComments} setShowComments={setShowComments} />
        </div>
      )}
      {/* サイドバーの症例一覧アイコン＋解説ボタン */}
      {isSidebarOpen && (
        <div className="fixed top-4 left-4 z-20 flex flex-row gap-2">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="bg-gray-800 p-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            title="症例一覧を閉じる"
          >
            <PanelLeftClose className="w-6 h-6 text-gray-300" />
            <span className="text-gray-300 text-base">症例一覧</span>
          </button>
          <DisplayModeToggle showComments={showComments} setShowComments={setShowComments} />
        </div>
      )}

      {/* Folder List - Left Column */}
      <div
        className={`w-72 bg-gray-800 shadow-xl overflow-y-auto border-r border-gray-700 transition-transform duration-300 fixed h-full z-10 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <FolderList 
          folderKeys={folderKeys}
          selectedFolder={selectedFolder}
          setSelectedFolder={setSelectedFolder}
          setIsSidebarOpen={setIsSidebarOpen}
          imageData={imageData}
        />
      </div>

      {/* Image Display - Right Column */}
      <div
        className={`flex-1 relative transition-[margin] duration-300 ${
          isSidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        <div className="absolute inset-0 p-0 pt-16 flex flex-col h-full">
          {/* inst.txtテキストエリア */}
          <InstructionText text={instText} />
          
          {/* 上下ボタンエリア */}
          <NavigationControls 
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            totalImages={activeImages.length}
          />
          
          {/* 画像エリア */}
          <ImageViewer 
            currentImageUrl={currentImageUrl}
            previousImage={previousImage}
            loadedImages={loadedImages}
            handleImageLoaded={handleImageLoaded}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            totalImages={activeImages.length}
            setTemporaryShowComment={setTemporaryShowComment}
            images={images}
            comments={comments}
          />
          
          {/* サムネイルエリア */}
          <ThumbnailBar 
            images={activeImages}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
import React, { useCallback } from 'react';

type DisplayModeToggleProps = {
  showComments: boolean;
  setShowComments: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * 通常モードと解説モードを切り替えるラジオボタンコンポーネント
 */
export function DisplayModeToggle({ showComments, setShowComments }: DisplayModeToggleProps) {
  // モード切り替え処理
  const handleModeChange = useCallback((mode: 'normal' | 'comments') => {
    setShowComments(mode === 'comments');
  }, [setShowComments]);
  
  return (
    <div className="flex bg-gray-800 rounded-lg p-1 select-none">
      <button
        className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
          !showComments 
            ? "bg-blue-600 text-white" 
            : "bg-transparent text-gray-300 hover:text-white"
        }`}
        onClick={() => handleModeChange('normal')}
      >
        <div className={`w-4 h-4 mr-2 rounded-full border ${!showComments ? "border-white bg-white" : "border-gray-400"}`}>
          {!showComments && <div className="w-2 h-2 bg-blue-600 rounded-full m-auto transform translate-y-1/4"></div>}
        </div>
        通常
      </button>
      
      <button
        className={`px-3 py-2 rounded-md text-sm flex items-center transition-colors ${
          showComments 
            ? "bg-blue-600 text-white" 
            : "bg-transparent text-gray-300 hover:text-white"
        }`}
        onClick={() => handleModeChange('comments')}
      >
        <div className={`w-4 h-4 mr-2 rounded-full border ${showComments ? "border-white bg-white" : "border-gray-400"}`}>
          {showComments && <div className="w-2 h-2 bg-blue-600 rounded-full m-auto transform translate-y-1/4"></div>}
        </div>
        解説
      </button>
    </div>
  );
} 
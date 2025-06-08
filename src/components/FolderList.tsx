import React from 'react';
import { Folder } from 'lucide-react';

type FolderListProps = {
  folderKeys: string[];
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  imageData: { [folder: string]: { images: string[] } };
};

/**
 * 左サイドバーのフォルダ一覧コンポーネント
 */
export function FolderList({
  folderKeys,
  selectedFolder,
  setSelectedFolder,
  setIsSidebarOpen,
  imageData
}: FolderListProps) {
  return (
    <div className="p-6 pt-16">
      <h2 className="text-xl font-bold mb-6 text-white">症例一覧</h2>
      <div className="space-y-3">
        {folderKeys.map((folder) => (
          <button
            key={folder}
            onClick={() => {
              setSelectedFolder(folder);
              setIsSidebarOpen(false); // フォルダ選択時にサイドバーを閉じる
            }}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
              selectedFolder === folder
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
            title={folder}
          >
            <Folder
              className={`w-5 h-5 mr-3 ${
                selectedFolder === folder ? 'text-white' : 'text-gray-400'
              }`}
            />
            <div className="flex-1 text-left">
              <div className="font-medium">{folder}</div>
              <div className="text-sm opacity-75">
                {imageData[folder]?.images.length ?? 0} photos
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 
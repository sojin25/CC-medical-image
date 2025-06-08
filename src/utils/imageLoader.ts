/**
 * 画像データの読み込みと処理を行うユーティリティ
 */

// プレフィックスが付いていない画像のみ読み込む (png, jpg, jpeg)
const imageModules = import.meta.glob([
  '../image_folder/**/*.png', 
  '../image_folder/**/*.jpg', 
  '../image_folder/**/*.jpeg'
], { eager: true, query: '?url', import: 'default' });

// コメント画像を読み込む (c- プレフィックスが付いた画像のみ)
const commentsModules = import.meta.glob([
  '../image_folder/**/comments/c-*.png',
  '../image_folder/**/comments/c-*.jpg',
  '../image_folder/**/comments/c-*.jpeg'
], { eager: true, query: '?url', import: 'default' });

/**
 * 各フォルダ内のすべての.txtファイルを読み込む
 * 例: M3-1-000.txt, inst.txt など
 */
const txtModules = import.meta.glob('../image_folder/**/*.txt', { eager: true, query: '?raw', import: 'default' });

type FolderImages = {
  images: string[];
  comments: { [filename: string]: string };
};

// イベント防止関数
export const preventAction = (e: React.SyntheticEvent | Event) => {
  e.preventDefault();
  return false;
};

export const buildImageData = () => {
  const folders: { [folder: string]: FolderImages } = {};
  console.log("Building image data...");

  // 通常画像とそのファイル名
  const regularImagePaths: {[folder: string]: {[url: string]: string}} = {};
  
  // デバッグ用に全ての画像パスを表示
  console.log("通常画像パス:", Object.keys(imageModules));
  console.log("コメント画像パス:", Object.keys(commentsModules));
  
  // 通常画像のパスとファイル名を整理
  Object.entries(imageModules).forEach(([path, url]) => {
    // 例: ../image_folder/M3-1-000/image-0001.jpg
    const pathParts = path.split('/');
    // パスからフォルダ名を抽出
    if (pathParts.length >= 3) {
      // ../image_folder/M3-1-000/image-0001.jpg の場合、M3-1-000を取得
      const folder = pathParts.slice(2, -1).join('/');
      const filename = pathParts[pathParts.length - 1];
      
      // プレフィックス付きの画像を除外（念のため）
      if (!filename.startsWith('c-') && (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg'))) {
        if (!folders[folder]) folders[folder] = { images: [], comments: {} };
        if (!regularImagePaths[folder]) regularImagePaths[folder] = {};
        
        folders[folder].images.push(url as string);
        regularImagePaths[folder][url as string] = filename;
        
        console.log(`通常画像: ${folder}/${filename} -> ${url}`);
      }
    }
  });

  // コメント画像を処理
  Object.entries(commentsModules).forEach(([path, url]) => {
    // 例: ../image_folder/M3-1-000/comments/c-image-0001.jpg
    const pathParts = path.split('/');
    // コメント画像の親フォルダパスを取得（commentsサブフォルダの1つ上が通常画像のフォルダ）
    if (pathParts.length >= 5) {
      // ../image_folder/M3-1-000/comments/c-image-0001.jpg → M3-1-000
      const folder = pathParts.slice(2, -2).join('/');
      const filename = pathParts[pathParts.length - 1];

      // c-で始まる画像のみを処理
      if (filename.startsWith('c-') && (filename.endsWith('.png') || filename.endsWith('.jpg') || filename.endsWith('.jpeg'))) {
        if (!folders[folder]) folders[folder] = { images: [], comments: {} };

        // 通常画像のファイル名を生成（c-image-0001.jpg → image-0001.jpg）
        const normalFilename = filename.substring(2);

        console.log(`コメント画像: ${folder}/comments/${filename} -> ${url} (対応する通常画像: ${normalFilename})`);

        // 通常画像のファイル名をキーとして、コメント画像のURLを保存
        folders[folder].comments[normalFilename] = url as string;
      }
    }
  });
  
  // コメント画像マッピングを構築
  const commentImageMapping: Record<string, string> = {};
  
  // Vercel環境用のコメント画像マッピングを構築
  Object.keys(folders).forEach(folder => {
    const folderData = folders[folder];
    const baseImageNames = new Map<string, string>(); // 基本ファイル名と画像URLのマップ
    
    // すべての通常画像の基本ファイル名を取得
    folderData.images.forEach(imgUrl => {
      const filename = imgUrl.split('/').pop() || '';
      // ハイフンで分割してハッシュを除去 (例: image-0001-abc123.jpg → image-0001)
      const baseName = filename.split('-').slice(0, 2).join('-');
      baseImageNames.set(baseName, imgUrl);
    });
    
    // コメント画像との対応関係を構築
    Object.entries(folderData.comments).forEach(([commentFilename, commentUrl]) => {
      const commentBaseName = commentFilename.split('-').slice(0, 2).join('-');
      
      // 対応する通常画像を検索
      baseImageNames.forEach((normalUrl, normalBaseName) => {
        if (normalBaseName === commentBaseName) {
          // 通常画像URLからコメント画像URLへのマッピングを作成
          commentImageMapping[normalUrl] = commentUrl;
          console.log(`マッピング作成: ${normalUrl} → ${commentUrl}`);
        }
      });
    });
    
    console.log(`フォルダ ${folder} のマッピング:`, commentImageMapping);
  });
  
  // 確認用ログ
  Object.keys(folders).forEach(folder => {
    console.log(`フォルダ ${folder}:`);
    console.log(`- 通常画像数: ${folders[folder].images.length}`);
    console.log(`- コメント画像数: ${Object.keys(folders[folder].comments).length}`);
  });

  return { folders, commentImageMapping };
};

/**
 * 各フォルダ内のすべての.txtファイルの内容を
 * instTxtData[folder/filename] = 内容
 * で格納する
 */
export const getInstTxtData = () => {
  const instTxtData: { [key: string]: string } = {};
  Object.entries(txtModules).forEach(([path, raw]) => {
    const pathParts = path.split('/');
    // ../image_folder/M3-1-000/M3-1-000.txt の場合、M3-1-000, M3-1-000.txtを取得
    if (pathParts.length >= 3 && pathParts[pathParts.length - 1].endsWith('.txt')) {
      const folder = pathParts.slice(2, -1).join('/');
      const filename = pathParts[pathParts.length - 1];
      // キーは "M3-1-000/M3-1-000.txt" のようにする
      const key = `${folder}/${filename}`;
      instTxtData[key] = raw as string;
    }
  });
  return instTxtData;
};

// 自然順にソート
export function naturalCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export type ImageData = {
  folders: { [folder: string]: FolderImages };
  commentImageMapping: Record<string, string>;
};

// 画像データとinst.txtデータを初期化
export const { folders: imageData, commentImageMapping } = buildImageData();
export const instTxtData = getInstTxtData();
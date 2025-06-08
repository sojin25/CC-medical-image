import React from 'react';

type InstructionTextProps = {
  text: string;
};

/**
 * ケース説明テキスト表示コンポーネント
 */
export function InstructionText({ text }: InstructionTextProps) {
  return (
    <div className="flex-none bg-gray-800 rounded-t-2xl px-6 py-4 min-h-[64px] max-h-36 overflow-y-auto text-white text-base shadow">
      {text ? (
        <pre className="whitespace-pre-wrap font-sans">{text}</pre>
      ) : (
        <span className="text-gray-400">説明テキストがありません</span>
      )}
    </div>
  );
} 
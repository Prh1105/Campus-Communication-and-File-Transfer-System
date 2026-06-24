import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { useChat } from '../contexts/ChatContext';
import { uploadFile } from '../services/file.service';

export default function MessageInput() {
  const { sendMessage, activeChat } = useChat();
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    sendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const fileInfo = await uploadFile(file, setUploadProgress);
      sendMessage(`[文件] ${file.name}`, 'file', {
        url: fileInfo.url,
        name: fileInfo.originalName,
        size: fileInfo.size,
      });
    } catch (err: any) {
      alert('文件上传失败: ' + (err.message || '未知错误'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!activeChat) return null;

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-white">
      {/* 上传进度 */}
      {uploading && (
        <div className="mb-2">
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">上传中 {uploadProgress}%</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* 文件上传按钮 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          title="发送文件"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />

        {/* 文本输入 */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          rows={1}
          className="flex-1 resize-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm max-h-32"
        />

        {/* 发送按钮 */}
        <button
          type="submit"
          disabled={!text.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </form>
    </div>
  );
}

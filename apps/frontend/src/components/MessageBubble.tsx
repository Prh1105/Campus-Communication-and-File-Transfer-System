import type { Message } from '@campus-im/shared';

interface Props {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: Props) {
  const isSystem = message.type === 'system';
  const isImage = message.type === 'image';
  const isFile = message.type === 'file';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isMine ? 'order-1' : ''}`}>
        {/* 发送者名称 (非本人时显示) */}
        {!isMine && message.sender && (
          <p className="text-xs text-gray-500 mb-1 ml-1">{message.sender.displayName}</p>
        )}

        <div
          className={`px-4 py-2 rounded-2xl break-words ${
            isMine
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
          }`}
        >
          {/* 图片消息 */}
          {isImage && message.fileUrl && (
            <img
              src={message.fileUrl}
              alt={message.fileName || '图片'}
              className="max-w-60 max-h-60 rounded-lg mb-1 cursor-pointer"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          )}

          {/* 文件消息 */}
          {isFile && message.fileUrl && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm underline mb-1"
            >
              <span>📎</span>
              <span>{message.fileName || '文件'}</span>
              {message.fileSize && (
                <span className="text-xs opacity-70">
                  {message.fileSize > 1024 * 1024
                    ? `${(message.fileSize / 1024 / 1024).toFixed(1)}MB`
                    : message.fileSize > 1024
                      ? `${(message.fileSize / 1024).toFixed(1)}KB`
                      : `${message.fileSize}B`}
                </span>
              )}
            </a>
          )}

          {/* 文本内容 */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* 时间戳 */}
        <p
          className={`text-[10px] text-gray-400 mt-1 ${isMine ? 'text-right mr-1' : 'ml-1'}`}
        >
          {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

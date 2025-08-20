import dayjs from 'dayjs';

export default function MessageItem({ message, meId }) {
  const mine = message.sender?._id === meId;
  const readCount = (message.readBy || []).length;
  const doubleTick = readCount > 1;

  return (
    <div className={`flex items-end gap-2 mb-2 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && (
        <img
          src={message.sender?.avatarUrl || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border"
        />
      )}
      <div className={`max-w-xs px-3 py-2 rounded-lg shadow ${mine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {!mine && <div className="text-xs font-bold mb-1">{message.sender?.name}</div>}
        {message.type === 'image' ? (
          <img src={message.attachments?.[0]} alt="attachment" className="max-w-[200px] rounded" />
        ) : (
          <div>{message.content}</div>
        )}
        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
          <span>{dayjs(message.createdAt).format('HH:mm')}</span>
          {mine && (
            <span>
              {doubleTick ? '✔✔' : '✔'}
            </span>
          )}
        </div>
      </div>
      {mine && (
        <img
          src={message.sender?.avatarUrl || '/default-avatar.png'}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border"
        />
      )}
    </div>
  );
}

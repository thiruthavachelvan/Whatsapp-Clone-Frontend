import React, { useState, useEffect } from 'react';
import { Plus, Camera, Search, MoreVertical, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchStatuses, uploadStatus } from '../../services/api';
import StatusViewer from './StatusViewer';

const StatusTab = ({ currentUser }) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserStatuses, setSelectedUserStatuses] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef(null);

  const loadStatuses = async () => {
    try {
      const data = await fetchStatuses();
      setStatuses(data);
    } catch (error) {
      console.error("Failed to load statuses", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, []);

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Status media must be under 10MB");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        await uploadStatus({
          userId: currentUser._id,
          mediaUrl: reader.result,
          type: file.type.startsWith('video') ? 'video' : 'image'
        });
        await loadStatuses(); // Refresh
      } catch (error) {
        console.error("Failed to upload status", error);
        alert("Failed to upload status. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const myStatusGroup = statuses.find(group => group.user?._id === currentUser?._id);
  const otherStatuses = statuses.filter(group => group.user?._id !== currentUser?._id);

  const isAllViewed = (group) => {
    if (!group || !currentUser) return false;
    return group.statuses.every(status => 
      status.views?.some(view => (view.userId?._id || view.userId) === currentUser._id)
    );
  };

  const handleCloseViewer = () => {
    setSelectedUserStatuses(null);
    loadStatuses();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#111b21] transition-colors duration-300 relative overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex items-center border-b border-gray-200 dark:border-white/5">
        <h2 className="text-xl font-bold text-gray-800 dark:text-[#e9edef]">Status</h2>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*,video/*" 
        onChange={handleFileChange} 
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* My Status */}
        <div 
          className="px-4 py-3 flex items-center hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] cursor-pointer group"
        >
          <div className="relative mr-4" onClick={() => myStatusGroup ? setSelectedUserStatuses(myStatusGroup) : handleUploadClick()}>
            <div className={`w-12 h-12 rounded-full border-2 ${myStatusGroup ? (isAllViewed(myStatusGroup) ? 'border-gray-400 dark:border-[#3b4a54]' : 'border-whatsapp-green') + ' p-0.5' : 'border-gray-300 dark:border-[#3b4a54]'}`}>
              {currentUser.profilePic ? (
                <img src={currentUser.profilePic} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 dark:bg-[#3b4a54] flex items-center justify-center text-white">
                  {currentUser.avatarLetter || currentUser.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {!myStatusGroup && (
              <div className="absolute bottom-0 right-0 bg-whatsapp-green rounded-full p-0.5 border-2 border-white dark:border-[#111b21]">
                <Plus size={12} className="text-white" />
              </div>
            )}
          </div>
          <div 
            className="flex-1 border-b border-gray-100 dark:border-white/5 pb-3"
            onClick={handleUploadClick}
          >
            <h3 className="font-medium text-gray-900 dark:text-[#e9edef]">My status</h3>
            <p className="text-sm text-gray-500 dark:text-[#8696a0]">
              {isUploading ? 'Uploading...' : (myStatusGroup ? formatDistanceToNow(new Date(myStatusGroup.statuses[0].createdAt)) + ' ago' : 'Tap to add status update')}
            </p>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="px-4 py-3 text-sm font-medium text-whatsapp-teal uppercase tracking-wider">
          Recent updates
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading statuses...</div>
        ) : otherStatuses.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No recent updates</div>
        ) : (
          otherStatuses.map(group => (
            <div 
              key={group.user._id} 
              className="px-4 py-3 flex items-center hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942] cursor-pointer"
              onClick={() => setSelectedUserStatuses(group)}
            >
              <div className="mr-4">
                <div className={`w-12 h-12 rounded-full border-2 ${isAllViewed(group) ? 'border-gray-400 dark:border-[#3b4a54]' : 'border-whatsapp-green'} p-0.5`}>
                  {group.user.profilePic ? (
                    <img src={group.user.profilePic} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: group.user.avatarColor || '#9ca3af' }}
                    >
                      {group.user.avatarLetter || group.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 border-b border-gray-100 dark:border-white/5 pb-3">
                <h3 className="font-medium text-gray-900 dark:text-[#e9edef]">{group.user.username}</h3>
                <p className="text-sm text-gray-500 dark:text-[#8696a0]">
                  {formatDistanceToNow(new Date(group.statuses[0].createdAt))} ago
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUserStatuses && (
        <StatusViewer 
          group={selectedUserStatuses} 
          currentUser={currentUser}
          onClose={handleCloseViewer} 
        />
      )}
    </div>
  );
};

export default StatusTab;

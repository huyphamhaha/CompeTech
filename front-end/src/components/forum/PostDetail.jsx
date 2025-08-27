import React, { useState } from "react";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Clock,
  User,
  Edit,
  Trash2,
  Reply,
  Send,
} from "lucide-react";
import EditPost from "./EditPost.jsx";

const PostDetail = ({
  post,
  onBack,
  onDelete,
  onEdit,
  onLike,
  onAddComment,
  onDeleteComment,
  onEditComment,
  onReplyToComment,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [showEditPost, setShowEditPost] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Không rõ";

    let date;
    if (timestamp.seconds) {
      // Firebase Timestamp
      date = new Date(timestamp.seconds * 1000);
    } else {
      // ISO string
      date = new Date(timestamp);
    }

    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 48) return "Hôm qua";
    return date.toLocaleDateString("vi-VN");
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(post.id, newComment.trim());
      setNewComment("");
    }
  };

  const handleEditComment = (commentId, currentContent) => {
    setEditingCommentId(commentId);
    setEditCommentContent(currentContent);
  };

  const handleSaveEditComment = () => {
    if (editCommentContent.trim()) {
      onEditComment(post.id, editingCommentId, editCommentContent.trim());
      setEditingCommentId(null);
      setEditCommentContent("");
    }
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentContent("");
  };

  const handleReplyToComment = (commentId) => {
    if (replyContent.trim()) {
      onReplyToComment(post.id, commentId, replyContent.trim());
      setReplyingToCommentId(null);
      setReplyContent("");
    }
  };

  const handleCancelReply = () => {
    setReplyingToCommentId(null);
    setReplyContent("");
  };

  const canEditComment = (comment) => {
    return currentUser?.uid === comment.authorId;
  };

  const canDeleteComment = (comment) => {
    return (
      currentUser?.uid === comment.authorId ||
      currentUser?.uid === post.authorId
    );
  };

  if (showEditPost) {
    return (
      <EditPost
        post={post}
        onClose={() => setShowEditPost(false)}
        onSubmit={(updatedPost) => {
          onEdit(post.id, updatedPost);
          setShowEditPost(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#064232] hover:text-[#0a5a47] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Post Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#064232] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{post.author}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#FCE3E1] text-[#064232] text-sm rounded-full">
                {post.category}
              </span>
              {currentUser?.uid === post.authorId && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowEditPost(true)}
                    className="p-2 text-gray-400 hover:text-[#064232] transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Bạn có chắc chắn muốn xóa bài viết này?"
                        )
                      ) {
                        onDelete(post.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post Title and Content */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="text-gray-700 mb-6 whitespace-pre-wrap">
            {post.content}
          </div>

          {/* Post Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-5 h-5" />
              <span>{post.likes}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{post.comments.length} bình luận</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bình luận ({post.comments.length})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận của bạn..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#064232] focus:border-transparent resize-none"
                  maxLength={1000}
                />
              </div>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-[#064232] text-white rounded-lg hover:bg-[#0a5a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-fit"
              >
                <Send className="w-4 h-4" />
                Gửi
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            ) : (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-l-4 border-[#064232] pl-4"
                >
                  {/* Comment */}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#064232] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {comment.author}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {canEditComment(comment) && (
                          <button
                            onClick={() =>
                              handleEditComment(comment.id, comment.content)
                            }
                            className="p-1 text-gray-400 hover:text-[#064232] transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Bạn có chắc chắn muốn xóa bình luận này?"
                                )
                              ) {
                                onDeleteComment(post.id, comment.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => setReplyingToCommentId(comment.id)}
                          className="p-1 text-gray-400 hover:text-[#064232] transition-colors"
                        >
                          <Reply className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editCommentContent}
                          onChange={(e) =>
                            setEditCommentContent(e.target.value)
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#064232] focus:border-transparent resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveEditComment}
                            className="px-3 py-1 bg-[#064232] text-white rounded text-sm hover:bg-[#0a5a47] transition-colors"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={handleCancelEditComment}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </div>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingToCommentId === comment.id && (
                    <div className="ml-8 mb-3">
                      <div className="flex gap-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Viết trả lời..."
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#064232] focus:border-transparent resize-none"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleReplyToComment(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1 bg-[#064232] text-white rounded text-sm hover:bg-[#0a5a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Trả lời
                          </button>
                          <button
                            onClick={handleCancelReply}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 space-y-3">
                      {comment.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="border-l-2 border-gray-200 pl-4"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-[#064232] rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {reply.author}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                </div>
                              </div>
                            </div>
                            {currentUser?.uid === reply.authorId && (
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Bạn có chắc chắn muốn xóa trả lời này?"
                                    )
                                  ) {
                                    // Handle delete reply
                                  }
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-gray-700 text-sm whitespace-pre-wrap">
                            {reply.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

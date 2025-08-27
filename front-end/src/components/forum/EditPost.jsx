import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const EditPost = ({ post, onClose, onSubmit }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState(post.category);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Chung",
    "Học tập",
    "Thảo luận",
    "Hỏi đáp",
    "Chia sẻ kinh nghiệm",
    "Tài liệu",
    "Sự kiện",
  ];

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
    setCategory(post.category);
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        category,
      });
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Có lỗi xảy ra khi cập nhật bài viết!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Chỉnh sửa bài viết
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tiêu đề *
              </label>
              <input
                type="text"
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#064232] focus:border-transparent"
                maxLength={200}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/200 ký tự
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="edit-category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Danh mục
              </label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#064232] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="edit-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nội dung *
              </label>
              <textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Viết nội dung bài viết của bạn..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#064232] focus:border-transparent resize-none"
                maxLength={5000}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {content.length}/5000 ký tự
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-4 py-2 bg-[#064232] text-white rounded-lg hover:bg-[#0a5a47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Cập nhật
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;

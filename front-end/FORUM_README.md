# Forum Component - Hướng dẫn sử dụng

## Tổng quan

Forum component đã được sửa chữa và cải thiện để khắc phục các vấn đề về hiển thị comment và bài viết. Các chức năng chính bao gồm:

## Các chức năng đã được sửa

### 1. Hiển thị Comment

- ✅ Sửa lỗi không xem được comment
- ✅ Comment được hiển thị đúng cách với avatar, tên người dùng, thời gian
- ✅ Hiển thị số lượng comment chính xác

### 2. Hiển thị Bài viết của tôi

- ✅ Sửa lỗi không xem được bài viết của người dùng hiện tại
- ✅ Nút "Bài viết của tôi" hoạt động chính xác
- ✅ Filter bài viết theo người dùng

### 3. Chức năng Comment

- ✅ Bỏ chức năng trả lời comment (reply)
- ✅ Thêm chức năng chỉnh sửa comment
- ✅ Thêm chức năng xóa comment
- ✅ Chỉ chủ sở hữu comment mới có thể edit/delete

### 4. Chức năng Bài viết

- ✅ Thêm chức năng chỉnh sửa bài viết
- ✅ Thêm chức năng xóa bài viết
- ✅ Chỉ chủ sở hữu bài viết mới có thể edit/delete
- ✅ Cải thiện giao diện edit với tags

## Cấu trúc Files

```
src/components/forum/
├── Forum.jsx           # Component chính của forum
├── PostCard.jsx        # Hiển thị từng bài viết
├── CommentSection.jsx  # Hiển thị và quản lý comment
├── CreatePost.jsx      # Tạo bài viết mới
└── Forum.css          # Styling cho forum
```

## Cách sử dụng

### 1. Xem tất cả bài viết

- Mặc định forum sẽ hiển thị tất cả bài viết
- Sắp xếp theo thời gian mới nhất

### 2. Xem bài viết của tôi

- Click vào nút "Bài viết của tôi" để filter
- Chỉ hiển thị bài viết của người dùng đang đăng nhập

### 3. Tìm kiếm bài viết

- Sử dụng ô tìm kiếm để tìm theo nội dung, tên tác giả, hoặc tags

### 4. Tạo bài viết mới

- Click vào "Bạn muốn chia sẻ điều gì?" để mở modal tạo bài viết
- Có thể thêm nội dung, hình ảnh, và tags

### 5. Chỉnh sửa bài viết

- Click vào 3 chấm (⋮) trên bài viết của bạn
- Chọn "Chỉnh sửa"
- Sửa nội dung và tags
- Click "Lưu thay đổi" hoặc "Hủy bỏ"

### 6. Xóa bài viết

- Click vào 3 chấm (⋮) trên bài viết của bạn
- Chọn "Xóa bài đăng"
- Xác nhận xóa

### 7. Thêm comment

- Click "Bình luận" để mở phần comment
- Viết comment và click nút gửi

### 8. Chỉnh sửa comment

- Click vào icon edit (✏️) trên comment của bạn
- Sửa nội dung và click "Lưu"

### 9. Xóa comment

- Click vào icon delete (🗑️) trên comment của bạn
- Xác nhận xóa

## Cải thiện kỹ thuật

### 1. State Management

- Cải thiện việc quản lý state cho posts và filteredPosts
- Tách biệt logic filter và fetch data

### 2. Error Handling

- Xử lý lỗi tốt hơn khi fetch data
- Hiển thị thông báo lỗi rõ ràng

### 3. Performance

- Tối ưu việc re-render component
- Cải thiện việc update state

### 4. UI/UX

- Thêm loading states
- Cải thiện responsive design
- Thêm animations và transitions

## Troubleshooting

### Vấn đề thường gặp

1. **Comment không hiển thị sau khi reload**

   - Kiểm tra console log để xem lỗi
   - Đảm bảo Firebase connection hoạt động
   - Kiểm tra quyền truy cập database
   - Kiểm tra xem comment có được lưu đúng vào collection `forum_comments` không
   - Đảm bảo `postId` trong comment khớp với ID của bài viết

2. **Nút 3 chấm (⋮) không hiển thị cho bài viết của mình**

   - Kiểm tra console log để xem debug info về ownership check
   - Đảm bảo `post.author.id` khớp với `currentUser.uid`
   - Kiểm tra xem user đã đăng nhập chưa
   - Kiểm tra `userDetails` trong AuthContext có đúng không

3. **Bài viết của tôi không hiển thị**

   - Đảm bảo user đã đăng nhập
   - Kiểm tra `userDetails.uid` có giá trị
   - Kiểm tra logic filter trong useEffect
   - Kiểm tra xem `forumService.getPostsByUser()` có hoạt động không

4. **Không thể edit/delete**
   - Đảm bảo bạn là chủ sở hữu bài viết/comment
   - Kiểm tra quyền truy cập Firebase
   - Kiểm tra console log để xem lỗi

### Debug Steps

1. **Kiểm tra comment không hiển thị:**

   ```javascript
   // Mở Developer Tools > Console
   // Tìm các log sau:
   "Fetching comments for post: [postId]";
   "Fetched comments: [comments]";
   "CommentSection state: {...}";
   ```

2. **Kiểm tra nút 3 chấm không hiển thị:**

   ```javascript
   // Mở Developer Tools > Console
   // Tìm các log sau:
   "PostCard ownership check: {...}";
   // Kiểm tra:
   // - postAuthorId có khớp với currentUserId không
   // - isPostOwner có đúng không
   ```

3. **Kiểm tra Firebase data:**
   - Mở Firebase Console
   - Kiểm tra collection `forum_comments`
   - Đảm bảo comment có `postId` đúng
   - Đảm bảo comment có `author.id` đúng

### Common Issues & Solutions

1. **Comment author.id missing:**

   - Đảm bảo `currentUser.uid` được truyền đúng
   - Kiểm tra AuthContext có hoạt động không

2. **Post author.id mismatch:**

   - Đảm bảo khi tạo bài viết, `author.id` được set đúng
   - Kiểm tra `forumService.createPost()` có set `author.id` không

3. **Comment count not updating:**

   - Kiểm tra `forumService.incrementCommentCount()` có hoạt động không
   - Kiểm tra local state update có đúng không

4. **Permission denied:**
   - Kiểm tra Firebase Security Rules
   - Đảm bảo user có quyền đọc/ghi vào collections cần thiết

## Dependencies

- React 18+
- Firebase 9+
- Lucide React (icons)
- Tailwind CSS

## Notes

- Forum sử dụng Firebase Firestore để lưu trữ dữ liệu
- Cần cấu hình Firebase đúng cách
- Authentication context phải được setup
- Cần có quyền đọc/ghi vào collections: `forum_posts`, `forum_comments`

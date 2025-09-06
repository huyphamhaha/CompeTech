import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import "./blog.css";
import { Link } from "react-router-dom";

const BlogView = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState({});
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const blogData = docSnapshot.data();
          setBlog(blogData);
          setLikes(blogData.likes || 0);
          setComments(blogData.comments || []);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching blog: ", error);
      }
    };

    const fetchUserData = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          setUser(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    const checkIfLiked = async (uid) => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
          const blogData = docSnapshot.data();
          if (blogData.likedBy?.includes(uid)) {
            setIsLiked(true);
          } else {
            setIsLiked(false);
          }
        }
      } catch (error) {
        console.error("Error checking if liked: ", error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser.uid);
        checkIfLiked(currentUser.uid);
      }
    });

    getBlog();

    return () => unsubscribe();
  }, [id]);

  const handleDeleteComment = async (commentId) => {
    try {
      const commentToDelete = comments[commentId];
      if (!commentToDelete) {
        console.error("Comment not found");
        return;
      }
      if (commentToDelete.userId !== auth.currentUser.uid) {
        console.error("You are not authorized to delete this comment");
        return;
      }
      const docRef = doc(db, "blogs", id);
      const updatedComments = comments.filter(
        (_, index) => index !== commentId
      );
      await updateDoc(docRef, {
        comments: updatedComments,
      });
      setComments(updatedComments);
    } catch (error) {
      console.error("Error deleting comment: ", error);
    }
  };

  const handleDeleteCommentReply = async (commentIndex, replyIndex) => {
    try {
      const comment = comments[commentIndex];
      if (!comment || !comment.replies || !comment.replies[replyIndex]) {
        console.error("Reply not found");
        return;
      }
      const replyToDelete = comment.replies[replyIndex];
      if (replyToDelete.userId !== auth.currentUser.uid) {
        console.error("You are not authorized to delete this reply");
        return;
      }
      const docRef = doc(db, "blogs", id);
      const updatedComments = [...comments];
      updatedComments[commentIndex].replies = comment.replies.filter(
        (_, index) => index !== replyIndex
      );
      await updateDoc(docRef, {
        comments: updatedComments,
      });
      setComments(updatedComments);
    } catch (error) {
      console.error("Error deleting reply: ", error);
    }
  };

  const handleEditComment = (index) => {
    setEditingIndex(index);
    setEditedContent(comments[index].content);
  };

  const handleUpdateComment = async (e, commentId) => {
    e.preventDefault();
    if (!editedContent.trim()) return;

    try {
      const updatedComments = [...comments];
      updatedComments[commentId].content = editedContent;
      const docRef = doc(db, "blogs", id);
      await updateDoc(docRef, {
        comments: updatedComments,
      });
      setComments(updatedComments);
      setEditingIndex(null);
      setEditedContent("");
    } catch (error) {
      console.error("Error updating comment: ", error);
    }
  };

  const toggleReplies = (commentIndex) => {
    setShowReplies((prev) => ({
      ...prev,
      [commentIndex]: !prev[commentIndex],
    }));
  };

  const handleReplySubmit = async (e, commentIndex) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    const reply = {
      userId: auth.currentUser.uid,
      userName: user.firstName || "Anonymous",
      userPhoto: user.photo || "https://primex-bd.com/logo192.png",
      content: replyContent,
      timestamp: new Date(),
    };

    try {
      const docRef = doc(db, "blogs", id);
      const updatedComments = [...comments];
      if (!updatedComments[commentIndex].replies) {
        updatedComments[commentIndex].replies = [];
      }
      updatedComments[commentIndex].replies.push(reply);
      await updateDoc(docRef, {
        comments: updatedComments,
      });
      setComments(updatedComments);
      setReplyContent("");
      setReplyToCommentId(null);
    } catch (error) {
      console.error("Error adding reply: ", error);
    }
  };

  const handleLike = async () => {
    try {
      const docRef = doc(db, "blogs", id);
      if (isLiked) {
        await updateDoc(docRef, {
          likes: likes - 1,
          likedBy: arrayRemove(auth.currentUser.uid),
        });
        setLikes(likes - 1);
      } else {
        await updateDoc(docRef, {
          likes: likes + 1,
          likedBy: arrayUnion(auth.currentUser.uid),
        });
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating likes: ", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const comment = {
      userId: auth.currentUser.uid,
      userName: user.firstName || "Anonymous",
      userPhoto: user.photo || "https://primex-bd.com/logo192.png",
      content: newComment,
      timestamp: new Date(),
    };

    try {
      const docRef = doc(db, "blogs", id);
      await updateDoc(docRef, {
        comments: arrayUnion(comment),
      });
      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  };

  const { Sapo, Body, CoverURL, Title, author, published_on } = blog;

  return (
    <>
      <Link to="#" onClick={() => navigate(-1)} className="go-back">
        <svg
          aria-hidden="true"
          focusable="false"
          data-prefix="fas"
          data-icon="chevron-left"
          className="svg-back svg-inline--fa fa-chevron-left "
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 320 512"
        >
          <path
            fill="currentColor"
            d="M224 480c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25l192-192c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l169.4 169.4c12.5 12.5 12.5 32.75 0 45.25C240.4 476.9 232.2 480 224 480z"
          ></path>
        </svg>
        Quay lại
      </Link>

      <div>
        <div className="blog-detail-container">
          <div className="blog-detail-wrapped">
            {author && (
              <div className="author-container-blog-detail">
                <span className="small-author-container-blog-detail">
                  <img
                    src={author.avatar || "https://primex-bd.com/logo192.png"}
                    alt="Author"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #000",
                    }}
                  />
                  <p className="author-name">{author.name}</p>
                </span>
                <p className="time-post-blog">
                  {new Date(published_on.seconds * 1000).toLocaleDateString()}
                </p>
              </div>
            )}
            <h1 style={{ fontSize: "3rem" }} className="blog-detail-title">
              <span>{Title}</span>
            </h1>
            <div>
              {CoverURL && (
                <img src={CoverURL} alt="" className="preview-blog-img" />
              )}
            </div>
            <div>
              <div
                className="blog-detail-info"
                dangerouslySetInnerHTML={{ __html: Sapo }}
                style={{
                  fontSize: "22px",
                  fontStyle: "italic",
                  lineHeight: "1.5",
                  color: "#292929",
                  marginBottom: "40px",
                }}
              />
            </div>
            <div>
              <div
                className="blog-detail-info"
                dangerouslySetInnerHTML={{ __html: Body }}
                style={{ fontSize: "20px" }}
              />
            </div>

            <div>
              <div
                className={`like-container ${isLiked ? "liked" : ""}`}
                onClick={handleLike}
              >
                <input
                  type="checkbox"
                  id="checkbox"
                  checked={isLiked}
                  readOnly
                />
                <label htmlFor="checkbox">
                  <svg
                    className="svg-heart"
                    id="heart-svg"
                    viewBox="467 392 58 57"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      id="Group"
                      fill="none"
                      fillRule="evenodd"
                      transform="translate(467 392)"
                    >
                      <path
                        d="M29.144 20.773c-.063-.13-4.227-8.67-11.44-2.59C7.63 28.795 28.94 43.256 29.143 43.394c.204-.138 21.513-14.6 11.44-25.213-7.214-6.08-11.377 2.46-11.44 2.59z"
                        id="heart"
                        fill="#AAB8C2"
                      />
                      <circle
                        id="main-circ"
                        fill="#E2264D"
                        opacity="0"
                        cx="29.5"
                        cy="29.5"
                        r="1.5"
                      />

                      <g id="grp7" opacity="0" transform="translate(7 6)">
                        <circle id="oval1" fill="#9CD8C3" cx="2" cy="6" r="2" />
                        <circle id="oval2" fill="#8CE8C3" cx="5" cy="2" r="2" />
                      </g>

                      <g id="grp6" opacity="0" transform="translate(0 28)">
                        <circle id="oval1" fill="#CC8EF5" cx="2" cy="7" r="2" />
                        <circle id="oval2" fill="#91D2FA" cx="3" cy="2" r="2" />
                      </g>

                      <g id="grp3" opacity="0" transform="translate(52 28)">
                        <circle id="oval2" fill="#9CD8C3" cx="2" cy="7" r="2" />
                        <circle id="oval1" fill="#8CE8C3" cx="4" cy="2" r="2" />
                      </g>

                      <g id="grp2" opacity="0" transform="translate(44 6)">
                        <circle id="oval2" fill="#CC8EF5" cx="5" cy="6" r="2" />
                        <circle id="oval1" fill="#CC8EF5" cx="2" cy="2" r="2" />
                      </g>

                      <g id="grp5" opacity="0" transform="translate(14 50)">
                        <circle id="oval1" fill="#91D2FA" cx="6" cy="5" r="2" />
                        <circle id="oval2" fill="#91D2FA" cx="2" cy="2" r="2" />
                      </g>

                      <g id="grp4" opacity="0" transform="translate(35 50)">
                        <circle id="oval1" fill="#F48EA7" cx="6" cy="5" r="2" />
                        <circle id="oval2" fill="#F48EA7" cx="2" cy="2" r="2" />
                      </g>

                      <g id="grp1" opacity="0" transform="translate(24)">
                        <circle
                          id="oval1"
                          fill="#9FC7FA"
                          cx="2.5"
                          cy="3"
                          r="2"
                        />
                        <circle
                          id="oval2"
                          fill="#9FC7FA"
                          cx="7.5"
                          cy="2"
                          r="2"
                        />
                      </g>
                    </g>
                  </svg>
                </label>
                {likes}
              </div>

              {auth.currentUser ? (
                <form onSubmit={handleCommentSubmit}>
                  <div className="post-comment-container">
                    <img
                      src={user?.photo || "/default-avatar.png"}
                      alt=""
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #000",
                      }}
                    ></img>
                    <label></label>
                    <textarea
                      className="comment-input"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Viết bình luận của bạn"
                    />
                  </div>
                  <div className="comment-post-wrapped">
                    <button className="comment-post-button" type="submit">
                      Submit
                    </button>
                  </div>
                </form>
              ) : (
                <p>Đăng nhập để có thể bình luận và like bài viết</p>
              )}

              <h3 className="comment-title">Bình luận</h3>

              <ul>
                {comments.map((comment, index) => (
                  <div className="comment-wrapped" key={index}>
                    <li className="comment-item">
                      <img
                        src={comment.userPhoto}
                        alt={comment.userName}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid #000",
                        }}
                      />
                      <div className="comment-container">
                        <h3 style={{ fontWeight: "700", fontSize: "18px" }}>
                          {comment.userName}
                        </h3>
                        {editingIndex === index ? (
                          <form
                            className="form-edit-comment"
                            onSubmit={(e) => handleUpdateComment(e, index)}
                          >
                            <textarea
                              className="comment-input"
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              placeholder="Nội dung chỉnh sửa"
                              style={{ fontSize: "18px", margin: "16px 0 0" }}
                            />
                            <button
                              type="submit"
                              className="comment-post-button"
                              style={{ fontSize: "14px", marginBottom: "12px" }}
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              type="button"
                              className="comment-post-button"
                              style={{
                                fontSize: "14px",
                                marginRight: "8px",
                                backgroundColor: "#f44336",
                                marginBottom: "12px",
                              }}
                              onClick={() => setEditingIndex(null)}
                            >
                              Hủy
                            </button>
                          </form>
                        ) : (
                          <p style={{ margin: "6px 0", fontSize: "18px" }}>
                            {comment.content}
                          </p>
                        )}
                        <div>
                          {auth.currentUser &&
                            comment.userId === auth.currentUser.uid &&
                            editingIndex !== index && (
                              <>
                                <button
                                  style={{ fontSize: "14px" }}
                                  className="delete-comment-button"
                                  onClick={() => handleDeleteComment(index)}
                                >
                                  Xóa
                                </button>
                                <button
                                  style={{ fontSize: "14px" }}
                                  className="edit-comment-button"
                                  onClick={() => handleEditComment(index)}
                                >
                                  Sửa
                                </button>
                              </>
                            )}
                          <button
                            style={{ fontSize: "14px", float: "right" }}
                            className="reply-comment-button edit-comment-button"
                            onClick={() =>
                              setReplyToCommentId(
                                replyToCommentId === index ? null : index
                              )
                            }
                          >
                            {auth.currentUser ? "trả lời" : ""}
                          </button>
                        </div>
                      </div>
                    </li>
                    {replyToCommentId === index && (
                      <>
                        <form
                          onSubmit={(e) => handleReplySubmit(e, index)}
                          style={{ marginTop: "12px" }}
                        >
                          <div className="post-comment-container">
                            <img
                              src={user?.photo || "/default-avatar.png"}
                              alt=""
                              style={{
                                width: "40px !important",
                                height: "40px !important",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid #000",
                              }}
                            ></img>
                            <label></label>
                            <textarea
                              className="comment-input"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="Viết phản hồi của bạn"
                            />
                          </div>
                          <div style={{ display: "flow-root" }}>
                            <button
                              className="comment-post-button"
                              type="submit"
                              style={{
                                fontSize: "14px",
                                marginRight: "8px",
                                marginBottom: "12px",
                              }}
                            >
                              Trả lời
                            </button>

                            <button
                              type="button"
                              className="comment-post-button"
                              style={{
                                fontSize: "14px",
                                marginRight: "8px",
                                backgroundColor: "#f44336",
                                marginBottom: "12px",
                              }}
                              onClick={() =>
                                setReplyToCommentId(
                                  replyToCommentId === index ? null : index
                                )
                              }
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                    {comment.replies && comment.replies.length > 0 && (
                      <div
                        className="comment-wrapped"
                        style={{ marginTop: "6px", marginBottom: "32px" }}
                      >
                        <button
                          onClick={() => toggleReplies(index)}
                          className="show-hide-reply"
                          style={{
                            display: auth.currentUser ? "block" : "none",
                          }}
                        >
                          {showReplies[index] ? "Ẩn phản hồi" : "Hiện phản hồi"}
                        </button>
                        {showReplies[index] &&
                          comment.replies.map((reply, replyIndex) => (
                            <div
                              key={replyIndex}
                              className="comment-item"
                              style={{ marginTop: "12px", marginLeft: "60px" }}
                            >
                              <img
                                src={reply.userPhoto}
                                alt={reply.userName}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid #000",
                                }}
                              />
                              <div className="comment-container">
                                <h3 style={{ fontSize: "18px" }}>
                                  {reply.userName}
                                </h3>
                                <p
                                  style={{ fontSize: "18px", margin: "6px 0" }}
                                >
                                  {reply.content}
                                </p>

                                <div style={{ display: "flex" }}>
                                  {reply.userId === auth.currentUser.uid && (
                                    <button
                                      style={{
                                        fontSize: "14px",
                                        marginRight: "6px",
                                      }}
                                      className="delete-comment-button"
                                      onClick={() =>
                                        handleDeleteCommentReply(
                                          index,
                                          replyIndex
                                        )
                                      }
                                    >
                                      Xóa
                                    </button>
                                  )}

                                  <button
                                    style={{
                                      fontSize: "14px",
                                      display: "inline-block",
                                      marginLeft: "0",
                                    }}
                                    className="reply-comment-button edit-comment-button"
                                    onClick={() =>
                                      setReplyToCommentId(
                                        replyToCommentId === index
                                          ? null
                                          : index
                                      )
                                    }
                                  >
                                    Trả lời
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogView;

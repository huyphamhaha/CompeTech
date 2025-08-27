import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const MyPosts = () => {
  const navigate = useNavigate();
  const [userBlogs, setUserBlogs] = useState([]);
  const [user, setUser] = useState(null);

  const fetchUserBlogs = async (user) => {
    try {
      const blogsQuery = query(
        collection(db, "blogs"),
        where("author.id", "==", user.uid)
      );
      const querySnapshot = await getDocs(blogsQuery);
      const blogsData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setUserBlogs(blogsData);
    } catch (error) {
      console.error("Error fetching user blogs: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchUserBlogs(user);
      } else {
        console.log("User is not logged in");
        navigate("/blog");
      }
    });
    return () => unsubscribe();
  }, []);

  const DeleteBlog = async (id) => {
    try {
      await deleteDoc(doc(db, "blogs", id));
      setUserBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  };

  return (
    <div className="blogs-container-section">
      <Link to="/blog" className="go-back">
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
      <h1 className="blogs-display-title">Bài viết của bạn 🦜</h1>
      <div className="blogs-grid">
        {userBlogs.map((blog) => (
          <Link to={"/blog/" + blog.id} key={blog.id} className="blog-item">
            {blog.CoverURL && (
              <img
                src={
                  blog.CoverURL ||
                  "https://assets.rebelmouse.io/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZSI6Imh0dHBzOi8vYXNzZXRzLnJibC5tcy8xMDg5NTI2MC9vcmlnaW4uanBnIiwiZXhwaXJlc19hdCI6MTY0Mzk3NDA2OX0.EKbcCpG-hu1nkgORwEystT7CDJ8itiSwWA7eGKoQReE/img.jpg?width=980"
                }
                alt=""
                className="blog-cover"
              />
            )}
            <p className="blogs-title">{blog.Title}</p>
            <div
              className="blogs-sapo"
              dangerouslySetInnerHTML={{ __html: blog.Sapo }}
            />

            <div className="blog-footer">
              <div className="author-info">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={blog.author.avatar || "/default-avatar.png"}
                    alt="Author"
                    className="author-photo"
                  />
                  <p>{blog.author.name}</p>
                </div>
                <p>
                  {new Date(
                    blog.published_on.seconds * 1000
                  ).toLocaleDateString()}
                </p>
              </div>
              <div className="blog-actions">
                <Link to={"/blog/edit/" + blog.id} className="edit-link">
                  Chỉnh sửa
                </Link>
                <Link
                  to={"/mypost"}
                  onClick={() => DeleteBlog(blog.id)}
                  className="delete-button"
                >
                  Xóa
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MyPosts;

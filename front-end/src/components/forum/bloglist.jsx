import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  limit,
  setDoc,
} from "firebase/firestore";
import { FaPen, FaEraser } from "react-icons/fa";
import "./blog.css"; // Import the CSS file
import Header from "../Header/header";

const BlogsCollection = collection(db, "blogs");

const Bloglist = () => {
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const searchBlogs = (e) => {
    e.preventDefault();
    const results = blogs.filter((blog) =>
      blog.Title.toLowerCase().includes(search.toLowerCase())
    );
    setSearchResults(results);
  };

  //Lấy dữ liệu user
  const fetchUserData = async (user) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUserDetails(docSnap.data());
    } else {
      // Tạo tài liệu người dùng mới nếu không tồn tại
      const newUserDetails = {
        firstName: user.displayName,
        email: user.email,
        photo: user.photoURL,
      };
      await setDoc(docRef, newUserDetails);
      setUserDetails(newUserDetails);
    }
  };

  //Xem user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        console.log("User is not logged in");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(BlogsCollection, limit(100));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setBlogs(data);
        setSearchResults(data); // Initialize search results with all blogs
      } catch (error) {
        console.error("Error fetching blogs: ", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Header backgroundColor={"white"}></Header>
      <div className="blog-section-body" style={{ backgroundColor: "white" }}>
        <div className="menu-container-blog">
          <div className="menu-item">
            {userDetails && (
              <div className="blog-profile special-profile">
                <img
                  src={userDetails.photo || "/default-avatar.png"}
                  alt="User Avatar"
                  className="user-avatar"
                />
                <span className="displayName">{userDetails.firstName}</span>
              </div>
            )}

            {!userDetails && (
              <h2 style={{ color: "#292929" }} className="">
                Chưa Đăng nhập
              </h2>
            )}
          </div>

          <div className="add-delete-container">
            <Link to="/blogcreate" className="menu-item add-post">
              Viết blog
            </Link>

            <Link to="/mypost" className="menu-item edit-delete-post">
              Blog của tôi
            </Link>
          </div>
        </div>
        <div className="blogs-container-section">
          <form className="search-wrapper" onSubmit={searchBlogs}>
            <div className="search-bar">
              <input
                id="searchQueryInput"
                type="text"
                name="searchQueryInput"
                placeholder="Tìm kiếm các bài viết"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                id="searchQuerySubmit"
                type="submit"
                name="searchQuerySubmit"
              >
                <svg
                  style={{ width: "24px", height: "24px" }}
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#666666"
                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                  />
                </svg>
              </button>
            </div>
          </form>

          <h1 className="blogs-display-title">Bài viết nổi bật ✨</h1>

          <div className="blogs-grid">
            {searchResults.map((blog) => (
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
                  {blog.author && (
                    <>
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
                          <p className="author-blog-name">{blog.author.name}</p>
                        </div>
                        <p>
                          {new Date(
                            blog.published_on.seconds * 1000
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}

                  {/* <Link
                                        to={"/blog/" + blog.id}
                                        className="view-link"
                                    >
                                        View
                                    </Link> */}
                </div>

                {/* {user && user.uid === blog.author.uid && (
                                    <div className="blog-actions">
                                        <Link
                                            to={"/blog/edit/" + blog.id}
                                            className="edit-link"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => DeleteBlog(blog.id)}
                                            className="delete-button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )} */}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Bloglist;

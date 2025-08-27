import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Timestamp, updateDoc, doc, getDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { collection } from "firebase/firestore";
import { Editor } from "@tinymce/tinymce-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from "react-router-dom";

const BlogsCollection = collection(db, "blogs");

const BlogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [sapo, setSapo] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState(null);
  const [coverUrl, setCoverUrl] = useState("");

  const handleEditorImageUpload = async (blobInfo, progress) => {
    return new Promise((resolve, reject) => {
      const file = blobInfo.blob();
      const storageRef = ref(storage, `editorImages/${file.name}`);
      uploadBytes(storageRef, file)
        .then(async (snapshot) => {
          const downloadURL = await getDownloadURL(storageRef);
          resolve(downloadURL);
        })
        .catch((error) => {
          console.error("Error uploading image: ", error);
          reject("Image upload failed");
        });
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(BlogsCollection, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTitle(data.Title);
          setSapo(data.Sapo);
          setBody(data.Body);
          setCoverUrl(data.CoverURL);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    fetchData();
  }, [id]);

  const handleCoverChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setCover(file);
      const imageUrl = URL.createObjectURL(file);
      setCoverUrl(imageUrl);
    }
  };

  const uploadImage = async (image) => {
    if (!image) return null;
    const storageRef = ref(storage, `covers/${image.name}`);
    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const docRef = doc(BlogsCollection, id);

    try {
      let updatedCoverUrl = coverUrl;

      if (cover) {
        updatedCoverUrl = await uploadImage(cover);
      }

      await updateDoc(docRef, {
        Title: title,
        CoverURL: updatedCoverUrl,
        Sapo: sapo,
        Body: body,
        last_Updated: Timestamp.fromDate(new Date()),
      });
      navigate("/mypost");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  return (
    <div className="create-blog-container">
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
      <form onSubmit={handleSubmit} className="create-blog-form">
        <input
          className="blog-title-input"
          type="text"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="blog-sapo-input"
          type="text"
          placeholder="Giới thiệu bài viết"
          value={sapo}
          onChange={(e) => setSapo(e.target.value)}
          required
        />

        <Editor
          value={body}
          apiKey="dckhg5kisflqurkxis6l4tylqavvaimo0n5wsnczh1jq0mrf"
          textareaName="Body"
          init={{
            height: 600,
            menubar: false,
            plugins:
              "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate mentions tableofcontents footnotes mergetags autocorrect typography inlinecss markdown",
            toolbar:
              "undo redo | formatselect | blocks fontsize | " +
              "bold italic backcolor | bullist numlist | " +
              "removeformat | image ",
            content_style:
              'body { font-family:system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" } p, li { font-size:18px !important }  img{ max-width: 100% !important; height: auto !important; object-fit: contain}',
            images_upload_handler: handleEditorImageUpload,
          }}
          onEditorChange={(content) => setBody(content)}
        />

        <div className="preview-blogImg-container">
          <label htmlFor="images" className="drop-container" id="dropcontainer">
            <span className="drop-title">Drop files here</span>
            <input
              type="file"
              name="coverImg"
              accept="image/*"
              onChange={handleCoverChange}
            />
          </label>

          <img
            src={
              coverUrl ||
              "https://assets.rebelmouse.io/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZSI6Imh0dHBzOi8vYXNzZXRzLnJibC5tcy8xMDg5NTI2MC9vcmlnaW4uanBnIiwiZXhwaXJlc19hdCI6MTY0Mzk3NDA2OX0.EKbcCpG-hu1nkgORwEystT7CDJ8itiSwWA7eGKoQReE/img.jpg?width=980"
            }
            alt="Preview"
          />

          <button
            type="submit"
            style={{ display: "block" }}
            className="sign-button create-blog-button"
          >
            Chỉnh sửa bài viết
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogEdit;

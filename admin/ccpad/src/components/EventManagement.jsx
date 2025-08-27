import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "Sự kiện",
    maxParticipants: 50,
    status: "active",
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const auth = getAuth();
  const db = getFirestore();

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, "events"));
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setEvents(data);
    } catch (e) {
      console.error(e);
      setError("Không thể tải danh sách sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      let isoDate = "";
      if (form.date && form.time) {
        const candidate = new Date(`${form.date}T${form.time}:00`);
        if (!isNaN(candidate.getTime())) isoDate = candidate.toISOString();
      }
      let imageUrl = form.image;
      if (imageFile) {
        const fileRef = ref(
          storage,
          `events/${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`
        );
        const snap = await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }

      await addDoc(collection(db, "events"), {
        ...form,
        image: imageUrl || "",
        date: form.date || "",
        time: form.time || "",
        isoDate,
        createdBy: auth.currentUser?.uid || "admin",
        createdAt: new Date().toISOString(),
        registrations: [],
      });
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "Sự kiện",
        maxParticipants: 50,
        status: "active",
        image: "",
      });
      setImageFile(null);
      await fetchEvents();
    } catch (e) {
      console.error(e);
      setError("Tạo sự kiện thất bại");
    }
  };

  const toggleStatus = async (id, status) => {
    try {
      const ref = doc(db, "events", id);
      await updateDoc(ref, { status });
      await fetchEvents();
    } catch (e) {
      console.error(e);
      setError("Cập nhật trạng thái thất bại");
    }
  };

  const startEdit = (ev) => {
    setEditingId(ev.id);
    setEditForm({ ...ev });
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditForm(null);
    setEditImageFile(null);
    setIsEditOpen(false);
  };

  const saveEdit = async () => {
    if (!editingId || !editForm) return;
    try {
      let imageUrl = editForm.image || "";
      if (editImageFile) {
        const fileRef = ref(
          storage,
          `events/${Date.now()}_${editImageFile.name.replace(/\s+/g, "_")}`
        );
        const snap = await uploadBytes(fileRef, editImageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }
      const refDoc = doc(db, "events", editingId);
      await updateDoc(refDoc, {
        title: editForm.title || "",
        description: editForm.description || "",
        date: editForm.date || "",
        time: editForm.time || "",
        location: editForm.location || "",
        category: editForm.category || "Sự kiện",
        maxParticipants: Number(editForm.maxParticipants) || 0,
        status: editForm.status || "active",
        image: imageUrl,
      });
      await fetchEvents();
      cancelEdit();
    } catch (e) {
      console.error(e);
      setError("Cập nhật sự kiện thất bại");
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;
    try {
      await deleteDoc(doc(db, "events", id));
      await fetchEvents();
    } catch (e) {
      console.error(e);
      setError("Xóa sự kiện thất bại");
    }
  };

  if (loading) return <div className="mt-8">Đang tải...</div>;
  return (
    <div className="max-w-6xl mx-auto p-4 mt-8">
      <h2 className="text-xl font-semibold mb-4">Tạo sự kiện</h2>
      <form
        onSubmit={createEvent}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8"
      >
        <input
          className="border p-2 rounded"
          placeholder="Tiêu đề"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          type="time"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Địa điểm"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="border p-2 rounded w-full"
          />
        </div>
        <select
          className="border p-2 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option>Workshop</option>
          <option>Cuộc thi</option>
          <option>Thiện nguyện</option>
          <option>Câu lạc bộ</option>
          <option>Sự kiện</option>
        </select>
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Số người tối đa"
          value={form.maxParticipants}
          onChange={(e) =>
            setForm({ ...form, maxParticipants: Number(e.target.value) })
          }
          required
        />
        <textarea
          className="border p-2 rounded md:col-span-2"
          placeholder="Mô tả"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="bg-blue-600 text-white p-2 rounded md:col-span-2">
          Tạo sự kiện
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-3">Danh sách sự kiện</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="border rounded-lg overflow-hidden shadow-sm bg-white"
          >
            <div className="aspect-video bg-gray-100 overflow-hidden">
              {ev.image ? (
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Không có ảnh
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between">
                <div
                  className="font-semibold truncate max-w-[70%]"
                  title={ev.title}
                >
                  {ev.title}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ml-2 ${
                    ev.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {ev.status === "active" ? "Mở" : "Đóng"}
                </span>
              </div>
              <div
                className="text-sm opacity-80 mt-1 truncate"
                title={`${ev.date} • ${ev.time} • ${ev.location}`}
              >
                {ev.date} • {ev.time} • {ev.location}
              </div>
              <div
                className="text-sm mt-2 min-h-[3.5rem]"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                title={ev.description}
              >
                {ev.description}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => setDetailEvent(ev)}
                >
                  Xem chi tiết
                </button>
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => toggleStatus(ev.id, "active")}
                >
                  Mở
                </button>
                <button
                  className="bg-gray-500 text-white px-3 py-1 rounded"
                  onClick={() => toggleStatus(ev.id, "closed")}
                >
                  Đóng
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => startEdit(ev)}
                >
                  Chỉnh sửa
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => deleteEvent(ev.id)}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {error && <div className="text-red-600 mt-3">{error}</div>}

      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDetailEvent(null)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden">
            <div className="aspect-video bg-gray-100">
              {detailEvent.image ? (
                <img
                  src={detailEvent.image}
                  alt={detailEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Không có ảnh
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="text-lg font-semibold">{detailEvent.title}</div>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setDetailEvent(null)}
                >
                  ✕
                </button>
              </div>
              <div className="text-sm opacity-80 mt-1">
                {detailEvent.date} • {detailEvent.time} • {detailEvent.location}
              </div>
              <div className="mt-3 whitespace-pre-wrap">
                {detailEvent.description || ""}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div>
                  Danh mục:{" "}
                  <span className="font-medium">{detailEvent.category}</span>
                </div>
                <div>
                  Tối đa:{" "}
                  <span className="font-medium">
                    {detailEvent.maxParticipants}
                  </span>
                </div>
                <div>
                  Trạng thái:{" "}
                  <span className="font-medium">{detailEvent.status}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button
                  className="px-3 py-1 rounded border"
                  onClick={() => setDetailEvent(null)}
                >
                  Đóng
                </button>
                <button
                  className="px-3 py-1 rounded bg-yellow-500 text-white"
                  onClick={() => {
                    setDetailEvent(null);
                    startEdit(detailEvent);
                  }}
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cancelEdit}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-4">
            <div className="text-lg font-semibold mb-3">Chỉnh sửa sự kiện</div>
            <div className="space-y-2">
              <input
                className="border p-2 rounded w-full"
                placeholder="Tiêu đề"
                value={editForm?.title || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="border p-2 rounded"
                  type="date"
                  value={editForm?.date || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                />
                <input
                  className="border p-2 rounded"
                  type="time"
                  value={editForm?.time || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, time: e.target.value })
                  }
                />
              </div>
              <input
                className="border p-2 rounded w-full"
                placeholder="Địa điểm"
                value={editForm?.location || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files?.[0] || null)}
                className="border p-2 rounded w-full"
              />
              <select
                className="border p-2 rounded w-full"
                value={editForm?.category || "Sự kiện"}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
              >
                <option>Workshop</option>
                <option>Cuộc thi</option>
                <option>Thiện nguyện</option>
                <option>Câu lạc bộ</option>
                <option>Sự kiện</option>
              </select>
              <input
                className="border p-2 rounded w-full"
                type="number"
                placeholder="Số người tối đa"
                value={editForm?.maxParticipants || 0}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    maxParticipants: Number(e.target.value),
                  })
                }
              />
              <textarea
                className="border p-2 rounded w-full"
                placeholder="Mô tả"
                value={editForm?.description || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={cancelEdit}
                  type="button"
                  className="px-3 py-1 rounded border"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEdit}
                  type="button"
                  className="px-3 py-1 rounded bg-blue-600 text-white"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;

import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const EventApprovals = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("Không thể tải sự kiện");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const updateRegistrationStatus = async (eventId, userId, status) => {
    try {
      const ref = doc(db, "events", eventId);
      const event = events.find((e) => e.id === eventId);
      if (!event) return;
      const registrations = (event.registrations || []).map((r) =>
        r.userId === userId ? { ...r, status } : r
      );
      await updateDoc(ref, { registrations });
      await fetchEvents();
    } catch (e) {
      console.error(e);
      setError("Cập nhật trạng thái thất bại");
    }
  };

  if (loading) return <div>Đang tải...</div>;
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Duyệt đăng ký sự kiện</h2>
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{event.title}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {event.date} • {event.time} • {event.location}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    event.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {event.status === "active" ? "Đang mở" : "Đã đóng"}
                </span>
              </div>
            </div>
            <div className="p-4">
              {(event.registrations || []).filter((r) => r.status === "pending")
                .length === 0 ? (
                <div className="text-sm opacity-80">Không có đơn chờ duyệt</div>
              ) : (
                <div className="divide-y">
                  {(event.registrations || [])
                    .filter((r) => r.status === "pending")
                    .map((r) => (
                      <div
                        key={r.userId}
                        className="py-3 flex items-center gap-3"
                      >
                        <img
                          src={r.photoURL || "/default-avatar.png"}
                          alt={r.displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{r.displayName}</div>
                          <div className="text-xs opacity-70">{r.email}</div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded"
                            onClick={() =>
                              updateRegistrationStatus(
                                event.id,
                                r.userId,
                                "approved"
                              )
                            }
                          >
                            Duyệt
                          </button>
                          <button
                            className="bg-red-600 text-white px-3 py-1 rounded"
                            onClick={() =>
                              updateRegistrationStatus(
                                event.id,
                                r.userId,
                                "rejected"
                              )
                            }
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <div className="text-red-600 mt-3">{error}</div>}
    </div>
  );
};

export default EventApprovals;

import React, { useState } from "react";
import { Bell, User, ChevronDown, X, Star, UploadCloud } from "lucide-react";

const bookings = [
  {
    vehicle: {
      name: "Toyota RAV4 2021",
      plate: "RAC 250G",
      img: "https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg",
    },
    bookingId: "#BK012345",
    location: "Kigali Airport",
    payment: "Paid",
    total: 720,
    pickup: "Aug 18, 2025 at 10:00 AM",
    return: "Aug 23, 2025 at 10:30 AM",
    status: "Active",
  },
  {
    vehicle: {
      name: "Honda Civic 2023",
      plate: "RAC 009G",
      img: "https://cdn.pixabay.com/photo/2016/11/29/09/32/auto-1868726_1280.jpg",
    },
    bookingId: "#BK012345",
    location: "Kigali Airport",
    payment: "Paid",
    total: 720,
    pickup: "Aug 18, 2025 at 10:00 AM",
    return: "Aug 23, 2025 at 10:30 AM",
    status: "Cancelled",
  },
];

const MIN_FEEDBACK_LENGTH = 20;

const MyBookingsFeedbackPage: React.FC = () => {
  const [tab, setTab] = useState<"booking" | "feedback">("booking");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const openFeedbackModal = (booking: typeof bookings[0]) => {
    setSelectedBooking(booking);
    setShowModal(true);
    setRating(0);
    setFeedback("");
    setPhoto(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setRating(0);
    setFeedback("");
    setPhoto(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Topbar */}
      <header className="bg-white shadow flex items-center px-8 py-3 justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo192.png" alt="AutoFleet Hub" className="w-10 h-10" />
          <span className="font-bold text-xl text-[#1746a2]">AutoFleet Hub</span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-[400px]">
            <input
              type="text"
              placeholder="Search by vehicle, location..."
              className="w-full border rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white p-2 rounded-full shadow">
            <Bell className="w-5 h-5 text-gray-500" />
          </button>
          <div className="bg-white rounded-lg px-3 py-1 flex items-center gap-2 shadow">
            EN <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <main className="flex-1 max-w-4xl mx-auto py-10">
        <div className="flex justify-center mb-6 gap-8">
          <button
            className={`pb-2 font-semibold border-b-2 ${
              tab === "booking"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setTab("booking")}
          >
            My Booking
          </button>
          <button
            className={`pb-2 font-semibold border-b-2 ${
              tab === "feedback"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setTab("feedback")}
          >
            Feedback
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {bookings.map((b, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow px-6 py-4 flex flex-col md:flex-row items-center md:items-stretch gap-4"
            >
              <img
                src={b.vehicle.img}
                alt={b.vehicle.name}
                className="w-28 h-20 object-cover rounded border"
              />
              <div className="flex-1 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{b.vehicle.name}</div>
                  <div className="text-xs text-gray-500">{b.vehicle.plate}</div>
                  <div className="text-xs mt-2">
                    <span className="font-semibold">Booking ID:</span>{" "}
                    <span className="text-blue-700">{b.bookingId}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs">
                    <span className="font-semibold">Location:</span> {b.location}
                  </div>
                  <div className="text-xs mt-2">
                    <span className="font-semibold">Pickup:</span> {b.pickup}
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Return:</span> {b.return}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="text-xs">
                    <span className="font-semibold">Payment:</span>{" "}
                    <span className="text-green-700">{b.payment}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold">Total:</span>{" "}
                    <span className="font-bold">${b.total}.00</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button className="bg-gray-100 px-4 py-2 rounded font-semibold text-gray-700 border border-gray-200 hover:bg-gray-200">
                  View Details
                </button>
                {tab === "booking" ? (
                  b.status === "Active" ? (
                    <button className="bg-gray-100 px-4 py-2 rounded font-semibold text-red-700 border border-gray-200 hover:bg-red-100">
                      Cancel Booking
                    </button>
                  ) : (
                    <button className="bg-gray-100 px-4 py-2 rounded font-semibold text-red-700 border border-gray-200 cursor-not-allowed" disabled>
                      Cancelled
                    </button>
                  )
                ) : (
                  <button
                    className="bg-blue-700 px-4 py-2 rounded font-semibold text-white hover:bg-blue-900"
                    onClick={() => openFeedbackModal(b)}
                  >
                    Feedback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Feedback Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="font-bold text-lg mb-2">Leave Feedback</div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={selectedBooking.vehicle.img}
                alt={selectedBooking.vehicle.name}
                className="w-14 h-10 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{selectedBooking.vehicle.name}</div>
                <div className="text-xs text-gray-500">{selectedBooking.vehicle.plate}</div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Rate Your Experience</label>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                        fill={rating >= star ? "#facc15" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs text-gray-400">Select a rating</div>
              </div>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Your Feedback</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Share your experience about vehicle and service ..."
                  minLength={MIN_FEEDBACK_LENGTH}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Minimum 20 characters required</span>
                  <span>{feedback.length} characters</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block font-semibold mb-1">Add Photos (Optional)</label>
                <label className="w-full border-2 border-dashed rounded flex flex-col items-center justify-center py-6 cursor-pointer text-gray-400 hover:border-blue-400">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <span>Click to Upload Vehicle photos</span>
                  <span className="text-xs mt-1">PNG, JPG or JPEG (MAX, 5MB)</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {photo && (
                    <span className="mt-2 text-xs text-green-700">{photo.name}</span>
                  )}
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-semibold hover:bg-gray-300"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-900"
                  disabled={rating === 0 || feedback.length < MIN_FEEDBACK_LENGTH}
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookingsFeedbackPage;
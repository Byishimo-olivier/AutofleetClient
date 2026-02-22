import { useState, useEffect } from "react";
import { X, Star, Upload } from "lucide-react";
import { apiClient, API_BASE_URL, STATIC_BASE_URL } from "@/services/apiClient";


// Types for backend data structure
interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  type: string;
  color: string;
  images: string[] | string;
  owner_id: string;
  location_address: string;
}

interface Booking {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_date: string;
  end_date: string;
  pickup_location: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  // Joined vehicle data
  make: string;
  model: string;
  year: number;
  license_plate: string;
  type: string;
  color: string;
  images: string[] | string;
  location_address: string;
  // Joined customer data
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  // Joined owner data
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone: string;
}

interface Feedback {
  id: string;
  booking_id: string;
  customer_id: string;
  vehicle_id: string;
  rating: number;
  comment: string;
  service_rating: number;
  vehicle_condition_rating: number;
  created_at: string;
  // Joined data
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  type: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  images?: string[] | string; // Added images property
}

const MIN_FEEDBACK_LENGTH = 20;

const MyBookingsFeedbackPage: React.FC = () => {
  const [tab, setTab] = useState<"booking" | "feedback">("booking");
  const [showModal, setShowModal] = useState(false);
  const [showCreateFeedbackModal, setShowCreateFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [vehicleConditionRating, setVehicleConditionRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  // State for real data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user ID from token or localStorage
  useEffect(() => {
    const getUserId = () => {
      try {
        // Use 'autofleet_token' key
        const token = localStorage.getItem('autofleet_token');

        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const extractedUserId = payload.id || payload.userId;
          setUserId(extractedUserId);
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    getUserId();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    if (tab === "booking") {
      fetchBookings();
    } else {
      fetchUserFeedbacks();
    }
  }, [tab, userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ bookings: Booking[] }>('/bookings');

      if (response && response.success && response.data && Array.isArray(response.data?.bookings)) {
        const bookingsData = response.data.bookings;
        setBookings(bookingsData);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFeedbacks = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/feedback/customer/${userId}`);

      if (response && response.success) {
        const feedbackData = response.data;

        if (Array.isArray(feedbackData)) {
          setFeedbacks(feedbackData);
        } else {
          setFeedbacks([]);
        }
      } else {
        setError('Failed to fetch feedbacks');
      }
    } catch (err: any) {
      console.error('Error fetching feedbacks:', err);

      if (err.response?.status === 403) {
        setError('Access denied to view feedbacks');
      } else if (err.response?.status === 404) {
        setFeedbacks([]);
      } else {
        setError(`Failed to fetch feedbacks: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingById = async (bookingId: string): Promise<Booking | null> => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);

      if (response && response.success && response.data) {
        const booking = response.data as Booking;

        return booking;
      }
      return null;
    } catch (err) {
      console.error('Error fetching booking details:', err);
      return null;
    }
  };

  const openFeedbackModal = async (booking: Booking) => {
    // Check if feedback already exists for this booking
    const existingFeedback = feedbacks.find(f => f.booking_id === booking.id);
    if (existingFeedback) {
      alert('You have already submitted feedback for this booking');
      return;
    }

    // Fetch detailed booking info if needed
    const detailedBooking = await fetchBookingById(booking.id);
    setSelectedBooking(detailedBooking || booking);
    setShowModal(true);
    setRating(0);
    setServiceRating(0);
    setVehicleConditionRating(0);
    setComment("");
    setPhoto(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
    setRating(0);
    setServiceRating(0);
    setVehicleConditionRating(0);
    setComment("");
    setPhoto(null);
  };

  const openCreateFeedbackModal = async () => {
    setRating(0);
    setServiceRating(0);
    setVehicleConditionRating(0);
    setComment("");
    setPhoto(null);
    setSelectedBooking(null);

    // Fetch bookings first, then show modal
    if (bookings.length === 0) {
      await fetchBookings();
    }

    setShowCreateFeedbackModal(true);
  };

  const closeCreateFeedbackModal = () => {
    setShowCreateFeedbackModal(false);
    setSelectedBooking(null);
    setRating(0);
    setServiceRating(0);
    setVehicleConditionRating(0);
    setComment("");
    setPhoto(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBooking || rating === 0 || comment.length < MIN_FEEDBACK_LENGTH) {
      return;
    }

    try {
      // Submit feedback using the backend endpoint
      const feedbackData = {
        bookingId: selectedBooking.id,
        rating: rating,
        comment: comment,
        serviceRating: serviceRating > 0 ? serviceRating : undefined,
        vehicleConditionRating: vehicleConditionRating > 0 ? vehicleConditionRating : undefined
      };

      const response = await apiClient.post('/feedback', feedbackData);

      if (response && response.success) {
        alert('Feedback submitted successfully!');
        closeModal();
        // Refresh feedbacks if we're on the feedback tab
        if (tab === "feedback") {
          fetchUserFeedbacks();
        }
      } else {
        alert(response.message || 'Failed to submit feedback');
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else {
        alert('Failed to submit feedback');
      }
    }
  };

  const handleCreateFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBooking || rating === 0 || comment.length < MIN_FEEDBACK_LENGTH) {
      alert('Please select a booking, provide a rating, and write at least 20 characters of feedback.');
      return;
    }

    try {
      const feedbackData = {
        bookingId: selectedBooking.id,
        rating: rating,
        comment: comment,
        serviceRating: serviceRating > 0 ? serviceRating : undefined,
        vehicleConditionRating: vehicleConditionRating > 0 ? vehicleConditionRating : undefined
      };

      const response = await apiClient.post('/feedback', feedbackData);

      if (response && response.success) {
        alert('Feedback submitted successfully!');
        closeCreateFeedbackModal();
        if (tab === "feedback") {
          fetchUserFeedbacks();
        }
      } else {
        alert(response.message || 'Failed to submit feedback');
      }
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      alert(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}/status`, {
        status: 'cancelled'
      });

      if (response && response.success) {
        alert('Booking cancelled successfully!');
        fetchBookings(); // Refresh the list
      } else {
        alert('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking');
    }
  };

  const getImageUrl = (img: string | null | undefined) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    // Always ensure a single leading slash
    const normalizedImg = img.startsWith("/") ? img : `/${img}`;
    return `${STATIC_BASE_URL}${normalizedImg}`;
  };

  const getMainImage = (item: Booking | Feedback) => {
    const images = parseVehicleImages(item.images);
    if (images.length > 0) {
      return getImageUrl(images[0]);
    }
    return 'https://placehold.co/600x400?text=No+Image';
  };

  const parseVehicleImages = (images: any) => {
    let parsedImages: string[] = [];
    try {
      if (Array.isArray(images)) {
        parsedImages = images;
      } else if (images && typeof images === 'string' && images.trim() !== '') {
        parsedImages = JSON.parse(images);
      }
    } catch {
      parsedImages = [];
    }
    return parsedImages;
  };

  const getVehicleName = (item: Booking | Feedback) => {
    return `${item.make} ${item.model} ${item.year}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'text-green-700';
      case 'cancelled':
        return 'text-red-700';
      case 'pending':
        return 'text-yellow-700';
      case 'completed':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const StarRating = ({ rating, onRatingChange, label }: { rating: number, onRatingChange: (rating: number) => void, label: string }) => (
    <div className="mb-4">
      <label className="block font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-7 h-7 ${rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              fill={rating >= star ? "#facc15" : "none"}
            />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-400">Select a rating</div>
    </div>
  );

  const StarRatingComponent = ({
    rating,
    onRatingChange,
    label,
    required = false
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    label: string;
    required?: boolean;
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onRatingChange(star)}
            className="focus:outline-none hover:scale-110 transition-transform"
          >
            <Star
              className={`w-8 h-8 ${rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                }`}
              fill={rating >= star ? "#facc15" : "none"}
            />
          </button>
        ))}
      </div>
      <div className="text-xs text-gray-500">Select a rating</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => {
              if (tab === "booking") {
                fetchBookings();
              } else {
                fetchUserFeedbacks();
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentData = tab === "booking" ? bookings : feedbacks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto py-10">
        <div className="flex justify-center mb-6 gap-8">
          <button
            className={`pb-2 font-semibold border-b-2 ${tab === "booking"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
            onClick={() => setTab("booking")}
          >
            My Booking
          </button>
          <button
            className={`pb-2 font-semibold border-b-2 ${tab === "feedback"
              ? "border-blue-700 text-blue-700"
              : "border-transparent text-gray-500 hover:text-blue-700"
              }`}
            onClick={() => setTab("feedback")}
          >
            My Feedback
          </button>
        </div>

        {/* Add Create Feedback Button for Feedback Tab */}
        {tab === "feedback" && (
          <div className="flex justify-end mb-4">
            <button
              onClick={openCreateFeedbackModal}
              className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Create Feedback
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {currentData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                {tab === "booking" ? "No bookings found" : "No feedback found"}
              </div>
              {tab === "feedback" && (
                <div className="text-gray-400 text-sm mt-2">
                  Complete your bookings and leave feedback to see them here
                </div>
              )}
            </div>
          ) : tab === "booking" ? (
            // Bookings Tab
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow px-6 py-4 flex flex-col md:flex-row items-center md:items-stretch gap-4"
              >
                <div className="w-28 h-20 bg-gray-300 rounded-lg mr-3 overflow-hidden flex items-center justify-center border">
                  {(() => {
                    const images = parseVehicleImages(booking.images);
                    const firstImage = images && images.length > 0 ? images[0] : null;
                    const imageUrl = getImageUrl(firstImage);
                    return (
                      <img
                        src={imageUrl}
                        alt={getVehicleName(booking)}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    );
                  })()}
                </div>
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{getVehicleName(booking)}</div>
                    <div className="text-xs text-gray-500">{booking.license_plate}</div>
                    <div className="text-xs mt-2">
                      <span className="font-semibold">Booking ID:</span>{" "}
                      <span className="text-blue-700">#{booking.id}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs">
                      <span className="font-semibold">Location:</span>{" "}
                      {booking.pickup_location && booking.pickup_location !== "N/A"
                        ? booking.pickup_location
                        : booking.location_address || "N/A"}
                    </div>
                    <div className="text-xs mt-2">
                      <span className="font-semibold">Pickup:</span> {formatDate(booking.start_date)}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Return:</span> {formatDate(booking.end_date)}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-xs">
                      <span className="font-semibold">Payment:</span>{" "}
                      <span className={booking.payment_status === 'paid' ? 'text-green-700' : 'text-yellow-700'}>
                        {booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Total:</span>{" "}
                      <span className="font-bold">${booking.total_amount}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Status:</span>{" "}
                      <span className={getStatusColor(booking.status)}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button className="bg-gray-100 px-4 py-2 rounded font-semibold text-gray-700 border border-gray-200 hover:bg-gray-200">
                    View Details
                  </button>
                  {booking.status === "confirmed" || booking.status === "active" ? (
                    <button
                      className="bg-gray-100 px-4 py-2 rounded font-semibold text-red-700 border border-gray-200 hover:bg-red-100"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </button>
                  ) : booking.status === "cancelled" ? (
                    <button
                      className="bg-blue-700 px-4 py-2 rounded font-semibold text-white hover:bg-blue-900"
                      onClick={() => openFeedbackModal(booking)}
                    >
                      Leave Feedback
                    </button>
                  ) : (
                    <button
                      className="bg-blue-700 px-4 py-2 rounded font-semibold text-white hover:bg-blue-900"
                      onClick={() => openFeedbackModal(booking)}
                    >
                      Leave Feedback
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Feedback Tab
            feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white rounded-xl shadow px-6 py-4 flex flex-col md:flex-row items-center md:items-stretch gap-4"
              >
                <div className="w-28 h-20 bg-gray-300 rounded-lg mr-3 overflow-hidden flex items-center justify-center border">
                  {(() => {
                    const images = parseVehicleImages(feedback.images);
                    const firstImage = images && images.length > 0 ? images[0] : null;
                    const imageUrl = getImageUrl(firstImage);
                    return (
                      <img
                        src={imageUrl}
                        alt={getVehicleName(feedback)}
                        className="w-full h-full object-cover"
                        onError={e => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                      />
                    );
                  })()}
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{getVehicleName(feedback)}</div>
                    <div className="text-xs text-gray-500">{feedback.license_plate}</div>
                    <div className="text-xs mt-2">
                      <span className="font-semibold">Feedback ID:</span>{" "}
                      <span className="text-blue-700">#{feedback.id}</span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-xs">
                      <span className="font-semibold">Rental Period:</span>
                    </div>
                    <div className="text-xs mt-2">
                      <span className="font-semibold">From:</span> {formatDate(feedback.start_date)}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">To:</span> {formatDate(feedback.end_date)}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <div className="text-xs">
                      <span className="font-semibold">Overall Rating:</span>{" "}
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${feedback.rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              fill={feedback.rating >= star ? "#facc15" : "none"}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">({feedback.rating}/5)</span>
                      </div>
                    </div>

                    {feedback.service_rating && (
                      <div className="text-xs">
                        <span className="font-semibold">Service:</span>{" "}
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${feedback.service_rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                  }`}
                                fill={feedback.service_rating >= star ? "#facc15" : "none"}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">({feedback.service_rating}/5)</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs">
                      <span className="font-semibold">Submitted:</span>{" "}
                      <span className="text-gray-600">{formatDate(feedback.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <button
                    className="bg-gray-100 px-4 py-2 rounded font-semibold text-gray-700 border border-gray-200 hover:bg-gray-200"
                    onClick={() => {
                      alert(`Feedback: ${feedback.comment}`);
                    }}
                  >
                    View Details
                  </button>
                  <button
                    className="bg-blue-700 px-4 py-2 rounded font-semibold text-white hover:bg-blue-900"
                    onClick={() => {
                      alert('Edit feedback functionality can be added here');
                    }}
                  >
                    Edit Feedback
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create Feedback Modal */}
      {showCreateFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Leave Feedback</h2>
              <button
                onClick={closeCreateFeedbackModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Booking Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Booking <span className="text-red-500">*</span>
                </label>

                {bookings.length === 0 ? (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                    No bookings available
                  </div>
                ) : (
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedBooking?.id || ''}
                    onChange={(e) => {
                      const bookingId = e.target.value;
                      console.log('Dropdown changed, value:', bookingId);
                      console.log('Available bookings:', bookings);

                      if (bookingId) {
                        // Try both string and number comparison
                        const booking = bookings.find(b => String(b.id) === String(bookingId));
                        console.log('Found booking:', booking);

                        if (booking) {
                          setSelectedBooking(booking);
                        }
                      } else {
                        setSelectedBooking(null);
                      }
                    }}
                    required
                  >
                    <option value="">Choose a booking...</option>
                    {bookings
                      .filter(booking => !feedbacks.find(f => f.booking_id === booking.id))
                      .map(booking => (
                        <option key={booking.id} value={booking.id}>
                          {getVehicleName(booking)} - {booking.license_plate} (#{booking.id})
                        </option>
                      ))}
                  </select>
                )}

                {bookings.length === 0 && (
                  <div className="text-sm text-red-500 mt-2">
                    No bookings found. Please make sure you have bookings in your account.
                  </div>
                )}

                {bookings.length > 0 && bookings.filter(booking => !feedbacks.find(f => f.booking_id === booking.id)).length === 0 && (
                  <div className="text-sm text-yellow-600 mt-2">
                    All your bookings already have feedback submitted.
                  </div>
                )}
              </div>

              {/* Selected Vehicle Display */}
              {selectedBooking && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                  <img
                    src={getMainImage(selectedBooking)}
                    alt={getVehicleName(selectedBooking)}
                    className="w-16 h-12 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{getVehicleName(selectedBooking)}</div>
                    <div className="text-sm text-gray-600">{selectedBooking.license_plate}</div>
                    <div className="text-xs text-gray-500">
                      Status: <span className={getStatusColor(selectedBooking.status)}>{selectedBooking.status}</span>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateFeedbackSubmit}>
                {/* Rate Your Experience */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Rate Your Experience</h3>
                  <StarRatingComponent
                    rating={rating}
                    onRatingChange={setRating}
                    label="Overall Rating"
                    required={true}
                  />
                </div>

                {/* Your Feedback */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Share your experience about vehicle and service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    required
                    minLength={MIN_FEEDBACK_LENGTH}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Minimum 20 characters required</span>
                    <span>{comment.length} characters</span>
                  </div>
                </div>

                {/* Add Photos (Optional) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Photos (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to Upload Vehicle photos
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG or JPEG(MAX. 5MB)
                      </p>
                    </label>
                    {photo && (
                      <p className="text-sm text-green-600 mt-2">
                        Selected: {photo.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeCreateFeedbackModal}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedBooking || rating === 0 || comment.length < MIN_FEEDBACK_LENGTH}
                    className="flex-1 px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal from Booking Button */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="font-bold text-lg mb-2">Leave Feedback</div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={getMainImage(selectedBooking)}
                alt={getVehicleName(selectedBooking)}
                className="w-14 h-10 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{getVehicleName(selectedBooking)}</div>
                <div className="text-xs text-gray-500">{selectedBooking.license_plate}</div>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                label="Overall Rating *"
              />

              <StarRating
                rating={serviceRating}
                onRatingChange={setServiceRating}
                label="Service Rating (Optional)"
              />

              <StarRating
                rating={vehicleConditionRating}
                onRatingChange={setVehicleConditionRating}
                label="Vehicle Condition Rating (Optional)"
              />

              <div className="mb-4">
                <label className="block font-semibold mb-1">Your Feedback *</label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Share your experience about vehicle and service ..."
                  minLength={MIN_FEEDBACK_LENGTH}
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  required
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Minimum 20 characters required</span>
                  <span>{comment.length} characters</span>
                </div>
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
                  disabled={rating === 0 || comment.length < MIN_FEEDBACK_LENGTH}
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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const BookingsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching booking data
    setTimeout(() => {
      setBookings([
        { id: 1, user: "John Doe", vehicle: "Toyota RAV4", date: "2023-10-01", status: "Confirmed" },
        { id: 2, user: "Jane Smith", vehicle: "Honda Civic", date: "2023-10-02", status: "Pending" },
        // Add more bookings...
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEditBooking = (id: number) => {
    navigate(`/admin/bookings/edit/${id}`);
  };

  if (loading) {
    return <div>Loading bookings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bookings Management</h1>
      <Button onClick={() => navigate('/admin/bookings/add')} className="mb-4">Add New Booking</Button>
      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-4 flex justify-between items-center">
            <div>
              <h2 className="font-semibold">{booking.user}</h2>
              <p>{booking.vehicle}</p>
              <p>{booking.date}</p>
              <p className={`text-${booking.status === "Confirmed" ? "green" : "yellow"}-600`}>{booking.status}</p>
            </div>
            <Button onClick={() => handleEditBooking(booking.id)}>Edit</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BookingsManagement;
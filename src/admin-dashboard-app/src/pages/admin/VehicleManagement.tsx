import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car } from "lucide-react";
import { useSettings } from "@/contexts/SettingContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const VehicleManagement: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching vehicle data
    setTimeout(() => {
      setVehicles([
        { id: 1, make: "Toyota", model: "RAV4", year: 2023, available: true },
        { id: 2, make: "Honda", model: "Civic", year: 2022, available: false },
        // Add more vehicles as needed
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddVehicle = () => {
    navigate("/admin/vehicles/add");
  };

  const handleEditVehicle = (id: number) => {
    navigate(`/admin/vehicles/edit/${id}`);
  };

  const handleRemoveVehicle = (id: number) => {
    // Logic to remove vehicle
    setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
  };

  if (loading) {
    return <div>Loading vehicles...</div>;
  }

  return (
    <div className={`p-8 ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <h1 className="text-2xl font-bold mb-4">Vehicle Management</h1>
      <Button onClick={handleAddVehicle} className="mb-4">Add Vehicle</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(vehicle => (
          <Card key={vehicle.id} className="p-4">
            <h2 className="text-lg font-semibold">{`${vehicle.make} ${vehicle.model}`}</h2>
            <p>{`Year: ${vehicle.year}`}</p>
            <p>{`Available: ${vehicle.available ? "Yes" : "No"}`}</p>
            <div className="flex justify-between mt-4">
              <Button onClick={() => handleEditVehicle(vehicle.id)}>Edit</Button>
              <Button onClick={() => handleRemoveVehicle(vehicle.id)} className="bg-red-600">Remove</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VehicleManagement;
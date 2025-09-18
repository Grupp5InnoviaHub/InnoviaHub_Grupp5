import React, { useState } from "react";
import { FiClock, FiMapPin, FiEye, FiX } from "react-icons/fi";
import { useBookings, useCancelBooking } from "../../hooks/useApi";
import { useAdminAuth } from "../../context/AdminAuthProvider";
import toast from "react-hot-toast";

const Bookings: React.FC = () => {
  useAdminAuth();

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const {
    data: bookings,
    isLoading,
    error,
    refetch,
  } = useBookings({
    page: 1,
    pageSize: 10,
  });

  const cancelBookingMutation = useCancelBooking();

  // Handler functions
  const handleViewBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const handleCancelBooking = (booking: any) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await cancelBookingMutation.mutateAsync(selectedBooking.bookingId);
      refetch();
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking.");
    } finally {
      // Always close modal and reset state, regardless of success or error
      setShowCancelModal(false);
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Bookings Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and monitor all system bookings
            </p>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 ">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600">
              Error loading bookings: {error.message}
            </p>
            <p className="text-gray-500 mt-2 text-sm">
              Please check if the backend server is running on port 5296
            </p>
          </div>
        ) : (bookings?.items?.length || 0) === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📅</div>
            <p className="text-gray-600">No bookings found.</p>
            <p className="text-gray-500 mt-2 text-sm">
              Bookings will appear here when users make reservations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50  border-b border-gray-200 ">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500  uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white  divide-y divide-gray-200 dark:divide-gray-700">
                {bookings?.items?.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-xs">
                            #{booking.bookingId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {booking.userEmail.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 ">
                            {booking.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                          <FiMapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 ">
                            {booking.resourceTypeName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 ">
                        <div className="font-medium">
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500 ">
                          {new Date(booking.bookingDate).toLocaleTimeString()} -{" "}
                          {new Date(booking.endDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                      <div className="flex items-center">
                        <FiClock className="w-4 h-4 mr-2 text-gray-400" />
                        {booking.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          booking.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.isActive ? "Active" : "Completed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View booking details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        {booking.isActive && (
                          <button
                            onClick={() => handleCancelBooking(booking)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cancel booking"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Booking Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">
                    Booking Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Booking ID:</span> #
                      {selectedBooking.bookingId}
                    </div>
                    <div>
                      <span className="font-medium">User:</span>{" "}
                      {selectedBooking.userEmail}
                    </div>
                    <div>
                      <span className="font-medium">Resource:</span>{" "}
                      {selectedBooking.resourceTypeName}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedBooking.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedBooking.isActive ? "Active" : "Completed"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">
                    Date & Time
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Booking Date:</span>{" "}
                      {new Date(
                        selectedBooking.bookingDate
                      ).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">End Date:</span>{" "}
                      {new Date(selectedBooking.endDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {Math.ceil(
                        (new Date(selectedBooking.endDate).getTime() -
                          new Date(selectedBooking.bookingDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {selectedBooking.isActive && (
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setShowCancelModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                <FiX className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cancel Booking
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel booking{" "}
              <strong>#{selectedBooking.bookingId}</strong> for{" "}
              <strong>{selectedBooking.userEmail}</strong>?
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelBooking}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={cancelBookingMutation.isPending}
              >
                {cancelBookingMutation.isPending
                  ? "Cancelling..."
                  : "Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;

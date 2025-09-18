import React, { useState } from "react";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import {
  useUsers,
  useDeleteUser,
  useCreateUser,
  useUpdateUser,
} from "../../hooks/useApi";
import { useAdminAuth } from "../../context/AdminAuthProvider";
import type { CreateUserForm, UpdateUserForm } from "../../types/admin";
import toast from "react-hot-toast";

const Users: React.FC = () => {
  useAdminAuth();
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    totalBookings?: number;
    activeBookings?: number;
    createdAt?: string;
    updatedAt?: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [addFormData, setAddFormData] = useState<CreateUserForm>({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    role: "Member",
    isActive: true,
  });

  const [editFormData, setEditFormData] = useState<UpdateUserForm>({
    firstName: "",
    lastName: "",
    email: "",
    role: "Member",
    isActive: true,
  });

  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page: 1,
    pageSize: 10,
  });

  const deleteUserMutation = useDeleteUser();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Validation functions
  const validateAddForm = (): string | null => {
    if (!addFormData.firstName.trim()) return "First name is required";
    if (!addFormData.lastName.trim()) return "Last name is required";
    if (!addFormData.email.trim()) return "Email is required";
    if (!addFormData.email.includes("@")) return "Please enter a valid email";
    if (!addFormData.password.trim()) return "Password is required";
    if (addFormData.password.length < 6)
      return "Password must be at least 6 characters";
    if (addFormData.password !== addFormData.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const validateEditForm = (): string | null => {
    if (!editFormData.firstName.trim()) return "First name is required";
    if (!editFormData.lastName.trim()) return "Last name is required";
    if (!editFormData.email.trim()) return "Email is required";
    if (!editFormData.email.includes("@")) return "Please enter a valid email";
    return null;
  };

  // Handle view user
  const handleViewUser = (user: typeof selectedUser) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Handle edit user from table
  const handleEditUserFromTable = (user: typeof selectedUser) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      role: user?.role || "Member",
      isActive: user?.isActive || true,
    });
    setShowEditModal(true);
  };

  // Handle delete user
  const handleDeleteUser = (user: typeof selectedUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete user.");
    } finally {
      // Always close modal and reset state, regardless of success or error
      setShowDeleteModal(false);
      setSelectedUser(null);
      refetch();
    }
  };

  // Handle add user
  const handleAddUser = () => {
    setAddFormData({
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      role: "Member",
      isActive: true,
    });
    setShowAddModal(true);
  };

  // Handle form submissions
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateAddForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await createUserMutation.mutateAsync(addFormData);
      setShowAddModal(false);
      setAddFormData({
        email: "",
        firstName: "",
        lastName: "",
        password: "",
        confirmPassword: "",
        role: "Member",
        isActive: true,
      });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    const validationError = validateEditForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        userData: editFormData,
      });
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Users Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system users and their permissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddUser}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600">Error loading users: {error.message}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.items?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {(user.firstName || "U").charAt(0)}
                            {(user.lastName || "U").charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 ">
                            {user.firstName || "Unknown"}{" "}
                            {user.lastName || "User"}
                          </div>
                          <div className="text-sm text-gray-500 ">
                            {user.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          (user.role || "Member") === "Admin"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role || "Member"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 ">
                      <div>
                        <div className="font-medium">
                          {user.totalBookings || 0} total
                        </div>
                        <div className="text-gray-500 ">
                          {user.activeBookings || 0} active
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 ">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="View user details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUserFromTable(user)}
                          className="p-2 text-gray-600  hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 ">
                User Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.firstName?.charAt(0) || "U"}
                    {selectedUser.lastName?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 ">
                    {selectedUser.firstName || "Unknown"}{" "}
                    {selectedUser.lastName || "User"}
                  </h4>
                  <p className="text-gray-600 ">
                    {selectedUser.email || "No email"}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        (selectedUser.role || "Member") === "Admin"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedUser.role || "Member"}
                    </span>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50  rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900  mb-2">
                    Account Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedUser.email || "No email"}
                    </div>
                    <div>
                      <span className="font-medium">Role:</span>{" "}
                      {selectedUser.role || "Member"}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span>{" "}
                      {selectedUser.id || "Unknown"}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50  rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900  mb-2">
                    Booking Statistics
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Total Bookings:</span>{" "}
                      {selectedUser.totalBookings || 0}
                    </div>
                    <div>
                      <span className="font-medium">Active Bookings:</span>{" "}
                      {selectedUser.activeBookings || 0}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {selectedUser.updatedAt
                        ? new Date(selectedUser.updatedAt).toLocaleDateString()
                        : "Unknown"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200 ">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setEditFormData({
                      firstName: selectedUser.firstName || "",
                      lastName: selectedUser.lastName || "",
                      email: selectedUser.email || "",
                      role: selectedUser.role || "Member",
                      isActive: selectedUser.isActive || true,
                    });
                    setShowEditModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit User
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                <FiTrash2 className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete User
                </h3>
                <p className="text-sm text-gray-600 ">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <strong>
                {selectedUser?.firstName || "Unknown"}{" "}
                {selectedUser?.lastName || "User"}
              </strong>
              ? This will permanently remove the user and all associated data.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteUserMutation.isPending}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 ">
                Add New User
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={addFormData.firstName}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={addFormData.lastName}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={addFormData.password}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        password: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={addFormData.confirmPassword}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={addFormData.role}
                    onChange={(e) =>
                      setAddFormData({ ...addFormData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={addFormData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createUserMutation.isPending ? "Adding..." : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white  rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 ">
                Edit User
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                  >
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editFormData.isActive ? "true" : "false"}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        isActive: e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white  text-gray-900 "
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300  text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateUserMutation.isPending ? "Updating..." : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

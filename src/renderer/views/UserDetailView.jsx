// src/renderer/views/UserDetailView.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Import components
import LoadingSpinner from "../components/common/LoadingSpinner";
import FormInput from "../components/FormInput";

const UserDetailView = () => {
  const { t } = useTranslation();
  const { currentUser, accessToken } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  // State
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // New user mode
  const isNewUser = userId === "new";

  // Check if user is admin
  useEffect(() => {
    if (currentUser?.role !== "admin") {
      toast.error(t("users.errors.unauthorized"));
      navigate("/dashboard");
    }
  }, [currentUser, navigate, t]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isNewUser) {
        setFormData({
          username: "",
          email: "",
          firstName: "",
          lastName: "",
          role: "staff",
          password: "",
          passwordConfirmation: "",
          isActive: true,
          sendEmail: true,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setUser(response.data.user);
          setFormData({
            username: response.data.user.username,
            email: response.data.user.email,
            firstName: response.data.user.firstName || "",
            lastName: response.data.user.lastName || "",
            role: response.data.user.role,
            password: "",
            passwordConfirmation: "",
            isActive: response.data.user.isActive,
          });
        } else {
          toast.error(t("users.errors.notFound"));
          navigate("/dashboard/users");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error(t("users.errors.loadFailed"));
        navigate("/dashboard/users");
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      fetchUserData();
    }
  }, [accessToken, userId, navigate, t, currentUser, isNewUser]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.username) {
      errors.username = t("validation.required");
    }

    if (!formData.email) {
      errors.email = t("validation.required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t("validation.email");
    }

    if (isNewUser || formData.password) {
      if (!formData.password) {
        errors.password = t("validation.required");
      } else if (formData.password.length < 8) {
        errors.password = t("validation.minLength", { length: 8 });
      }

      if (formData.password !== formData.passwordConfirmation) {
        errors.passwordConfirmation = t("validation.passwordMismatch");
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      let response;

      // Prepare data for API
      const userData = {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        isActive: formData.isActive,
      };

      // Add password if set
      if (formData.password) {
        userData.password = formData.password;
      }

      // Add sendEmail for new users
      if (isNewUser) {
        userData.sendEmail = formData.sendEmail;
      }

      if (isNewUser) {
        response = await api.post("/admin/users", userData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      } else {
        response = await api.put(`/admin/users/${userId}`, userData, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      if (response.data.success) {
        toast.success(
          isNewUser ? t("users.success.created") : t("users.success.updated")
        );

        if (isNewUser) {
          navigate(`/dashboard/users/${response.data.user.id}`);
        } else {
          setUser(response.data.user);
          // Reset password fields
          setFormData((prev) => ({
            ...prev,
            password: "",
            passwordConfirmation: "",
          }));
        }
      } else {
        toast.error(response.data.message || t("users.errors.saveFailed"));
      }
    } catch (error) {
      console.error("Error saving user:", error);

      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error(t("users.errors.saveFailed"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back
  const handleBack = () => {
    navigate("/dashboard/users");
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-1 rounded-full hover:bg-base-200"
            aria-label={t("common.back")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">
            {isNewUser
              ? t("users.newUser")
              : t("users.editUser", { username: user.username })}
          </h1>
        </div>
      </div>

      <div className="bg-base-100 rounded-lg shadow-card border border-base-300">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium border-b border-base-300 pb-2">
                {t("users.sections.basicInfo")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  label={t("users.fields.username")}
                  placeholder={t("users.placeholders.username")}
                  required
                  errorMessage={formErrors.username}
                />

                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  label={t("users.fields.email")}
                  placeholder={t("users.placeholders.email")}
                  required
                  errorMessage={formErrors.email}
                />

                <FormInput
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  label={t("users.fields.firstName")}
                  placeholder={t("users.placeholders.firstName")}
                  errorMessage={formErrors.firstName}
                />

                <FormInput
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  label={t("users.fields.lastName")}
                  placeholder={t("users.placeholders.lastName")}
                  errorMessage={formErrors.lastName}
                />

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    {t("users.fields.role")}
                    <span className="text-error ml-1">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary border-base-300"
                  >
                    <option value="admin">{t("users.roles.admin")}</option>
                    <option value="manager">{t("users.roles.manager")}</option>
                    <option value="staff">{t("users.roles.staff")}</option>
                  </select>
                </div>

                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm">
                    {t("users.fields.isActive")}
                  </label>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium border-b border-base-300 pb-2">
                {isNewUser
                  ? t("users.sections.setPassword")
                  : t("users.sections.changePassword")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium mb-1"
                  >
                    {t("users.fields.password")}
                    {isNewUser && <span className="text-error ml-1">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                        formErrors.password ? "border-error" : "border-base-300"
                      }`}
                      placeholder={t("users.placeholders.password")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-neutral"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-neutral"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-error text-sm mt-1">
                      {formErrors.password}
                    </p>
                  )}
                  {!isNewUser && (
                    <p className="text-neutral text-sm mt-1">
                      {t("users.passwordNote")}
                    </p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="passwordConfirmation"
                    className="block text-sm font-medium mb-1"
                  >
                    {t("users.fields.passwordConfirmation")}
                    {isNewUser && <span className="text-error ml-1">*</span>}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                      formErrors.passwordConfirmation
                        ? "border-error"
                        : "border-base-300"
                    }`}
                    placeholder={t("users.placeholders.passwordConfirmation")}
                  />
                  {formErrors.passwordConfirmation && (
                    <p className="text-error text-sm mt-1">
                      {formErrors.passwordConfirmation}
                    </p>
                  )}
                </div>
              </div>

              {isNewUser && (
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-base-300 rounded"
                  />
                  <label htmlFor="sendEmail" className="ml-2 block text-sm">
                    {t("users.fields.sendEmail")}
                  </label>
                </div>
              )}
            </div>

            {/* Form actions */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn btn-primary"
              >
                {isSaving ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("common.saving")}
                  </span>
                ) : isNewUser ? (
                  t("common.create")
                ) : (
                  t("common.save")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDetailView;

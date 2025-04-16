// src/renderer/views/ProfileView.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import api from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Import components
import LoadingSpinner from "../components/common/LoadingSpinner";
import FormInput from "../components/FormInput";

const ProfileView = () => {
  const { t } = useTranslation();
  const { currentUser, accessToken } = useAuth();

  // State
  const [userData, setUserData] = useState(null);
  const [profileForm, setProfileForm] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    passwordConfirmation: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/users/me", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.data.success) {
          setUserData(response.data.user);
          setProfileForm({
            username: response.data.user.username,
            email: response.data.user.email,
            firstName: response.data.user.firstName || "",
            lastName: response.data.user.lastName || "",
          });
        } else {
          toast.error(t("profile.errors.loadFailed"));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error(t("profile.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [accessToken, t]);

  // Handle profile form change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};

    if (!profileForm.username) {
      errors.username = t("validation.required");
    }

    if (!profileForm.email) {
      errors.email = t("validation.required");
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      errors.email = t("validation.email");
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = t("validation.required");
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = t("validation.required");
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = t("validation.minLength", { length: 8 });
    }

    if (!passwordForm.passwordConfirmation) {
      errors.passwordConfirmation = t("validation.required");
    } else if (passwordForm.newPassword !== passwordForm.passwordConfirmation) {
      errors.passwordConfirmation = t("validation.passwordMismatch");
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await api.put("/users/me", profileForm, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success(t("profile.success.updated"));
        setUserData(response.data.user);
      } else {
        toast.error(response.data.message || t("profile.errors.updateFailed"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response?.data?.errors) {
        setProfileErrors(error.response.data.errors);
      } else {
        toast.error(t("profile.errors.updateFailed"));
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await api.put("/users/me/password", passwordForm, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        toast.success(t("profile.success.passwordChanged"));
        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          passwordConfirmation: "",
        });
      } else {
        toast.error(
          response.data.message || t("profile.errors.passwordChangeFailed")
        );
      }
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.response?.data?.errors) {
        setPasswordErrors(error.response.data.errors);
      } else {
        const errorMessage = error.response?.data?.message;
        if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error(t("profile.errors.passwordChangeFailed"));
        }
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t("profile.title")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
          <div className="bg-base-200 px-4 py-3 border-b border-base-300">
            <h2 className="text-lg font-medium">
              {t("profile.sections.info")}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <FormInput
                type="text"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                label={t("users.fields.username")}
                placeholder={t("users.placeholders.username")}
                required
                errorMessage={profileErrors.username}
              />

              <FormInput
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                label={t("users.fields.email")}
                placeholder={t("users.placeholders.email")}
                required
                errorMessage={profileErrors.email}
              />

              <FormInput
                type="text"
                name="firstName"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                label={t("users.fields.firstName")}
                placeholder={t("users.placeholders.firstName")}
                errorMessage={profileErrors.firstName}
              />

              <FormInput
                type="text"
                name="lastName"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                label={t("users.fields.lastName")}
                placeholder={t("users.placeholders.lastName")}
                errorMessage={profileErrors.lastName}
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="btn btn-primary"
                >
                  {isSavingProfile ? (
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
                  ) : (
                    t("common.save")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
          <div className="bg-base-200 px-4 py-3 border-b border-base-300">
            <h2 className="text-lg font-medium">
              {t("profile.sections.password")}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="mb-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium mb-1"
                >
                  {t("profile.fields.currentPassword")}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                      passwordErrors.currentPassword
                        ? "border-error"
                        : "border-base-300"
                    }`}
                    placeholder={t("profile.placeholders.currentPassword")}
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
                {passwordErrors.currentPassword && (
                  <p className="text-error text-sm mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium mb-1"
                >
                  {t("profile.fields.newPassword")}
                  <span className="text-error ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full pl-3 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                      passwordErrors.newPassword
                        ? "border-error"
                        : "border-base-300"
                    }`}
                    placeholder={t("profile.placeholders.newPassword")}
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-error text-sm mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="passwordConfirmation"
                  className="block text-sm font-medium mb-1"
                >
                  {t("profile.fields.passwordConfirmation")}
                  <span className="text-error ml-1">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="passwordConfirmation"
                  name="passwordConfirmation"
                  value={passwordForm.passwordConfirmation}
                  onChange={handlePasswordChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                    passwordErrors.passwordConfirmation
                      ? "border-error"
                      : "border-base-300"
                  }`}
                  placeholder={t("profile.placeholders.passwordConfirmation")}
                />
                {passwordErrors.passwordConfirmation && (
                  <p className="text-error text-sm mt-1">
                    {passwordErrors.passwordConfirmation}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="btn btn-primary"
                >
                  {isSavingPassword ? (
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
                  ) : (
                    t("profile.actions.changePassword")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-base-100 rounded-lg shadow-card border border-base-300 overflow-hidden">
          <div className="bg-base-200 px-4 py-3 border-b border-base-300">
            <h2 className="text-lg font-medium">
              {t("profile.sections.account")}
            </h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-neutral mb-1">
                  {t("users.fields.role")}
                </div>
                <div className="font-medium">
                  {userData?.role ? t(`users.roles.${userData.role}`) : "-"}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-neutral mb-1">
                  {t("users.fields.lastLogin")}
                </div>
                <div>
                  {userData?.lastLogin
                    ? new Date(userData.lastLogin).toLocaleString()
                    : t("common.never")}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-neutral mb-1">
                  {t("users.fields.createdAt")}
                </div>
                <div>
                  {userData?.createdAt
                    ? new Date(userData.createdAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;

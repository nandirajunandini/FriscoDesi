"use client";

import { useEffect, useState } from "react";

interface AdminSettings {
  adminName: string;
  email: string;
  emailNotifications: boolean;
  newMessageNotifications: boolean;
  listingNotifications: boolean;
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  adminName: "",
  email: "",
  emailNotifications: true,
  newMessageNotifications: true,
  listingNotifications: true,
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] =
    useState<AdminSettings>(
      DEFAULT_SETTINGS
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =====================================================
     SAFE JSON READER
  ===================================================== */

  async function readResponse(
    res: Response
  ) {
    const text = await res.text();

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        error: text,
      };
    }
  }

  /* =====================================================
     LOAD SETTINGS
  ===================================================== */

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const res = await fetch(
          "/api/admin/settings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await readResponse(res);

        console.log(
          "⚙️ Frontend settings response:",
          data
        );

        if (!res.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Failed to load settings"
          );
        }

        /*
          Strapi response:

          {
            data: {
              adminName: "...",
              email: "...",
              ...
            }
          }
        */

        const settingsData =
          data?.data || data;

        if (!settingsData) {
          throw new Error(
            "Admin settings not found"
          );
        }

        setSettings({
          adminName:
            settingsData.adminName ||
            "",

          email:
            settingsData.email ||
            "",

          emailNotifications:
            settingsData.emailNotifications ??
            true,

          newMessageNotifications:
            settingsData.newMessageNotifications ??
            true,

          listingNotifications:
            settingsData.listingNotifications ??
            true,

          maintenanceMode:
            settingsData.maintenanceMode ??
            false,
        });

      } catch (err) {
        console.error(
          "❌ Load settings error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load settings"
        );

      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  async function handleSave(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      console.log(
        "📤 Saving settings:",
        settings
      );

      const res = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            settings
          ),

          cache: "no-store",
        }
      );

      const data =
        await readResponse(res);

      console.log(
        "📥 Save response:",
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to save settings"
        );
      }

      setMessage(
        "Settings saved successfully."
      );

    } catch (err) {
      console.error(
        "❌ Save settings error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save settings"
      );

    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">
          Loading settings...
        </p>
      </main>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-gray-50 p-10">

      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <h1 className="text-3xl font-bold mb-2">
            Admin Settings
          </h1>

          <p className="text-gray-500 mb-8">
            Manage your FriscoDesi admin
            preferences.
          </p>


          {/* =================================================
              SUCCESS MESSAGE
          ================================================= */}

          {message && (
            <div className="mb-6 bg-green-100 text-green-700 px-4 py-3 rounded-lg">
              {message}
            </div>
          )}


          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSave}
            className="space-y-6"
          >

            {/* =================================================
                ADMIN NAME
            ================================================= */}

            <div>

              <label className="block font-medium mb-2">
                Admin Name
              </label>

              <input
                type="text"
                value={
                  settings.adminName
                }
                onChange={(e) =>
                  setSettings(
                    (previous) => ({
                      ...previous,

                      adminName:
                        e.target.value,
                    })
                  )
                }
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>


            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label className="block font-medium mb-2">
                Email
              </label>

              <input
                type="email"
                value={
                  settings.email
                }
                onChange={(e) =>
                  setSettings(
                    (previous) => ({
                      ...previous,

                      email:
                        e.target.value,
                    })
                  )
                }
                className="w-full border rounded-lg px-4 py-3"
              />

            </div>


            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div className="border-t pt-6">

              <h2 className="text-xl font-semibold mb-4">
                Notifications
              </h2>


              {/* Email Notifications */}

              <label className="flex items-center justify-between py-3">

                <span>
                  Email Notifications
                </span>

                <input
                  type="checkbox"
                  checked={
                    settings.emailNotifications
                  }
                  onChange={(e) =>
                    setSettings(
                      (previous) => ({
                        ...previous,

                        emailNotifications:
                          e.target.checked,
                      })
                    )
                  }
                  className="w-5 h-5"
                />

              </label>


              {/* New Message Notifications */}

              <label className="flex items-center justify-between py-3">

                <span>
                  New Message Notifications
                </span>

                <input
                  type="checkbox"
                  checked={
                    settings.newMessageNotifications
                  }
                  onChange={(e) =>
                    setSettings(
                      (previous) => ({
                        ...previous,

                        newMessageNotifications:
                          e.target.checked,
                      })
                    )
                  }
                  className="w-5 h-5"
                />

              </label>


              {/* Listing Notifications */}

              <label className="flex items-center justify-between py-3">

                <span>
                  Listing Notifications
                </span>

                <input
                  type="checkbox"
                  checked={
                    settings.listingNotifications
                  }
                  onChange={(e) =>
                    setSettings(
                      (previous) => ({
                        ...previous,

                        listingNotifications:
                          e.target.checked,
                      })
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

            </div>


            {/* =================================================
                MAINTENANCE MODE
            ================================================= */}

            <div className="border-t pt-6">

              <label className="flex items-center justify-between">

                <div>

                  <h2 className="font-semibold">
                    Maintenance Mode
                  </h2>

                  <p className="text-sm text-gray-500">
                    Temporarily disable parts
                    of the website.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    settings.maintenanceMode
                  }
                  onChange={(e) =>
                    setSettings(
                      (previous) => ({
                        ...previous,

                        maintenanceMode:
                          e.target.checked,
                      })
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

            </div>


            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >

              {saving
                ? "Saving..."
                : "Save Settings"}

            </button>

          </form>

        </div>

      </div>

    </main>
  );
}
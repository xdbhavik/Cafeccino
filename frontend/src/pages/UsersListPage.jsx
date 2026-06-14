import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Key, EyeOff, Trash2, HelpCircle, UserX, UserCheck, Edit2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { Dialog } from "../components/ui/Dialog";

export const UsersListPage = () => {
  const navigate = useNavigate();
  const { users, deleteUser, toggleUserArchive, changeUserPassword, fetchUsers } = useAdmin();

  // Dialog targets
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [pwTargetId, setPwTargetId] = useState(null);

  // Password Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");

  React.useEffect(() => {
    fetchUsers().catch(console.error);
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError("");

    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    try {
      await changeUserPassword(pwTargetId, newPassword);
      setPwTargetId(null);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err.message || "Failed to update password.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId) {
      try {
        await deleteUser(deleteTargetId);
        setDeleteTargetId(null);
      } catch (err) {
        alert(err.message || "Failed to delete user.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
            Staff & User Logins
          </h1>
          <p className="text-sm text-text-secondary">
            Manage system access accounts, passwords, cashier roles, and statuses.
          </p>
        </div>
        <Link
          to="/admin/users/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-bold text-sm rounded-lg hover:shadow-accent transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Account</span>
        </Link>
      </div>

      {/* Users Data Table */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-raised/40">
                <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Name</th>
                <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Email Address</th>
                <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Role</th>
                <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Status</th>
                <th className="py-4 px-6 font-sora font-semibold text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => {
                const isArchived = u.isArchived;
                return (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-surface-raised/10 ${
                      isArchived ? "opacity-50 line-through text-text-secondary" : ""
                    }`}
                  >
                    <td className="py-3.5 px-6 font-semibold text-text-primary">{u.name}</td>
                    <td className="py-3.5 px-6 font-mono text-xs">{u.email}</td>
                    <td className="py-3.5 px-6">
                      {u.role?.toLowerCase() === "admin" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-dim text-accent border border-accent/20">
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-raised border border-border text-text-secondary">
                          {u.role?.toLowerCase() === "employee" ? "Cashier Staff" : (u.role || "Cashier Staff")}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      {isArchived ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-border text-text-secondary">
                          Archived
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/15 text-success border border-success/20">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit User Details */}
                        <button
                          onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                          disabled={isArchived}
                          className="p-1.5 text-text-secondary hover:text-accent hover:bg-surface-raised rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Edit Details"
                        >
                          <Edit2 size={15} />
                        </button>
                        {/* Change Password */}
                        <button
                          onClick={() => setPwTargetId(u.id)}
                          disabled={isArchived}
                          className="p-1.5 text-text-secondary hover:text-accent hover:bg-surface-raised rounded-md transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Change Password"
                        >
                          <Key size={15} />
                        </button>
                        {/* Archive Toggle */}
                        <button
                          onClick={async () => {
                            try {
                              await toggleUserArchive(u.id);
                            } catch (err) {
                              alert(err.message || "Failed to toggle archive status.");
                            }
                          }}
                          className={`p-1.5 rounded-md transition-all ${
                            isArchived
                              ? "text-success hover:bg-success/15"
                              : "text-text-secondary hover:text-amber-500 hover:bg-surface-raised"
                          }`}
                          title={isArchived ? "Activate Account" : "Archive Account"}
                        >
                          {isArchived ? <UserCheck size={15} /> : <EyeOff size={15} />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTargetId(u.id)}
                          className="p-1.5 text-text-secondary hover:text-danger hover:bg-surface-raised rounded-md transition-all"
                          title="Delete Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change Password Modal */}
      <Dialog
        isOpen={pwTargetId !== null}
        onClose={() => {
          setPwTargetId(null);
          setPwError("");
        }}
        title="Change Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {pwError && (
            <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
              {pwError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setPwTargetId(null);
                setPwError("");
              }}
              className="h-10 px-4 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg transition-all"
            >
              Update Password
            </button>
          </div>
        </form>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Login Account"
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-sm text-text-primary font-medium mb-1">
            Are you sure you want to delete this employee account?
          </p>
          <p className="text-xs text-text-secondary mb-6">
            The cashier will be immediately disconnected and credentials deleted from databases.
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setDeleteTargetId(null)}
              className="flex-1 h-10 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 h-10 bg-danger text-text-primary rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

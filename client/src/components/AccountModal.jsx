import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import { changePassword } from "../services/authProfileService";

const AccountModal = ({ isOpen, onClose, user }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setSubmitting(true);
    const result = await changePassword({ currentPassword, newPassword });
    setSubmitting(false);

    if (result.ok) {
      setStatus({ type: "success", message: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setStatus({ type: "error", message: result.error });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account">
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-sm text-slate-500">Username</p>
          <p className="font-semibold text-slate-800">{user?.username}</p>
          <p className="text-sm text-slate-500 mt-2">Email</p>
          <p className="font-semibold text-slate-800">{user?.email}</p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <h4 className="font-semibold text-slate-800">Change password</h4>
          {status.message && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {status.message}
            </div>
          )}
          <div>
            <label className="text-sm text-slate-600">Current password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">New password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Confirm new password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full rounded-lg py-2 text-white font-medium ${
              submitting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </Modal>
  );
};

AccountModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
  }),
};

AccountModal.defaultProps = {
  user: null,
};

export default AccountModal;

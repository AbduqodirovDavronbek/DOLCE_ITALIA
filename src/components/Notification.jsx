import { useEffect } from "react";

const Notification = ({ message, type = "info", onClose, duration = 5000 }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__content">
        <span className="notification__icon">
          {type === "success" && "✓"}
          {type === "error" && "✕"}
          {type === "warning" && "!"}
          {type === "info" && "ℹ"}
        </span>
        <p className="notification__message">{message}</p>
      </div>
      <button
        className="notification__close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;

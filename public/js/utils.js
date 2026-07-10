const HarvConnectUtils = (() => {
  const CATEGORIES = {
    TOMATO_LOCAL: "Local Tomato",
    TOMATO_HYBRID: "Hybrid Tomato",
    PEPPER: "Pepper",
    OKRA: "Okra",
    GARDEN_EGGS: "Garden Eggs",
    CABBAGE: "Cabbage",
    LETTUCE: "Lettuce",
    CUCUMBER: "Cucumber",
    ONION: "Onion",
  };

  const UNITS = ["KG", "BAG", "CRATE", "BUNCH", "BOX", "PIECE"];

  const VEHICLE_TYPES = {
    MOTORBIKE: "Motorbike",
    TRICYCLE: "Tricycle",
    PICKUP: "Pickup",
    MINI_TRUCK: "Mini Truck",
    TRUCK: "Truck",
    OTHER: "Other",
  };

  const ORDER_STATUSES = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    READY_FOR_TRANSPORT: "Ready for Transport",
    PENDING_DISPATCH: "Pending Dispatch",
    IN_TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  const STATUS_COLORS = {
    PENDING: "#F59E0B",
    ACCEPTED: "#3B82F6",
    READY_FOR_TRANSPORT: "#8B5CF6",
    PENDING_DISPATCH: "#6366F1",
    IN_TRANSIT: "#F97316",
    DELIVERED: "#10B981",
    REJECTED: "#EF4444",
    CANCELLED: "#6B7280",
  };

  const MOMO_NETWORKS = ["MTN", "Vodafone", "AirtelTigo"];

  function formatCedis(amount) {
    const num = Number(amount);
    if (isNaN(num)) return "GH\u20B50.00";
    return "GH\u20B5" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getCategoryLabel(enumVal) {
    return CATEGORIES[enumVal] || enumVal;
  }

  function getUnitLabel(unit) {
    return unit ? unit.toLowerCase() + "s" : "";
  }

  function getStatusLabel(status) {
    return ORDER_STATUSES[status] || status;
  }

  function getStatusColor(status) {
    return STATUS_COLORS[status] || "#6B7280";
  }

  function getVehicleLabel(type) {
    return VEHICLE_TYPES[type] || type;
  }

  function debounce(fn, delay) {
    let timer;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^\+?[\d\s\-()]{10,}$/.test(phone);
  }

  function validatePassword(pw) {
    const errors = [];
    if (pw.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(pw)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(pw)) errors.push("One lowercase letter");
    if (!/\d/.test(pw)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(pw)) errors.push("One special character");
    return errors;
  }

  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const obj = {};
    for (const [key, val] of params) {
      obj[key] = val;
    }
    return obj;
  }

  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .map(function (w) { return w[0]; })
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getGreeting(userName) {
    var hour = new Date().getHours();
    var timeGreeting;
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";
    else timeGreeting = "Good evening";
    var name = userName || "there";
    if (name.indexOf(" ") > 0) name = name.split(" ")[0];
    return timeGreeting + ", " + name;
  }

  function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "..." : str;
  }

  function createStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
      "\u2605".repeat(full) +
      (half ? "\u00BD" : "") +
      "\u2606".repeat(empty)
    );
  }

  return {
    CATEGORIES: CATEGORIES,
    UNITS: UNITS,
    VEHICLE_TYPES: VEHICLE_TYPES,
    ORDER_STATUSES: ORDER_STATUSES,
    STATUS_COLORS: STATUS_COLORS,
    MOMO_NETWORKS: MOMO_NETWORKS,
    formatCedis: formatCedis,
    formatDate: formatDate,
    formatDateTime: formatDateTime,
    getCategoryLabel: getCategoryLabel,
    getUnitLabel: getUnitLabel,
    getStatusLabel: getStatusLabel,
    getStatusColor: getStatusColor,
    getVehicleLabel: getVehicleLabel,
    debounce: debounce,
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    validatePassword: validatePassword,
    getParams: getParams,
    getInitials: getInitials,
    getGreeting: getGreeting,
    truncate: truncate,
    createStars: createStars,
  };
})();

function handleBecomeLink(e, type) {
  e.preventDefault();
  var user = HarvConnectAuth.getUser();
  var isLoggedIn = HarvConnectAuth.isAuthenticated();
  if (isLoggedIn && user) {
    HarvConnectComponents.showModal(
      "Switch Account",
      "<p>You are currently logged in as a <strong>" + user.role + "</strong>. To sign up as a " + type + ", you need to log out first.</p><p>Do you want to log out now?</p>",
      [
        { label: "No, Stay Logged In", className: "hc-btn hc-btn-ghost", onclick: "HarvConnectComponents.closeModal()" },
        { label: "Yes, Log Out", className: "hc-btn hc-btn-danger", onclick: "HarvConnectAuth.logout()" },
      ]
    );
  } else {
    window.location.href = "register.html";
  }
}

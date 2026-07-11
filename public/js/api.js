const HarvConnectAPI = (() => {
  const BASE_URL = "/api/v1";

  async function request(method, endpoint, body, isFormData) {
    const headers = {};
    const token = sessionStorage.getItem("hc_token");
    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }
    if (!isFormData && body) {
      headers["Content-Type"] = "application/json";
    }

    const config = { method: method, headers: headers };
    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const res = await fetch(BASE_URL + endpoint, config);
    const data = await res.json();

    if (!res.ok) {
      var err = new Error(data.message || "Request failed");
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  var auth = {
    register: function (payload) {
      return request("POST", "/auth/register", payload);
    },
    login: function (payload) {
      return request("POST", "/auth/login", payload);
    },
    getMe: function () {
      return request("GET", "/auth/me");
    },
    deleteAccount: function () {
      return request("DELETE", "/auth/delete");
    },
    verifyEmail: function (token) {
      return request("POST", "/auth/verify-email", { token: token });
    },
    resendVerification: function (email) {
      return request("POST", "/auth/resend-verification", { email: email });
    },
    forgotPassword: function (email) {
      return request("POST", "/auth/forgot-password", { email: email });
    },
    resetPassword: function (token, password) {
      return request("POST", "/auth/reset-password", { token: token, password: password });
    },
  };

  var products = {
    list: function (params) {
      params = params || {};
      var qs = new URLSearchParams(params).toString();
      return request("GET", "/products" + (qs ? "?" + qs : ""));
    },
    get: function (id) {
      return request("GET", "/products/" + id);
    },
    create: function (formData) {
      return request("POST", "/products", formData, true);
    },
    update: function (id, payload) {
      return request("PATCH", "/products/" + id, payload);
    },
    delete: function (id) {
      return request("DELETE", "/products/" + id);
    },
  };

  var orders = {
    list: function () {
      return request("GET", "/orders");
    },
    get: function (id) {
      return request("GET", "/orders/" + id);
    },
    create: function (payload) {
      return request("POST", "/orders", payload);
    },
    updateStatus: function (id, status) {
      return request("PATCH", "/orders/" + id + "/status", { status: status });
    },
  };

  var tracking = {
    get: function (orderId) {
      return request("GET", "/orders/" + orderId + "/tracking");
    },
    start: function (orderId) {
      return request("POST", "/orders/" + orderId + "/tracking/start");
    },
    markPickedUp: function (orderId) {
      return request("POST", "/orders/" + orderId + "/tracking/picked-up");
    },
    updateLocation: function (orderId, lat, lng) {
      return request("PUT", "/orders/" + orderId + "/tracking/location", { lat: lat, lng: lng });
    },
    markDelivered: function (orderId) {
      return request("POST", "/orders/" + orderId + "/tracking/deliver");
    },
  };

  var profile = {
    updateFarmer: function (payload) {
      return request("PATCH", "/profile/farmer", payload);
    },
    updateBuyer: function (payload) {
      return request("PATCH", "/profile/buyer", payload);
    },
  };

  var transport = {
    updateStatus: function (payload) {
      return request("PUT", "/transport/status", payload);
    },
    listDrivers: function () {
      return request("GET", "/transport/drivers");
    },
  };

  var payments = {
    momo: function (payload) {
      return request("POST", "/payments/momo", payload);
    },
  };

  var reviews = {
    create: function (payload) {
      return request("POST", "/reviews", payload);
    },
    getFarmer: function (farmerId, params) {
      params = params || {};
      var qs = new URLSearchParams(params).toString();
      return request("GET", "/reviews/farmer/" + farmerId + (qs ? "?" + qs : ""));
    },
    getFarmerRating: function (farmerId) {
      return request("GET", "/reviews/farmer/" + farmerId + "/rating");
    },
    getMyReviews: function () {
      return request("GET", "/reviews/my-reviews");
    },
  };

  var recommendations = {
    get: function (commodity) {
      return request("GET", "/recommendations?commodity=" + encodeURIComponent(commodity));
    },
  };

  return {
    auth: auth,
    products: products,
    orders: orders,
    profile: profile,
    transport: transport,
    payments: payments,
    reviews: reviews,
    recommendations: recommendations,
    tracking: tracking,
  };
})();

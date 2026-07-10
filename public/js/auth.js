const HarvConnectAuth = (() => {
  var TOKEN_KEY = "hc_token";
  var USER_KEY = "hc_user";

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function getUser() {
    try {
      var raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  function isAuthenticated() {
    return !!getToken();
  }

  function getRole() {
    var user = getUser();
    return user ? user.role : null;
  }

  async function login(email, password, role) {
    var payload = { email: email, password: password };
    if (role) payload.role = role;
    var res = await HarvConnectAPI.auth.login(payload);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  }

  async function register(payload) {
    var res = await HarvConnectAPI.auth.register(payload);
    return res;
  }

  async function fetchAndCacheUser() {
    try {
      var res = await HarvConnectAPI.auth.getMe();
      setUser(res.data);
      return res.data;
    } catch (e) {
      clearSession();
      return null;
    }
  }

  async function initAuth() {
    if (!isAuthenticated()) return null;
    var user = getUser();
    if (!user) {
      user = await fetchAndCacheUser();
    }
    return user;
  }

  function logout() {
    clearSession();
    window.location.href = "login.html";
  }

  function requireAuth() {
    if (!isAuthenticated()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  function requireRole(expectedRole) {
    var role = getRole();
    if (!role) {
      window.location.href = "login.html";
      return false;
    }
    if (expectedRole && role !== expectedRole) {
      window.location.href = getDashboardPath(role);
      return false;
    }
    return true;
  }

  function getDashboardPath(role) {
    switch (role) {
      case "FARMER": return "farmer-products.html";
      case "BUYER": return "marketplace.html";
      case "TRANSPORT": return "transport.html";
      case "ADMIN": return "marketplace.html";
      default: return "login.html";
    }
  }

  function getLoginRedirect() {
    var role = getRole();
    if (!role) return "login.html";
    return getDashboardPath(role);
  }

  async function forgotPassword(email) {
    return await HarvConnectAPI.auth.forgotPassword(email);
  }

  async function resetPassword(token, password) {
    return await HarvConnectAPI.auth.resetPassword(token, password);
  }

  return {
    getToken: getToken,
    getUser: getUser,
    isAuthenticated: isAuthenticated,
    getRole: getRole,
    login: login,
    register: register,
    forgotPassword: forgotPassword,
    resetPassword: resetPassword,
    fetchAndCacheUser: fetchAndCacheUser,
    initAuth: initAuth,
    logout: logout,
    requireAuth: requireAuth,
    requireRole: requireRole,
    getDashboardPath: getDashboardPath,
    getLoginRedirect: getLoginRedirect,
    clearSession: clearSession,
  };
})();

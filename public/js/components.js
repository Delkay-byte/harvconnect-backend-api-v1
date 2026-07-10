const HarvConnectComponents = (() => {
  var toastTimeout = null;

  function renderHeader(activePage) {
    var user = HarvConnectAuth.getUser();
    var role = user ? user.role : null;
    var isLoggedIn = HarvConnectAuth.isAuthenticated();

    var navLinks = "";
    var mobileLinks = "";

    if (!isLoggedIn) {
      navLinks =
        '<a href="index.html">Home</a>' +
        '<a href="marketplace.html">Marketplace</a>' +
        '<a href="login.html">Login</a>';
      mobileLinks =
        '<a href="index.html" class="mobile-link">Home</a>' +
        '<a href="marketplace.html" class="mobile-link">Marketplace</a>' +
        '<a href="login.html" class="mobile-link highlight">Login</a>';
    } else if (role === "FARMER") {
      navLinks =
        '<a href="farmer-products.html"' + (activePage === "products" ? ' class="active"' : "") + ">My Products</a>" +
        '<a href="farmer-orders.html" class="orders-link-wrap' + (activePage === "orders" ? " active" : "") + '">Orders<span class="orders-badge" id="farmerOrdersBadge"></span></a>' +
        '<a href="marketplace.html"' + (activePage === "marketplace" ? ' class="active"' : "") + ">Marketplace</a>" +
        '<a href="profile.html"' + (activePage === "profile" ? ' class="active"' : "") + ">Profile</a>";
      mobileLinks =
        '<a href="farmer-products.html" class="mobile-link">My Products</a>' +
        '<a href="farmer-orders.html" class="mobile-link">Orders</a>' +
        '<a href="marketplace.html" class="mobile-link">Marketplace</a>' +
        '<a href="profile.html" class="mobile-link">Profile</a>';
    } else if (role === "BUYER") {
      navLinks =
        '<a href="marketplace.html"' + (activePage === "marketplace" ? ' class="active"' : "") + ">Marketplace</a>" +
        '<a href="cart.html" class="cart-link-wrap' + (activePage === "cart" ? " active" : "") + '">Cart<span class="cart-badge" id="cartBadge"></span></a>' +
        '<a href="orders.html"' + (activePage === "orders" ? ' class="active"' : "") + ">Orders</a>" +
        '<a href="profile.html"' + (activePage === "profile" ? ' class="active"' : "") + ">Profile</a>";
      mobileLinks =
        '<a href="marketplace.html" class="mobile-link">Marketplace</a>' +
        '<a href="cart.html" class="mobile-link">Cart</a>' +
        '<a href="orders.html" class="mobile-link">Orders</a>' +
        '<a href="profile.html" class="mobile-link">Profile</a>';
    } else if (role === "TRANSPORT") {
      navLinks =
        '<a href="transport.html"' + (activePage === "transport" ? ' class="active"' : "") + ">Dashboard</a>" +
        '<a href="profile.html"' + (activePage === "profile" ? ' class="active"' : "") + ">Profile</a>";
      mobileLinks =
        '<a href="transport.html" class="mobile-link">Dashboard</a>' +
        '<a href="profile.html" class="mobile-link">Profile</a>';
    }

    var userArea = "";
    if (isLoggedIn && user) {
      var chatBadge = "";
      var chatUnread = typeof HarvConnectChat !== "undefined" ? HarvConnectChat.getUnreadCount(user.id) : 0;
      chatBadge = '<a href="chat.html" class="chat-bell-wrap">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
        (chatUnread > 0 ? '<span class="notif-badge" style="background:var(--hc-info);">' + (chatUnread > 9 ? "9+" : chatUnread) + "</span>" : "") +
        "</a>";
      var notifBadge = "";
      if (role === "BUYER" || role === "TRANSPORT") {
        var unread;
        if (role === "TRANSPORT") {
          unread = typeof HarvConnectNotifications !== "undefined" ? HarvConnectNotifications.getDriverUnreadCount() : 0;
        } else {
          unread = typeof HarvConnectNotifications !== "undefined" ? HarvConnectNotifications.getUnreadCount() : 0;
        }
        var notifLink = role === "TRANSPORT" ? "transport.html#notifications" : "notifications.html";
        notifBadge = '<a href="' + notifLink + '" class="notif-bell-wrap">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>' +
          (unread > 0 ? '<span class="notif-badge">' + (unread > 9 ? "9+" : unread) + "</span>" : "") +
          "</a>";
      }
      userArea =
        '<div class="user-menu-area">' +
          chatBadge +
          notifBadge +
          '<div class="user-avatar-sm" title="' + (user.fullName || "") + '">' +
            HarvConnectUtils.getInitials(user.fullName) +
          "</div>" +
          '<button class="btn-logout-sm" onclick="HarvConnectAuth.logout()" title="Logout">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
          "</button>" +
        "</div>";
    }

    return (
      '<header class="app-header">' +
        '<div class="header-container">' +
          '<div class="logo-area">' +
            '<img src="images/HarvConnect-logo.png" alt="HarvConnect" class="brand-logo" />' +
          "</div>" +
          '<nav class="desktop-nav">' + navLinks + "</nav>" +
          '<div class="cta-group">' +
            (!isLoggedIn ? '<a href="register.html" class="btn-nav-get-started">Get Started</a>' : "") +
            userArea +
            '<button class="menu-toggle-btn" onclick="HarvConnectComponents.toggleMobileMenu()" aria-label="Toggle menu">' +
              '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
            "</button>" +
          "</div>" +
        "</div>" +
        '<nav class="mobile-nav-menu" id="mobileNavMenu">' + mobileLinks + "</nav>" +
      "</header>"
    );
  }

  function renderFooter() {
    var role = HarvConnectAuth.getRole();
    var roleLinks = "";
    if (!role) {
      roleLinks =
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "farmer" + '\');">Become a Farmer</a></li>' +
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "buyer" + '\');">Become a Buyer</a></li>' +
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "transporter" + '\');">Join as Transporter</a></li>';
    } else if (role === "FARMER") {
      roleLinks =
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "buyer" + '\');">Become a Buyer</a></li>' +
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "transporter" + '\');">Join as Transporter</a></li>';
    } else if (role === "BUYER") {
      roleLinks =
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "farmer" + '\');">Become a Farmer</a></li>' +
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "transporter" + '\');">Join as Transporter</a></li>';
    } else if (role === "TRANSPORT") {
      roleLinks =
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "farmer" + '\');">Become a Farmer</a></li>' +
        '<li><a href="#" onclick="handleBecomeLink(event,\'' + "buyer" + '\');">Become a Buyer</a></li>';
    }

    return (
      '<footer class="detailed-footer-new">' +
        '<div class="footer-grid-container-new">' +
          '<div class="footer-identity-column-new">' +
            '<div class="footer-logo-wrap-new">' +
              '<img src="images/HarvConnect-logo.png" alt="HarvConnect" style="height:40px;" />' +
            "</div>" +
            '<p class="footer-tagline-desc-new">' +
              "Connecting Ghana's smallholder farmers directly to buyers. " +
              "Fair prices, fresh produce, reliable delivery." +
            "</p>" +
          "</div>" +
          '<div class="footer-links-column-new">' +
            "<h3>PLATFORM</h3>" +
            '<ul>' +
              '<li><a href="marketplace.html">Marketplace</a></li>' +
              roleLinks +
            "</ul>" +
          "</div>" +
          '<div class="footer-links-column-new">' +
            "<h3>SUPPORT</h3>" +
            '<ul>' +
              '<li><a href="tel:+233500000000">Help Center</a></li>' +
              '<li><a href="mailto:support@harvconnect.com">Email Support</a></li>' +
              '<li><a href="faqs.html">FAQs</a></li>' +
            "</ul>" +
          "</div>" +
        "</div>" +
        '<div class="footer-bottom-bar-new">' +
          "<p>&copy; " + new Date().getFullYear() + " HarvConnect. All rights reserved.</p>" +
        "</div>" +
      "</footer>"
    );
  }

  function toggleMobileMenu() {
    var menu = document.getElementById("mobileNavMenu");
    if (menu) {
      menu.classList.toggle("open");
    }
  }

  function showToast(message, type) {
    type = type || "info";
    var existing = document.querySelector(".hc-toast");
    if (existing) existing.remove();
    if (toastTimeout) clearTimeout(toastTimeout);

    var toast = document.createElement("div");
    toast.className = "hc-toast hc-toast-" + type;

    var icon = "";
    if (type === "success") {
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    } else if (type === "error") {
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else {
      icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    }

    toast.innerHTML =
      '<div class="hc-toast-icon">' + icon + "</div>" +
      '<span class="hc-toast-msg">' + message + "</span>" +
      '<button class="hc-toast-close" onclick="this.parentElement.remove()">&times;</button>';

    document.body.appendChild(toast);

    toastTimeout = setTimeout(function () {
      toast.classList.add("hc-toast-exit");
      setTimeout(function () {
        if (toast.parentElement) toast.remove();
      }, 300);
    }, 4000);
  }

  function showModal(title, content, actions) {
    var existing = document.querySelector(".hc-modal-overlay");
    if (existing) existing.remove();

    var actionsHtml = "";
    if (actions && actions.length) {
      actionsHtml = actions
        .map(function (a) {
          return (
            '<button class="hc-btn ' + (a.className || "hc-btn-outline") + '" onclick="' + (a.onclick || "") + '">' +
              a.label +
            "</button>"
          );
        })
        .join("");
    }

    var overlay = document.createElement("div");
    overlay.className = "hc-modal-overlay";
    overlay.innerHTML =
      '<div class="hc-modal">' +
        '<div class="hc-modal-header">' +
          '<h3>' + title + "</h3>" +
          '<button class="hc-modal-close" onclick="HarvConnectComponents.closeModal()">&times;</button>' +
        "</div>" +
        '<div class="hc-modal-body">' + content + "</div>" +
        (actionsHtml ? '<div class="hc-modal-footer">' + actionsHtml + "</div>" : "") +
      "</div>";

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) HarvConnectComponents.closeModal();
    });

    document.body.appendChild(overlay);
  }

  function closeModal() {
    var overlay = document.querySelector(".hc-modal-overlay");
    if (overlay) overlay.remove();
  }

  function showLoader() {
    var existing = document.getElementById("hc-fullpage-loader");
    if (existing) return;

    var loader = document.createElement("div");
    loader.id = "hc-fullpage-loader";
    loader.className = "hc-fullpage-loader";
    loader.innerHTML =
      '<div class="hc-loader-spinner">' +
        '<div class="hc-spinner"></div>' +
        "<p>Loading...</p>" +
      "</div>";
    document.body.appendChild(loader);
  }

  function hideLoader() {
    var loader = document.getElementById("hc-fullpage-loader");
    if (loader) loader.remove();
  }

  function renderEmptyState(message, icon) {
    icon = icon || '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    return (
      '<div class="hc-empty-state">' +
        '<div class="hc-empty-icon">' + icon + "</div>" +
        '<p class="hc-empty-msg">' + message + "</p>" +
      "</div>"
    );
  }

  function renderErrorState(message, retryFn) {
    var retryBtn = retryFn
      ? '<button class="hc-btn hc-btn-primary" onclick="' + retryFn + '">Try Again</button>'
      : "";
    return (
      '<div class="hc-empty-state">' +
        '<div class="hc-empty-icon">' +
          '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D32F2F" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' +
        "</div>" +
        '<p class="hc-empty-msg">' + (message || "Something went wrong") + "</p>" +
        retryBtn +
      "</div>"
    );
  }

  function renderSkeletonCards(count) {
    var html = "";
    for (var i = 0; i < count; i++) {
      html +=
        '<div class="hc-skeleton-card">' +
          '<div class="hc-skeleton-img"></div>' +
          '<div class="hc-skeleton-line hc-skeleton-w60"></div>' +
          '<div class="hc-skeleton-line hc-skeleton-w40"></div>' +
          '<div class="hc-skeleton-line hc-skeleton-w80"></div>' +
        "</div>";
    }
    return html;
  }

  function renderPagination(meta, onPageClick) {
    if (!meta || meta.totalPages <= 1) return "";
    var html = '<div class="hc-pagination">';
    for (var i = 1; i <= meta.totalPages; i++) {
      var activeClass = i === meta.currentPage ? " hc-pagination-active" : "";
      html +=
        '<button class="hc-pagination-btn' + activeClass + '" onclick="' + onPageClick + "(" + i + ')">' +
          i +
        "</button>";
    }
    html += "</div>";
    return html;
  }

  function updateNotifBadge() {
    var user = HarvConnectAuth.getUser();
    var role = user ? user.role : null;
    if (!role || (role !== "BUYER" && role !== "TRANSPORT")) return;
    var bellWrap = document.querySelector(".notif-bell-wrap");
    if (!bellWrap) return;
    var existingBadge = bellWrap.querySelector(".notif-badge");
    var unread = role === "TRANSPORT"
      ? (typeof HarvConnectNotifications !== "undefined" ? HarvConnectNotifications.getDriverUnreadCount() : 0)
      : (typeof HarvConnectNotifications !== "undefined" ? HarvConnectNotifications.getUnreadCount() : 0);
    if (unread > 0) {
      if (existingBadge) {
        existingBadge.textContent = unread > 9 ? "9+" : unread;
      } else {
        var badge = document.createElement("span");
        badge.className = "notif-badge";
        badge.textContent = unread > 9 ? "9+" : unread;
        bellWrap.appendChild(badge);
      }
    } else {
      if (existingBadge) existingBadge.remove();
    }
  }

  var PASSWORD_TOGGLES = {};

  function updateChatBadge() {
    var user = HarvConnectAuth.getUser();
    if (!user) return;
    var wraps = document.querySelectorAll(".chat-bell-wrap");
    var unread = typeof HarvConnectChat !== "undefined" ? HarvConnectChat.getUnreadCount(user.id) : 0;
    wraps.forEach(function (wrap) {
      var existingBadge = wrap.querySelector(".notif-badge");
      if (unread > 0) {
        if (existingBadge) {
          existingBadge.textContent = unread > 9 ? "9+" : unread;
        } else {
          var badge = document.createElement("span");
          badge.className = "notif-badge";
          badge.style.background = "var(--hc-info)";
          badge.textContent = unread > 9 ? "9+" : unread;
          wrap.appendChild(badge);
        }
      } else {
        if (existingBadge) existingBadge.remove();
      }
    });
  }

  function getCartCount() {
    try {
      var cart = JSON.parse(sessionStorage.getItem("hc_cart") || "[]");
      return cart.reduce(function (s, item) { return s + item.quantity; }, 0);
    } catch (e) { return 0; }
  }

  function updateCartBadge() {
    var badge = document.getElementById("cartBadge");
    if (!badge) return;
    var count = getCartCount();
    if (count > 0) {
      badge.textContent = count > 9 ? "9+" : count;
      badge.style.display = "";
    } else {
      badge.style.display = "none";
    }
  }

  function updateFarmerOrdersBadge() {
    var badge = document.getElementById("farmerOrdersBadge");
    if (!badge) return;
    var unread = typeof HarvConnectNotifications !== "undefined" ? HarvConnectNotifications.getFarmerUnreadCount() : 0;
    if (unread > 0) {
      badge.textContent = unread > 9 ? "9+" : unread;
      badge.style.display = "";
    } else {
      badge.style.display = "none";
    }
  }

  function setupPasswordToggle(inputId) {
    if (PASSWORD_TOGGLES[inputId]) return;
    var input = document.getElementById(inputId);
    if (!input) return;

    var wrap = document.createElement("div");
    wrap.className = "pw-input-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pw-toggle-btn";
    btn.setAttribute("aria-label", "Toggle password visibility");
    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    wrap.appendChild(btn);

    var showing = false;
    btn.addEventListener("click", function () {
      showing = !showing;
      input.type = showing ? "text" : "password";
      btn.innerHTML = showing
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    });

    PASSWORD_TOGGLES[inputId] = true;
  }

  function setupNotifListener() {
    var user = HarvConnectAuth.getUser();
    var role = user ? user.role : null;
    if (role !== "BUYER" && role !== "TRANSPORT") return;
    window.addEventListener("storage", function (e) {
      if (e.key && (e.key.indexOf("hc_notif_") === 0)) {
        updateNotifBadge();
      }
      if (e.key && (e.key.indexOf("hc_chat") === 0 || e.key === "hc_chat_idx")) {
        updateChatBadge();
      }
    });
  }

  if (typeof HarvConnectAuth !== "undefined" && HarvConnectAuth.getUser()) {
    var _role = HarvConnectAuth.getRole();
    if (_role === "BUYER" || _role === "TRANSPORT") {
      setupNotifListener();
    }
    if (typeof HarvConnectChat !== "undefined") {
      updateChatBadge();
      window.addEventListener("storage", function (e) {
        if (e.key && (e.key.indexOf("hc_chat") === 0 || e.key === "hc_chat_idx")) {
          updateChatBadge();
        }
      });
    }
    if (_role === "BUYER") {
      updateCartBadge();
    }
    if (_role === "FARMER") {
      updateFarmerOrdersBadge();
      window.addEventListener("storage", function (e) {
        if (e.key && e.key.indexOf("hc_farmer_notif_") === 0) {
          updateFarmerOrdersBadge();
        }
      });
    }
  }

  return {
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    toggleMobileMenu: toggleMobileMenu,
    showToast: showToast,
    showModal: showModal,
    closeModal: closeModal,
    showLoader: showLoader,
    hideLoader: hideLoader,
    renderEmptyState: renderEmptyState,
    renderErrorState: renderErrorState,
    renderSkeletonCards: renderSkeletonCards,
    renderPagination: renderPagination,
    updateNotifBadge: updateNotifBadge,
    setupNotifListener: setupNotifListener,
    setupPasswordToggle: setupPasswordToggle,
    updateCartBadge: updateCartBadge,
    updateFarmerOrdersBadge: updateFarmerOrdersBadge,
    getCartCount: getCartCount,
  };
})();

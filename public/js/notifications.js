const HarvConnectNotifications = (() => {
  var NOTIF_PREFIX = "hc_notif_";
  var DRIVER_NOTIF_PREFIX = "hc_notif_driver_";

  function getNotifKey(orderId) {
    return NOTIF_PREFIX + orderId;
  }

  function createNotification(orderId, data) {
    var key = getNotifKey(orderId);
    var existing = localStorage.getItem(key);
    if (existing) return;
    var notif = {
      orderId: orderId,
      orderNumber: data.orderNumber || orderId.slice(0, 8),
      productName: data.productName || "Product",
      buyerId: data.buyerId || "",
      farmerId: data.farmerId || "",
      buyerName: data.buyerName || "Buyer",
      farmerName: data.farmerName || "Farmer",
      status: data.status || "ACCEPTED",
      message: data.message || "Your order has been accepted by the farmer.",
      timestamp: Date.now(),
      read: false,
      dismissed: false,
    };
    localStorage.setItem(key, JSON.stringify(notif));
    return notif;
  }

  function getNotifications() {
    var notifs = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(NOTIF_PREFIX) === 0) {
        try {
          var n = JSON.parse(localStorage.getItem(key));
          if (!n.dismissed) notifs.push(n);
        } catch (e) {}
      }
    }
    notifs.sort(function (a, b) { return b.timestamp - a.timestamp; });
    return notifs;
  }

  function getUnreadCount() {
    return getNotifications().filter(function (n) { return !n.read; }).length;
  }

  function markAsRead(orderId) {
    var key = getNotifKey(orderId);
    var raw = localStorage.getItem(key);
    if (raw) {
      try {
        var n = JSON.parse(raw);
        n.read = true;
        localStorage.setItem(key, JSON.stringify(n));
      } catch (e) {}
    }
  }

  function dismissNotification(orderId) {
    var key = getNotifKey(orderId);
    var raw = localStorage.getItem(key);
    if (raw) {
      try {
        var n = JSON.parse(raw);
        n.dismissed = true;
        localStorage.setItem(key, JSON.stringify(n));
      } catch (e) {}
    }
  }

  function clearAll() {
    var toRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(NOTIF_PREFIX) === 0) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(function (k) { localStorage.removeItem(k); });
  }

  function pollNotifications(callback, interval) {
    interval = interval || 5000;
    return setInterval(function () {
      callback(getNotifications());
    }, interval);
  }

  function getDriverNotifKey(driverId, orderId) {
    return DRIVER_NOTIF_PREFIX + driverId + "_" + orderId;
  }

  function createDriverNotification(driverId, data) {
    var key = getDriverNotifKey(driverId, data.orderId);
    var existing = localStorage.getItem(key);
    if (existing) return;
    var notif = {
      driverId: driverId,
      orderId: data.orderId,
      orderNumber: data.orderNumber || (data.orderId || "").slice(0, 8),
      productName: data.productName || "Product",
      buyerName: data.buyerName || "Buyer",
      buyerPhone: data.buyerPhone || "",
      pickupAddress: data.pickupAddress || "",
      deliveryAddress: data.deliveryAddress || "",
      farmerId: data.farmerId || "",
      farmerName: data.farmerName || "Farmer",
      message: data.message || "You have been selected for a delivery!",
      timestamp: Date.now(),
      read: false,
      dismissed: false,
    };
    localStorage.setItem(key, JSON.stringify(notif));
    return notif;
  }

  function getDriverNotifications() {
    var notifs = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(DRIVER_NOTIF_PREFIX) === 0) {
        try {
          var n = JSON.parse(localStorage.getItem(key));
          if (!n.dismissed) notifs.push(n);
        } catch (e) {}
      }
    }
    notifs.sort(function (a, b) { return b.timestamp - a.timestamp; });
    return notifs;
  }

  function getDriverUnreadCount() {
    return getDriverNotifications().filter(function (n) { return !n.read; }).length;
  }

  function markDriverNotifAsRead(key) {
    var raw = localStorage.getItem(key);
    if (raw) {
      try {
        var n = JSON.parse(raw);
        n.read = true;
        localStorage.setItem(key, JSON.stringify(n));
      } catch (e) {}
    }
  }

  function dismissDriverNotif(key) {
    var raw = localStorage.getItem(key);
    if (raw) {
      try {
        var n = JSON.parse(raw);
        n.dismissed = true;
        localStorage.setItem(key, JSON.stringify(n));
      } catch (e) {}
    }
  }

  function clearDriverNotifications() {
    var toRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(DRIVER_NOTIF_PREFIX) === 0) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(function (k) { localStorage.removeItem(k); });
  }

  var FARMER_NOTIF_PREFIX = "hc_farmer_notif_";

  function getFarmerNotifKey(farmerId, orderId) {
    return FARMER_NOTIF_PREFIX + farmerId + "_" + orderId;
  }

  function createFarmerNotification(farmerId, data) {
    var key = getFarmerNotifKey(farmerId, data.orderId);
    var existing = localStorage.getItem(key);
    if (existing) return;
    var notif = {
      farmerId: farmerId,
      orderId: data.orderId,
      orderNumber: data.orderNumber || (data.orderId || "").slice(0, 8),
      productName: data.productName || "Product",
      buyerId: data.buyerId || "",
      buyerName: data.buyerName || "Buyer",
      message: data.message || "New order received!",
      timestamp: Date.now(),
      read: false,
      dismissed: false,
    };
    localStorage.setItem(key, JSON.stringify(notif));
    return notif;
  }

  function getFarmerNotifications(farmerId) {
    var notifs = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(FARMER_NOTIF_PREFIX + (farmerId || "")) === 0) {
        try {
          var n = JSON.parse(localStorage.getItem(key));
          if (!n.dismissed) notifs.push(n);
        } catch (e) {}
      }
    }
    notifs.sort(function (a, b) { return b.timestamp - a.timestamp; });
    return notifs;
  }

  function getFarmerUnreadCount(farmerId) {
    if (farmerId) {
      return getFarmerNotifications(farmerId).filter(function (n) { return !n.read; }).length;
    }
    var count = 0;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(FARMER_NOTIF_PREFIX) === 0) {
        try {
          var n = JSON.parse(localStorage.getItem(key));
          if (!n.read && !n.dismissed) count++;
        } catch (e) {}
      }
    }
    return count;
  }

  function markFarmerNotifAsRead(farmerId, orderId) {
    var key = getFarmerNotifKey(farmerId, orderId);
    var raw = localStorage.getItem(key);
    if (raw) {
      try {
        var n = JSON.parse(raw);
        n.read = true;
        localStorage.setItem(key, JSON.stringify(n));
      } catch (e) {}
    }
  }

  return {
    createNotification: createNotification,
    getNotifications: getNotifications,
    getUnreadCount: getUnreadCount,
    markAsRead: markAsRead,
    dismissNotification: dismissNotification,
    clearAll: clearAll,
    pollNotifications: pollNotifications,
    createDriverNotification: createDriverNotification,
    getDriverNotifications: getDriverNotifications,
    getDriverUnreadCount: getDriverUnreadCount,
    markDriverNotifAsRead: markDriverNotifAsRead,
    dismissDriverNotif: dismissDriverNotif,
    clearDriverNotifications: clearDriverNotifications,
    createFarmerNotification: createFarmerNotification,
    getFarmerNotifications: getFarmerNotifications,
    getFarmerUnreadCount: getFarmerUnreadCount,
    markFarmerNotifAsRead: markFarmerNotifAsRead,
  };
})();

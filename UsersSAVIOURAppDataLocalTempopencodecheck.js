
    (function () {
      document.getElementById("header").innerHTML = HarvConnectComponents.renderHeader("");
      document.getElementById("footer").innerHTML = HarvConnectComponents.renderFooter();

      if (!HarvConnectAuth.requireAuth()) return;

      var content = document.getElementById("transportContent");
      var params = HarvConnectUtils.getParams();
      var orderId = params.orderId || "";
      var _cachedDrivers = [];
      var _cachedOrder = null;

      var BASE_RATE_PER_KM = 3.50;
      var RATES = {
        MOTORBIKE: { base: 5, perKm: 2.00 },
        TRICYCLE: { base: 8, perKm: 2.50 },
        PICKUP: { base: 12, perKm: 3.50 },
        MINI_TRUCK: { base: 18, perKm: 4.50 },
        TRUCK: { base: 25, perKm: 6.00 },
        OTHER: { base: 10, perKm: 3.00 },
      };

      var MOCK_DRIVERS = [];

      var DEFAULT_LAT = 5.6037;
      var DEFAULT_LNG = -0.1870;

      function haversine(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      }

      function calculatePrice(vehicleType, distanceKm) {
        var rate = RATES[vehicleType] || RATES.OTHER;
        return rate.base + (rate.perKm * distanceKm);
      }

      async function loadTransport() {
        content.innerHTML = HarvConnectComponents.renderSkeletonCards(3);

        var buyerLat = DEFAULT_LAT;
        var buyerLng = DEFAULT_LNG;
        var user = HarvConnectAuth.getUser();
        var bp = user && user.buyerProfile;
        if (bp && bp.latitude && bp.longitude) {
          buyerLat = parseFloat(bp.latitude);
          buyerLng = parseFloat(bp.longitude);
        }

        var liveDrivers = [];
        try {
          var res = await HarvConnectAPI.transport.listDrivers();
          liveDrivers = (res.data && (res.data.drivers || res.data)) || [];
        } catch (e) {
          // Fall back to mock data
        }

        var allDrivers = liveDrivers.length > 0 ? liveDrivers : MOCK_DRIVERS;
        var available = allDrivers.filter(function (d) {
          var tp = d.transportProfile || {};
          return tp.isAvailable !== false;
        });

        if (available.length === 0) available = allDrivers;

        var driversWithData = available.map(function (d) {
          var tp = d.transportProfile || {};
          var dLat = parseFloat(tp.currentLat || DEFAULT_LAT);
          var dLng = parseFloat(tp.currentLng || DEFAULT_LNG);
          var dist = haversine(buyerLat, buyerLng, dLat, dLng);
          var vehicleType = tp.vehicleType || "OTHER";
          var price = calculatePrice(vehicleType, dist);
          return { driver: d, profile: tp, distance: dist, price: price, vehicleType: vehicleType };
        });

        if (orderId) {
          try {
            var ordersRes = await HarvConnectAPI.orders.list();
            var ordersList = ordersRes.data || [];
            _cachedOrder = ordersList.find(function (o) { return o.id === orderId; }) || null;
          } catch (e) {}
        }

        driversWithData.sort(function (a, b) { return a.price - b.price; });
        _cachedDrivers = driversWithData;

        var recommendedIdx = 0;
        for (var i = 0; i < driversWithData.length; i++) {
          if (driversWithData[i].distance < 20) { recommendedIdx = i; break; }
        }

        var nearest = driversWithData.length > 0 ? driversWithData[0] : null;

        var tripInfoHtml = '<div class="transport-search-area">' +
          '<h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Your Trip</h3>' +
          '<div class="trip-info">' +
            '<div class="trip-info-item"><label>Your Location</label><span>' + (bp && bp.deliveryAddress ? bp.deliveryAddress : "Accra, Ghana") + "</span></div>" +
            '<div class="trip-info-item"><label>Distance Range</label><span>' + (driversWithData.length > 0 ? driversWithData[driversWithData.length-1].distance.toFixed(1) : "0") + " km max</span></div>" +
            (nearest ? '<div class="trip-info-item"><label>Starting From</label><span>GH\u20B5' + nearest.price.toFixed(2) + "</span></div>" : "") +
            '<div class="trip-info-item"><label>Drivers Available</label><span>' + driversWithData.length + "</span></div>" +
          "</div>" +
        "</div>";

        var driversHtml = '<div style="margin-top:16px;">' +
          '<h3 style="font-size:16px;font-weight:700;margin-bottom:12px;">Available Drivers</h3>';

        if (driversWithData.length === 0) {
          driversHtml += '<p style="font-size:14px;color:var(--hc-text-gray);">No drivers available at the moment.</p>';
        } else {
          driversHtml += driversWithData.map(function (item, idx) {
            var d = item.driver;
            var tp = item.profile;
            var isRec = idx === recommendedIdx;
            var distText = item.distance < 1 ? item.distance.toFixed(2) + " km" : item.distance.toFixed(1) + " km";

            return (
              '<div class="driver-card-t' + (isRec ? " recommended" : "") + '">' +
                '<div class="driver-avatar-t">' + HarvConnectUtils.getInitials(d.fullName) + "</div>" +
                '<div class="driver-info-t">' +
                  '<div class="driver-name-t">' + (d.fullName || "Driver") + (isRec ? '<span class="recommended-badge-t">Best Match</span>' : "") + "</div>" +
                  '<div class="driver-meta-t">' +
                    '<span>' + HarvConnectUtils.getVehicleLabel(tp.vehicleType) + "</span>" +
                    '<span>' + (tp.capacity || 0) + " kg</span>" +
                    '<span>' + (tp.currentRegion || "N/A") + "</span>" +
                  "</div>" +
                  '<div class="driver-meta-t">' +
                    '<span>&#128205; ' + distText + " away</span>" +
                    '<span>' + (tp.currentAddress || "") + "</span>" +
                  "</div>" +
                  '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">' +
                    '<button class="hc-btn hc-btn-primary hc-btn-sm select-driver-btn" onclick="selectDriver(\'' + (d.id || idx) + "','" + orderId + "')\">Select Driver</button>" +
                    (d.phone ? '<a href="https://wa.me/' + d.phone.replace(/[^0-9]/g, "") + '?text=Hello%20' + encodeURIComponent(d.fullName || "Driver") + '%2C%20I%20need%20transport%20for%20my%20farm%20produce." target="_blank" class="hc-btn hc-btn-outline hc-btn-sm" title="WhatsApp">' +
                      '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
                    "</a>" : "") +
                    '<button class="hc-btn hc-btn-ghost hc-btn-sm" onclick="chatWithDriver(\'' + (d.id || idx) + "','" + (d.fullName || "Driver").replace(/'/g, "\\'") + "')\" title=\"Chat " + (d.fullName || "Driver") + "\">' +
                      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
                    "</button>" +
                  "</div>" +
                "</div>" +
                '<div class="driver-price-t">' +
                  '<div class="driver-price-amount">GH\u20B5' + item.price.toFixed(2) + "</div>" +
                  '<div class="driver-price-label">incl. ' + distText + " trip</div>" +
                "</div>" +
              "</div>"
            );
          }).join("");
        }
        driversHtml += "</div>";

        content.innerHTML = tripInfoHtml + driversHtml;
      }

      window.selectDriver = function (driverId, orderId) {
        if (orderId) {
          HarvConnectNotifications.dismissNotification(orderId);
        }
        var user = HarvConnectAuth.getUser();
        var selected = _cachedDrivers.find(function (item) { return (item.driver.id || _cachedDrivers.indexOf(item)) == driverId; });
        if (selected && user) {
          var buyerProfile = user.buyerProfile || {};
          var order = _cachedOrder || {};
          var orderProduct = order.product || {};
          var farmerId = (order.farmer && order.farmer.id) || "";
          var farmerName = (order.farmer && order.farmer.fullName) || "Farmer";
          HarvConnectNotifications.createDriverNotification(selected.driver.id || driverId, {
            orderId: orderId,
            orderNumber: order.orderNumber || orderId.slice(0, 8),
            productName: orderProduct.name || (order.productName || "Farm Produce"),
            buyerName: user.fullName || "Buyer",
            buyerPhone: user.phone || "",
            pickupAddress: (order.farmer && order.farmer.farmAddress) || (order.farmAddress || "Farm location"),
            deliveryAddress: buyerProfile.deliveryAddress || (order.deliveryAddress || "Buyer location"),
            farmerId: farmerId,
            farmerName: farmerName,
            message: "New delivery request from " + (user.fullName || "a buyer") + " — " + (orderProduct.name || "produce") + " needs to be picked up from the farm and delivered.",
          });
          // Auto-create chat between transporter and farmer
          if (farmerId && selected.driver.id) {
            HarvConnectChat.getOrCreateChat({
              participant1Id: selected.driver.id,
              participant1Name: selected.driver.fullName || "Transporter",
              participant1Role: "TRANSPORT",
              participant2Id: farmerId,
              participant2Name: farmerName,
              participant2Role: "FARMER",
              orderId: orderId,
            });
            HarvConnectComponents.updateChatBadge();
          }
        }
        HarvConnectComponents.updateNotifBadge();
        HarvConnectComponents.showToast("Driver selected! They will be notified to pick up your order.", "success");
        setTimeout(function () { window.location.href = "orders.html"; }, 1200);
      };

      window.chatWithDriver = function (driverId, driverName) {
        var user = HarvConnectAuth.getUser();
        if (!user) return;
        HarvConnectChat.getOrCreateChat({
          participant1Id: user.id,
          participant1Name: user.fullName || "Me",
          participant1Role: "BUYER",
          participant2Id: driverId,
          participant2Name: driverName || "Driver",
          participant2Role: "TRANSPORT",
          orderId: orderId || "",
        });
        window.location.href = "chat.html?chat=chat_" + HarvConnectChat.getChatId(user.id, driverId);
      };

      loadTransport();
    })();
  
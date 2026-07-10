const HarvConnectChat = (() => {
  var CHAT_IDX_KEY = "hc_chat_idx";

  function getChatIndex() {
    try {
      var raw = localStorage.getItem(CHAT_IDX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveChatIndex(idx) {
    localStorage.setItem(CHAT_IDX_KEY, JSON.stringify(idx));
  }

  function getChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
  }

  function getOrCreateChat(opts) {
    var idx = getChatIndex();
    var chatId = "chat_" + getChatId(opts.participant1Id, opts.participant2Id);
    var existing = idx.find(function (c) { return c.chatId === chatId; });
    if (!existing) {
      existing = {
        chatId: chatId,
        participants: [opts.participant1Id, opts.participant2Id],
        participantNames: {},
        participantRoles: {},
        orderId: opts.orderId || "",
        lastMessage: "",
        lastTimestamp: Date.now(),
        unread: {},
      };
      existing.participantNames[opts.participant1Id] = opts.participant1Name;
      existing.participantNames[opts.participant2Id] = opts.participant2Name;
      existing.participantRoles[opts.participant1Id] = opts.participant1Role;
      existing.participantRoles[opts.participant2Id] = opts.participant2Role;
      existing.unread[opts.participant1Id] = 0;
      existing.unread[opts.participant2Id] = 0;
      idx.push(existing);
      saveChatIndex(idx);
    }
    return existing;
  }

  function getMessages(chatId) {
    try {
      var key = chatId + "_msgs";
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function sendMessage(chatId, senderId, senderName, text) {
    var msgs = getMessages(chatId);
    var msg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      senderId: senderId,
      senderName: senderName,
      text: text,
      timestamp: Date.now(),
    };
    msgs.push(msg);
    localStorage.setItem(chatId + "_msgs", JSON.stringify(msgs));

    var idx = getChatIndex();
    var chat = idx.find(function (c) { return c.chatId === chatId; });
    if (chat) {
      chat.lastMessage = text;
      chat.lastTimestamp = Date.now();
      chat.participants.forEach(function (p) {
        if (p !== senderId) chat.unread[p] = (chat.unread[p] || 0) + 1;
      });
      saveChatIndex(idx);
    }
    return msg;
  }

  function getUserChats(userId) {
    return getChatIndex().filter(function (c) {
      return c.participants.indexOf(userId) !== -1;
    }).sort(function (a, b) {
      return b.lastTimestamp - a.lastTimestamp;
    });
  }

  function markAsRead(chatId, userId) {
    var idx = getChatIndex();
    var chat = idx.find(function (c) { return c.chatId === chatId; });
    if (chat) {
      chat.unread[userId] = 0;
      saveChatIndex(idx);
    }
  }

  function getUnreadCount(userId) {
    return getChatIndex().reduce(function (sum, c) {
      return sum + (c.unread[userId] || 0);
    }, 0);
  }

  return {
    getChatId: getChatId,
    getOrCreateChat: getOrCreateChat,
    getMessages: getMessages,
    sendMessage: sendMessage,
    getUserChats: getUserChats,
    markAsRead: markAsRead,
    getUnreadCount: getUnreadCount,
  };
})();

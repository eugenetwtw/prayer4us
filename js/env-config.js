// API key is now handled server-side via /api/chat
// This file is kept for backward compatibility with index.html
window.ENV = window.ENV || {};
window.getApiKey = async function() { return ''; };

// src/utils/ids.js
export const generateLocalId = (len = 8) => Math.random().toString(36).slice(2, 2 + len);
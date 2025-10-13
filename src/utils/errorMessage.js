export function toUserMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (!err) return fallback;
  const msg = typeof err === 'string' ? err : (err.message || err.error || err.msg || fallback);
  // hide technical texts
  if (/ECONN|NetworkError|CORS|JSON|stack|trace|token|jwt|mongodb|mongoose|cloudinary|multer|nominatim|geoapify/i.test(msg)) {
    return fallback;
  }
  // common replacements
  if (/unauthorized|forbidden|auth/i.test(msg)) return 'Please sign in to continue.';
  if (/not found/i.test(msg)) return 'Requested resource was not found.';
  if (/timeout/i.test(msg)) return 'Request timed out. Please try again.';
  if (/validation|required/i.test(msg)) return 'Please fill all required fields correctly.';
  return msg;
}



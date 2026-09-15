export const standardRecordingMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/mp4",
] as const;

export const appleRecordingMimeTypes = [
  "audio/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
] as const;

export function isAppleTouchDevice(userAgent: string, touchPoints = 0) {
  return /iPad|iPhone|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1);
}

export function selectRecordingMimeType(
  userAgent: string,
  touchPoints: number,
  supports: (mimeType: string) => boolean,
) {
  const candidates = isAppleTouchDevice(userAgent, touchPoints) ? appleRecordingMimeTypes : standardRecordingMimeTypes;
  for (const mimeType of candidates) {
    try {
      if (supports(mimeType)) return mimeType;
    } catch {
      // Some older browsers expose MediaRecorder but throw while checking codecs.
    }
  }
  return undefined;
}

export function recorderErrorMessage(name?: string) {
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Micro đang bị chặn. Nhờ người lớn cho phép micro trong cài đặt trình duyệt, hoặc chọn cách nói trực tiếp.";
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return "Thiết bị chưa tìm thấy micro. Con vẫn có thể luyện bằng cách nói trực tiếp.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Micro đang được ứng dụng khác sử dụng. Đóng ứng dụng đó rồi thử lại, hoặc chọn cách nói trực tiếp.";
  }
  if (name === "OverconstrainedError") {
    return "Micro không hỗ trợ cấu hình ghi âm này. Con hãy thử lại hoặc chọn cách nói trực tiếp.";
  }
  return "Chưa mở được micro trên thiết bị này. Con vẫn có thể nói thành tiếng rồi tự đánh giá.";
}

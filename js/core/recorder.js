// js/core/recorder.js — 말하며 녹음하기 (브라우저 마이크). 녹음은 앱을 닫으면 사라져요.
let rec = null, chunks = [], stream = null, startedAt = 0;
const clips = {}; // 질문 id → 마지막 녹음 주소

export const supported = () => !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);
export const isRecording = () => !!rec && rec.state === 'recording';
export const elapsed = () => (isRecording() ? Math.floor((Date.now() - startedAt) / 1000) : 0);

export async function start(id) {
  if (!supported()) throw new Error('이 브라우저에서는 녹음을 쓸 수 없어요');
  stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  chunks = [];
  rec = new MediaRecorder(stream);
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.onstop = () => {
    if (chunks.length) clips[id] = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
    stream?.getTracks().forEach(t => t.stop());
    rec = null;
  };
  rec.start();
  startedAt = Date.now();
}
export function stop() {
  if (isRecording()) rec.stop();
}
export const clip = id => clips[id];
export function play(id) {
  const url = clips[id];
  if (!url) return false;
  new Audio(url).play();
  return true;
}

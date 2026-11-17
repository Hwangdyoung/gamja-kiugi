/* 이름 뒤에 붙는 조사(이/가, 은/는)를 받침에 맞춰 고른다.
   한글이 아닌 이름은 받침을 알 수 없어 "이(가)"처럼 둘 다 보여준다. */
export function hasBatchim(name) {
  const c = name.trim().slice(-1).charCodeAt(0);
  if (!(c >= 0xac00 && c <= 0xd7a3)) return null;
  return (c - 0xac00) % 28 !== 0;
}

export function josa(name, withBatchim, without) {
  const h = hasBatchim(name);
  if (h === null) return `${withBatchim}(${without})`;
  return h ? withBatchim : without;
}

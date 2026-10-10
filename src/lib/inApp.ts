/*
 * 카카오톡 안에서 열린 브라우저인지.
 * 카카오톡 안 브라우저는 카메라를 열면 페이지가 처음부터 다시 열려서 사진 찍기가 잘 안 된다.
 */
export const isKakaoInApp = /KAKAOTALK/i.test(navigator.userAgent)

/* 카카오톡이 지원하는 "기본 브라우저로 열기" 주소 */
export function openInExternalBrowserUrl(path: string): string {
  return `kakaotalk://web/openExternal?url=${encodeURIComponent(window.location.origin + path)}`
}

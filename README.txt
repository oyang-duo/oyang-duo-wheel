오양 듀오 돌림판 사이트

파일 구성
- index.html
- style.css
- script.js
- images/preview.png
- images/oyang-donkatsu.png
- images/piggybank.png

기능
- 카카오톡 링크 미리보기용 OG 이미지: images/preview.png
- 돌리기 → 멈추기 → 관성으로 감속 후 정지
- 결과 종류:
  1) 오양민 돈까스: 사진만 표시
  2) 돼지저금통: 사진 + 돼지 이모티콘 떠다님
  3) 꽝: 큰 '꽝' 글자 + 메롱 이모티콘 떠다님

배포 방법
1. 이 폴더 전체를 GitHub 저장소에 업로드
2. Vercel에서 해당 저장소를 Import
3. 배포된 주소를 사용

주의
- 일부 서비스는 og:image에 절대 URL을 더 잘 반영합니다.
- 배포 후 필요하면 index.html의 og:image 값을
  https://당신의주소/images/preview.png
  같은 절대 주소로 바꿔도 됩니다.

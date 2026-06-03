const payload = {
  message: "중소기업이 참여할 수 있는 조달 기회를 파일데이터와 API 근거로 요약해줘.",
  section: "군수품 조달정보"
};

const response = await fetch("http://127.0.0.1:3000/api/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(payload)
});

const data = await response.json();
console.log(JSON.stringify(data, null, 2));

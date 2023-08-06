---
title: "[JavaScript] 간단하게 'yyyy-MM-dd' 포맷 문자열 구하기"
---

JavaScript Date 객체를 자주 사용하는 'yyyy-MM-dd' 포맷의 String 타입으로 변환 하고 싶다면 [toISOString](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) 함수를 이용하면 간편하다. 
`toISOString` 함수는 JS Date 객체를 ISO 형식 문자열로 반환한다.

```javascript
    // Wed Aug 03 2022 10:46:22 GMT+0900 (GMT+09:00) 
    let startDate = new Date();
    
    // '2022-08-03T01:46:22.163Z'
    startDate.toISOString();
```

하지만 ISO String 치환은 기존 Date 객체의 시각을 강제로 UTC 표준 시각으로 변환시키기 때문에 내 Local PC 와 UTC 간의 시차를 적용해주는 과정이 필요하다. 
이 때는 [getTimezoneOffset](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset) 함수를 이용한다. 
현재 로컬 타임존과 UTC 타임존의 시차를 **UTC 시각 기준으로** 환산하여 준다 (분 단위). 
따라서 변환 할 Date 객체에 미리 시차만큼을 더해주면 깔끔하게 로컬 타임존 기준으로 String 을 얻어낼 수 있다.

```javascript
    // UTC 와의 시차 (-540)
    let timeDiff = startDate.getTimezoneOffset();
    // 현재 시각에 차이를 미리 반영한다.
    startDate.setHours(startDate.getHours() - (timeDiff/60));
    // '2022-08-03T10:46:22.163Z'
    startDate.toISOString();
    // '2022-08-03'
    let startDateString = startDate.toISOString().split('T')[0];
```

함수로 간단하게 정리하면 다음과 같다.

```javascript
    function getDateStirng() {
        
    	let nowDate = new Date();
    	let timeDiff = nowDate.getTimezoneOffset();
    	nowDate.setHours(nowDate.getHours() - (timeDiff/60));
    	let nowDateString = nowDate.toISOString().split('T')[0];
        
    	return nowDateString;
    }
```
### References
- [https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString)
- [https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset)

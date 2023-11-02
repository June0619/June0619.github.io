---
title: "[JPA] LocalDateTime 자료형을 PK 혹은 복합키로 사용시 이슈"
tags: 
    - JPA
    - TroubleLog
categories:
    - JPA
---

## 1. 개요
보통 `Date` 타입의 자료형은 PK 로는 사용하지 않는 것이 일반적이지만, 오래 된 DB 스키마에 JPA 를 입히는 경우 복합키 요소 중 하나로 `Date` 자료형이 있는 경우가 있다. 이 때 `EntityManager` 의 find 메소드로도 해당 객체가 찾아지지 않고, 더티체킹의 업데이트 구문도 정상적으로 실행되지 않는 경우가 있다.


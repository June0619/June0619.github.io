---
title: "[운영체제] 1. 운영체제 개요"
tags: 
    - Study
    - OperationgSystem
categories:
    - CS
---

{% include figure path='' caption='' %}


{% include figure path='https://blog.kakaocdn.net/dn/v4Tnd/btrEGJZ3WQf/ZbaS4GDkoJlqOFICdzuQw0/img.png' %}

## 1. 역할

운영체제는 하드웨어 자원을 관리하고 응용 프로그램이 원할하게 실행되도록 관리하는 역할을 수행한다.

- 기존에 운영체제가 없던 환경에서의 문제점
    1. 다양한 환경에서 자원을 할당받는 것에 어려움이 있었다.
    2. 동시에 여러 프로그램을 실행할 시 응용프로그램 끼리의 자원 할당에 어려움이 있었다.

운영체제가 도입된 후 자원의 할당이나 분배에 운영체제가 개입하게 됨으로써 프로그램의 개발 및 실행의 효율성이 증가되었다.

{% include figure path='https://blog.kakaocdn.net/dn/dvmdGP/btryOFvpcq1/85g6TLX63dFGoSRqZDGdD1/img.png' caption='운영체제 도입 전' %}

{% include figure path='https://blog.kakaocdn.net/dn/Brj6V/btryOxdasDr/pWrir8NKnKxdfTw5U5jjBK/img.png' caption='운영체제 도입 후' %}

## 2. 커널

응용 프로그램과 하드웨어 수준의 처리의 가교 역할을 하는 운영체제의 핵심 요소를 **커널**이라 한다.

커널에는 일체형 커널과 마이크로 커널이 있다.

### 일체형 커널

- 장점 : 서비스 간 상호작용이 쉽다.
- 단점 : 일부 요소에서 에러 발생 시 시스템 전체의 장애로 이어질 수 있음
- UNIX 계열 운영체제가 여기에 포함된다.
- 운영체제의 모든 서비스가 커널에 포함되어 있다.

### 마이크로 커널

- 장점 : 확장 및 유지보수가 용이하다.
- 단점 : 서비스 간 데이터 전달이 필요한 경우 통신이 발생한다(소요 발생)
- 커널 내부에 핵심 요소만 남겨놓고 나머지 요소들은 외부로 분리한 커널

## 3. 운영체제의 구성

운영체제 내부에서 담당하는 자원의 성격에 따라 크게 네 가지의 서브시스템(관리자) 로 분류한다.

### 프로세스 관리자
프로세스를 생성하거나 삭제하며, CPU에 효율적으로 프로세스를 할당하기 위한 스케줄링을 담당한다.

### 메모리 관리자
주기억장치를 관리한다. 또한 운영체제 자신이 점유하고 있는 주기억장치 공간을 지키는 역할도 수행한다.

### 장치 관리자
물리적인 장치의 할당 및 반환을 관리한다.

### 파일 관리자
시스템의 모든 파일을 관리한다. 또한 파일의 접근 및 사용 권한을 관리한다.

## 4. 운영체제의 유형

응답시간의 속도와 데이터의 입력 방식에 따라 유형이 구분된다.

### 일괄처리 운영체제
- 예 : 천공카드, OMR 카드
- 작업을 모아서 한꺼번에 처리하는 유형

### 대화형 운영체제
시분할 운영체제라고도 하며 이용자에게 즉각적인 피드백을 제공한다.

### 실시간 운영체제
데이터 처리가 극도로 빨라야 하는 환경에서 사용된다.

### 하이브리드 운영체제
- 현대 PC의 대부분을 점유하고 있다.
- 일괄처리와 대화형 운영체제의 결합형태이다.
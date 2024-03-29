---
title: "[운영체제] 8. 장치 관리"
tags: 
    - Study
    - OperationgSystem
categories:
    - CS
---

{% include figure path='https://blog.kakaocdn.net/dn/v4Tnd/btrEGJZ3WQf/ZbaS4GDkoJlqOFICdzuQw0/img.png' %}
## 1. 장치의 개념

컴퓨터 시스템에는 다양한 장치가 존재한다. 프로세스 관점에서 보면 CPU와 메모리 등 실행에 필수적인 장치가 있는 반면 장치들은 데이터의 입출력에 사용되는 부가적인 장치이다.

입출력 장치들은 장치의 기능적 특징 및 장치 관리자의 관리 특성에 따라 세 가지 범주로 나눈다. 하나의 프로세스에만 할당 가능한 `전용장치`, 여러 프로세스에 할당 가능한 `공용장치`, 그리고 전용장치와 공용장치의 조합인 `가상장치` 등이 있다.

## 2. 장치의 구성

### 논리적 구성

운영체제와 하드웨어는 장치 드라이버 - 장치 제어기 - 장치 순으로 연결되어 있다.

- 장치 제어기

- 장치를 직접적으로 다루는 전자장치로, 장치 안에 포함되거나 독립적으로 존재한다.

- 장치 드라이버

- 응용 프로그램이 요청한 일반적인 입출력 요청을 장치에 맞게 변환한다.

### 물리적 구성

{% include figure path='https://blog.kakaocdn.net/dn/oWkWO/btrEE1NbFpQ/R4bIZr6TKmy09KNXh7wVVK/img.png' caption='입력장치의 물리적 구성' %}

장치의 물리적 구성은 CPU와 메모리, 그리고 나머지 장치들이 버스(bus) 로 연결되어 있는 형태를 띄고 있다.

## 3. 입출력 처리 유형

### 프로그램 방법

프로그램 방법은, CPU만을 이용하여 입출력을 처리하는 것으로 폴링(polling) 을 이용한다.

폴링이란 CPU가 입출력장치의 상태를 지속적으로 확인하여 CPU가 원하는 상태가 될 때까지 기다리는 것이다.

### 인터럽트 방법

인터럽트 방법은 입출력 처리에 인터럽트를 이용하는 것이다.

장치가 특정 상태가 되면 CPU에게 자신의 상태를 알리고, CPU는 진행중이던 명령만 마치고 장치의 인터럽트 요청에 대응하게 된다.

### DMA 방법

DMA(Direct Memory Access)는 DMA 제어기를 이용하여 CPU를 통하지 않고 직접 주기억장치에 접근하여 데이터를 전송하는 방법이다.

CPU와 DMA 모두 메모리를 엑세스하기 때문에 동시에 엑세스 하는 경우 충돌이 발생하나, 이 경우 DMA 제어기에 우선권이 있다.

## 4. 입출력 관리

### 버퍼링

버퍼(buffer)란 입출력 데이터 등의 정보를 전송할 때 임시적으로 데이터를 저장하는 메모리 공간이다. CPU의 데이터 처리 속도와 데이터 전송 속도의 차이로 인한 문제를 버퍼를 통해 해결한다.

{% include figure path='https://blog.kakaocdn.net/dn/BDOr6/btrECu2I7Ke/Ui9I5uHqGq5aAFMncYwTLK/img.png' caption='순환버퍼의 예시' %}

### 스풀링

스풀링(Simultaneous Peripheral Operation On Line, SPOOLing)은 입출력 프로세스와 저속 입출력장치 사이의 데이터 전송을 자기 디스크와 같은 고속 장치를 통하도록 하는 것으로 일종의 버퍼링이다.

프린터등의 장치에서 주로 사용된다.

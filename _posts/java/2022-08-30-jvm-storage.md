---
title: "[Java] Static 멤버를 위한 JVM 스토리지"
tags: 
    - Study
    - Java
categories:
    - Java
---

> 💡Refferecne: https://www.baeldung.com/jvm-static-storage

{% include figure path='https://blog.kakaocdn.net/dn/bxvzbX/btry7rRlJiB/VfYUEYU9cyDqCa8YmPC8g1/img.png' caption='JVM 메모리 구조 도식' %}

### 1. 개요

우리는 종종 JVM의 내부 메모리 할당을 간과하며 작업하고는 한다. 하지만 성능과 코드 품질 향상을 위해서는 JVM 메모리의 기본적인 사항을 공부할 필요가 있다. 이번에는 JVM 저장공간과 static 필드 관해 공부해 볼 예정이다.

### 2. JVM의 메모리 구분

우선 JVM의 메모리 구조를 상기시켜보도록 하자.

#### 2.1 Heap 메모리

힙 메모리는 런타임 저장 공간이다. (애플리케이션 구동 중 실시간으로 운영되는 저장공간이라는 의미이다.) 그리고 모든 JVM 스레드는 힙 메모리를 공유하며, 클래스 인스턴스와 배열등이 생성되면 이 곳에 저장된다. 자바에서는 힙 메모리를 두 가지 공간으로 분류하는데, `young generation` 과 `old generation` 이다. 또한 `young generation`은 내부적으로 `Eden`과 `Survivor space` 으로 분리된다. (`Survivor space`은 From 영역과 To 영역으로 구분된다.) `old generation`은 교수 객체 공간(Tenured) 으로 불리기도 한다. 힙 메모리에 생성된 객체의 라이프 사이클은 가비지 콜렉터(GC)라고 알려진 메모리 관리 시스템에 의해 자동으로 관리된다. 결과적으로 가비지 콜렉터는 객체의 메모리 할당을 해제하거나, 힙 메모리 내의 여러 영역으로 이동시키면서 메모리를 관리한다.

#### 2.2 Non-Heap 메모리

논-힙 메모리는 주로 클래스 구조, 필드, 메서드 데이터, 그리고 메서드의 코드 정보를 저장하는 메서드 영역으로 구성되어 있다. 힙 메모리와 비슷하게 모든 JVM 스레드는 메서드 영역에 접근할 수 있다. Permanent Generation (PermGem) 이라고도 알려진 메소드 영역은 논리적으로 힙 메모리의 일부로 취급되지만 가비지 콜렉팅의 대상이 되지 않을수도 있다. 하지만 Java 8 에서부터 PermGem 영역은 제거되고 MetaSpace 라고 하는 새로운 기본 메모리영역이 도입되었다.

#### 2.3 Cache 메모리

JVM 은 네이티브 코드의 컴파일 및 저장을 위해 캐시 메모리를 예약한다.

### 3. Java 8 이전의 Static 멤버 저장공간

Java 8 이전에는 PermGem 영역에 Static 메서드와 변수들이 저장되었다. 또한 Intern 된 문자열도 이곳에 저장되었다.

### 4. Java 8 이후의 Static 저장 공간

앞서 다루었듯이, PermGem 영역은 Metaspace 영역으로 대체 되었고 static 멤버의 저장 공간 또한 변경되었다. Java 8 이후로 Metaspace 영역은 오로지 클래스의 메타데이터만 저장하고, static 멤버는 Heap 에서 저장하고 유지하도록 변경되었다. (intern 된 문자열도 마찬가지)

### 5. 결론

짧은 기사를 통해 static 멤버를 위한 JVM의 저장공간들을 살펴보았다. 요약하자면 Java 8 이전에는 static 멤버들은 PermGem (Non-Heap 영역) 에 저장되었다. 하지만 Java 8 이후로는 힙 메모리에 저장되도록 변경되었다.

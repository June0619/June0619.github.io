---
title: "[JPA] could not initialize proxy - no Session"
tags: 
    - JPA
    - TroubleLog
categories:
    - JPA
---

## 1. 발생

[김영한 개발자님의 JPA 시리즈](https://www.inflearn.com/roadmaps/149) 수강 후 복습을 겸하여 개인 프로젝트를 진행하던 도중 낯이 익은 예외가 발생했다. 

바로 could not initialize proxy - no Session 예외인데, 관련 정보를 찾아보다 보니 JPA 기본편 수업에서 해당 에러에 대해 'JPA를 사용해서 개발하시다 보면 반드시 한번은 마주칠 에러' 라고 말씀하셨던 내용이 기억이 떠올랐다. 

막상 처음 에러를 발견하고 나서는 강의에서 들었던 내용이 기억이 가물가물 했었던 터라 한번 정리를 해두고자 기록을 남긴다.

## 2. 원인
### 2-1. 해당 에러의 원인
에러의 원인은 다음과 같다.

1. 엔티티의 조인 관계에서 지연 로딩을 사용하는 필드(FetchType.LAZY) 가 있는 엔티티를 조회 시, 해당 엔티티 객체의 프록시 객체가 반환된다.

2. 영속성 컨텍스트 범위 밖에서 위의 프록시 객체가 조인 된 연관 관계 필드를 조회하려고 하면 해당 에러가 발생한다.

{% include figure path='/assets/images/ghost_images/2022/09/image-10.png' caption='FechType.LAZY 상태에서 조인 필드 포함하여 조회 시!' %}

{% include figure path='/assets/images/ghost_images/2022/09/image-12.png' caption='영속성 컨텍스트 밖 (ex: Controller) 에서 프록시 객체 조인 필드 조회 시' %}

### 2-2. 에러 발생 시 상황
1. 에러가 발생한 부분의 엔티티 연관 관계는 회원과 회원-그룹 (1:N) 관계이다.
2. 특정 API 요청 시 Filter 에서 인가(Authorization) 토큰으로 회원에 관한 소속 그룹 정보를 조회한다.
3. 요청 스레드 컨텍스트에 회원 정보를 저장하기 위해 Entity 정보를 DTO 로 변환 한다.
4. DTO 변환 과정에서 영속성 컨텍스트를 빠져나온 엔티티 프록시 객체가 소속 그룹 정보를 요청한다.

{% include figure path='/assets/images/ghost_images/2022/09/image-13.png' %}

{% include figure path='/assets/images/ghost_images/2022/09/image-17.png' %}

## 3. 해결 방법
결국 위 오류는 프록시 객체가 영속성 컨텍스트 범위 밖에서 지연 로딩 필드의 값을 요청 했을 때 발생하는 오류이므로 해결 방법은 크게 세가지로 나눌 수 있다.

### 3-1. 영속성 컨텍스트 범위 내에서 필요한 값을 사용한다. (위 경우에는 DTO 변환)
구조적으로 깔끔해지는 이점은 있겠지만, 만약 자주 호출되는 쿼리라면 호출시마다 LAZY 타입의 필드를 반복해서 추가로 조회하는 N+1 문제가 발생할 수 있다.

### 3-2. FetchType 을 EAGER 로 변경한다. (프록시 객체 사용 X)
필드 FetchType 자체를 바꾸어 버리는 방법인데, 이는 해당 연관 관계 필드의 조인 정보가 필요 없는 경우에도 계속해서 Join 으로 데이터를 가져오기 때문에 불필요한 소요를 발생시킬 수 있다.

### 3-3. FetchJoin 을 사용한다. 
가장 적은 수정 범위 내에서 여러 문제를 동시에 해결할 수 있는 방법이다.  순수 Jpa 의 경우 JPQL 문법에서 `join` 대신 `join fetch` 를, data jpa 사용시에는 `@EntityGraph` 애노테이션을, QueryDSL 사용시에는 `.fetchJoin()` 메서드 체이닝을 통해 적용 가능하다.

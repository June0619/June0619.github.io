---
title: "[Spring] @PostConstruct 내에서 트랜잭션 사용"
slug: 'PostConstruct-내-트랜잭션-획득'
tags: 
    - JPA
    - Spring
    - TroubleLog
categories:
    - Spring
---

## 1. 개요
JPA 를 이용한 테스트 프로젝트를 진행하던 중 초기 데이터를 대량으로 INSERT 해주는 빈을 생성하려 하였다.

`@PostConstruct` 를 통해 Spring Boot 애플리케이션이 기동되는 시점에 작성해둔 로직에 의해 테스트 데이터들이 persist 되는 방식이었다.

하지만 JPA 를 통해 데이터를 Insert 하기 위해서는 트랜잭션이 필요하고, 뭔가 찝찝한 느낌은 들었지만 대충 `@Transactional` 애노테이션만 붙이고 작동을 시켜보았다.

코드를 보면 다음과 같다.

```java
@Component
@Transactional
public class TestDataInit {

    @PersistenceContext
    private EntityManager em;

    @PostConstruct
    public void init() {
        for (int i = 0; i < 50; i++) {
            Member member = new Member("member" + i);
            Reservation reservation = new Reservation(member);
            em.persist(reservation);
        }
    }
}
```

## 2. 문제 발생
하지만 역시나 다음과 같은 에러메시지가 나타나면서 기동에 실패하였다.

```text
Error creating bean with name 'testDataInit': Invocation of init method failed; nested exception is javax.persistence.TransactionRequiredException: No EntityManager with actual transaction available for current thread - cannot reliably process 'persist' call
```

문제는 AOP 실행과 스프링 컨테이너 초기화의 순서 차이때문에 발생했는데, 스프링 컨테이너가 전부 초기화 되어야 AOP가 적용되기 때문에 `@PostConstruct` 애노테이션 (컨테이너 초기화 시점) 에는 선언적 트랜잭션 관리를 사용할 수 없었던 것이다.


{% include figure path='assets/images/posts/2023/2023-09-21-13-39-20.png' caption='' %}


## 3. 해결

가장 간단한 방법은 선언적 트랜잭션 관리 (AOP 사용) 에서 프로그래밍 방식 트랜잭션 관리로 전환하는 것이다.

`PlatformTransactionManager` 인터페이스는 스프링 부트에서 자동으로 주입해주므로 `TrnasactionTemplate` 을 생성하여 트랜잭션을 다음과 같이 수동으로 시작해주면 스프링 컨테이너 시작 시점에 트랜잭션을 획득하여 jpa 를 사용할 수 있다.

```java
@PostConstruct
public void init() {

    TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
    transactionTemplate.execute(status -> {
        for (int i = 0; i < 50; i++) {
            Member member = new Member("member" + i);
            Reservation reservation = new Reservation(member);
            em.persist(reservation);
        }
        return null;
    });
}
```

---
title: "[Spring] @PostConstruct 내에서 트랜잭션 사용"
tags: 
    - JPA
    - Spring
    - TroubleLog
categories:
    - Spring
draft: true
---

## 1. 개요
JPA 를 이용한 테스트 프로젝트를 진행하던 중 초기 데이터를 대량으로 INSERT 해주는 빈을 생성하려 하였다.

`@PostConstruct` 를 통해 Spring Boot 애플리케이션이 기동되는 시점에 작성해둔 로직에 의해 테스트 데이터들이 persist 되는 방식이었다.

하지만 EntityManager 를 사용하기 위해서는 Transaction이 필요하고, 뭔가 찝찝한 느낌은 들었지만 대충 `@Transactional` 애노테이션만 붙이면 작동이 될 것이라 생각하였다.

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

원인을 간략하게 요약하면 `@Transactional` 애노테이션은 AOP를 통하여 Transaction 을 얻어오는데, AOP는 Spring 애플리케이션 컨텍스트가 완전히 초기화가 되어야 실행된다.

## 3. 해결

여러가지 해결 방법이 있지만 나는 트랜잭션을 직접 가져오는 방식을 사용했다.

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

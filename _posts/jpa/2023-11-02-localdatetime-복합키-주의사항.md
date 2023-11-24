---
title: "[JPA] LocalDateTime 자료형을 PK 혹은 복합키로 사용시 이슈"
tags: 
    - JPA
    - TroubleLog
categories:
    - JPA
slug: '복합키-localdatetime-사용시-이슈'
---

## 1. 이슈
시간을 나타내는 타입의 컬럼은 PK 로는 사용하지 않는 것이 일반적이지만, 오래 된 DB 테이블에 JPA 를 사용하는 경우 복합키 요소 중 하나로 시분초를 포함한 `DATE` 자료형이 포함되어 있는 경우가 간혹 있다. 이 때 ORACLE DB를 사용하는 경우 `EntityManager` 의 find 메소드로도 해당 객체가 찾아지지 않고, 더티체킹의 업데이트 구문도 정상적으로 실행되지 않는 경우가 있다. 우선 비슷한 예제 구현을 위해 `ENROLLED_MEMBER` (등록 명부) 테이블 안에 `NAME` 컬럼과 `ENTER_AT` 필드가 복합 PK로 지정되어 있는 상황을 가정해보자.

엔티티를 코드로 표현하면 다음과 같다.

```java
@Embeddable
public class EnrolledMemberCompositeId implements Serializable {

    @Column(name = "NAME")
    private String name;

    @Column(name = "ENTER_AT")
    private LocalDateTime enterAt;

    protected EnrolledMemberCompositeId() {}

    public EnrolledMemberCompositeId(String name, LocalDateTime enterAt) {
        this.name = name;
        this.enterAt = enterAt;
    }
}
```

```java
@Entity
public class EnrolledMember {
    @EmbeddedId
    private EnrolledMemberCompositeId enrolledMemberCompositeId;
    
    protected EnrolledMember() {}
    
    public EnrolledMember(EnrolledMemberCompositeId enrolledMemberCompositeId) {
        this.enrolledMemberCompositeId = enrolledMemberCompositeId;
    }

    //부가적인 필드들
}
```

해당 엔티티의 레포지토리로 저장과 단일 대상 조회 메소드를 구현하면 다음과 같다.

```java
@Repository
@RequiredArgsConstructor
public class EnrolledMemberRepository {

    private final EntityManager entityManager;

    public void save(EnrolledMember enrolledMember) {
        entityManager.persist(enrolledMember);
    }

    public Optional<EnrolledMember> findById(EnrolledMemberCompositeId id) {
        return Optional.ofNullable(entityManager.find(EnrolledMember.class, id));
    }
}
```

문제가 되는 상황은 바로 다음과 같은 상황이다. 
분명 저장 이후 `findById` 메소드에 분명 아이디 복합키 객체를 넣어 조회하였는데 값을 찾을 수가 없다.

{% include figure path='assets/images/posts/2023/2023-11-23-13-54-31.png' caption='실행 결과' %}


## 2. 원인과 해결 방법
처음에 원인을 찾기 위해 다른 복합키 환경에서 테스트를 아무리 해보아도 PK 를 기준으로 조회를 실행했는데 결과가 안나오는 경우가 없어서 한참을 해매다가, p6spy 라이브러리로 SQL을 직접 찍어보고야 원인을 찾았다.

원인은 JPA에서 Oracle 방언을 통해 LocalDateTime 필드를 검색 조건의 파라미터로 변경하게 되면 ISO 포맷의 Datetime 문자열을 그대로 전송하기 때문에 결과를 찾을 수 없다.

JPA 가 생성해준 쿼리는 다음과 같다.

```sql
select enrolledme0_.entered_at as entered_at1_0_0_, enrolledme0_.name as name2_0_0_ 
from enrolled_member enrolledme0_ 
where enrolledme0_.entered_at='2023-11-23T13:53:31.154+0900' and enrolledme0_.name='MEMBER';
```

실제로 결과를 얻기 위한 쿼리는 다음과 같을 것이다.

```sql
select enrolledme0_.entered_at as entered_at1_0_0_, enrolledme0_.name as name2_0_0_ 
from enrolled_member enrolledme0_ 
where enrolledme0_.entered_at='2023-11-23 13:53:31' and enrolledme0_.name='MEMBER';
```

임시로 찾은 해결 방법은 DB의 `Date` 컬럼을 엔티티 객체에서 `String` 자료형으로 컨버팅하여 다루는 방법이다.
`AttributeConverter` 인터페이스를 구현하여 다음과 같은 컨버터를 구현해주면 된다.

```java
@Slf4j
public class DateToStringConverter implements AttributeConverter<String, Date> {

    private SimpleDateFormat sf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Override
    public Date convertToDatabaseColumn(String attribute) {

        Date date = null;
        try {
            date = sf.parse(attribute);
        } catch (ParseException e) {
            log.error("[DateToStringConverter] Date parse error : {}", e.getMessage());
        }

        return date;
    }

    @Override
    public String convertToEntityAttribute(Date dbData) {
        if(dbData != null) {
            return sf.format(dbData);
        }else {
            return null;
        }
    }
}
```

그리고 다음과 같이 엔티티에 컨버터를 선언해준다

```java
    @Convert(converter = DateToStringConverter.class)
    @Column(name = "ENTERED_AT")
    private String enterAt;
```

그 후 테스트 코드를 실행하면 다음과 같이 테스트가 성공하는 것을 확인할 수 있다.

{% include figure path='assets/images/posts/2023/2023-11-24-13-24-59.png' caption='엔티티 수정 후 테스트 결과' %}
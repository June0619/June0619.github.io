---
title: "[Spring] PathVariable 로 Enum 사용하기"
slug: 'pathvariable-Enum-사용'
tags: 
    - Spring
categories:
    - Spring
---

## 1. 개요
특정 API Controller 의 PathVariable 파라미터로 열거 자료형을 사용하고 싶은 경우가 있다. 일반적으로 Spring3.0 이후로 기본 컨버터 중 `String` 자료형을 `Enum` 타입으로 변경해주는 `StringToEnumConverterFactory` 클래스가 등록되어 있으나 해당 컨버터를 그대로 사용할 경우 다음과 같은 단점들이 있다.

1. 내부적인 ENUM 값을 그대로 노출해야 한다. 
2. 자원 경로에는 적합하지 않은 대문자 사용이 강제된다.
3. 해당 ENUM 타입에 등록되어 있지 않은 경로 입력시 404 코드 반환을 위해 `TypeMissMatchException`을 핸들링 해주어야 한다. 

위 상황 구현을 위해 다음과 같은 예제를 가정해보자.

1. 사과(APPLE), 체리(SWEET-CHERRY) 열거 자료형
2. 1번의 Enum 타입을 선택적으로 path variable 로 사용
3. 없는 자료형의 경우 404 반환

```java
public enum Fruit {
    APPLE,
    SWEET_CHERRY;
}
````

```java
@GetMapping("/{fruit}")
public Fruit getFruits(@PathVariable Fruit fruit) {
    return fruit;
}
```

1. 해당 컨트롤러에 ENUM 코드를 요청하기 위해서는 대문자 혹은 언더스코어 사용이 강제된다.
2. 존재하지 않는 Enum 입력 시 `MethodArgumentTypeMismatchException` 가 발생한다.

직접 만든 TypeConvert 를 사용하여 위 문제들을 해결해보자.

## 2. Converter 작성 및 등록
스프링에서 기본적으로 대부분의 자료는 Converter 를 등록하여 관리하지만, 직접 컨버터를 구현하여 등록할 시 기본 컨버터보다 높은 우선순위로 다루어진다.

우선 `String` 을 `Fruit` 자료형으로 변경해주는 컨버터를 구현하여 작성하자.

```java
import org.springframework.core.convert.converter.Converter;

public class StringToFruitConverter implements Converter<String, Fruit> {
    @Override
    public Fruit convert(String source) {
        return Fruit.valueOf(source.toUpperCase().);
    }
}
```

애노테이션 기반 스프링 설정파일을 사용한다면 다음과 같이 구현한 컨버터를 등록한다.

```java
@Configuration
public class WebConfiguration implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToFruitConverter());
    }
}
```

그러면 다음과 같이 호출이 가능해진다. '/apple', '/sweet-cherry'

```text
### 호출 결과
GET http://localhost:8080/api/v1/fruits/sweet-cherry

HTTP/1.1 200 
Content-Type: application/json
Transfer-Encoding: chunked
Date: Tue, 02 Apr 2024 08:03:30 GMT
Keep-Alive: timeout=60
Connection: keep-alive

"SWEET_CHERRY"
Response file saved.
```

## 3. 예외 처리
하지만 아직 존재하지 않는 Enum 타입 호출 시 발생하는 예외는 깔끔하게 처리되지 않았다. 

사용자 입장에서는 단순히 자원 경로를 찾지 못했을 뿐인데 `MethodArgumentTypeMismatchException` 을 핸들링 해주는 것이 썩 좋아보이진 않는다.

왜냐하면 글로벌 Advice 사용시 다른 예외케이스에서 예상치 않은 핸들링이 일어날 수도 있기 때문이다.
해당 상황에 알맞은 예외를 다루고, http status 또한 404 코드를 반환하도록 수정해보자.

우선 Enum Class 의 `valueOf(String name)` 메소드 호출 중 자료형에 없는 name 값이 들어왔을 경우 `IllegalArgumentException` 이 발생하므로 해당 예외를 null 로 변환하여 반환한다.

```java
    public Fruit convert(String source) {
        try {
            return Fruit.valueOf(source.toUpperCase().replace("-", "_"));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
```

이대로 null 을 반환하면 pathVariable 상 존재하는 값이 null 값으로 변환되어 `MissingPathVariableException` 예외가 발생하는데, 이는 해당 파라미터를 `Optional` 객체로 받아주는 것으로 해결할 수 있다.

```java
@RestController
@RequestMapping("/api/v1/fruits")
public class FruitController {

    @GetMapping("/{fruit}")
    public Fruit getFruits(@PathVariable Optional<Fruit> fruit) {
        return fruit.orElseThrow(IllegalArgumentException::new);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(IllegalArgumentException.class)
    public String handleException() {
        return "NOT FOUND PATH";
    }
}
````

다음과 같이 `Optional` 객체로 Enum 존재 여부를 처리함으로써 PathVariable 이 올바르지 않은 예외상황까지 처리해 보았다. 
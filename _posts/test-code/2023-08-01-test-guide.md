---
title: "[Test] 테스트 코드 작성해보기"
tags: 
    - test-code
    - Spring
categories:
    - Test
slug: '테스트-코드-작성해보기'
draft: true
---

## 1. 개요
최근에는 많은 강의나 개발자들의 블로그에서 수도 없이 테스트 코드의 중요성에 대해 강조하고 있지만 실제로 테스트 코드를 작성하고 장애를 예방해본 경험이 없으면 그 가치를 받아들이기 힘들수도 있다. 그럼에도 불구하고 테스트 코드 작성에 관심을 가지고 첫 발을 떼려하는 동료들을 위해 테스트 코드를 작성하면 무엇이 좋은지, 또 어떻게 작성해야 할 지 고민했던 것들을 한번 정리해볼까 한다.

## 2. 테스트 코드의 목적 
우선 다음과 같은 클래스가 존재한다고 생각해보자. 

```java
public class Calculator {

    public int summary(int... numbers) {
        return Arrays.stream(numbers).sum();
    }
}   
```

방금 작성한 `summary` 메소드는 N 개의 정수를 들어오는대로 합쳐주는 간단한 계산 기능을 가지고 있다.

해당 메소드는 직관적으로 기대하는 결과값을 알아낼 수 있다.

하지만 테스트 코드를 굳이 한번 작성해보자.

```java
class CalculatorTest {

    Calculator cal = new Calculator();

    @Test
    void summaryTest() {
        
        int sum = cal.summary(1, 2, 3);
        assertThat(sum).isEqualTo(6);
    }
}
```

테스트는 당연히 성공하겠지만 모두 알다싶이 저런 단순한 비지니스 로직은 실무 코드에서는 많지가 않다.

인자를 모두 더하는 간단한 기능을 악의적인 스파게티 계산기로 만들어 보겠다.










## 3. Junit

## 4. 통합 테스트

## 5. 단위 테스트

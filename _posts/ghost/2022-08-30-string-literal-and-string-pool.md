---
title: [JAVA] String Literal 과 String Pool
slug: string-literal-and-string-pool
date_published: 2022-08-30T08:52:19.000Z
date_updated: 2022-08-30T08:58:25.000Z
tags: JAVA, 공부
---

## 시작하며

String Class 는 Java Language 사용 시 상당히 자주 사용하게 되는 클래스 입니다. 하지만 다른 클래스들과는 다르게 원시자료형처럼 선언이 가능하죠. 이러한 부분에 대해 왜 Java 의 문자열 클래스는 특별한지, 그리고 어떻게 특별한지 조사해보았습니다.

## String Class 만이 리터럴 선언이 가능하게 된 이유

간단하게 말해서, **편리하기 때문입니다.**  다른 클래스처럼 매번 new 연산자를 통해 char 배열을 인자로 넣고 선언하게 된다면, 개발자들은 매번 String 자료형을 선언하기 위해 다음과 같은 선언문을 사용해야 할 것입니다.

    String hello = new String(new char[] { 'h', 'e', 'l', 'l', 'o' });

모든 문자열을 위와 같은 코드로 선언하는 것은 매우 소요가 심한 일이고, 따라서 자바에서는 String Class 는 특별하게 리터럴 선언이 가능하도록 디자인 되었습니다. 하지만 String Class가 특별한 취급을 받는 것은 선언방식 뿐일까요? 그렇지 않습니다. 리터럴 선언 시 String Class 는 메모리 할당 방식도 조금 특이합니다.

## String Literal 선언 시 일어나는 일들

다음과 같은 문자열 데이터를 선언했다고 가정 해보겠습니다.

    String strA = "hello";

방금 선언한 `strA` 는 어떤 메모리 영역에 저장될까요? 우리가 일반적으로 자바에서 어떠한 참조형 객체 혹은 배열을 선언할 경우 선언된 객체는 Heap 영역에 저장된다고 알고 있습니다.

> 참고 : Stack Memory and Heap Space in Java
> [https://www.baeldung.com/java-stack-heap](https://www.baeldung.com/java-stack-heap)

따라서 String 객체 또한 선언 시 Heap 영역에 저장 될 것 같지만 사실 JVM은 선언한 문자열을 String Pool 이라고 하는 특별한 영역에서 관리합니다. 따라서 위에서 선언한 strA는 String Pool 이라고 하는 특수한 영역에 할당되어서 관리됩니다. String Pool 은 어떠한 영역이고, 왜 String 객체만 별도의 영역에서 관리하게 된 것일까요?

## String Pool

개발하고 있던 프로그램의 규모가 커져서 위에서 `strA` 변수에 선언한 `hello` 라는 문자열을 곳곳에서 10만번 정도 추가로 사용해야 한다고 가정 해보겠습니다. 만약 String 객체를 Heap 영역에서 관리한다면 다음과 같이 할당 될 것입니다.
![](https://blog.kakaocdn.net/dn/cbwz92/btrx7x4VZFM/JFkLfFdIVsMkybu7RXRpdK/img.png)
문자열은 프로그램에서 **매우 매우** 빈번하게 사용되는 자료형이고, 내용이 완전히 동일한 문자열에 대해 다음과 같이 메모리를 할당한다면 엄청난 낭비라고 생각되지 않으신가요? 하지만 String 객체가 리터럴로 선언됨에 따라 String Pool 에 할당된다면 위의 상황은 다음과 같이 변하게 됩니다.
![](https://blog.kakaocdn.net/dn/b3RMhy/btrx6o1XwGE/7mWiLUlX2Em5DUgqEkK26K/img.png)
10만개의 변수가 `hello` 라고 하는 하나의 문자열을 각각 메모리 할당하는 것이 아닌 String Pool 에 할당하는 하나의 문자열을 참조하게 됩니다. 어떻게 이것이 가능할까요? 그럼 반대로 만약 하나의 문자열 변수에서 `hello` 라고 하는 문자열의 내용을 변경하려 한다면 10만개의 변수에 저장된 데이터가 모두 변경되는것이 아닐까요? 그 비결은 바로 String Class 의 특수성 중 하나인 **불변(Immutable)** 에 있습니다.

## String Immutable

String Class 의 내부를 한번 살펴 보겠습니다.
![](https://blog.kakaocdn.net/dn/b5B6ym/btrx6o1XAma/TSITW4KkPOQVW0PYqpJk7K/img.png)
문자열 배열을 할당받는 `value` 변수가 `final` 로 선언되어 있음을 알 수 있죠. 한번 선언되고 절대 변경되지 않는다는 뜻입니다. 따라서 위에서 선언 한 10만개의 문자열 변수 중 다른 문자열을 새롭게 선언하거나, `+` 연산자를 통해 문자열을 변경하거나 하여도 처음 선언한 `hello` 문자열 객체의 값은 **절대로** 변경되지 않는다는 것이죠.

## Interning

문자열을 리터럴로 선언함으로써 String Pool 에 저장되고, 동일한 문자열을 참조한다는 것은 이해할 수 있었습니다. 그렇다면 리터럴로 선언하지 않을 때에는 어떨까요? 다음과 같은 선언이 있다고 가정해봅시다.

    String strLiteral = "abc";
    String strObject = new String("abc");
    
    boolean equalityA = strLiteral == strObject;

`equalityA` 변수의 값은 어떻게 될까요? 

확인해보면 `false` 가 나오게 되는 것을 알 수있습니다. 

객체 간 동일성 연산자(`==` )는 두 객체가 같은 메모리 공간을 참조하고 있는지 비교하므로 `strLiteral` 객체와 `strObject` 객체는 서로 다른 메모리를 참조하고 있음을 알 수 있습니다. 위에서 기술한 대로 두 String 객체가 모두 String Pool 에 존재한다면, 같은 메모리를 참조해야 하는데, 어째서 위와 같은 결과가 나타나게 됐을까요. 

한번 더 String Class 의 내부를 살펴보면, 다음과 같은 메서드를 발견할 수 있습니다.
![](https://blog.kakaocdn.net/dn/QiiBJ/btrx6Zm4GDp/KkSqKikPLjnKeKqmEwbAj1/img.png)
해당 메서드의 디스크립션에서 모든 리터럴 문자열과 문자열 상수 표현식은 선언과 동시에 `intern` 처리 되는 것을 알 수 있습니다. 이는 heap 영역에 존재하는 문자열 객체를 내부적으로 String Pool 영역으로 옮기는 작업이라고 합니다. 하지만 생성자를 통해 선언 된 String 문자열 객체는 이 `intern` 과정을 거치지 않으며 따라서 위에서 비교연산자를 통해 `strLiteral` 객체와 `strObject` 객체가 다른 주소값을 가르키고 있는 이유에 대해 알 수 있죠.

그렇다면 수동으로 `intern` 처리를 해준다면 같은 주소를 가리키게 되지 않을까 테스트 해보았습니다.

    String strLiteral = "abc";
    
    String strObject = new String("abc"); 
    boolean equalityA = strLiteral == strObject; // false 
    
    String strInterned = strObject.intern(); 
    boolean equalityB = strLiteral == strInterned; // true

`equalityB`의 결과로 `true` 가 반환됨에 따라 String 객체와 리터럴 선언간에 어떠한 내부적인 동작이 있었는지 알아볼 수 있었습니다.

## Refferences

- [https://www.baeldung.com/java-string-pool](https://www.baeldung.com/java-string-pool)
- [https://medium.com/@joongwon/string-의-메모리에-대한-고찰-57af94cbb6bc](https://medium.com/@joongwon/string-%EC%9D%98-%EB%A9%94%EB%AA%A8%EB%A6%AC%EC%97%90-%EB%8C%80%ED%95%9C-%EA%B3%A0%EC%B0%B0-57af94cbb6bc)
- [https://www.baeldung.com/java-string-initialization](https://www.baeldung.com/java-string-initialization)

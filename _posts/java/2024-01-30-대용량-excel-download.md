---
title: "[JAVA] Apache Poi 라이브러리와 Mybatis를 이용한 엑셀 다운로드 구현"
slug: '대용량-엑셀-다운로드'
tags: 
    - Mybatis
    - Apache-Poi
categories:
    - JAVA
---

## 개요
사내의 레거시 어드민 시스템에서 자꾸 특정 시간에 메모리 점유율이 치솟다가 결국 멈추는 이슈가 있었다.
원인을 분석해본 결과 출력 건수가 많은 메뉴에서 엑셀 다운로드 요청시 `전체 조회` -> `List 형태로 메모리 저장` -> `엑셀 생성` -> `다운로드` 공정으로 파일을 내려줬는데, 
데이터가 적었다면 상관없지만 해당 메뉴는 기간을 조금만 늘려도 수십만 건에서 100만건 까지 늘어날 수 있는 메뉴였기 때문에 빈번하게 문제가 되었다.
결국 대용량 다운로드를 위한 공정이 추가로 필요해졌는데 해당 기능을 개발하며 있었던 과정들을 몇가지 기록해볼까 한다.

## 원인 찾기
개요에 작성했지만, 기존의 엑셀 다운로드 과정은 다음과 같다.

1. 데이터 전체 조회 요청
2. JDBC 로 부터 응답받은 데이터를 하나의 List 에 일괄 저장
3. Apache Poi 라이브러리를 이용하여 일괄 엑셀 File 생성
4. 임시 생성한 파일을 response 로 응답 처리

자세한 진단을 하기 전에는 대량의 데이터를 XSSF 클래스를 이용하여 엑셀을 만들던 도중 OOM(Out of Memory Error) 로 인한 장애가 발생했을 것이라 추측했다.
하지만 실제로 코드를 보니 한가지 의문이 들었던 것이 100만건의 데이터를 List 자료형으로 메모리에 바로 올리는데 이 시점에는 장애가 나지 않는지가 의문이었다.
만약 의문이 맞았다면 실제 장애가 발생한 시점은 3번이 아니고 2번 시점일 것이었다.

사실 2번이던 3번이던 이미 수정해야 할 방향은 대충 감이 잡혔지만, 이전부터 라이브 서비스의 잘못된 코드로 인해 발생한 OOM을 멋지게 해결하는 환상(?)이 있었기 때문에 조금 더 정확하게 원인을 진단해보고 싶었다.
따라서 해당 이슈를 조금 더 정밀하게 분석해보기 위해 재현을 해보았다.

로컬에서 구동하더라도 실제 서버와 Heap 공간 크기에 차이가 있을 것이므로 우선 VM Option 으로 같은 공간을 할당해 주었다.
그 후 OutOfMemory 시 HeapDump 파일을 남기도록 옵션을 추가했다. 

```
-Xms:
-Xmx:
-XX:+HeapDumpOnOutOfMemoryError 
-XX:HeapDumpPath=/path/to/dump/directory
```

그리고 문제로 추정되는 엑셀 기능을 실행하여 경과를 지켜보았더니 실제로 다음과 같은 예외메시지가 발생하였다.

{% include figure path='assets/images/posts/2023/2024-01-30-15-00-36.png' caption='예외 메시지' %}

다행히 예상대로 OOM 이 발생하였으므로 방금 준 옵션으로 인해 HeapDump 파일이 생성 되었고,
좀 전 지정한 경로에 생긴 hprof 확장자의 heap dump 파일을 Eclipse Memory Analizer 를 이용하여 분석했다.

(heapdump 분석 방법에 대해 참조한 링크: [https://jupiny.com/2019/07/15/java-heap-dump-analysis/](https://jupiny.com/2019/07/15/java-heap-dump-analysis/))

{% include figure path='assets/images/posts/2023/2024-01-30-15-24-58.png' caption='분석 결과' %}

분석 결과 Heap 점유는 iBtais 패키지 내 `DefaultResultHandler` 에서 컬렉션 객체들로 인해 발생했고 해당 클래스가 작동하는 방식을 확인해보니 다음과 같았다.

{% include figure path='assets/images/posts/2023/2024-01-30-15-27-57.png' caption='ibatis DefaultResultHandler' %}

해당 API 는 resultSet 에서 한 줄씩 조회 결과를 List 에 끝까지 add 하는 구조였다.
예상대로 repository layer 에서 최초 데이터를 가져와서 페이징도 없이 메모리에 쌓는 시점부터 이미 GC 를 마비시킬 정도의 메모리 점유가 발생했고 이를 수정하기 위한 작업이 진행되었다.


## CustomResultHandler 제작
Mybatis 에서는 데이터 조회 시 `ResultHandler` 인터페이스를 상속받는 커스텀 ResultHandler 객체를 제작할 수 있다.
앞서 `DefaultResultHandler` 객체가 단순하게 조회 결과를 한 줄씩 List에 Add 해주는 구조라면, 임의로 만든 ResultHandler 객체에서 한 줄씩 Excel 데이터를 생성해주면 될 일이었다.

하지만 기존대로 XSSF 컴포넌트를 사용하면 조회한 데이터를 모두 엑셀로 내보낼 때 까지 메모리를 점유하므로 앞서 List 에 저장하던 방식과 크게 다르지 않다.
따라서 SXSSF 컴포넌트를 이용해야 중간중간 메모리의 정보를 파일로 flush 해주고 비우는 동작이 이루어지기 때문에 안정적으로 동작할 수 있다.

앞서 말한대로 구현한다면 `CustomResultHandler` 는 다음과 같이 구현될 수 있다.


```java
@Slf4j
public class MyCustomResultHandler implements ResultHandler {

    private final Workbook workbook;
    private Sheet sheet;
    private rowIndex = 3;

    public MyCustomResultHandler(Workbook workbook) {
        this.workbook = workbook;
        createSheet();
    }


    private void createSheet() {
        sheet = workbook.createSheet("Sheet Name");
        
        //Set Styles ...
        //Create Title ROW ...
        //Create Header ROW ...
    }

    @Override
    public void handleResult(ResultContext resultContext) {

        Map<String, Object> result = (Map<String, Object>) resultContext.getResultObject();

        Row row = sheet.createRow(rowIndex++);

        //기록하는 로직
    }
}
```

위에서 만든 `MyCustomResultHandler` 객체는 Mybatis 의 다음 인터페이스를 이용하면 된다.

{% include figure path='assets/images/posts/2023/2024-01-30-15-58-10.png' caption='' %}

그리고 해당 ResultHandler 를 호출하는 ServiceLayer 에서는 다음과 같이 참조할 SXSSF Workbook 객체를 미리 생성해서 넘겨주면 된다.

```java
public void createExcel() {

    SXSSFWorkbook workbook = new SXSSFWorkbook(10000); //flsuh 해줄 row 개수를 지정한다.
    MyCustomResultHandler handler = new MyCustomResultHandler(workbook, resultCount);

    sqlsession.select("statement", params, handler);

    //write and dispose Excel File
}
```

## 남은 과제
사실 기존 재직 인원들은 누르면 서비스가 죽여버리고 마는 치명적인 스펙때문에 눌러볼 엄두를 못내고 있었지만
신규 입사자들만 한번씩 눌러봐서 사고를 치고야 마는 깜짝상자같은(?) 기능이기도 했던 것 같다.

개발팀에서도 여차하면 DB에서 직접 데이터를 추출해서 보내주고 말지 라는 느낌으로 남아있던 케케묵은 과제이기는 하였는데, 막상 구현하고 보니 개선해야 할 점이 더 많이 보이긴 했다.

1. 100만 row 정도를 쓰게 되면 일단 파일을 만드는데 너무 오랜시간이 걸린다.
2. 기존의 동기적 처리를 그대로 두어서, 사용자는 결국 최대 20분까지 다운로드 중 화면만 하염없이 기다리고 있어야 한다. 

우선 첫 번째 문제인 파일 생성 시간을 줄이기 위해서 할 수 있는것이 무엇이 있을까 고민해본 결과, JDBC 조회 시 resultSet 의 버퍼를 늘리는 방법이 있지 않을까 생각해보았다.
현재 메모리 상에는 10000 row 까지 엑셀 컴포넌트를 들고 있다가 flush 하는데, resultSet 의 크기도 10000으로 맞추어주면 생성속도가 줄어들 것이라 예상했다.

```xml
<select id="queryName" parameterType="hashMap" fetchSize="10000">
<!--query-->
</select>
```

다음과 같이 fetchSize 설정을 10000 으로 수정하면 된다. (기존의 설정 값은 10이었다.)
아래는 각 fetchSize별 실행 결과이다.

- fetch - 10
    - 엑셀 다운로드 건수 : 154325건
    - 엑셀 다운로드 소요시간 : 326099millis

- fetch - 200
    - 엑셀 다운로드 건수 : 153908건
    - 엑셀 다운로드 소요시간 : 80020millis

- fetch - 10000
    - 엑셀 다운로드 건수 : 154008건
    - 엑셀 다운로드 소요시간 : 49050millis


fetch size 를 높일수록 드라마틱한 성능 개선이 되고 있는것을 확인할 수 있다.
하지만 fetch size 를 너무 높이게 되면 메모리에 부담이 되고 어차피 flush가 이루어지는 크기도 제한되어 있으니 적정한 수치를 찾는것이 좋을듯 하다.

다음은 두번째 문제인 사용자 화면 개선인데, 동작 자체가 크고 무거운 요청인 만큼 동기적으로 처리 하는것이 가장 좋은 방법이나 살짝 UI 적으로 해결한다면 응답받을 popup 이나 iframe 을 제공하여 해당 element 로 return 받는 것이 가장 깔끔해보인다.

## 후기
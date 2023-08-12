---
title: "[운영체제] 2. 프로세스 개요"
tags: 
    - Study
    - OperationgSystem
categories:
    - CS
---

{% include figure path='https://blog.kakaocdn.net/dn/v4Tnd/btrEGJZ3WQf/ZbaS4GDkoJlqOFICdzuQw0/img.png' %}

## 1. 프로세스

프로세스란 실행 중인 프로그램을 의미한다. 본디 프로그램이란 디스크 내 파일로써 존재하며 정적이고 수동적인 개체이다. 하지만 운영체제로 필요한 자원을 할당 받아 동작을 실행하면 능동적이고 동적인 프로세스가 된다.

### 1-1. 프로세스의 상태 변화

프로세스는 일단 생성된 후에는 자원을 할당 받고 종료되기 전까지 다섯 단계의 상태를 오간다.

{% include figure path='https://blog.kakaocdn.net/dn/bcRQba/btryP8J34e0/jPaODGNKNukOOWlVXOuK6k/img.png' caption='프로세스 상태의 다섯 단계' %}

#### 생성 → 준비
스케줄러에 의해 호출되는데, 이 때 메모리 이용 가능성과 어떤 장치가 요구되는지 검사한다.

#### 준비 → 실행
사전에 정의된 스케줄링 알고리즘에 따라 프로세스가 실행된다. (디스패치라고 한다.)

#### 실행 → 준비
할당 시간이나 우선순위 알고리즘의 선점방식에 의해 준비상태로 되돌아가는 경우도 있다.

#### 실행 → 대기
입출력 혹은 페이지 교환등의 작업은 시간이 오래 걸리기 때문에 그 사이 CPU를 다른 자원에 할당하기 위해 대기 상태로 보낸다.

#### 대기 → 준비
장치관리자의 신호에 의해 일어난다. 페이지 교환의 경우 페이지 인터럽트 핸들러가 메모리에 페이지가 존재한다고 신호하게 되며 프로세스가 준비 큐로 이동한다.

#### 실행 → 종료
성공적으로 종료되거나 운영체제가 에러를 감지하고 강제종료 한 경우 실시된다.

### 1-2. 프로세스 제어블록(PCB)

프로세스의 효율적인 관리를 위해 운영체제가 프로세스의 정보를 보관하는 블록. 프로세스가 진행됨에 따라 변경되기도 하며, 프로세스가 종료되는 경우 사라진다.

#### PCB 내용의 예시 (운영체제 별로 상이할 수 있음)

- 프로세스 상태
- 프로세스 번호(PID)
- 프로세스 고유 식별값
- 프로그램 카운터(PC)
- 프로세스 수행을 위한 다음 명령의 주소

#### 레지스터
CPU의 레지스터에 해당하는 정보를 포함한다. 실행 상태에서 다른 상태로 전이되는 경우 여기에 임시 저장하여 다시 실행상태가 될 때 활용한다.

#### 메모리 관리 정보
프로세스가 저장된 주소 및 가상 메모리와 실제 메모리의 매핑 정보, 기준 레지스터와 경계 레지스터 등의 정보를 포함한다.

#### 회계 및 입출력 상태 정보
주로 성능 측정과 순위에 대한 목적을 위한 정보들이 포함된다.

### 1-3. 프로세스 생성과 종료
#### 프로세스 생성
프로세스가 프로세스 생성 시스템 호출을 이용하여 자식 프로세스를 둘 수 있다. 이때 자식 프로세스는 부모 프로세스의 자원 일부(시스템 과부하 방지)를 얻는다.

#### 프로세스 종료
부모 프로세스가 자식 프로세스의 작업을 더 이상 원치 않을 때 종료시킬 수 있다. 또한 부모 프로세스가 종료되는 경우 자식 프로세스들은 운영체제에 의해 연속적 종료가 발생한다.

### 1-4. 프로세스 간의 관계

#### 독립적 프로세스
- 해당 프로세스들은 결정적이고, 재생 가능하다.
- 다른 프로세스와 영향을 주고받지 않는 프로세스를 의미한다.

#### 유기적 프로세스
- 해당 프로세스들은 비결정적이며 재생 불가능하다.
- 실행 중인 다른 프로세스와 유기적으로 영향을 주고받는 프로세스를 의미한다.

## 2. 쓰레드

{% include figure path='https://blog.kakaocdn.net/dn/rLlJ7/btrENH70g8A/DC13e94XwO5uUW88ED8AwK/img.png' caption='멀티 쓰레드 프로세스의 예시' %}

- 쓰레드는 프로세스 내에서 다중처리를 위해 고안된 개념이다.
- 운영체제에서 프로세스가 갖는 의미는 자원 소유 단위 및 디스패칭 단위 두 가지의 역할을 담당 했었다.
- 최근에 들어서는 디스패칭 단위는 쓰레드(경량 프로세스)가 담당하고 자원 소유의 단위를 프로세스(작업)로 구분하여 취급하고 있다.
- 하나의 프로세스는 여러 개의 쓰레드를 가질 수 있다.
- 쓰레드는 제어의 흐름을 의미하고, 이는 프로세스에서 실행의 개념만을 분리하여 실행에 필요한 최소한의 정보만을 가지고 쓰레드끼리는 프로세스의 실행 환경을 공유한다.
- 하나의 프로세스에서 다중 쓰레드를 이용 시 여러 개의 CPU 혹은 CPU가 멀티코어인 경우 병렬 처리가 가능해진다.

## 3. 스케줄링
CPU에게 어떤 작업들을 할당하여 우선적으로 처리하게 할지, 처리 순서를 결정하는 행위

### 스케줄링 정책
운영체제에서 프로세스를 스케줄링할 때에는 공정성과 균형을 중시해야 한다.

- 일괄처리 운영체제의 스케줄링 목표
- 처리량 극대화, 반환시간 최소화, CPU 활용 극대화
- 대화형 운영체제의 스케줄링 목표
- 빠른 응답 시간, 과다한 대기시간 방지

위의 목표들은 서로 상반된 성질을 가지고 있으므로 동시에 충족시키기는 어렵다.

#### 선점 스케줄링 정책

- 진행 중인 작업에 인터럽트를 걸고 다른 작업에 CPU를 할당하는 전략이다. 우선순위에 따라 작업이 변경된다. 작업이 변경될 때 프로세스의 상태를 PCB에 저장하고 다른 작업으로 교체하는 문맥 교환(Context Switching) 이 발생하며, 이 과정이 빈번하면 오버헤드가 발생한다.

#### 비선점 스케줄링 정책

- 프로세스가 자원을 할당받아 실행에 들어가면 I/O 인터럽트가 걸리거나 종료될 때까지 실행상태에 있는다. 응답 시간의 예측이 가능하며 짧은 작업이 긴 작업을 기다리거나 공정성이 떨어질 수 있다.

참고: 무한루프에 들어간 작업의 경우 선점/비선점에 관계없이 운영체제가 인터럽트를 걸게 된다.
---
title: "[Mockito] Strict Stubbing"
---

## 1.요약

단위 테스트를 작성하다가 낯선 예외에 마주쳤다. 

해당 예외 클래스의 description 을 확인한 결과, mockito 프레임워크의 `strictness` 레벨 설정에 관한 이슈가 있어 테스트가 실패하고 있었다.
![](__GHOST_URL__/content/images/2022/09/image-6.png)
strictness 설정이란, 요악하자면 불필요한 stubbing 을 허용할지 말지에 대한 옵션이다. 기본 레벨이 `*STRICT_STUBS*`이며, `*LENIENT*`으로 수정해주어야 사용하지 않는 stub 에 대해 무시하고 통과할 수 있다. 

즉,  stubbing 관련 로직을 BeforeEach 메서드에 별도로 정리하였는데, 이 mocking을 사용하지 않는 테스트가 존재하여 발생하는 에러였다.

## 2.상황

예를 들어 회원에 관하여 **전화번호 중복 체크** Validation 을 처리하는 서비스 로직이 있고, 해당 validator 내부의 Repository 클래스를 mocking 하여 단위테스트를 작성한다고 가정해보자.

    private final MemberRepository repository;
    
    public void duplicateCheck(SearchCondition cond) {
    
    	repository.findOne(cond)
    		.ifPresent(m -> {
    			throw new IllegalStateException("Duplicated Memberr");
    		});
    }

MemberValidator.java
    	@Mock
        MemberRepository repository;
        @InjectMocks
        MemberValidator validator;
        
        @BeforeEach
        void setUp() {
            
            SearchCondition cond = new SearchCondition("01012345678");
            SearchCondition wrongCond = new SearchCondition("01056781234");
            
            Member givenMember = Member.builder()
            	.name("test_member")
                .mobile("01012345678")
                .build();
    
            doReturn(Optional.of(givenMember)).when(repository).findOne(cond);
            doReturn(Optional.empty()).when(repository).findOne(wrongCond);
        }
    
        @Test
        void notDuplicated() {
            Member member = Member.builder()
                    .mobile("01056781234")
                    .build();
    
            assertDoesNotThrow(() -> validator.duplicateCheck(member));
        }
    
        @Test
        void duplicated() {
            Member member = Member.builder()
                    .mobile("01012345678")
                    .build();
    
            assertThrows(IllegalStateException.class, 
            	() -> validator.duplicateCheck(member));
        }
        

ValidatorTest.java
- `duplicated` 테스트는 `cond` 검색 조건으로 stub 된 반환 값을 사용하고 있다.
- `notDuplicated` 테스트는 `wrongCond` 검색 조건으로 stub 된 반환 값을 사용하고 있다.

그렇다면 각 테스트는 실행 전 **사용하지 않는 stubbing **을 1회씩 실시하고 있는 것이다. 

## 3.해결

위 상황을 해결해주기 위해서는 다음과 같은 방법들이 존재한다.

### 1) mock strict level 을 조절한다.

1-1. `@Mock` 애노테이션에 lenient 값을 줄 수 있다.

    	@Mock(lenient = true)
        MemberRepository repository;
        @InjectMocks
        MemberValidator validator;

1-2. stub 단위별로 lenient() 메서드 체이닝을 통해  lenient 레벨을 조정할 수 있다.

    lenient().doReturn(Optional.of(givenMember)).when(repository).findOne(cond);
    lenient().doReturn(Optional.empty()).when(repository).findOne(wrongCond);

### 2) stub 을 테스트 단위별로 실시한다.

BeforeEach 영역에서 공용으로 실시하던 stubbing 을 테스트 별 필요한 stubbing 만 진행하도록 개선한다.

    	@Mock
        MemberRepository repository;
        @InjectMocks
        MemberValidator validator;    
    
        @Test
        void notDuplicated() {
        	//given
            SearchCondition wrongCond = new SearchCondition("01056781234");
            doReturn(Optional.empty()).when(repository).findOne(wrongCond);
            
            //when   
            Member member = Member.builder()
                    .mobile("01056781234")
                    .build();
    		
            //then
            assertDoesNotThrow(() -> validator.duplicateCheck(member));
        }
    
        @Test
        void duplicated() {
        	//given
        	SearchCondition cond = new SearchCondition("01012345678");
            Member givenMember = Member.builder()
            	.name("test_member")
                .mobile("01012345678")
                .build();
                
    		doReturn(Optional.of(givenMember))
            	.when(repository).findOne(cond);     
                
            //when
            Member member = Member.builder()
                    .mobile("01012345678")
                    .build();
                    
    		//then                
            assertThrows(IllegalStateException.class, 
            	() -> validator.duplicateCheck(member));
        }
        

ValidatorTest.java
## 4.결론

테스트 코드의 엄격성 (Strictness) 는 mockito 프레임워크 2.x 버전부터 도입 된 기능이라고 한다.  이는 테스트 코드에서 불필요한 stub 및 중복 코드를 제거하기 위함인데, 보통 이런 경우 억지로 strictness 레벨을 조정하기 보다 프레임워크 철학에 맞추어 설계를 수정하는 편이 좋은 코드를 작성하는 방법이 아닐까 생각한다. 

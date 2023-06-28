---
title: "[JAVA] clone() 메서드 간단 정리"
---

Object 클래스의 clone 메서드는 Cloneable 인터페이스를 상속하지 않으면 사용할 수 없으며, 사용 시 CloneNotSupportedException 을 핸들링 해야 합니다. (Checked Exception 이므로)

이름에서 대략적으로 유추가 가능하지만 객체의 주소 값만 가져오는 얕은 복사가 아니라 내용이 같고 주소가 다른 새로운 객체를 생성하는 깊은 복사를 실행합니다.

우선 다음과 같이 Cloneable 인터페이스를 상속 받는 CloneableObject 객체를 정의합니다.

    public class CloneableObject implements Cloneable { 
    
    	String msg; 
    
        public CloneableObject(String msg) { 
            this.msg = msg; 
        } 
        
        @Override 
        public CloneableObject clone() { 
        	try { 
                return (CloneableObject) super.clone(); 
            } catch (CloneNotSupportedException e) { 
    			throw new AssertionError(); 
    		} 
    	} 
    }

그리고 위의 객체를 실제로 생성하고 clone 메서드를 통해 복사를 실행한 후 주소값과 객체의 내용을 비교해보도록 하겠습니다.

        @Test
        public void cloneTest() {
            //given
            CloneableObject objectA = new CloneableObject("MSG");
            //when
            CloneableObject objectB = objectA.clone();
            //then
            System.out.println("objectA = " + objectA);
            System.out.println("objectB = " + objectB);
            System.out.println("objectA.hash = " + objectA.hashCode());
            System.out.println("objectB.hash = " + objectB.hashCode());
            System.out.println("objectA.msg = " + objectA.msg);
            System.out.println("objectB.msg = " + objectB.msg);
    
            Assertions.assertThat(objectA).isNotSameAs(objectB);
            Assertions.assertThat(objectA).isNotEqualTo(objectB);
            Assertions.assertThat(objectA.msg).isEqualTo(objectB.msg);
        }
    

![](https://blog.kakaocdn.net/dn/czYtZ4/btrzYg1m1kA/p23FN6JigMt6Gnt9lIrkW0/img.png)
객체의 주소값, 해쉬코드 모두 기존 객체와 다른 새로운 객체가 생성되었지만, 멤버 변수가 갖는 값은 동일한 것을 확인할 수 있습니다.

혹시 CloneableObject 의 멤버 변수로 객체의 참조값을 포함한다면, clone 메서드 사용 시에 어떤 복사를 실시할까요?

다음과 같은 Member 클래스를 정의 후 멤버 변수로 포함 시켜보도록 하겠습니다.

    public class Member {
    
        public String name;
        public int age;
    
        public Member(String name, int age) {
            this.name = name;
            this.age = age;
        }
    }
    

CloneableObject는 다음과 같이 수정 하겠습니다.

    public class CloneableObject implements Cloneable {
    
        String msg;
        Member member;
    
        public CloneableObject(String msg, Member member) {
            this.msg = msg; this.member = member;
        }
    
        @Override
        public CloneableObject clone() {
            try {
                return (CloneableObject) super.clone();
            } catch (CloneNotSupportedException e) {
                throw new AssertionError();
            }
        }
    }
    

이후 위에서 실행한 것과 같이 Member 객체만 추가하여 clone을 실행하고, Member 객체의 주소 값을 확인 해보았습니다.

    
    	@Test
        public void innerCloneTest() {
            //given
            Member member = new Member("MemberName", 20);
            CloneableObject objectA = new CloneableObject("MSG", member);
            //when
            CloneableObject objectB = objectA.clone();
            //then
            System.out.println("objectA = " + objectA.member);
            System.out.println("objectB = " + objectB.member);
            System.out.println("objectA.hash = " + objectA.member.hashCode());
            System.out.println("objectB.hash = " + objectB.member.hashCode());
    
            Assertions.assertThat(objectA.member).isEqualTo(objectB.member);
            Assertions.assertThat(objectA.member).isSameAs(objectB.member);
        }
    

![](https://blog.kakaocdn.net/dn/KtnWE/btrzRm3GpoH/scfxSshKnSDJ8jRbcUSeI1/img.png)
참조 변수 또한 참조하고 있는 주소 값 자체를 복사 해오기 때문에 당연한 결과이겠지만, Member 객체는 완전히 동일한 주소와 값으로 복사 되는 것을 알 수 있습니다.

해당 필드의 객체 또한 깊은 복사를 실행하고 싶으면 해당 객체 또한 Clonable 인터페이스의 구현체로 clone 메서드를 재정의 해주어야 합니다.

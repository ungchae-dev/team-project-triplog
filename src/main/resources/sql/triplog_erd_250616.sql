-- 자바고 2차 팀 프로젝트 triplog 오라클 DB 쿼리문
-- triplog_erd_250616.sql

-- 데이터베이스 username: javago
-- 여행 블로그 서비스 'Triplog' 데이터베이스 스키마

-- 시퀀스 삭제 시 조회 후 사용
-- 전체 14개 테이블 중 member 제외 13개 시퀀스
SELECT 'DROP SEQUENCE ' || object_name || ' ;'
FROM user_objects
WHERE object_type = 'SEQUENCE';

-- 테이블 삭제 시 조회 후 사용
-- 전체 14개 테이블
SELECT 'DROP TABLE "' || TABLE_NAME || '" CASCADE CONSTRAINTS;'
FROM user_tables;

-- 휴지통 테이블 비우기(참고)
PURGE RECYCLEBIN;

COMMIT;

-- =============================================================================
-- 1. member 테이블 생성
-- 사용자 정보를 저장하는 테이블
-- 회원가입 시 입력하는 개인정보와 도토리(acorn) 관리
CREATE TABLE member
(
    member_id VARCHAR2(20) PRIMARY KEY,     -- 사용자 아이디(최대 20자), 기본키
    name VARCHAR2(20) NOT NULL,             -- 사용자 실명
    gender VARCHAR2(10) 
        CHECK (gender IN ('MALE', 'FEMALE')) NOT NULL,        -- 성별(남성: Male, 여성: Female)
    nickname VARCHAR2(50) NOT NULL,         -- 닉네임(다른 사용자에게 표시됨)
    email VARCHAR2(30) NOT NULL,            -- 이메일(@ 포함)
    password VARCHAR2(100) NOT NULL,        -- 비밀번호(특수문자, 영문, 숫자 포함)
    profile_image VARCHAR2(4000),           -- 프로필 이미지 경로(NULL 허용)
    phone VARCHAR2(20) NOT NULL,            -- 전화번호(ex. 010-1234-5678)
    join_date VARCHAR2(8) 
        DEFAULT TO_CHAR(SYSDATE, 'YYYYMMDD') NOT NULL,  -- 가입일자 == 블로그 생성일(날짜 YYYYMMDD)
    acorn NUMBER DEFAULT 30 NOT NULL,       -- 도토리(기본값: 30)
    role VARCHAR2(10) 
        CHECK (role IN ('USER', 'ADMIN')) NOT NULL    -- 역할(USER: 블로그 사용자, ADMIN: 관리자)
);

-- 회원 닉네임, 이메일, 휴대폰 번호(010-0000-1111) UNIQUE 제약조건 설정
ALTER TABLE member ADD CONSTRAINT unique_nickname UNIQUE (nickname);
ALTER TABLE member ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE member ADD CONSTRAINT unique_phone UNIQUE (phone);

SELECT * FROM member;

-- 2. blog 테이블 생성
-- 각 사용자의 블로그 정보를 저장하는 테이블
-- 회원가입 시 자동으로 블로그 생성됨
CREATE TABLE blog
(
    blog_id NUMBER PRIMARY KEY,                     -- 블로그 ID, 기본키
    member_id VARCHAR2(20) NOT NULL,                -- 블로그 소유자 ID(member 테이블 참조)
    skin_active VARCHAR2(1) DEFAULT 'N' NOT NULL 
        CHECK (skin_active IN ('Y', 'N')),          -- 스킨 기능 활성화 여부(Y/N)
    skin_image VARCHAR2(4000),                                -- 스킨 이미지 경로(NULL 허용)
    condition_message VARCHAR2(100),                -- 상태 메시지
    daily_visitors NUMBER(10) DEFAULT 0 NOT NULL,   -- 일일 방문자 수(양수, 최대 9999억까지 저장)
    total_visitors NUMBER(14) DEFAULT 0 NOT NULL,   -- 누적 방문자 수(양수, 최대 9999조(?)까지 저장)
    
    CONSTRAINT fk_blog_member FOREIGN KEY (member_id) REFERENCES member (member_id) -- 외래키: 블로그 소유자
);
SELECT * FROM blog;

-- 3. post 테이블 생성
-- 블로그 게시글 정보 저장
-- 여행 블로그의 주요 컨텐츠 테이블
CREATE TABLE post
(
    post_id NUMBER PRIMARY KEY,                         -- 게시글 ID, 기본키
    blog_id NUMBER NOT NULL,                            -- 게시글이 속한 블로그 ID(blog 테이블 참조)
    title VARCHAR2(100) NOT NULL,                       -- 게시글 제목
    content CLOB NOT NULL,                              -- 게시글 내용(대용량 텍스트)
    created_at DATE DEFAULT SYSDATE NOT NULL,       -- 작성 시간(기본값: 현재 시스템 시간)
    updated_at DATE,                                -- 수정 시간(NULL 허용)
    visibility VARCHAR2(20) DEFAULT 'PUBLIC' NOT NULL 
        CHECK (visibility IN ('PUBLIC', 'PRIVATE')),    -- 공개 설정(PUBLIC/PRIVATE)
    view_count NUMBER(12) DEFAULT 0 NOT NULL,           -- 조회수(양수, 최대 9999억까지 저장)
    
    CONSTRAINT fk_post_blog FOREIGN KEY (blog_id) REFERENCES blog (blog_id) -- 외래키: 게시글이 속한 블로그
);

-- 4. post_image 테이블 생성
-- 게시글에 첨부된 이미지 정보 저장
CREATE TABLE post_image
(
    image_id NUMBER PRIMARY KEY,                -- 이미지 ID, 기본키
    post_id NUMBER NOT NULL,                    -- 이미지가 속한 게시글 ID(post 테이블 참조)
    image_path VARCHAR2(4000) NOT NULL,                   -- 이미지 파일 경로
    is_thumbnail VARCHAR2(1) DEFAULT 'N' NOT NULL
        CHECK (is_thumbnail IN ('Y', 'N')),     -- 대표 이미지 여부(Y/N)
    upload_date DATE DEFAULT SYSDATE NOT NULL, -- 업로드 시간(기본값: 현재 시스템 시간)
    
    CONSTRAINT fk_post_image_post FOREIGN KEY (post_id) REFERENCES post (post_id) -- 외래키: 이미지가 속한 게시글
);

-- 5. hashtag_people 테이블 생성 (people + hashtag 병합)
-- 인원수 태그와 해시태그 정보를 저장하는 통합 테이블
CREATE TABLE hashtag_people
(
    tag_id NUMBER PRIMARY KEY,          -- 태그 ID, 기본키
    tag_name VARCHAR2(100) NOT NULL,    -- 해시태그 또는 인원수 태그명
    tag_type VARCHAR2(10) NOT NULL,     -- 태그 타입(HASHTAG/PEOPLE)
    
    CONSTRAINT check_tag_type CHECK (tag_type IN ('HASHTAG', 'PEOPLE'))
);

-- 6. post_hashtag_people 테이블 생성 (post_people + post_hashtag 병합)
-- 게시글과 태그(해시태그, 인원수 태그) 간의 다대다 관계 매핑 테이블
CREATE TABLE post_hashtag_people
(
    post_tag_id NUMBER PRIMARY KEY,     -- 포스트-태그 관계 ID, 기본키
    post_id NUMBER NOT NULL,            -- 게시글 ID(post 테이블 참조)
    tag_id NUMBER NOT NULL,             -- 태그 ID(hashtag_people 테이블 참조)

    CONSTRAINT fk_post_hashtag_people_post FOREIGN KEY (post_id) REFERENCES post (post_id),       -- 외래키: 태그가 적용된 게시글
    CONSTRAINT fk_post_hashtag_people_tag FOREIGN KEY (tag_id) REFERENCES hashtag_people (tag_id) -- 외래키: 게시글에 적용된 태그
);

-- 7. postlike 테이블 생성
-- 게시글 좋아요 정보 저장
-- 주간 베스트 글 선정에 활용
CREATE TABLE post_like
(
    like_id NUMBER PRIMARY KEY,       -- 좋아요 ID, 기본키
    post_id NUMBER NOT NULL,          -- 좋아요 대상 게시글 ID(post 테이블 참조)
    member_id VARCHAR2(20) NOT NULL,    -- 좋아요 누른 사용자 ID(member 테이블 참조)
    
    CONSTRAINT fk_post_like_post FOREIGN KEY (post_id) REFERENCES post (post_id),       -- 외래키: 좋아요 대상 게시글
    CONSTRAINT fk_post_like_member FOREIGN KEY (member_id) REFERENCES member (member_id)-- 외래키: 좋아요 누른 사용자
);

-- 8. comments 테이블 생성
-- 게시글 댓글 및 대댓글(답글) 정보 저장
-- 자기참조 외래키로 대댓글(답글) 구조 구현
CREATE TABLE comments
(
    comment_id NUMBER PRIMARY KEY,                  -- 댓글 ID, 기본키
    post_id NUMBER NOT NULL,                        -- 댓글이 속한 게시글 ID(post 테이블 참조)
    member_id VARCHAR2(20) NOT NULL,                -- 댓글 작성자 ID(member 테이블 참조)
    parent_comment_id NUMBER,                       -- 상위 댓글 ID(대댓글인 경우) - 자기참조 외래키
    content VARCHAR2(4000) NOT NULL,            -- 댓글 내용(가변문자열 max:4000)
    created_at DATE DEFAULT SYSDATE NOT NULL,   -- 작성 시간(기본값: 현재 시스템 시간)
    updated_at DATE,                            -- 수정 시간(추가)
    is_secret VARCHAR2(1) DEFAULT 'N' NOT NULL 
        CHECK (is_secret IN ('Y', 'N')),             -- 비밀 댓글 여부(Y/N)
        
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES post (post_id),                   -- 외래키: 댓글이 속한 게시글
    CONSTRAINT fk_comment_member FOREIGN KEY (member_id) REFERENCES member (member_id),           -- 외래키: 댓글 작성자
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comments (comment_id) -- 외래키: 상위 댓글(자기참조)
);

-- 9. comment_like 테이블 생성
-- 댓글 좋아요 정보 저장
CREATE TABLE comment_like
(
    comment_like_id NUMBER PRIMARY KEY,                -- 댓글 좋아요 ID, 기본키
    comment_id NUMBER NOT NULL,                        -- 좋아요 대상 댓글 ID(comment 테이블 참조)
    member_id VARCHAR2(20) NOT NULL,                   -- 좋아요 누른 사용자 ID(member 테이블 참조)
    
    CONSTRAINT fk_comment_like_comment FOREIGN KEY (comment_id) REFERENCES comments (comment_id), -- 외래키: 좋아요 대상 댓글
    CONSTRAINT fk_comment_like_member FOREIGN KEY (member_id) REFERENCES member (member_id)       -- 외래키: 좋아요 누른 사용자
);

-- 10. neighbor 테이블 생성
-- 블로그 이웃 관계 정보 저장
-- 이웃 관계는 양방향이 아닌 단방향으로 구현
CREATE TABLE neighbor
(
    neighbor_id NUMBER PRIMARY KEY,                 -- 이웃 관계 ID, 기본키
    member_id VARCHAR2(20) NOT NULL,                -- 이웃을 등록한 사용자 ID(member 테이블 참조) ex)내가 친구 추가한 경우, 나의 ID
    neighbor_member_id VARCHAR2(20) NOT NULL,       -- 이웃으로 등록된 사용자 ID(member 테이블 참조) ex) 내가 친구 추가한 경우, 상대방의 ID
    
    CONSTRAINT fk_neighbor_member FOREIGN KEY (member_id) REFERENCES member (member_id),        -- 외래키: 이웃 등록한 나 자신
    CONSTRAINT fk_neighbor_target FOREIGN KEY (neighbor_member_id) REFERENCES member (member_id), -- 외래키: 이웃 등록한 상대방
    CONSTRAINT uk_neighbor_unique UNIQUE (member_id, neighbor_member_id),  -- 중복 방지: 같은 이웃 관계 중복 등록 방지
    CONSTRAINT chk_not_self_neighbor CHECK (member_id != neighbor_member_id)  -- 자기 자신을 이웃으로 등록 못하게 방지
);

-- 11. guestbook 테이블 생성
-- 블로그 방명록 정보 저장
-- 이웃만 작성 가능, 비밀 방명록 기능 제공
CREATE TABLE guestbook
(
    guestbook_id NUMBER PRIMARY KEY,             -- 방명록 ID, 기본키
    blog_id NUMBER NOT NULL,                     -- 방명록이 속한 블로그 ID(Blog 테이블 참조)
    writer_id VARCHAR2(20) NOT NULL,             -- 방명록 작성자 ID(Member 테이블 참조)
    content VARCHAR2(4000) NOT NULL,                    -- 방명록 내용(가변문자열 max:4000)
    created_at DATE DEFAULT SYSDATE NOT NULL,           -- 작성 시간(기본값: 현재 시스템 시간)
    updated_at DATE,                                    -- 수정 시간(NULL 허용)
    is_secret VARCHAR2(1) DEFAULT 'N' NOT NULL
        CHECK (is_secret IN ('Y', 'N')),         -- 비밀 방명록 여부(Y/N)
    
    CONSTRAINT fk_guestbook_blog FOREIGN KEY (blog_id) REFERENCES blog (blog_id),        -- 외래키: 방명록이 속한 블로그
    CONSTRAINT fk_guestbook_writer FOREIGN KEY (writer_id) REFERENCES member (member_id) -- 외래키: 방명록 작성자
);

-- 12. music 테이블 생성
-- 블로그에서 구매/재생 가능한 음원 정보 저장
-- 음악 API와 연동하여 데이터 관리
CREATE TABLE music
(
    music_id NUMBER PRIMARY KEY,    -- 음악 ID, 기본키
    title VARCHAR2(100) NOT NULL,    -- 음악 제목
    artist VARCHAR2(50) NOT NULL,   -- 가수 이름
    album VARCHAR2(1000),             -- 앨범명(NULL 허용)
    music_file VARCHAR2(4000) NOT NULL,       -- 음악 파일 경로(가변문자열 max:4000)
    price NUMBER NOT NULL           -- 음원 가격(가격 = 도토리 갯수)
);

-- 13. emoticon 테이블 생성
-- 이모티콘 정보 저장
-- 도토리로 구매 가능한 이모티콘 목록
CREATE TABLE emoticon
(
    emoticon_id NUMBER PRIMARY KEY,         -- 이모티콘 ID, 기본키
    emoticon_name VARCHAR2(100) NOT NULL,   -- 이모티콘 이름
    emoticon_image VARCHAR2(4000) NOT NULL,  -- 이모티콘 이미지 경로(가변문자열 max:4000)
    price NUMBER NOT NULL                   -- 이모티콘 가격(가격 = 도토리 갯수)
);

-- 14. member_item 테이블 생성 (member_emoticon + member_music 병합)
-- 사용자가 구매한 아이템(이모티콘, 음원) 정보 저장
-- 사용자와 아이템 간의 다대다 관계 매핑 테이블
CREATE TABLE member_item
(
    member_item_id NUMBER PRIMARY KEY,          -- 사용자-아이템 관계 ID, 기본키
    member_id VARCHAR2(20) NOT NULL,            -- 구매한 사용자 ID(member 테이블 참조)
    music_id NUMBER,                            -- 구매한 음원 ID(music 테이블 참조, NULL 허용)
    emoticon_id NUMBER,                         -- 구매한 이모티콘 ID(emoticon 테이블 참조, NULL 허용)
    item_type VARCHAR2(10) NOT NULL,            -- 아이템 타입(EMOTICON/MUSIC)
    purchase_date VARCHAR2(8) 
        DEFAULT TO_CHAR(SYSDATE, 'YYYYMMDD') NOT NULL,  -- 구매일(날짜 YYYYMMDD)
        
    CONSTRAINT fk_member_item_member FOREIGN KEY (member_id) REFERENCES member (member_id), -- 외래키: 아이템 구매자
    CONSTRAINT fk_member_item_music FOREIGN KEY (music_id) REFERENCES music (music_id),     -- 외래키: 음원 참조
    CONSTRAINT fk_member_item_emoticon FOREIGN KEY (emoticon_id) REFERENCES emoticon (emoticon_id), -- 외래키: 이모티콘 참조
    CONSTRAINT check_item_type_mi CHECK (item_type IN ('EMOTICON', 'MUSIC')),
    CONSTRAINT check_item_reference CHECK (
        (item_type = 'MUSIC' AND music_id IS NOT NULL AND emoticon_id IS NULL) OR
        (item_type = 'EMOTICON' AND emoticon_id IS NOT NULL AND music_id IS NULL)
    ) -- 아이템 타입에 따라 해당하는 ID만 NOT NULL이어야 함
);

-- =============================================================================
-- 데이터베이스 시퀀스 생성
-- 테이블 생성 순서에 맞게 시퀀스 정의
-- 0. member 테이블은 VARCHAR2 타입의 ID를 사용하므로 시퀀스 불필요
-- member 제외 전체 시퀀스: 13
CREATE SEQUENCE blog_seq START WITH 1 INCREMENT BY 1; -- 1. blog 테이블 시퀀스
CREATE SEQUENCE post_seq START WITH 1 INCREMENT BY 1; -- 2. post 테이블 시퀀스
CREATE SEQUENCE post_image_seq START WITH 1 INCREMENT BY 1; -- 3. post_image 테이블 시퀀스
CREATE SEQUENCE hashtag_people_seq START WITH 1 INCREMENT BY 1; -- 4. hashtag_people 테이블 시퀀스
CREATE SEQUENCE post_hashtag_people_seq START WITH 1 INCREMENT BY 1; -- 5. post_hashtag_people 테이블 시퀀스
CREATE SEQUENCE post_like_seq START WITH 1 INCREMENT BY 1; -- 6. post_like 테이블 시퀀스
CREATE SEQUENCE comments_seq START WITH 1 INCREMENT BY 1; -- 7. comments 테이블 시퀀스
CREATE SEQUENCE comment_like_seq START WITH 1 INCREMENT BY 1; -- 8. comment_like 테이블 시퀀스
CREATE SEQUENCE neighbor_seq START WITH 1 INCREMENT BY 1; -- 9. neighbor 테이블 시퀀스
CREATE SEQUENCE guestbook_seq START WITH 1 INCREMENT BY 1; -- 10. guestbook 테이블 시퀀스
CREATE SEQUENCE music_seq START WITH 1 INCREMENT BY 1; -- 11. music 테이블 시퀀스
CREATE SEQUENCE emoticon_seq START WITH 1 INCREMENT BY 1; -- 12. emoticon 테이블 시퀀스
CREATE SEQUENCE member_item_seq START WITH 1 INCREMENT BY 1; -- 13. member_item 테이블 시퀀스

-- ※ 전체 시퀀스 조회 쿼리 (member 제외 전체 시퀀스: 13)
SELECT SEQUENCE_NAME FROM USER_SEQUENCES;

DROP TABLE member; -- 참조관계 확인용
COMMIT;
-- =============================================================================

INSERT INTO member (member_id, name, gender, nickname, email, password, profile_image, phone, role)
VALUES ('user1', '잔망루피', 'FEMALE', '세젤귀뤂', 'user10531@gmail.com', '$2a$10$7dM8bYgGgOaVZ6kKJpJrIexkNwZXH0nGpnvc6fMxqPRAECMOkUKGe', NULL, '010-1111-1111', 'USER');

INSERT INTO member (member_id, name, gender, nickname, email, password, profile_image, phone, role)
VALUES ('user2', '뽀로로', 'MALE', '어린이여러분', 'user20601@naver.com', '$2a$10$PDsNpb9QUOp6wCEAKZHZKeBqldJgmN8Tt6J0ml3rGM/U10nTEG3dK', NULL, '010-2222-2222', 'USER');

INSERT INTO member (member_id, name, gender, nickname, email, password, profile_image, phone, role)
VALUES ('user3', '크롱', 'MALE', '에그타르트쿠와앙', 'user30602@daum.net', '$2a$10$K8LkTfknmZQg.M4/PZ26guPONw1Xj8klFQyM6nPaxLu51PSaMZBGG', NULL, '010-3333-3333', 'USER');

INSERT INTO member (member_id, name, gender, nickname, email, password, profile_image, phone, role)
VALUES ('user4', '에디', 'MALE', '우웅치킨', 'user40603@gmail.com', '$2a$10$09FbI5eWIjaZGbBKD32lXOqieF87FZz1tXGMh2G/xWBkErHcd31fO', NULL, '010-4444-4444', 'USER');

INSERT INTO member (member_id, name, gender, nickname, email, password, profile_image, phone, role)
VALUES ('user5', '포비', 'MALE', '듬직한곰', 'user50604@naver.com', '$2a$10$WD3dDaokgwCLcHKIYURJxOjbnjh1tPEpibApZ02PZZOulKOd1M1IW', NULL, '010-5555-5555', 'USER')
;

SELECT * FROM member;

--SELECT *
--FROM (SELECT m.*,
--             ROW_NUMBER() OVER (PARTITION BY gender ORDER BY member_id) AS rn
--      FROM member m)
--WHERE rn <= 1;

COMMIT;

-- =============================================================================

-- blog 테이블 데이터 삽입
INSERT INTO blog (blog_id, member_id, skin_active) 
VALUES (BLOG_SEQ.NEXTVAL, 'user1', 'N');

INSERT INTO blog (blog_id, member_id, skin_active) 
VALUES (BLOG_SEQ.NEXTVAL, 'user2', 'N');

INSERT INTO blog (blog_id, member_id, skin_active) 
VALUES (BLOG_SEQ.NEXTVAL, 'user3', 'N');
  
INSERT INTO blog (blog_id, member_id, skin_active) 
VALUES (BLOG_SEQ.NEXTVAL, 'user4', 'N');

INSERT INTO blog (blog_id, member_id, skin_active)
VALUES (BLOG_SEQ.NEXTVAL, 'user5', 'N');

SELECT * FROM blog;

-- =============================================================================

-- post 테이블 데이터 삽입

-- 해당 blog_id를 참조해서 post에 삽입
INSERT INTO post (post_id, blog_id, title, content, visibility)
VALUES (post_seq.NEXTVAL, 1, '제주도 여행기', '정말 아름다운 제주도였어요!', 'PUBLIC');

INSERT INTO post (post_id, blog_id, title, content, visibility)
VALUES (post_seq.NEXTVAL, 2, '부산 해운대', '해운대에서 일출을 봤어요.', 'PRIVATE');

INSERT INTO post (post_id, blog_id, title, content, visibility)
VALUES (post_seq.NEXTVAL, 3, '강릉 커피거리', '바닷가 근처 커피향이 좋아요.', 'PUBLIC');

INSERT INTO post (post_id, blog_id, title, content, visibility)
VALUES (post_seq.NEXTVAL, 4, '경주 역사 탐방', '신라시대 유적지를 다녀왔습니다.', 'PRIVATE');

INSERT INTO post (post_id, blog_id, title, content, visibility)
VALUES (post_seq.NEXTVAL, 5, '서울 나들이', '서울 야경 너무 멋졌어요.', 'PUBLIC');

SELECT * FROM post;

SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') FROM post;
-- 눈에 보이는 건 YY/MM/DD 지만, 실제 DB에 삽입된 데이터는 YYYY-MM-DD HH:MM:SS

-- =============================================================================

-- post_image 테이블 데이터 삽입
INSERT INTO post_image (image_id, post_id, image_path, is_thumbnail)
VALUES (post_image_seq.NEXTVAL, 1, '/images/jeju_beach.jpg', 'Y');

INSERT INTO post_image (image_id, post_id, image_path, is_thumbnail)
VALUES (post_image_seq.NEXTVAL, 1, '/images/jeju_mountain.jpg', 'N');

INSERT INTO post_image (image_id, post_id, image_path, is_thumbnail)
VALUES (post_image_seq.NEXTVAL, 2, '/images/busan_sunrise.jpg', 'Y');

INSERT INTO post_image (image_id, post_id, image_path, is_thumbnail)
VALUES (post_image_seq.NEXTVAL, 3, '/images/gangneung_coffee.jpg', 'Y');

INSERT INTO post_image (image_id, post_id, image_path, is_thumbnail)
VALUES (post_image_seq.NEXTVAL, 4, '/images/gyeongju_temple.jpg', 'Y');

SELECT * FROM post_image;

-- =============================================================================

-- hashtag_people 테이블 데이터 삽입
-- 해시태그(hashtag): 해당 블로그 사용자 자율 작성 
--   ex) #가족들과즐거운시간이었어요, #사랑하는사람과함께라행복했던여행, ...
-- 인원수 태그 (9, people)
--   ex) #남자혼자 #여자혼자 #커플 #부모님과 #아이들과 #단체 #남자끼리 #여자끼리 #남녀함께

-- 인원수 태그(people) 데이터 삽입
INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '남자혼자', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '여자혼자', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '커플', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '부모님과', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '아이들과', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '단체', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '남자끼리', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '여자끼리', 'PEOPLE');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '남녀함께', 'PEOPLE');

-- 해시태그(hashtag) 데이터 삽입
INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '연인끼리즐거운여행하기좋은곳', 'HASHTAG');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '전국의잔망루피덕후들모여랍', 'HASHTAG');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '프로젝트끝나고여행가기좋아유~뀨', 'HASHTAG');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '여행글작성했슈이웃들댓글남겨줘U~', 'HASHTAG');

INSERT INTO hashtag_people (tag_id, tag_name, tag_type)
VALUES (hashtag_people_seq.NEXTVAL, '인스타감성충만호호', 'HASHTAG');

SELECT * FROM hashtag_people;

-- =============================================================================

-- post_hashtag_people 테이블 데이터 삽입
INSERT INTO post_hashtag_people (post_tag_id, post_id, tag_id)
VALUES (post_hashtag_people_seq.NEXTVAL, 1, 1);

INSERT INTO post_hashtag_people (post_tag_id, post_id, tag_id)
VALUES (post_hashtag_people_seq.NEXTVAL, 1, 3);

INSERT INTO post_hashtag_people (post_tag_id, post_id, tag_id)
VALUES (post_hashtag_people_seq.NEXTVAL, 2, 2);

INSERT INTO post_hashtag_people (post_tag_id, post_id, tag_id)
VALUES (post_hashtag_people_seq.NEXTVAL, 2, 4);

INSERT INTO post_hashtag_people (post_tag_id, post_id, tag_id)
VALUES (post_hashtag_people_seq.NEXTVAL, 3, 5);

SELECT * FROM post_hashtag_people;

-- =============================================================================

-- post_like 테이블 데이터 삽입
INSERT INTO post_like (like_id, post_id, member_id)
VALUES (post_like_seq.NEXTVAL, 1, 'user2');

INSERT INTO post_like (like_id, post_id, member_id)
VALUES (post_like_seq.NEXTVAL, 1, 'user3');

INSERT INTO post_like (like_id, post_id, member_id)
VALUES (post_like_seq.NEXTVAL, 2, 'user1');

INSERT INTO post_like (like_id, post_id, member_id)
VALUES (post_like_seq.NEXTVAL, 3, 'user4');

INSERT INTO post_like (like_id, post_id, member_id)
VALUES (post_like_seq.NEXTVAL, 5, 'user1');

SELECT * FROM post_like;

-- =============================================================================

INSERT INTO comments (comment_id, post_id, member_id, parent_comment_id, content, is_secret)
VALUES (comments_seq.NEXTVAL, 1, 'user1', NULL, '첫 번째 댓글입니다.', 'N');

INSERT INTO comments (comment_id, post_id, member_id, parent_comment_id, content, is_secret)
VALUES (comments_seq.NEXTVAL, 2, 'user2', 1, '첫 번째 댓글에 답글입니다.', 'Y');

INSERT INTO comments (comment_id, post_id, member_id, parent_comment_id, content, is_secret)
VALUES (comments_seq.NEXTVAL, 3, 'user3', NULL, '두 번째 게시물에 댓글 남겨요.', 'N');
  
INSERT INTO comments (comment_id, post_id, member_id, parent_comment_id, content, is_secret)
VALUES (comments_seq.NEXTVAL, 4, 'user4', NULL, '멋진 글 감사합니다!', 'N');
  
INSERT INTO comments (comment_id, post_id, member_id, parent_comment_id, content, is_secret)
VALUES (comments_seq.NEXTVAL, 5, 'user5', NULL, '비밀 댓글입니다.', 'Y');

SELECT * FROM comments;

SELECT *
FROM comments
WHERE post_id = 1
FETCH FIRST 2 ROWS ONLY;

-- =============================================================================

INSERT INTO comment_like (comment_like_id, comment_id, member_id)
VALUES (comment_like_seq.NEXTVAL, 1, 'user2');

INSERT INTO comment_like (comment_like_id, comment_id, member_id)
VALUES (comment_like_seq.NEXTVAL, 2, 'user3');
  
INSERT INTO comment_like (comment_like_id, comment_id, member_id)
VALUES (comment_like_seq.NEXTVAL, 3, 'user1');
  
INSERT INTO comment_like (comment_like_id, comment_id, member_id)
VALUES (comment_like_seq.NEXTVAL, 4, 'user5');
  
INSERT INTO comment_like (comment_like_id, comment_id, member_id)
VALUES (comment_like_seq.NEXTVAL, 5, 'user4');

SELECT * FROM comment_like;

-- =============================================================================

-- neighbor 테이블 데이터 삽입
INSERT INTO neighbor (neighbor_id, member_id, neighbor_member_id) 
VALUES (neighbor_seq.NEXTVAL, 'user1', 'user2');

INSERT INTO neighbor (neighbor_id, member_id, neighbor_member_id) 
VALUES (neighbor_seq.NEXTVAL, 'user1', 'user3');

INSERT INTO neighbor (neighbor_id, member_id, neighbor_member_id) 
VALUES (neighbor_seq.NEXTVAL, 'user2', 'user4');

INSERT INTO neighbor (neighbor_id, member_id, neighbor_member_id) 
VALUES (neighbor_seq.NEXTVAL, 'user3', 'user5');

INSERT INTO neighbor (neighbor_id, member_id, neighbor_member_id) 
VALUES (neighbor_seq.NEXTVAL, 'user4', 'user5');

SELECT * FROM neighbor;

-- =============================================================================

-- guestbook 테이블 데이터 삽입
INSERT INTO guestbook (guestbook_id, blog_id, writer_id, content, is_secret)
VALUES (guestbook_seq.NEXTVAL, 2, 'user2', '블로그 정말 멋져요! 제주도 사진 예뻐요~', 'N');

INSERT INTO guestbook (guestbook_id, blog_id, writer_id, content, is_secret)
VALUES (guestbook_seq.NEXTVAL, 3, 'user3', '부산 여행 후기 잘 봤습니다!', 'N');

INSERT INTO guestbook (guestbook_id, blog_id, writer_id, content, is_secret)
VALUES (guestbook_seq.NEXTVAL, 1, 'user1', '비밀 방명록입니다 ㅎㅎ', 'Y');

INSERT INTO guestbook (guestbook_id, blog_id, writer_id, content, is_secret)
VALUES (guestbook_seq.NEXTVAL, 5, 'user5', '경주 역사 여행 정보 감사해요!', 'N');

INSERT INTO guestbook (guestbook_id, blog_id, writer_id, content, is_secret)
VALUES (guestbook_seq.NEXTVAL, 4, 'user4', '서울 야경 사진 정말 예쁘네요~', 'N');

SELECT * FROM guestbook;

-- =============================================================================

-- item_type: MUSIC일 경우 (가격 = 도토리 갯수)
INSERT INTO music (music_id, title, artist, album, music_file, price)
VALUES (music_seq.NEXTVAL, '밤하늘의 별을', '헤이즈', '밤하늘 앨범', '/music/star.mp3', 10);

INSERT INTO music (music_id, title, artist, album, music_file, price)
VALUES (music_seq.NEXTVAL, 'Love Dive', 'IVE', 'After Like', '/music/lovedive.mp3', 20);

INSERT INTO music (music_id, title, artist, album, music_file, price)
VALUES (music_seq.NEXTVAL, 'Next Level', 'aespa', 'Savage', '/music/nextlevel.mp3', 10);

INSERT INTO music (music_id, title, artist, album, music_file, price)
VALUES (music_seq.NEXTVAL, 'Butter', 'BTS', 'Butter', '/music/butter.mp3', 20);

INSERT INTO music (music_id, title, artist, album, music_file, price)
VALUES (music_seq.NEXTVAL, 'Attention', 'New Jeans', 'New Jeans', '/music/attention.mp3', 10);

SELECT * FROM music;

-- =============================================================================

-- item_type: EMOTICON일 경우

-- 이모티콘 이름 중복 방지
ALTER TABLE emoticon ADD CONSTRAINT unq_emoticon_name UNIQUE (emoticon_name);

-- 이모티콘 데이터 삽입 (가격 = 도토리 갯수)
INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '사랑스러운 화이트 마시멜로짱', 'https://img.stipop.io/2025/3/4/1741052202929_6d5ckoc8t8.png', 23);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '립덕이에요', 'https://img.stipop.io/2024/8/31/1725032076262_lb7daa8u0w.png', 20);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '귀여운 강아지 쫑이의 일상', 'https://img.stipop.io/2024/8/2/1722577166928_vqd0483a7v.png', 24);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '귀여운 소녀 리내', 'https://img.stipop.io/2024/7/23/1721680198099_f6hlzohsfq.png', 24);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '베베냥의 맛집리뷰', 'https://img.stipop.io/2024/5/27/1716791702177_zyu72ynlxk.png', 24);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '어쨌거나 고양이', 'https://img.stipop.io/2024/4/18/1713369752182_uz40dgz4qt.png', 17);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '새콤이의 말말말', 'https://img.stipop.io/2024/4/13/1712973889461_cjR9RcoVgz.png', 10);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '귀여운 토밍이', 'https://img.stipop.io/2024/2/25/1708799678513_5wn9rv6cwh.png', 24);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '밈잘알 햄짱이의 일상!', 'https://img.stipop.io/2024/1/13/1705151977368_n2plkbbz7t.png', 24);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '꾸밍이 등장', 'https://img.stipop.io/2023/6/4/1685815456266_ev4rzzrqpa.png', 16);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '퍼런햄쥐', 'https://img.stipop.io/2024/11/15/1731671187866_djwayienqn.png', 10);

INSERT INTO emoticon (emoticon_id, emoticon_name, emoticon_image, price)
VALUES (emoticon_seq.NEXTVAL, '팬그리 10종 모음', 'https://img.stipop.io/2025/5/23/1747926551160_9w3261buhx.png', 10);

SELECT * FROM emoticon;

-- =============================================================================

-- member_item 테이블 데이터 삽입
-- purchase_date는 기본값(현재 날짜)을 사용하므로 생략

-- EMOTICON 구매
INSERT INTO member_item (member_item_id, member_id, music_id, emoticon_id, item_type)
VALUES (member_item_seq.NEXTVAL, 'user1', NULL, 1, 'EMOTICON');

-- MUSIC 구매
INSERT INTO member_item (member_item_id, member_id, music_id, emoticon_id, item_type)
VALUES (member_item_seq.NEXTVAL, 'user2', 2, NULL, 'MUSIC');

-- EMOTICON 구매
INSERT INTO member_item (member_item_id, member_id, music_id, emoticon_id, item_type)
VALUES (member_item_seq.NEXTVAL, 'user3', NULL, 3, 'EMOTICON');

-- EMOTICON 구매
INSERT INTO member_item (member_item_id, member_id, music_id, emoticon_id, item_type)
VALUES (member_item_seq.NEXTVAL, 'user4', NULL, 4, 'EMOTICON');

-- MUSIC 구매
INSERT INTO member_item (member_item_id, member_id, music_id, emoticon_id, item_type)
VALUES (member_item_seq.NEXTVAL, 'user5', 5, NULL, 'MUSIC');

-- ========== 추가 ===z=======
-- 2024년도 9월부터의 이모티콘, 음악 더미데이터 랜덤 추가
BEGIN
  FOR i IN 1..100 LOOP
    DECLARE
      v_item_type     VARCHAR2(10);
      v_member_id     VARCHAR2(20);
      v_music_id      NUMBER;
      v_emoticon_id   NUMBER;
      v_purchase_date VARCHAR2(8);
      v_random_date   DATE;
    BEGIN
      -- 1. 랜덤 member_id (user1 ~ user5)
      v_member_id := 'user' || TO_CHAR(TRUNC(DBMS_RANDOM.VALUE(1, 6)));
      
      -- 2. 랜덤 날짜: 2024-09-01 ~ 2025-06-30
      v_random_date := TO_DATE('2024-09-01', 'YYYY-MM-DD') + TRUNC(DBMS_RANDOM.VALUE(0, 303)); -- 약 10개월

      v_purchase_date := TO_CHAR(v_random_date, 'YYYYMMDD');

      -- 3. 랜덤 아이템 타입 및 해당 ID 설정
      IF DBMS_RANDOM.VALUE < 0.5 THEN
        v_item_type := 'MUSIC';
        v_music_id := TRUNC(DBMS_RANDOM.VALUE(1, 6));      -- 1 ~ 5
        v_emoticon_id := NULL;
      ELSE
        v_item_type := 'EMOTICON';
        v_emoticon_id := TRUNC(DBMS_RANDOM.VALUE(1, 13));  -- 1 ~ 12
        v_music_id := NULL;
      END IF;

      -- 4. INSERT
      INSERT INTO member_item (
        member_item_id,
        member_id,
        music_id,
        emoticon_id,
        item_type,
        purchase_date
      ) VALUES (
        member_item_seq.NEXTVAL,
        v_member_id,
        v_music_id,
        v_emoticon_id,
        v_item_type,
        v_purchase_date
      );
    END;
  END LOOP;
  COMMIT;
END;
/

-- =============================================================================

-- 테이블 각각의 전체 컬럼 데이터 조회
SELECT * FROM member;
    SELECT * FROM member ORDER BY acorn DESC;
SELECT * FROM blog;
SELECT * FROM post;
    SELECT * FROM post ORDER BY post_id DESC;
SELECT * FROM post_image;
    SELECT * FROM post_image WHERE post_id = 21;
SELECT * FROM hashtag_people;
SELECT * FROM post_hashtag_people;
SELECT * FROM post_like;
SELECT * FROM comments;
SELECT * FROM comment_like;
SELECT * FROM neighbor;
SELECT * FROM guestbook;
SELECT * FROM guestbook ORDER BY blog_id DESC;

SELECT * FROM music;
SELECT * FROM emoticon;
SELECT * FROM member_item;

-- 전체 시퀀스 조회
SELECT SEQUENCE_NAME FROM USER_SEQUENCES;

-- =============================================================================

COMMIT; -- 모든 변경사항 저장

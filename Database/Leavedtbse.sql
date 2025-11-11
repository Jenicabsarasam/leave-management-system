--
-- PostgreSQL database dump
--

\restrict puWtvWGrJLuQqSCfLo5ng0MYKkMwcEvm72kcVgEq7fD2tw1ldJzG7zzhFB3Ah0g

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2025-10-03 07:24:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17658)
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17657)
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.branches_id_seq OWNER TO postgres;

--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 221
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- TOC entry 224 (class 1259 OID 17671)
-- Name: hostels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hostels (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    code character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hostels OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17670)
-- Name: hostels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hostels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hostels_id_seq OWNER TO postgres;

--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 223
-- Name: hostels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hostels_id_seq OWNED BY public.hostels.id;


--
-- TOC entry 230 (class 1259 OID 17741)
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaves (
    id integer NOT NULL,
    student_id integer NOT NULL,
    parent_id integer,
    advisor_id integer,
    warden_id integer,
    reason text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    type character varying(20) DEFAULT 'normal'::character varying,
    status character varying(50) DEFAULT 'pending'::character varying,
    qr_code text,
    arrival_timestamp timestamp without time zone,
    warden_comments text,
    emergency_approved_at timestamp without time zone,
    proof_submitted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    meeting_scheduled boolean DEFAULT false,
    meeting_date timestamp without time zone,
    meeting_notes text,
    proof_file_path text,
    proof_verified boolean DEFAULT false,
    proof_verified_by integer,
    proof_verified_at timestamp without time zone,
    proof_submitted_at timestamp without time zone
);


ALTER TABLE public.leaves OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17740)
-- Name: leaves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leaves_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leaves_id_seq OWNER TO postgres;

--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 229
-- Name: leaves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leaves_id_seq OWNED BY public.leaves.id;


--
-- TOC entry 228 (class 1259 OID 17717)
-- Name: parent_student; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parent_student (
    id integer NOT NULL,
    parent_id integer NOT NULL,
    student_id integer NOT NULL,
    relationship character varying(50) DEFAULT 'parent'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.parent_student OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17716)
-- Name: parent_student_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.parent_student_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parent_student_id_seq OWNER TO postgres;

--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 227
-- Name: parent_student_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.parent_student_id_seq OWNED BY public.parent_student.id;


--
-- TOC entry 220 (class 1259 OID 17646)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17645)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 232 (class 1259 OID 17798)
-- Name: system_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_logs (
    id integer NOT NULL,
    user_id integer,
    user_name character varying(255),
    action text NOT NULL,
    ip_address character varying(45),
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_logs OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17797)
-- Name: system_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 231
-- Name: system_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_logs_id_seq OWNED BY public.system_logs.id;


--
-- TOC entry 226 (class 1259 OID 17684)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role_id integer NOT NULL,
    phone character varying(20),
    roll_number character varying(50),
    branch_id integer,
    division character varying(1),
    hostel_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_division_check CHECK (((division IS NULL) OR ((division)::text = ANY ((ARRAY['A'::character varying, 'B'::character varying, 'C'::character varying, 'D'::character varying, 'E'::character varying])::text[]))))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17683)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4841 (class 2604 OID 17661)
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- TOC entry 4843 (class 2604 OID 17674)
-- Name: hostels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostels ALTER COLUMN id SET DEFAULT nextval('public.hostels_id_seq'::regclass);


--
-- TOC entry 4850 (class 2604 OID 17744)
-- Name: leaves id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves ALTER COLUMN id SET DEFAULT nextval('public.leaves_id_seq'::regclass);


--
-- TOC entry 4847 (class 2604 OID 17720)
-- Name: parent_student id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_student ALTER COLUMN id SET DEFAULT nextval('public.parent_student_id_seq'::regclass);


--
-- TOC entry 4839 (class 2604 OID 17649)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 17801)
-- Name: system_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs ALTER COLUMN id SET DEFAULT nextval('public.system_logs_id_seq'::regclass);


--
-- TOC entry 4845 (class 2604 OID 17687)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5055 (class 0 OID 17658)
-- Dependencies: 222
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, code, created_at) FROM stdin;
1	Computer Science Engineering	CSE	2025-09-30 10:14:00.447792
2	Artificial Intelligence	AI	2025-09-30 10:14:00.447792
3	Electrical and Electronics Engineering	EEE	2025-09-30 10:14:00.447792
4	Mechanical Engineering	MECH	2025-09-30 10:14:00.447792
5	Civil Engineering	CIVIL	2025-09-30 10:14:00.447792
\.


--
-- TOC entry 5057 (class 0 OID 17671)
-- Dependencies: 224
-- Data for Name: hostels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hostels (id, name, code, created_at) FROM stdin;
1	Nila	NILA	2025-09-30 10:14:00.447792
2	Kaveri	KAVERI	2025-09-30 10:14:00.447792
3	Ganga	GANGA	2025-09-30 10:14:00.447792
4	Yamuna	YAMUNA	2025-09-30 10:14:00.447792
5	Saraswati	SARASWATI	2025-09-30 10:14:00.447792
\.


--
-- TOC entry 5063 (class 0 OID 17741)
-- Dependencies: 230
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (id, student_id, parent_id, advisor_id, warden_id, reason, start_date, end_date, type, status, qr_code, arrival_timestamp, warden_comments, emergency_approved_at, proof_submitted, created_at, updated_at, meeting_scheduled, meeting_date, meeting_notes, proof_file_path, proof_verified, proof_verified_by, proof_verified_at, proof_submitted_at) FROM stdin;
1	1	\N	\N	2	Sick	2025-10-01	2025-10-02	emergency	completed	data:image/png;base64,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	2025-09-30 04:51:21.843		2025-09-30 04:47:54.723	t	2025-09-30 10:16:52.496177	2025-09-30 10:16:52.496177	f	\N	\N	/uploads/proofs/proof-1759392387452-866787746-Tutorial_3_September_2025.pdf	t	4	2025-10-02 08:18:09.709	2025-10-02 08:06:27.473
3	5	\N	\N	6	Health issue	2025-10-01	2025-10-01	emergency	completed	data:image/png;base64,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	2025-09-30 06:55:13.209	\N	2025-09-30 06:53:59.949	f	2025-09-30 12:23:06.285425	2025-09-30 12:23:06.285425	f	\N	\N	\N	f	\N	\N	\N
4	9	10	4	2	Weekend	2025-10-03	2025-10-05	normal	warden_approved	data:image/png;base64,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	\N	\N	\N	f	2025-09-30 15:48:27.536164	2025-09-30 15:48:27.536164	f	\N	\N	\N	f	\N	\N	\N
2	1	\N	\N	2	Health emeregency	2025-10-03	2025-10-03	emergency	rejected	\N	\N	\N	\N	f	2025-09-30 10:20:05.041378	2025-09-30 10:20:05.041378	f	\N	\N	\N	f	\N	\N	\N
5	9	\N	\N	\N	Going for a function	2025-10-01	2025-10-02	normal	pending	\N	\N	\N	\N	f	2025-09-30 20:17:33.973036	2025-09-30 20:17:33.973036	f	\N	\N	\N	f	\N	\N	\N
6	11	\N	\N	2	Health emeregency	2025-10-01	2025-10-01	emergency	warden_approved	data:image/png;base64,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	\N	\N	2025-10-02 06:26:18.859	f	2025-09-30 20:28:00.928808	2025-09-30 20:28:00.928808	f	\N	\N	\N	f	\N	\N	\N
7	1	3	4	2	Weekend	2025-10-11	2025-10-12	normal	warden_approved	data:image/png;base64,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	\N	\N	\N	f	2025-10-02 11:57:43.279378	2025-10-02 11:57:43.279378	f	\N	\N	\N	f	\N	\N	\N
8	11	12	4	2	Weekend	2025-10-25	2025-10-26	normal	warden_approved	data:image/png;base64,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	\N	\N	\N	f	2025-10-02 12:17:59.06601	2025-10-02 12:17:59.06601	f	\N	\N	\N	f	\N	\N	\N
\.


--
-- TOC entry 5061 (class 0 OID 17717)
-- Dependencies: 228
-- Data for Name: parent_student; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parent_student (id, parent_id, student_id, relationship, created_at) FROM stdin;
1	3	1	parent	2025-09-30 10:18:37.703293
2	7	5	parent	2025-09-30 12:24:58.419453
3	10	9	parent	2025-09-30 15:49:09.11563
4	12	11	parent	2025-10-02 12:19:20.678884
\.


--
-- TOC entry 5053 (class 0 OID 17646)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, created_at) FROM stdin;
1	student	2025-09-30 10:14:00.447792
2	parent	2025-09-30 10:14:00.447792
3	advisor	2025-09-30 10:14:00.447792
4	warden	2025-09-30 10:14:00.447792
5	admin	2025-09-30 10:14:00.447792
\.


--
-- TOC entry 5065 (class 0 OID 17798)
-- Dependencies: 232
-- Data for Name: system_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_logs (id, user_id, user_name, action, ip_address, user_agent, "timestamp") FROM stdin;
\.


--
-- TOC entry 5059 (class 0 OID 17684)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role_id, phone, roll_number, branch_id, division, hostel_id, created_at) FROM stdin;
1	TestStudent1	studenttest1@college.edu	$2b$10$YcynczFFB3a3FeDTfN4rae8s8Iz3oO9/lOzKTy/K1rsq.0LG4UVSa	1		1	1	A	1	2025-09-30 10:16:26.028462
2	TestWarden1	wardentest1@college.edu	$2b$10$bb8FE.fZtVSmpUKURhmSEOvZbYEfSgvtDAUN6GSFNg5NEXSPa6vYa	4			\N	\N	1	2025-09-30 10:17:40.426334
3	TestParent1	parenttest1@college.edu	$2b$10$jiKZ1cIXVe6lWEP2uLXxHelrDkrWebGf6soTk98zaxYuC3/mfbsbm	2		1	\N	\N	\N	2025-09-30 10:18:37.699551
4	TestAdvisor1	advisortest1@college.edu	$2b$10$9KiBiVWOO.nmafKv6I2XIels.uAY2DkZBjMcY7W6LGnxxmZnE6tMe	3			1	A	\N	2025-09-30 10:22:33.655449
5	TestStudent2	studenttest2@college.edu	$2b$10$MBn7gq4GxHuDvxGdUHnG8uaXpKOE2bIYNoJ5ekD1ESSQslFp/WEj6	1		2	4	D	2	2025-09-30 12:22:21.576104
6	TestWarden2	wardentest2@college.edu	$2b$10$MW3HqrXt7wK3R3pv2iD6xOkHMYC5ns4FL5MesmGiugN0sr2je8W/i	4			\N	\N	2	2025-09-30 12:23:39.7466
7	TestParent2	parenttest2@college.edu	$2b$10$uNABOi5jDLL7WWVNwxWjTOHKhG8gUy2/FKoHv0CJghCeKw5p5fwIO	2		2	\N	\N	\N	2025-09-30 12:24:58.415915
8	TestAdvisor2	advisortest2@college.edu	$2b$10$8kyY5OBqHFE3vG/c0CpDreyeGGhEVtkXUb0tqCDcx.ISjAuoVGm42	3			4	D	\N	2025-09-30 12:26:32.269477
9	TestStudent3	studenttest3@college.edu	$2b$10$HSlSD9nbU8utK5dVo/fWGOFGx2k5ZCLrWrujzdMAgWAoRp42I7rYa	1		3	1	A	1	2025-09-30 15:47:52.113157
10	TestParent3	parenttest3@college.edu	$2b$10$j68kdvc7RkFhMueAq5LpzObfCXKDO2vH7Ad9LzlapTHFQVBMLo4ue	2		3	\N	\N	\N	2025-09-30 15:49:09.111447
11	Jenica B Sarasam	jenicabsarasam@gmail.com	$2b$10$4LS/FYfAZyGuB8EPhupSbeq5aIPXxKFYsQrZnt4rR75/.2I6mMVrm	1		23	1	A	1	2025-09-30 20:27:07.201673
12	Biju A Sarasam	bijusarasam@gmail.com	$2b$10$9iLlgPy.SHPqscKOjpNtv.pU3IMVvlp/YR41cgwIM08iubX18iI2C	2		23	\N	\N	\N	2025-10-02 12:19:20.67359
13	System Admin	admin@college.edu	$2b$10$8JsZp.Edkfh7f3z8M4fpzuRf/Vl9wWhMniexeJMp1e.VtkQ6LCFZq	5	\N	\N	\N	\N	\N	2025-10-02 14:13:53.531846
\.


--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 221
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 5, true);


--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 223
-- Name: hostels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hostels_id_seq', 5, true);


--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 229
-- Name: leaves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leaves_id_seq', 8, true);


--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 227
-- Name: parent_student_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.parent_student_id_seq', 4, true);


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 67, true);


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 231
-- Name: system_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_logs_id_seq', 1, false);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- TOC entry 4866 (class 2606 OID 17669)
-- Name: branches branches_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_key UNIQUE (code);


--
-- TOC entry 4868 (class 2606 OID 17667)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 17682)
-- Name: hostels hostels_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostels
    ADD CONSTRAINT hostels_code_key UNIQUE (code);


--
-- TOC entry 4872 (class 2606 OID 17680)
-- Name: hostels hostels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hostels
    ADD CONSTRAINT hostels_pkey PRIMARY KEY (id);


--
-- TOC entry 4889 (class 2606 OID 17758)
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- TOC entry 4882 (class 2606 OID 17729)
-- Name: parent_student parent_student_parent_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_student
    ADD CONSTRAINT parent_student_parent_id_student_id_key UNIQUE (parent_id, student_id);


--
-- TOC entry 4884 (class 2606 OID 17727)
-- Name: parent_student parent_student_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_student
    ADD CONSTRAINT parent_student_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 17656)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 4864 (class 2606 OID 17654)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 17808)
-- Name: system_logs system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 17700)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4878 (class 2606 OID 17698)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4885 (class 1259 OID 17780)
-- Name: idx_leaves_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leaves_status ON public.leaves USING btree (status);


--
-- TOC entry 4886 (class 1259 OID 17779)
-- Name: idx_leaves_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leaves_student_id ON public.leaves USING btree (student_id);


--
-- TOC entry 4887 (class 1259 OID 17781)
-- Name: idx_leaves_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leaves_type ON public.leaves USING btree (type);


--
-- TOC entry 4879 (class 1259 OID 17784)
-- Name: idx_parent_student_parent_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parent_student_parent_id ON public.parent_student USING btree (parent_id);


--
-- TOC entry 4880 (class 1259 OID 17785)
-- Name: idx_parent_student_student_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_parent_student_student_id ON public.parent_student USING btree (student_id);


--
-- TOC entry 4890 (class 1259 OID 17814)
-- Name: idx_system_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_timestamp ON public.system_logs USING btree ("timestamp");


--
-- TOC entry 4891 (class 1259 OID 17815)
-- Name: idx_system_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_system_logs_user_id ON public.system_logs USING btree (user_id);


--
-- TOC entry 4873 (class 1259 OID 17782)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4874 (class 1259 OID 17783)
-- Name: idx_users_role_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role_id ON public.users USING btree (role_id);


--
-- TOC entry 4899 (class 2606 OID 17769)
-- Name: leaves leaves_advisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_advisor_id_fkey FOREIGN KEY (advisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4900 (class 2606 OID 17764)
-- Name: leaves leaves_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4901 (class 2606 OID 17789)
-- Name: leaves leaves_proof_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_proof_verified_by_fkey FOREIGN KEY (proof_verified_by) REFERENCES public.users(id);


--
-- TOC entry 4902 (class 2606 OID 17759)
-- Name: leaves leaves_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4903 (class 2606 OID 17774)
-- Name: leaves leaves_warden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_warden_id_fkey FOREIGN KEY (warden_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4897 (class 2606 OID 17730)
-- Name: parent_student parent_student_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_student
    ADD CONSTRAINT parent_student_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4898 (class 2606 OID 17735)
-- Name: parent_student parent_student_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parent_student
    ADD CONSTRAINT parent_student_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 17809)
-- Name: system_logs system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4894 (class 2606 OID 17706)
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE SET NULL;


--
-- TOC entry 4895 (class 2606 OID 17711)
-- Name: users users_hostel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_hostel_id_fkey FOREIGN KEY (hostel_id) REFERENCES public.hostels(id) ON DELETE SET NULL;


--
-- TOC entry 4896 (class 2606 OID 17701)
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


-- Completed on 2025-10-03 07:24:50

--
-- PostgreSQL database dump complete
--

\unrestrict puWtvWGrJLuQqSCfLo5ng0MYKkMwcEvm72kcVgEq7fD2tw1ldJzG7zzhFB3Ah0g


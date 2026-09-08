window.PROJECT_LIBRARY_DESIGNS = {
  projects: [
    {
      slug: "inclusive-game-ai",
      sourceIndex: 0,
      icon: "gaia",
      shortTitle: {
        en: "Accessible Game AI",
        ko: "접근 가능한 게임 AI",
      },
      category: {
        en: "Assistive AI",
        ko: "보조 AI",
      },
      story: {
        research: {
          en: "Field interviews with players with disabilities identified barriers they could not resolve independently.",
          ko: "장애인 플레이어 현장 인터뷰를 통해 혼자 해결하기 어려운 실제 장벽을 발견했습니다.",
        },
        design: {
          en: "Mapped assistance to Explainer, Reader, and player-authorized Surrogate roles so support could adapt without overriding agency.",
          ko: "지원을 Explainer, Reader, 사용자 승인형 Surrogate 역할에 연결해 주체성을 침해하지 않으면서 상황에 맞게 전환하도록 설계했습니다.",
        },
        artifact: {
          en: "A game-grounded RAG agent with text and voice interaction, optional visual context, logging, and an operator workflow.",
          ko: "게임 지식 기반 RAG, 텍스트·음성 상호작용, 선택형 시각 맥락, 기록, 운영 워크플로를 갖춘 에이전트입니다.",
        },
        evidence: {
          en: "Across the project, we conducted in-depth interviews with approximately 30 participants and surveys of approximately 200 participants recruited through partner organizations; design principles were published at ACM IUI 2026.",
          ko: "프로젝트 전반 약 30명 심층 인터뷰와 협력단체를 통한 약 200명 설문을 진행했으며, 설계 원칙은 ACM IUI 2026에 게재되었습니다.",
        },
      },
      editorial: {
        question: {
          en: "How can an AI assistant help players overcome game-specific barriers while preserving their control, challenge, and sense of accomplishment?",
          ko: "AI 어시스턴트가 플레이어의 통제감과 도전, 성취를 지키면서 게임별 접근성 장벽을 넘도록 도울 수 있을까?",
        },
        responsibility: {
          en: "As lead student researcher, I connect field research, requirements, system design, prototyping, evaluation, and publication. My direct work includes interviews, interaction design, RAG and multimodal implementation, data analysis, and research synthesis.",
          ko: "학생연구원 총괄로서 현장 연구부터 요구사항 도출, 시스템 설계, 프로토타이핑, 평가, 논문화까지 연결합니다. 인터뷰, 상호작용 설계, RAG·멀티모달 구현, 데이터 분석, 연구 종합을 직접 수행했습니다.",
        },
        evaluation: {
          en: "Across the project, we conducted in-depth interviews with approximately 30 participants and surveys of approximately 200 participants recruited through partner organizations.",
          ko: "프로젝트 전반 약 30명 심층 인터뷰와 협력단체를 통한 약 200명 설문을 진행했습니다.",
        },
        outcome: {
          en: "The resulting timing, modality, customization, and automation principles were published at ACM IUI 2026.",
          ko: "도출된 개입 시점, 모달리티, 개인화, 자동화 원칙은 ACM IUI 2026에 게재되었습니다.",
        },
        lesson: {
          en: "Better accessibility did not come from answering more questions. It came from matching what the assistant could sense, express, and do to how each player could perceive and act.",
          ko: "더 많은 질문에 답하는 것만으로 접근성이 높아지지는 않았습니다. 어시스턴트의 감지·표현·실행 방식을 각 플레이어의 지각과 행동 방식에 맞추는 것이 핵심이었습니다.",
        },
        problem: {
          en: "Players with disabilities encounter information, perception, and execution gaps during settings and live play. Existing accessibility options cover known cases, but a text-first overlay can still fail when support conflicts with screen readers, vision, motor capacity, or the pace of play.",
          ko: "장애인 플레이어는 설정과 실제 플레이에서 정보·지각·실행의 간극을 겪습니다. 기존 접근성 옵션은 알려진 사례를 다루지만, 텍스트 중심 오버레이는 스크린 리더·시각·운동 능력·플레이 속도와 충돌할 때 다시 장벽이 됩니다.",
        },
        build: {
          en: "I developed a domain-grounded research assistant with game-specific knowledge, RAG, text and voice interaction, optional visual context, interaction logging, and an operator workflow for studies and iteration.",
          ko: "게임별 지식과 RAG, 텍스트·음성 상호작용, 선택적 화면 맥락, 상호작용 로그, 연구 운영 도구를 결합한 도메인 특화 어시스턴트를 개발했습니다.",
        },
        decision: {
          en: "I organized assistance around the barrier occurring in the moment: Explainer for information, Reader for perception, and Surrogate for player-authorized execution. This makes modality and player agency part of the system architecture.",
          ko: "진단명이 아니라 그 순간 발생한 장벽을 기준으로 정보 지원은 Explainer, 지각 지원은 Reader, 플레이어가 승인한 실행 지원은 Surrogate로 구분했습니다. 지원 방식과 플레이어의 주체성을 시스템 구조에 반영한 결정입니다.",
        },
        validation: {
          en: "Across the project, we conducted in-depth interviews with approximately 30 participants and surveys of approximately 200 participants recruited through partner organizations.",
          ko: "프로젝트 전반 약 30명 심층 인터뷰와 협력단체를 통한 약 200명 설문을 진행했습니다.",
        },
        outcomeSystem: {
          en: "A working GAIA research platform and a modular Explainer-Reader-Surrogate roadmap were handed forward for continued development.",
          ko: "작동하는 GAIA 연구 플랫폼과 Explainer-Reader-Surrogate 모듈형 발전 로드맵을 구축해 후속 개발로 인계했습니다.",
        },
        outcomeEvidence: {
          en: "The studies showed strong value for information gaps, but exposed modality mismatch for perception and input burden for execution. The work produced peer-reviewed outputs at CHI, IUI, HCI Korea, and Korean journals and conferences.",
          ko: "정보 간극에는 높은 효용을 보였지만 지각에서는 출력 모달리티 불일치, 실행에서는 입력 부담을 확인했습니다. 결과는 CHI·IUI·HCI Korea 및 국내 학술지·학회 논문으로 이어졌습니다.",
        },
        outcomeValue: {
          en: "The project connects KAIST research with disability communities, the National Rehabilitation Center, game-industry partners, and international accessibility organizations.",
          ko: "KAIST 연구를 장애인 커뮤니티, 국립재활원, 게임 산업 파트너, 해외 접근성 기관과 연결했습니다.",
        },
      },
      palette: "cobalt",
      pattern: "signal",
      height: "tall",
      width: "wide",
      mark: "GAIA",
      spineVenue: "KAIST",
      subtitle: {
        en: "A conversational AI assistant designed around each player's immediate accessibility barrier.",
        ko: "플레이어가 마주한 순간의 접근성 장벽에 맞춰 지원 방식을 바꾸는 대화형 AI",
      },
    },
    {
      slug: "data-quality-engine",
      sourceIndex: 1,
      icon: "dqm",
      shortTitle: {
        en: "Data-Quality Engine",
        ko: "데이터 품질 엔진",
      },
      category: {
        en: "Data Systems",
        ko: "데이터 시스템",
      },
      story: {
        research: {
          en: "Mapped enterprise data-quality rules and audit requirements against real production data.",
          ko: "실제 운영 데이터를 바탕으로 기업 데이터 품질 규칙과 감사 요구사항을 정리했습니다.",
        },
        design: {
          en: "Chose deterministic rules and statistics where LLM variability would weaken auditability.",
          ko: "LLM의 변동성이 감사 가능성을 약화하는 구간에는 결정론적 규칙과 통계를 선택했습니다.",
        },
        artifact: {
          en: "A version-controlled, production-oriented engine for automated data-quality measurement and verification.",
          ko: "데이터 품질 측정·검증을 자동화하는 버전 관리형 운영 지향 엔진입니다.",
        },
        evidence: {
          en: "I tested the engine on enterprise data and documented module- and test-level results in a formal report.",
          ko: "기업 데이터로 엔진을 시험하고 모듈·테스트 단위 결과를 공식 보고서에 정리했습니다.",
        },
      },
      editorial: {
        question: {
          en: "How can we automate enterprise data-quality verification without trading away determinism, auditability, or reproducibility?",
          ko: "결정론·감사 가능성·재현성을 포기하지 않고 기업 데이터 품질 검증을 어떻게 자동화할 수 있을까?",
        },
        responsibility: {
          en: "I independently built the DQM v1.0 engine within SKAIWORLDWIDE's 2024–2026 government-funded R&D project. I owned rule translation, architecture, implementation, version control, testing, and verification for the engine; the broader funded project remained a team effort.",
          ko: "SKAIWORLDWIDE의 2024~2026년 정부 지원 R&D 과제에서 DQM v1.0 엔진을 단독 개발했습니다. 엔진 범위의 규칙 해석, 아키텍처, 구현, 버전 관리, 시험, 검증을 맡았으며 전체 과제는 팀 단위로 수행되었습니다.",
        },
        evaluation: {
          en: "The release was checked against real enterprise data and documented in a formal verification report.",
          ko: "실제 기업 데이터로 릴리스를 검증하고 공식 검증 보고서에 기록했습니다.",
        },
        outcome: {
          en: "I prepared a version-controlled, production-oriented engine and formal results package for technical handoff.",
          ko: "버전 관리형 운영 지향 엔진과 공식 결과 패키지를 기술 인계용으로 준비했습니다.",
        },
        lesson: {
          en: "The strongest engineering decision was not adding more AI, but selecting the smallest reliable mechanism for each decision boundary.",
          ko: "가장 중요한 엔지니어링 결정은 AI를 더 많이 적용하는 것이 아니라 각 판단 지점에 가장 단순하고 신뢰할 수 있는 방식을 선택하는 일이었습니다.",
        },
        problem: {
          en: "Operational teams must apply many quality rules to real data, but manual checks are slow and difficult to reproduce. A probabilistic model can generate plausible explanations while still weakening the exact audit trail the client needs.",
          ko: "운영 조직은 실제 데이터에 많은 품질 규칙을 적용해야 하지만 수작업 검사는 느리고 재현하기 어렵습니다. 확률적 모델은 그럴듯한 설명을 만들 수 있어도 고객이 필요로 하는 정확한 감사 추적성을 약화시킬 수 있습니다.",
        },
        build: {
          en: "I built a versioned engine that applies deterministic rules and statistical checks to enterprise datasets, detects and corrects quality errors, infers structural relationships, and records reviewable results.",
          ko: "기업 데이터에 결정론적 규칙과 통계 검사를 적용해 품질 오류를 탐지·보정하고 구조적 관계를 추론하며, 검토 가능한 결과를 기록하는 버전형 엔진을 구축했습니다.",
        },
        decision: {
          en: "Where identical inputs needed to produce identical, inspectable outputs, I chose explicit rules and statistics over an LLM.",
          ko: "동일한 입력에 대해 동일하고 검토 가능한 결과가 필요한 구간에는 LLM 대신 명시적 규칙과 통계를 적용했습니다.",
        },
        validation: {
          en: "I tested the engine on enterprise datasets and documented its behavior in a formal results report. My scope covered technical implementation and verification; final client acceptance was outside my role.",
          ko: "기업 데이터셋으로 엔진을 시험하고 동작과 결과를 공식 보고서에 정리했습니다. 제 역할은 기술 구현과 검증까지였으며 최종 고객 인수는 담당 범위 밖이었습니다.",
        },
        outcomeSystem: {
          en: "A production-oriented, versioned verification engine and a formal results report prepared for handoff.",
          ko: "운영 지향 버전형 검증 엔진과 인수인계를 위해 작성한 공식 결과보고서",
        },
        outcomeEvidence: {
          en: "Each rule-level result can be reproduced and inspected instead of being accepted as an opaque model judgment.",
          ko: "불투명한 모델 판단에 의존하지 않고 규칙별 결과를 재현하고 점검할 수 있도록 만들었습니다.",
        },
        outcomeValue: {
          en: "The engine provides an auditable foundation for recurring data-quality checks and future rule expansion.",
          ko: "반복적인 데이터 품질 검사와 향후 규칙 확장을 위한 감사 가능한 기반을 마련했습니다.",
        },
      },
      palette: "ink",
      pattern: "grid",
      height: "standard",
      width: "regular",
      mark: "DQM",
      spineVenue: "IND",
      subtitle: {
        en: "A deterministic data-quality engine built for repeatable and auditable verification.",
        ko: "반복 가능하고 감사 가능한 검증을 위해 개발한 결정론적 데이터 품질 엔진",
      },
    },
    {
      slug: "haenyeo-legacy",
      sourceIndex: 2,
      icon: "tewak",
      shortTitle: {
        en: "Haenyeo Heritage",
        ko: "해녀 문화유산",
      },
      category: {
        en: "Serious Games",
        ko: "시리어스 게임",
      },
      story: {
        research: {
          en: "Worked with Haenyeo communities and the museum on the loss of intergenerational knowledge.",
          ko: "해녀 공동체와 박물관과 함께 세대 간 지식 단절 문제를 조사했습니다.",
        },
        design: {
          en: "Translated diving practice and ecological knowledge into learnable serious-game mechanics.",
          ko: "잠수 작업과 생태 지식을 학습 가능한 시리어스 게임 메커니즘으로 전환했습니다.",
        },
        artifact: {
          en: "A community-reviewed game concept, narrative, mechanics, visual journey, and care-centered design method.",
          ko: "공동체가 검토한 게임 콘셉트·서사·메커니즘·비주얼 여정과 돌봄 중심 설계 방법입니다.",
        },
        evidence: {
          en: "Two workshop cycles involved six Haenyeo and one Haenam; participants refined mechanics and representation.",
          ko: "두 차례 워크숍에 해녀 6명과 해남 1명이 참여해 메커니즘과 재현 방식을 다듬었습니다.",
        },
      },
      editorial: {
        question: {
          en: "How can we translate embodied Haenyeo knowledge into play without flattening it into folklore or replacing community voice with designer interpretation?",
          ko: "해녀의 체화된 지식을 민속 이미지로 축소하거나 디자이너의 해석으로 공동체 목소리를 대체하지 않고 어떻게 놀이로 옮길 수 있을까?",
        },
        responsibility: {
          en: "As a student researcher and game designer, I joined preparatory fieldwork, participatory workshops, design synthesis, mechanics and narrative development, and the return session for community review.",
          ko: "학생연구원·게임 디자이너로 사전 현장 조사, 참여형 워크숍, 설계 종합, 메커닉·내러티브 개발, 공동체 검토를 위한 재방문 세션에 참여했습니다.",
        },
        evaluation: {
          en: "The game concept and visual journey were grounded through two co-design cycles with six Haenyeo and one Haenam.",
          ko: "해녀 6명과 해남 1명이 참여한 두 차례 공동 설계를 통해 게임 콘셉트와 시각적 여정을 검토했습니다.",
        },
        outcome: {
          en: "The work produced a community-reviewed game concept, narrative, mechanics, visual journey, and care-centered design method; a playable build remains future work.",
          ko: "공동체가 검토한 게임 콘셉트·서사·메커니즘·시각적 여정과 돌봄 중심 설계 방법을 만들었으며 플레이 가능한 빌드는 후속 과제입니다.",
        },
        problem: {
          en: "Jeju Haenyeo knowledge is ecological, embodied, and intergenerational. Static documentation can preserve artifacts, but it struggles to communicate the lived logic of breath, mutual responsibility, environmental change, and community survival.",
          ko: "제주 해녀의 지식은 생태적·체화적·세대 간 지식입니다. 정적 기록은 자료를 보존할 수 있지만 숨, 상호 책임, 환경 변화, 공동체 생존의 살아 있는 논리를 전달하기 어렵습니다.",
        },
        build: {
          en: "A slide-based and visual-journey concept for The Golden Tewak, with a breath-centered core loop, diving tasks, community decisions, characters, environmental dilemmas, and the Inspiration Game Design with Care method.",
          ko: "숨 중심 코어 루프, 물질 과업, 공동체 의사결정, 인물, 환경 딜레마를 담은 The Golden Tewak 시각 콘셉트와 Inspiration Game Design with Care 방법을 만들었습니다.",
        },
        decision: {
          en: "We treated relationship building and interpretation as design work. The team returned repeatedly to community narratives and used an insider-interpreter to preserve cultural meaning beyond literal translation.",
          ko: "관계 형성과 해석 자체를 설계 작업으로 보았습니다. 공동체 서사로 반복해서 돌아가고 내부자 통역자의 문화적 해석을 통해 문자 번역 이상의 의미를 보존했습니다.",
        },
        validation: {
          en: "Evidence came from preparatory meetings, interviews with two senior Haenyeo, two participatory workshop cycles, a four-day design sprint, six Haenyeo plus one Haenam representing three villages and Jeju City, and consultation with Haenyeo Museum experts.",
          ko: "사전 회의, 고령 해녀 2명 인터뷰, 2차례 참여형 워크숍, 4일 디자인 스프린트, 3개 마을·제주시를 대표한 해녀 6명과 해남 1명, 해녀박물관 전문가 자문으로 검증했습니다.",
        },
        outcomeSystem: {
          en: "A community-reviewed game concept, narrative, mechanics, visual journey, and reusable care-centered design method.",
          ko: "공동체 검토를 거친 게임 콘셉트·내러티브·메커닉·비주얼 여정과 재사용 가능한 돌봄 중심 설계 방법",
        },
        outcomeEvidence: {
          en: "Participants unanimously said it was a game they would play and refined the breathing mechanic, platform direction, art direction, and representation.",
          ko: "참여자 전원이 직접 플레이하고 싶은 게임이라고 평가했으며 숨 메커닉, 플랫폼, 아트 방향, 재현 방식을 함께 수정했습니다.",
        },
        outcomeValue: {
          en: "The community recognized shared ownership; the Haenyeo Museum identified value for education and international interpretation. A playable prototype remains future work.",
          ko: "공동체는 공동 소유감을 확인했고 해녀박물관은 교육·국제 관람객 해설 도구의 가치를 확인했습니다. 플레이 가능한 프로토타입은 후속 과제입니다.",
        },
        lesson: {
          en: "The challenge was not digitizing tradition. It was creating enough trust and generative friction for a community to imagine its own future through play.",
          ko: "핵심은 전통의 디지털화가 아니라 공동체가 놀이를 통해 자신의 미래를 상상할 수 있도록 신뢰와 생산적 긴장을 만드는 일이었습니다.",
        },
      },
      palette: "oxide",
      pattern: "current",
      height: "short",
      width: "wide",
      mark: "HNY",
      spineVenue: "KAIST",
      subtitle: {
        en: "The Golden Tewak, a community-authored game concept for carrying living heritage forward.",
        ko: "살아 있는 유산을 다음 세대로 잇는 공동체 기반 게임 콘셉트, The Golden Tewak",
      },
    },
    {
      slug: "adaptive-xr",
      sourceIndex: 3,
      icon: "xr",
      shortTitle: {
        en: "Adaptive XR",
        ko: "적응형 XR",
      },
      category: {
        en: "Extended Reality",
        ko: "확장현실",
      },
      story: {
        research: {
          en: "Studied how changing physical environments break the fit between real and virtual space.",
          ko: "변화하는 물리 환경이 현실과 가상 공간의 정합성을 어떻게 깨뜨리는지 탐구했습니다.",
        },
        design: {
          en: "Contributed to adaptive spatial rules and multimodal visual-haptic feedback within an international consortium.",
          ko: "국제 컨소시엄에서 적응형 공간 규칙과 멀티모달 시각·햅틱 피드백에 기여했습니다.",
        },
        artifact: {
          en: "A real-time XR interface that repositions virtual content around physical conditions.",
          ko: "물리 조건에 맞춰 가상 콘텐츠를 재배치하는 실시간 XR 인터페이스입니다.",
        },
        evidence: {
          en: "The international consortium validated the integrated XR system; the study did not isolate an individual user-study effect for my module.",
          ko: "국제 컨소시엄이 통합 XR 시스템을 검증했으며, 제 모듈만의 사용자 연구 효과를 별도로 분리해 측정하지는 않았습니다.",
        },
      },
      editorial: {
        question: {
          en: "How can XR content adapt to changing physical conditions without breaking presence or forcing users to recalibrate the experience?",
          ko: "XR 콘텐츠는 현존감을 깨뜨리거나 사용자의 반복 보정을 요구하지 않고 변화하는 물리 조건에 어떻게 적응할 수 있을까?",
        },
        responsibility: {
          en: "As a student researcher, I contributed to adaptive spatial behavior and visual-haptic feedback within an international research and industry consortium.",
          ko: "학생연구원으로서 국제 산학 컨소시엄의 적응형 공간 동작과 시각·햅틱 피드백 연구에 기여했습니다.",
        },
        outcome: {
          en: "The project produced a real-time interface that repositions virtual content around physical conditions.",
          ko: "물리 조건에 따라 가상 콘텐츠를 재배치하는 실시간 인터페이스를 구현했습니다.",
        },
        problem: {
          en: "Room geometry, obstacles, and user position change, while many XR layouts assume a stable calibrated space. That mismatch can reduce safety, reachability, and presence.",
          ko: "방 구조·장애물·사용자 위치는 변하지만 많은 XR 레이아웃은 고정된 보정 공간을 가정합니다. 이 불일치는 안전성·도달 가능성·현존감을 떨어뜨립니다.",
        },
        build: {
          en: "The team developed a research interface that senses physical conditions and adjusts the position or presentation of virtual content through visual and haptic feedback.",
          ko: "현실 공간의 조건을 감지하고 가상 콘텐츠의 위치와 표현 방식을 시각·햅틱 피드백과 함께 조정하는 연구용 인터페이스를 개발했습니다.",
        },
        decision: {
          en: "We treated environmental fit as a continuous interaction problem, not a one-time calibration step.",
          ko: "환경 정합성을 일회성 보정이 아니라 지속적인 상호작용 문제로 다뤘습니다.",
        },
        validation: {
          en: "We developed and reviewed the interface within an international consortium. I focused on adaptive spatial behavior and visual-haptic feedback, while evaluation addressed the integrated system rather than isolating my module.",
          ko: "국제 컨소시엄과 함께 인터페이스를 개발하고 검토했습니다. 저는 적응형 공간 동작과 시각·햅틱 피드백에 집중했으며, 평가는 제 모듈만 분리하지 않고 통합 시스템을 대상으로 진행했습니다.",
        },
        outcomeSystem: {
          en: "Adaptive spatial and multimodal interaction components for the consortium's real-time XR research stack.",
          ko: "컨소시엄 실시간 XR 연구 스택을 위한 적응형 공간·멀티모달 상호작용 구성요소",
        },
        outcomeEvidence: {
          en: "The project established an implemented direction for environment-responsive XR, with my contribution focused on component design and implementation.",
          ko: "환경 변화에 반응하는 XR의 구현 방향을 구체화했으며, 저는 구성요소의 설계와 구현에 기여했습니다.",
        },
        outcomeValue: {
          en: "Connected human-centered interface work across KAIST, Fraunhofer, NYU, UniSA, Anipen, and bHaptics.",
          ko: "KAIST·Fraunhofer·NYU·UniSA·Anipen·bHaptics의 인간 중심 인터페이스 연구를 연결했습니다.",
        },
        lesson: {
          en: "The challenge was not placing content in a room. It was preserving an intelligible relationship between body, space, and feedback as the room changes.",
          ko: "핵심은 방 안에 콘텐츠를 놓는 일이 아니라 공간이 변해도 몸·공간·피드백의 이해 가능한 관계를 유지하는 일이었습니다.",
        },
      },
      palette: "plum",
      pattern: "orbit",
      height: "tall",
      width: "regular",
      mark: "XR",
      spineVenue: "KAIST",
      subtitle: {
        en: "Real-time spatial adaptation that keeps virtual content coherent with a changing room.",
        ko: "변화하는 현실 공간과 가상 콘텐츠의 정합성을 유지하는 실시간 공간 적응",
      },
    },
    {
      slug: "camouflage-effectiveness",
      sourceIndex: 4,
      icon: "kf21",
      shortTitle: {
        en: "Computer Vision for Camouflage",
        ko: "위장 분석 컴퓨터 비전",
      },
      category: {
        en: "Computer Vision",
        ko: "컴퓨터 비전",
      },
      story: {
        research: {
          en: "Analyzed aircraft detectability across altitude, terrain, and weather using vision and simulation.",
          ko: "컴퓨터 비전과 시뮬레이션으로 고도·지형·기상별 항공기 피탐성을 분석했습니다.",
        },
        design: {
          en: "Developed camouflage colorways and pattern configurations for changing conditions.",
          ko: "변화하는 조건에 대응하는 위장 컬러웨이와 패턴 구성을 설계했습니다.",
        },
        artifact: {
          en: "A comparative evaluation pipeline and camouflage proposals for the KF-21 Boramae.",
          ko: "KF-21 보라매를 위한 비교 평가 파이프라인과 위장 제안안입니다.",
        },
        evidence: {
          en: "Selected camouflage directions were incorporated into the sponsored project's outputs after comparative review.",
          ko: "조건별 비교 검토를 거친 위장 디자인 방향이 산학 과제 결과물에 반영되었습니다.",
        },
      },
      editorial: {
        question: {
          en: "How can we compare camouflage color and pattern proposals across altitude, terrain, and weather without relying only on subjective visual judgment?",
          ko: "주관적 시각 판단에만 의존하지 않고 고도·지형·기상별 위장 색상과 패턴 제안을 어떻게 비교할 수 있을까?",
        },
        responsibility: {
          en: "As a student researcher, I supported image-based effectiveness analysis and developed colorway and pattern configurations for the HGU-KAI sponsored project.",
          ko: "학생연구원으로 한동대-KAI 과제에서 영상 기반 효과 분석과 컬러웨이·패턴 구성을 개발했습니다.",
        },
        evaluation: {
          en: "We compared detectability across altitude, terrain, and weather conditions.",
          ko: "고도·지형·기상 조건에 따라 피탐성을 비교 평가했습니다.",
        },
        outcome: {
          en: "Selected design directions were incorporated into the sponsored project's outputs.",
          ko: "선정된 디자인 방향은 산학 과제 결과물에 반영되었습니다.",
        },
        problem: {
          en: "A camouflage scheme that works in one scene can fail under another background or viewing condition. Static reviews do not expose that condition-dependent detectability.",
          ko: "한 장면에서 유효한 위장안도 다른 배경·관측 조건에서는 실패할 수 있습니다. 정적 검토만으로는 조건 의존적 피탐성을 드러내기 어렵습니다.",
        },
        build: {
          en: "A simulation and computer-vision comparison workflow for KF-21 camouflage proposals under varied environmental conditions.",
          ko: "다양한 환경 조건에서 KF-21 위장 제안을 비교하는 시뮬레이션·컴퓨터 비전 워크플로입니다.",
        },
        decision: {
          en: "We compared proposals across conditions instead of treating one preferred rendering as universal evidence.",
          ko: "하나의 선호 렌더링을 보편적 근거로 삼지 않고 조건별로 제안을 비교했습니다.",
        },
        validation: {
          en: "The proposed designs were reviewed within the sponsored university-industry project, and selected directions were included in its outputs. Operational adoption and field performance were outside this study's scope.",
          ko: "제안한 디자인은 산학 과제 안에서 검토되었고 선정된 방향은 과제 결과물에 반영되었습니다. 실제 운용 채택과 현장 성능 평가는 이 연구의 범위에 포함되지 않았습니다.",
        },
        outcomeSystem: {
          en: "Condition-aware colorway and camouflage pattern proposals supported by a comparative analysis workflow.",
          ko: "조건별 비교 분석 워크플로에 근거한 컬러웨이·위장 패턴 제안",
        },
        outcomeEvidence: {
          en: "The work replaced a single-scene aesthetic judgment with repeatable cross-condition comparison.",
          ko: "단일 장면의 미적 판단을 반복 가능한 조건 간 비교로 전환했습니다.",
        },
        outcomeValue: {
          en: "Selected design directions were incorporated into the sponsored project's outputs.",
          ko: "선정된 디자인 방향은 산학 과제 결과물에 반영되었습니다.",
        },
        lesson: {
          en: "The challenge was not making a pattern look plausible. It was making its effectiveness comparable across the conditions that could invalidate it.",
          ko: "핵심은 패턴을 그럴듯하게 보이게 하는 것이 아니라 효과를 무효화할 수 있는 조건 전반에서 비교 가능하게 만드는 일이었습니다.",
        },
      },
      palette: "moss",
      pattern: "terrain",
      height: "standard",
      width: "wide",
      mark: "KF-21",
      spineVenue: "KAI",
      subtitle: {
        en: "Computer-vision and simulation studies of detectability across operational conditions.",
        ko: "운용 조건별 피탐성을 분석한 컴퓨터 비전·시뮬레이션 연구",
      },
    },
    {
      slug: "smart-city-tracking",
      sourceIndex: 5,
      icon: "traffic",
      shortTitle: {
        en: "Smart-City Object Tracking",
        ko: "스마트시티 객체 추적",
      },
      category: {
        en: "Smart Infrastructure",
        ko: "스마트 인프라",
      },
      story: {
        research: {
          en: "Framed dense-traffic detection around road scenes and roadside sensing constraints.",
          ko: "도로 장면과 도로변 센싱 제약을 중심으로 고밀도 교통 탐지 문제를 정의했습니다.",
        },
        design: {
          en: "Optimized preprocessing, detection flow, anchor boxes, and the physical sensor enclosure.",
          ko: "전처리·탐지 흐름·앵커 박스와 물리 센서 인클로저를 함께 최적화했습니다.",
        },
        artifact: {
          en: "An object-tracking pipeline connected to IoT hardware in a 3D-printed enclosure.",
          ko: "3D 프린팅 하우징의 IoT 하드웨어와 연결된 객체 추적 파이프라인입니다.",
        },
        evidence: {
          en: "I helped integrate physical sensing, preprocessing, and road-scene detection in one working prototype.",
          ko: "물리 센싱, 데이터 전처리, 도로 장면 탐지를 하나의 작동형 프로토타입으로 통합했습니다.",
        },
      },
      editorial: {
        question: {
          en: "How can roadside sensing track dense traffic while remaining buildable, protectable, and deployable as physical infrastructure?",
          ko: "도로변 센싱은 제작·보호·배치 가능한 물리 인프라로 유지되면서 고밀도 교통을 어떻게 추적할 수 있을까?",
        },
        responsibility: {
          en: "I worked across preprocessing, detection-flow and anchor-box tuning, IoT integration, and 3D-printed enclosure development.",
          ko: "전처리, 탐지 흐름·앵커박스 조정, IoT 통합, 3D 프린팅 하우징 개발을 수행했습니다.",
        },
        outcome: {
          en: "I helped produce an integrated research prototype spanning sensing, enclosure fabrication, and road-scene detection.",
          ko: "센싱, 하우징 제작, 도로 장면 탐지를 통합한 연구 프로토타입을 구현했습니다.",
        },
        lesson: {
          en: "The challenge was not tuning a detector in isolation. It was making model behavior answerable to the realities of the sensor that produces its data.",
          ko: "핵심은 탐지기를 따로 조정하는 일이 아니라 모델 동작을 데이터를 만드는 센서의 현실 조건에 연결하는 일이었습니다.",
        },
        problem: {
          en: "Road-scene models depend on the quality and position of the sensing hardware that feeds them. Optimizing detection without the enclosure and data path leaves the system undeployable.",
          ko: "도로 장면 모델은 입력 센서의 품질과 위치에 의존합니다. 하우징과 데이터 경로를 제외한 탐지 최적화만으로는 시스템을 배치할 수 없습니다.",
        },
        build: {
          en: "An integrated roadside prototype combining sensing hardware, a custom enclosure, and an object-tracking pipeline for dense traffic scenes.",
          ko: "센싱 하드웨어, 맞춤형 하우징, 고밀도 교통 장면 객체 추적 파이프라인을 결합한 도로변 프로토타입입니다.",
        },
        decision: {
          en: "We co-designed the physical and model layers so camera placement, protection, preprocessing, and detection behavior could be tuned as one system.",
          ko: "카메라 배치·보호·전처리·탐지 동작을 하나의 시스템으로 조정하도록 물리 계층과 모델 계층을 함께 설계했습니다.",
        },
        validation: {
          en: "We integrated sensing hardware, enclosure fabrication, and road-scene detection in one prototype. An independent benchmark or deployment study remained future work.",
          ko: "센싱 하드웨어와 하우징 제작, 도로 장면 탐지를 하나의 프로토타입으로 통합했습니다. 독립 벤치마크와 실제 도로 배치 평가는 후속 과제로 남았습니다.",
        },
        outcomeSystem: {
          en: "An IoT roadside-sensing and object-tracking research prototype with a fabricated enclosure.",
          ko: "제작 하우징을 포함한 IoT 도로변 센싱·객체 추적 연구 프로토타입입니다.",
        },
        outcomeEvidence: {
          en: "I helped implement end-to-end integration from physical sensing and data preprocessing to the detection workflow.",
          ko: "물리 센싱과 데이터 전처리부터 객체 탐지까지 이어지는 전체 시스템 통합에 기여했습니다.",
        },
        outcomeValue: {
          en: "The prototype was developed as a smart-city traffic-sensing research platform at Handong Global University.",
          ko: "한동대학교에서 스마트시티 교통 센싱 연구 플랫폼으로 프로토타입을 개발했습니다.",
        },
      },
      palette: "sand",
      pattern: "grid",
      height: "short",
      width: "regular",
      mark: "IoT",
      spineVenue: "HGU",
      subtitle: {
        en: "A roadside sensing prototype linking enclosure design to an AI detection pipeline.",
        ko: "하우징 설계와 AI 탐지 파이프라인을 연결한 도로변 센싱 프로토타입",
      },
    },
  ],
  publications: [
    {
      slug: "ai-assistant-disabilities-thesis",
      sourceIndex: 0,
      shortTitle: {
        en: "Accessible AI for Games",
        ko: "게임 접근성을 위한 AI",
      },
      category: {
        en: "Master's Thesis",
        ko: "석사학위논문",
      },
      story: {
        research: {
          en: "Twelve players with disabilities exposed information, perception, and execution barriers in Minecraft tasks.",
          ko: "장애인 플레이어 12명의 Minecraft 과업에서 정보·지각·실행 장벽이 드러났습니다.",
        },
        design: {
          en: "Mapped each active gap to Explainer, Reader, or player-authorized Surrogate support.",
          ko: "각 간극을 Explainer·Reader·사용자 승인형 Surrogate 지원에 연결했습니다.",
        },
        artifact: {
          en: "A master's thesis, Information-Perception-Execution framework, and three-role GAIA model.",
          ko: "석사학위논문과 정보·지각·실행 프레임워크, 세 가지 GAIA 역할 모델을 정리했습니다.",
        },
        evidence: {
          en: "Controlled mixed-method evidence showed information value alongside modality and input mismatches.",
          ko: "통제된 혼합방법 연구에서 정보 지원의 가치와 모달리티·입력 불일치를 함께 확인했습니다.",
        },
      },
      palette: "ink",
      pattern: "type",
      height: "tall",
      width: "wide",
      mark: "MGCT",
      editorial: {
        question: {
          en: "When, how, and for whom does a domain-specific AI assistant reduce or reproduce accessibility barriers during mainstream gameplay?",
          ko: "도메인 특화 AI 어시스턴트는 주류 게임 플레이에서 언제·어떻게·누구에게 접근성 장벽을 줄이거나 재생산하는가?",
        },
        gap: {
          en: "Game AI assistants are usually judged by answer quality or model capability; evidence is limited on how an overlay coexists with assistive tools of players with disabilities, perception, motor capacity, and live play practices.",
          ko: "게임 AI 어시스턴트는 주로 답변 품질이나 모델 능력으로 평가됐으며, 오버레이가 장애인 플레이어의 보조 기술·지각·운동 능력·실제 플레이 관행과 어떻게 공존하는지에 대한 근거는 부족했습니다.",
        },
        contribution: {
          en: "In my master's thesis, I connect a mixed-methods evaluation of AI-assisted Minecraft play to the Information-Perception-Execution framework and three corresponding assistant roles: Explainer, Reader, and Surrogate.",
          ko: "석사학위논문에서 AI 보조 Minecraft 플레이의 혼합방법 평가를 정보·지각·실행 간극 프레임워크와 Explainer·Reader·Surrogate의 세 역할로 연결했습니다.",
        },
        method: {
          en: "12 players with disabilities, ages 23–53; six configuration and early-game tasks under counterbalanced baseline and GAIA conditions; task outcomes, interaction logs, post-task questionnaires, 30–60 minute interviews, and reflexive thematic analysis. Six participants completed both questionnaires, so quantitative comparisons are exploratory.",
          ko: "장애인 플레이어 12명(23~53세), 기준선과 GAIA 조건을 교차 배치한 설정·초반 플레이 과업 6개, 과업 결과·상호작용 로그·사후 설문·30~60분 인터뷰, 성찰적 주제 분석을 사용했습니다. 양 조건 설문을 완료한 6명의 정량 비교는 탐색적입니다.",
        },
        takeaway: {
          en: "I found that accessibility depends less on raw model capability than on whether the assistant's modalities match how each player can perceive and act.",
          ko: "접근성은 모델의 능력 자체보다 어시스턴트의 모달리티가 각 플레이어의 지각·행동 방식과 맞는지에 더 크게 좌우된다는 점을 확인했습니다.",
        },
        finding1: {
          en: "Information gaps were tractable. For players who could see the overlay and execute inputs, GAIA reduced search and memory burden while preserving agency.",
          ko: "정보 간극은 해결 가능했습니다. 오버레이를 보고 입력을 수행할 수 있는 플레이어에게 GAIA는 탐색·기억 부담을 줄이면서 주체성을 유지했습니다.",
        },
        finding2: {
          en: "Perception gaps exposed output mismatch. A visual text overlay was inaccessible to blind and low-vision players and could conflict with trusted screen-reader workflows.",
          ko: "지각 간극은 출력 불일치를 드러냈습니다. 시각 텍스트 오버레이는 전맹·저시력 플레이어에게 접근 불가능했고 기존 스크린 리더와 충돌할 수 있었습니다.",
        },
        finding3: {
          en: "Execution gaps required action, not more explanation. Correct advice did not help when typing or performing the instructed sequence was itself the barrier.",
          ko: "실행 간극에는 더 많은 설명이 아니라 행동 지원이 필요했습니다. 타이핑이나 지시된 동작 자체가 장벽이면 정확한 조언도 도움이 되지 않았습니다.",
        },
        implication: {
          en: "Evaluate and orchestrate assistant roles by the active gap: explain information, translate perception, or execute only scoped player-authorized actions.",
          ko: "현재 간극에 따라 역할을 평가·조율해야 합니다. 정보를 설명하고, 지각을 변환하며, 제한된 사용자 승인 행동만 실행해야 합니다.",
        },
        scope: {
          en: "One controlled Minecraft study with a disability-community sample; the prototype lacked native screen-reader integration, voice input, and a working Surrogate. Findings do not yet generalize to mobile, novice, or high-twitch multiplayer play.",
          ko: "장애 커뮤니티 표본을 사용한 통제된 Minecraft 단일 연구입니다. 프로토타입에는 네이티브 스크린 리더, 음성 입력, 작동형 Surrogate가 없었으며 모바일·초보·고속 멀티플레이로 일반화할 수 없습니다.",
        },
      },
    },
    {
      slug: "toward-ludic-ai",
      sourceIndex: 1,
      shortTitle: {
        en: "Evaluating Playful AI",
        ko: "놀이형 AI 평가",
      },
      category: {
        en: "Journal Article",
        ko: "학술지 논문",
      },
      story: {
        research: {
          en: "Achievement metrics miss voluntary constraint, rule boundaries, and relational play.",
          ko: "성취 지표만으로는 자발적 제약·규칙 경계·관계적 놀이를 포착할 수 없었습니다.",
        },
        design: {
          en: "Translated play theory into observable behavioral dimensions grounded in what the AI actually does.",
          ko: "놀이 이론을 AI의 실제 행동에 근거한 관찰 가능한 차원으로 번역했습니다.",
        },
        artifact: {
          en: "A three-dimension framework for evaluating the ludic competence of game-playing AI.",
          ko: "게임 AI의 루딕 역량을 평가하는 세 차원 프레임워크를 제안했습니다.",
        },
        evidence: {
          en: "A peer-reviewed conceptual journal article; empirical validation remains open.",
          ko: "학술지에 게재된 개념 논문이며 실증 검증은 후속 과제입니다.",
        },
      },
      palette: "oxide",
      pattern: "orbit",
      height: "standard",
      width: "regular",
      mark: "DGR",
      editorial: {
        question: {
          en: "How can game-playing AI be evaluated for the competence to play with others, not only for winning efficiently?",
          ko: "게임 AI를 효율적 승리뿐 아니라 다른 존재와 함께 노는 역량으로 어떻게 평가할 수 있을까?",
        },
        gap: {
          en: "Win rate, sample efficiency, and completion metrics capture achievement but miss voluntary constraint, recognition of rule boundaries, and adjustment to a co-player's frame.",
          ko: "승률·표본 효율·완료율은 성취를 포착하지만 자발적 제약, 규칙 경계 인식, 함께 노는 상대의 틀에 대한 조율을 놓칩니다.",
        },
        contribution: {
          en: "As first author, I translate ludic theory into three observable dimensions—intentional inefficiency, epistemic boundary awareness, and relational attunement—and connect them to measurable behavior and AI alignment.",
          ko: "제1저자로서 놀이 이론을 의도적 비효율성·인식론적 경계 자각·관계적 조율의 세 관찰 가능 차원으로 구체화하고, 이를 행동 지표와 AI 정렬 문제에 연결했습니다.",
        },
        method: {
          en: "Theoretical synthesis and critical analysis: Suits, Sicart, Galloway, and Bateson are translated into observable behavior; benchmark cases are reread through the framework; the history and politics of win-rate measurement are examined.",
          ko: "이론 종합과 비판 분석을 사용합니다. Suits·Sicart·Galloway·Bateson을 관찰 가능한 행동으로 번역하고 벤치마크 사례와 승률 측정의 역사·정치를 재검토합니다.",
        },
        takeaway: {
          en: "My central argument is that an AI can optimize victory while remaining unable to recognize or sustain the conditions that make interaction playful.",
          ko: "핵심 주장은 AI가 승리를 최적화하면서도 상호작용을 놀이로 만드는 조건을 인식하고 유지하는 데는 실패할 수 있다는 것입니다.",
        },
        finding1: {
          en: "Intentional inefficiency measures whether a system can accept meaningful self-constraint when efficiency is not the point of the shared activity.",
          ko: "의도적 비효율성은 효율이 공동 활동의 목적이 아닐 때 시스템이 의미 있는 자기 제약을 수용하는지 측정합니다.",
        },
        finding2: {
          en: "Epistemic boundary awareness tests behavior, not verbal disclaimers: the system must detect and change course at the gap between specified rules and intended play.",
          ko: "인식론적 경계 자각은 말이 아니라 행동을 봅니다. 명시 규칙과 의도된 놀이의 간극을 감지하고 행동을 바꿔야 합니다.",
        },
        finding3: {
          en: "Relational attunement asks whether the system adapts signals, challenge, and surplus interaction to sustain a mutually accepted play frame.",
          ko: "관계적 조율은 시스템이 상호 수용된 놀이 틀을 유지하도록 신호·도전·잉여 상호작용을 조정하는지 묻습니다.",
        },
        implication: {
          en: "Pair achievement metrics with constraint cost, boundary and reward-hacking diagnostics, relational surplus, and human judgment when evaluating cooperative game AI.",
          ko: "협력형 게임 AI 평가에서 성취 지표에 제약 비용, 경계·보상 해킹 진단, 관계적 잉여, 인간 평가를 함께 사용해야 합니다.",
        },
        scope: {
          en: "A conceptual and measurement proposal, not an empirical validation. It cannot establish inner experience, solve the politics of player labor, or prevent the framework itself from becoming a target for metric gaming.",
          ko: "경험적 검증이 아닌 개념·측정 제안입니다. 내적 경험을 판정하거나 플레이어 노동의 정치 문제를 해결하거나 프레임워크 자체의 지표 게임화를 막을 수 없습니다.",
        },
      },
    },
    {
      slug: "game-accessibility-preferences",
      sourceIndex: 2,
      shortTitle: {
        en: "What Players Want from AI",
        ko: "플레이어가 원하는 AI 지원",
      },
      category: {
        en: "Journal Article",
        ko: "학술지 논문",
      },
      story: {
        research: {
          en: "Responses from 112 players with disabilities showed that diagnoses and functional barriers are not interchangeable.",
          ko: "장애인 플레이어 112명의 응답에서 진단 범주와 기능적 장벽이 동일하지 않음이 드러났습니다.",
        },
        design: {
          en: "Organized support by barrier, timing, and context, with setup labor as the first priority.",
          ko: "지원을 장벽·시점·맥락으로 구성하고 초기 설정 부담을 첫 우선순위로 두었습니다.",
        },
        artifact: {
          en: "A four-unit AI-support preference map with exploratory, multiple-comparison-aware statistics.",
          ko: "네 가지 AI 지원 선호 지도와 다중비교를 고려한 탐색적 통계를 만들었습니다.",
        },
        evidence: {
          en: "Setup and automation averaged 6.31 of 7; individual regressions did not survive FDR correction.",
          ko: "설정·자동화 평균은 7점 중 6.31이었고 개별 회귀계수는 FDR 보정 후 유의하지 않았습니다.",
        },
      },
      palette: "cobalt",
      pattern: "signal",
      height: "tall",
      width: "narrow",
      mark: "JKMS",
      editorial: {
        question: {
          en: "How do the AI-support preferences of players with disabilities differ by support type and intervention timing, and how are those preferences related to functional barriers?",
          ko: "장애인 플레이어의 AI 지원 선호는 지원 유형·개입 시점에 따라 어떻게 달라지며 기능적 장벽과 어떤 관련이 있는가?",
        },
        gap: {
          en: "Accessibility is often designed from diagnosis labels or feature availability, with limited quantitative evidence separating setup, in-play guidance, assistive recommendation, and timing or reflection.",
          ko: "접근성은 진단 범주나 기능 제공 여부를 중심으로 설계되어 왔으며, 초기 설정·플레이 중 안내·보조 추천·개입 시점과 성찰을 구분한 정량 근거는 부족했습니다.",
        },
        contribution: {
          en: "As first author, I mapped disability identity, functional barriers, play motivations, and four forms of preferred AI support across 112 players, with correction for multiple comparisons.",
          ko: "제1저자로서 장애인 플레이어 112명의 장애 정체성·기능적 장벽·플레이 동기와 네 가지 AI 지원 선호를 다중비교 보정과 함께 분석했습니다.",
        },
        method: {
          en: "Online survey of 112 players with disabilities; descriptive analysis, identity-barrier association tests, maximum-likelihood exploratory factor analysis with oblimin rotation, Friedman and Holm comparisons, Spearman correlations, multiple regression, and Benjamini-Hochberg FDR correction.",
          ko: "장애인 플레이어 112명 온라인 설문, 기술통계, 정체성-장벽 연관 검정, 최대우도·oblimin 탐색적 요인분석, Friedman·Holm 비교, Spearman 상관, 다중회귀, Benjamini-Hochberg FDR 보정을 사용했습니다.",
        },
        takeaway: {
          en: "Players broadly welcomed AI support, but the strongest preference was for setup and automation, and barrier-specific relationships were more stable than motivation-based ones.",
          ko: "플레이어는 전반적으로 AI 지원을 수용했지만 초기 설정·자동화 선호가 가장 높았고, 동기보다 장벽별 관련성이 더 안정적이었습니다.",
        },
        finding1: {
          en: "Identity and barrier partly overlapped but were not interchangeable. Functional difficulties extended beyond the corresponding diagnosis categories.",
          ko: "정체성과 장벽은 부분적으로 겹쳤지만 동일하지 않았고, 기능적 어려움은 대응 진단 범주보다 넓게 나타났습니다.",
        },
        finding2: {
          en: "Setup and Automation ranked highest at M=6.31/7, ahead of Assistive Recommendation (5.93), In-Play Guidance (5.92), and Timing and Reflection (5.75).",
          ko: "초기 설정·자동화는 평균 6.31/7로 보조 추천 5.93, 플레이 중 안내 5.92, 시점·성찰 5.75보다 높았습니다.",
        },
        finding3: {
          en: "Visual barriers correlated positively with setup support and motor barriers with assistive recommendation; hearing barriers correlated negatively with both. Individual regression coefficients did not survive FDR correction.",
          ko: "시각 장벽은 설정 지원, 운동 장벽은 보조 추천과 정적 관련을 보였고 청각 장벽은 두 유형과 부적 관련을 보였습니다. 개별 회귀계수는 FDR 보정 후 유의성을 유지하지 못했습니다.",
        },
        implication: {
          en: "Design support as a configurable portfolio organized by barrier, timing, and context, with setup labor treated as a first-class accessibility problem.",
          ko: "장벽·시점·맥락별로 조절 가능한 지원 포트폴리오를 설계하고 초기 설정 노동을 핵심 접근성 문제로 다뤄야 합니다.",
        },
        scope: {
          en: "Exploratory, self-report, cross-sectional data from a Korean sample; several outcomes were single items and barriers were binary. Results identify design hypotheses, not universal preference laws.",
          ko: "한국 표본의 탐색적·자기보고·횡단 자료이며 일부 결과는 단일 문항, 장벽은 이분형입니다. 보편 법칙이 아니라 설계 가설을 제시합니다.",
        },
      },
    },
    {
      slug: "gaia-design-principles",
      sourceIndex: 3,
      shortTitle: {
        en: "Designing Accessible AI",
        ko: "접근 가능한 AI 설계",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Seven professional accessibility playtesters rejected interruption during high-concentration play.",
          ko: "전문 접근성 플레이테스터 7명은 고집중 플레이 중 개입을 거부했습니다.",
        },
        design: {
          en: "Adapted timing and modality while preserving agency and ownership of accomplishment.",
          ko: "시점과 모달리티를 조정하면서 주체성과 성취의 소유권을 보존하도록 설계했습니다.",
        },
        artifact: {
          en: "Dual Context Adaptation and an Ethical Framework for Agency and Accomplishment.",
          ko: "Dual Context Adaptation과 Agency and Accomplishment 윤리 프레임워크를 제안했습니다.",
        },
        evidence: {
          en: "An ACM IUI qualitative study whose seven-person lead-user sample limits generalization.",
          ko: "ACM IUI 질적 연구이며 7명의 리드유저 표본이므로 일반화에 한계가 있습니다.",
        },
      },
      palette: "plum",
      pattern: "grid",
      height: "standard",
      width: "wide",
      mark: "IUI",
      editorial: {
        question: {
          en: "When do hardcore players with disabilities perceive a game AI assistant as useful or disruptive, and what ethical boundaries preserve agency and accomplishment?",
          ko: "하드코어 장애인 플레이어는 게임 AI 어시스턴트를 언제 유용하거나 방해된다고 느끼며 주체성과 성취를 지키는 윤리적 경계는 무엇인가?",
        },
        gap: {
          en: "Assistive AI research offers accessibility functions, but provides little evidence about timing, flow, customization, and fair assistance inside a time-critical game loop.",
          ko: "보조 AI 연구는 접근성 기능을 제안하지만 시간 압박이 있는 게임 루프에서 개입 시점·몰입·개인화·공정한 조력에 대한 근거가 부족했습니다.",
        },
        contribution: {
          en: "As first author, I derived two empirically grounded principles: Dual Context Adaptation for protecting flow, and an Ethical Framework for Agency and Accomplishment for defining acceptable assistance.",
          ko: "제1저자로서 몰입을 보호하는 이중 맥락 적응 원칙과 허용 가능한 조력의 경계를 정하는 주체성·성취 윤리 프레임워크를 도출했습니다.",
        },
        method: {
          en: "Ethics-approved semi-structured interviews with seven professional accessibility playtesters who averaged 21 hours of play per week; a Discord-based GAIA prototype shown in a high-concentration fighting-game context; reflexive thematic analysis, audit trail, and participant feedback on themes.",
          ko: "주당 평균 21시간 플레이하는 전문 접근성 플레이테스터 7명 대상 윤리 승인 반구조화 인터뷰, 고집중 격투게임 맥락의 Discord 기반 GAIA 프로토타입, 성찰적 주제 분석·감사 추적·참여자 주제 피드백을 사용했습니다.",
        },
        takeaway: {
          en: "I show that effective assistance is not maximal assistance: it reads both player and game state, protects flow, and keeps meaningful accomplishment with the player.",
          ko: "효과적인 조력은 개입을 극대화하는 것이 아니라 플레이어와 게임 상태를 함께 읽고, 몰입을 보호하며, 의미 있는 성취를 플레이어에게 남기는 것임을 보여줍니다.",
        },
        finding1: {
          en: "Timing divided acceptance. Participants welcomed support during onboarding, settings, and discovery, but rejected interruption during high-concentration play.",
          ko: "개입 시점이 수용을 갈랐습니다. 온보딩·설정·탐색 단계 지원은 환영했지만 고집중 플레이 중 방해는 거부했습니다.",
        },
        finding2: {
          en: "A centralized guide had value, but verbose responses, limited customization, and weak visual cues made the prototype itself a source of effort.",
          ko: "중앙화된 안내는 가치가 있었지만 장황한 답변, 제한된 개인화, 약한 시각 단서가 프로토타입 자체를 새로운 노력으로 만들었습니다.",
        },
        finding3: {
          en: "Players accepted assistance that restores access while retaining decisions and challenge; automation became ethically suspect when it displaced authorship of the achievement.",
          ko: "플레이어는 결정과 도전을 남겨둔 채 접근을 회복하는 지원을 수용했지만 성취의 주체를 대체하는 자동화는 윤리적으로 경계했습니다.",
        },
        implication: {
          en: "Sense dual context, adapt timing and modality, make assistance levels negotiable, and constrain automation around player-defined goals and fair play.",
          ko: "이중 맥락을 감지하고 시점·모달리티를 조절하며 조력 수준을 협상 가능하게 하고 사용자 정의 목표와 공정한 플레이를 중심으로 자동화를 제한해야 합니다.",
        },
        scope: {
          en: "Seven expert players recruited through one professional program; the external Discord prototype was a design stimulus, not a fully integrated or summatively evaluated in-game system.",
          ko: "한 전문 프로그램에서 모집한 전문가 7명 표본이며 외부 Discord 프로토타입은 완전 통합·총괄 평가된 게임 내 시스템이 아니라 설계 자극물이었습니다.",
        },
      },
    },
    {
      slug: "game-ai-assistant-barriers",
      sourceIndex: 4,
      shortTitle: {
        en: "Barriers to Game Access",
        ko: "게임 접근 장벽",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Open responses from 112 players with disabilities mapped barriers across five functional domains.",
          ko: "장애인 플레이어 112명의 서술 응답에서 다섯 기능 영역의 장벽을 구조화했습니다.",
        },
        design: {
          en: "Prioritized To Play before Easy Play and Better Play in the assistance ladder.",
          ko: "지원 단계에서 Easy Play와 Better Play보다 To Play를 먼저 확보하도록 우선순위를 정했습니다.",
        },
        artifact: {
          en: "A three-level requirements map for baseline access, workload reduction, and personalization.",
          ko: "기본 접근·부담 완화·개인화를 구분하는 3단계 요구사항 지도를 제안했습니다.",
        },
        evidence: {
          en: "This conference-stage analysis shares the N=112 survey lineage with Publication 03; it is not independent evidence.",
          ko: "이 학술대회 단계 분석은 Publication 03과 동일한 N=112 설문 계보를 공유하며 독립된 근거가 아닙니다.",
        },
      },
      palette: "moss",
      pattern: "rules",
      height: "short",
      width: "regular",
      mark: "KGS",
      editorial: {
        question: {
          en: "What functional barriers do players with different disabilities encounter, and what do they require from a game AI assistant?",
          ko: "서로 다른 장애를 가진 플레이어가 경험하는 기능적 장벽은 무엇이며 게임 AI 어시스턴트에 무엇을 요구하는가?",
        },
        gap: {
          en: "Diagnosis-based settings and single-modality AI aids cannot capture the mismatch between a game's demands and a player's remaining abilities across a live play journey.",
          ko: "진단명 기반 설정과 단일 모달리티 AI 보조는 실제 플레이 여정에서 게임 요구와 플레이어 잔존 능력 사이의 불일치를 충분히 포착하지 못합니다.",
        },
        contribution: {
          en: "I co-developed a barrier-centered requirements map with three levels: To Play for basic access, Easy Play for reducing effort, and Better Play for personalized strategy and experience.",
          ko: "기본 접근을 위한 To Play, 부담을 줄이는 Easy Play, 개인화된 전략과 경험을 지원하는 Better Play의 3단계 장벽 중심 요구사항 지도를 공동 개발했습니다.",
        },
        method: {
          en: "Ethics-approved online survey of 112 players with disabilities; five functional-barrier domains; open-ended AI support preferences; inductive thematic coding by disability group and organization of requirements into three accessibility levels.",
          ko: "장애인 플레이어 112명 대상 윤리 승인 온라인 설문, 5개 기능적 장벽 영역, 개방형 AI 지원 선호, 장애 유형별 귀납적 주제 코딩과 3개 접근성 수준 구조화를 사용했습니다.",
        },
        takeaway: {
          en: "Accessible game AI must filter and translate the right information, adapt its intrusiveness to context, and let the player choose how much help is allowed.",
          ko: "접근 가능한 게임 AI는 필요한 정보만 선별·변환하고 맥락에 따라 침습도를 조절하며 조력 강도를 플레이어가 선택하게 해야 합니다.",
        },
        finding1: {
          en: "Disability category did not determine one fixed barrier. Visual, auditory, motor, cognitive, and communication difficulties crossed diagnostic boundaries and combined differently by context.",
          ko: "장애 범주는 하나의 고정 장벽을 결정하지 않았습니다. 시각·청각·운동·인지·의사소통 어려움은 진단 경계를 넘어 맥락별로 다르게 결합했습니다.",
        },
        finding2: {
          en: "To Play requirements centered on modality conversion and alternative input: game-state narration, spatial audio translated to visual or haptic form, voice or gaze input, and selectable communication responses.",
          ko: "To Play 요구는 게임 상태 음성화, 공간 음향의 시각·촉각 변환, 음성·시선 입력, 선택형 의사소통 답변 등 모달리티 변환과 대체 입력에 집중됐습니다.",
        },
        finding3: {
          en: "Easy and Better Play introduced a tension: setup automation, summaries, navigation, and strategy were desired, but high-intensity intervention and over-automation could increase load or erode challenge.",
          ko: "Easy·Better Play에서는 설정 자동화·요약·길 찾기·전략 지원을 원했지만 고강도 상황 개입과 과도한 자동화는 부담을 높이거나 도전을 훼손할 수 있었습니다.",
        },
        implication: {
          en: "Build a context filter, multimodal output and input, adaptive intervention timing, and an explicit player-controlled assistance ladder from hint to authorized execution.",
          ko: "맥락 필터, 멀티모달 입출력, 적응형 개입 시점, 힌트부터 승인 실행까지 사용자 통제 조력 단계를 설계해야 합니다.",
        },
        scope: {
          en: "This paper shares the same N=112 survey lineage as the accessibility-preferences paper and is not an independent dataset. Online self-report may overrepresent connected communities; cognitive load was subjective, genre was not modeled, and the principles require prototype and usability validation.",
          ko: "이 논문은 접근성 선호 논문과 동일한 N=112 설문 계보를 공유하며 독립 데이터셋이 아닙니다. 온라인 자기보고는 연결된 커뮤니티를 과대표할 수 있고 인지 부하는 주관적이며 장르를 모델링하지 않았으므로 원칙에 대한 프로토타입·사용성 검증이 필요합니다.",
        },
      },
    },
    {
      slug: "press-start-to-continue",
      sourceIndex: 5,
      shortTitle: {
        en: "How Players Adapt",
        ko: "플레이어의 적응 과정",
      },
      category: {
        en: "Extended Abstract",
        ko: "확장 초록",
      },
      story: {
        research: {
          en: "Five hardcore players with disabilities described iterative adaptation across personal, social, cultural, and game resources.",
          ko: "장애인 하드코어 플레이어 5명은 개인·사회·문화·게임 자원을 넘나드는 반복적 적응을 설명했습니다.",
        },
        design: {
          en: "Reframed adaptation as a resource system rather than an individual deficit.",
          ko: "적응을 개인의 결핍이 아니라 자원 시스템의 문제로 재구성했습니다.",
        },
        artifact: {
          en: "A thematic process model explaining how gameplay adaptation continues or breaks down.",
          ko: "게임 적응이 지속되거나 무너지는 과정을 설명하는 주제 기반 모델을 만들었습니다.",
        },
        evidence: {
          en: "CHI Extended Abstract with explicit co-first authorship; the N=5 sample was hearing-skewed.",
          ko: "공동 제1저자가 명시된 CHI 확장 초록이며, N=5 표본은 청각장애 참여자 비중이 높았습니다.",
        },
      },
      palette: "cobalt",
      pattern: "current",
      height: "tall",
      width: "wide",
      mark: "CHI",
      editorial: {
        question: {
          en: "How do hardcore players with disabilities iteratively adapt when gameplay difficulties persist beyond the available accessibility features?",
          ko: "하드코어 장애인 플레이어는 기존 접근성 기능으로 해결되지 않는 어려움에 반복적으로 어떻게 적응하는가?",
        },
        gap: {
          en: "Prior work identifies individual tools and barriers, but offers limited cross-disability evidence on how coping strategies and personal, social, cultural, and game resources evolve together over time.",
          ko: "선행연구는 개별 도구와 장벽을 다루지만 대처 전략과 개인·사회·문화·게임 자원이 시간에 따라 함께 진화하는 과정을 장애 전반에서 설명한 근거는 부족했습니다.",
        },
        contribution: {
          en: "As co-first author, I helped model adaptation as an iterative cycle linking personal strategy, assistive technology, social support, and the modifiability of the game environment.",
          ko: "공동 제1저자로서 개인 전략·보조 기술·사회적 지원·게임 환경의 수정 가능성이 이어지는 반복적 적응 과정을 모델링했습니다.",
        },
        method: {
          en: "Semi-structured interviews with five hardcore players with disabilities; disability and play-history presurvey; inductive thematic analysis with iterative cross-checking against participant accounts.",
          ko: "하드코어 장애인 플레이어 5명 반구조화 인터뷰, 장애·플레이 이력 사전 설문, 참여자 진술과 반복 교차검토한 귀납적 주제 분석을 사용했습니다.",
        },
        takeaway: {
          en: "Players persist when they can iteratively combine personal strategy with game, social, and cultural resources; when the environment cannot be modified, even expert players leave.",
          ko: "플레이어는 개인 전략을 게임·사회·문화 자원과 반복적으로 결합할 수 있을 때 지속하며 환경을 수정할 수 없으면 숙련자도 떠납니다.",
        },
        finding1: {
          en: "Coping was active and iterative: practice, custom settings, assistive devices, accessibility tools, and social play styles were refined through trial and error.",
          ko: "대처는 능동적·반복적이었습니다. 연습, 맞춤 설정, 보조기기, 접근성 도구, 사회적 플레이 스타일을 시행착오로 개선했습니다.",
        },
        finding2: {
          en: "Social resources could turn a barrier into a sustainable strategy. Real-time directions from friends let a low-vision participant continue complex raids.",
          ko: "사회적 자원은 장벽을 지속 가능한 전략으로 바꿀 수 있었습니다. 친구의 실시간 방향 안내는 저시력 참여자가 복잡한 레이드를 지속하게 했습니다.",
        },
        finding3: {
          en: "When game-environment resources were absent, adaptation reached a ceiling. A player with hearing loss left audio-dependent FPS play despite extensive personal workarounds.",
          ko: "게임 환경 자원이 없으면 적응은 한계에 도달했습니다. 청각장애 참여자는 다양한 개인 전략에도 음향 의존 FPS를 떠났습니다.",
        },
        implication: {
          en: "Design AI to help players discover, combine, and refine resources, not to replace the experimentation and challenge they value.",
          ko: "AI는 플레이어가 자원을 발견·조합·개선하도록 도와야 하며 플레이어가 가치 있게 여기는 실험과 도전을 대체해서는 안 됩니다.",
        },
        scope: {
          en: "Five self-report interviews, skewed toward hearing disabilities and hardcore multiplayer play; players who had already stopped gaming were not represented.",
          ko: "자기보고 인터뷰 5명으로 청각장애와 하드코어 멀티플레이에 치우쳤으며 게임을 이미 중단한 사람은 포함되지 않았습니다.",
        },
      },
    },
    {
      slug: "game-npc-identity",
      sourceIndex: 6,
      shortTitle: {
        en: "Designing AI Game Characters",
        ko: "AI 게임 캐릭터 설계",
      },
      category: {
        en: "Conference Presentation",
        ko: "학술대회 발표",
      },
      story: {
        research: {
          en: "NPC roles evolved from scripted functions toward increasingly adaptive agents.",
          ko: "NPC 역할은 정해진 기능에서 점차 적응적인 에이전트로 변화해 왔습니다.",
        },
        design: {
          en: "Bound autonomy within game rules and identity while protecting player agency.",
          ko: "자율성을 게임 규칙과 정체성 안에 제한하고 플레이어 주체성을 보호하도록 제안했습니다.",
        },
        artifact: {
          en: "A historical and conceptual periodization with a future design agenda.",
          ko: "역사적·개념적 시대 구분과 미래 설계 의제를 정리했습니다.",
        },
        evidence: {
          en: "As first author, I synthesized eight sources and selected game examples into a conceptual history and future design agenda for game characters.",
          ko: "제1저자로 문헌 8편과 게임 사례를 종합해 게임 캐릭터의 역사와 미래 설계 의제를 정리했습니다.",
        },
      },
      palette: "sand",
      pattern: "type",
      height: "standard",
      width: "narrow",
      mark: "DiGRA",
      editorial: {
        question: {
          en: "How has the identity and role of the game NPC changed, and what should define an NPC when generative AI makes it more adaptive and autonomous?",
          ko: "게임 NPC의 정체성과 역할은 어떻게 변해왔으며 생성형 AI가 적응성과 자율성을 높일 때 NPC를 무엇으로 정의해야 하는가?",
        },
        gap: {
          en: "NPCs are commonly described by scripted functions, while newer systems blur the boundary between background object, narrative actor, simulated agent, and co-player.",
          ko: "NPC는 주로 스크립트 기능으로 설명돼 왔지만 최신 시스템은 배경 객체·서사 행위자·시뮬레이션 에이전트·협력 플레이어의 경계를 흐립니다.",
        },
        contribution: {
          en: "As first author, I trace the NPC from rule-bound game function to increasingly autonomous social actor and define the design boundaries needed to preserve character identity and player agency.",
          ko: "제1저자로서 NPC가 규칙에 종속된 게임 기능에서 자율적인 사회적 행위자로 변화한 과정을 추적하고, 캐릭터 정체성과 플레이어 주체성을 지키기 위한 설계 경계를 제시했습니다.",
        },
        method: {
          en: "Conceptual conference presentation using selected game examples and eight cited sources; historical synthesis and design reflection with no systematic search, corpus-selection protocol, or user study.",
          ko: "선별한 게임 사례와 인용 문헌 8편을 활용한 개념적 학술대회 발표입니다. 체계적 검색, 코퍼스 선정 절차, 사용자 연구 없이 역사적 종합과 설계 성찰을 수행했습니다.",
        },
        takeaway: {
          en: "A more intelligent NPC is not automatically a better NPC; its autonomy must strengthen the player's play rather than compete with authorship of it.",
          ko: "더 지능적인 NPC가 자동으로 더 좋은 NPC는 아닙니다. NPC의 자율성은 플레이어의 플레이를 강화해야지 그 주체성과 경쟁해서는 안 됩니다.",
        },
        finding1: {
          en: "Past NPC identity was anchored in stable scripted functions such as opposition, guidance, exposition, and world population.",
          ko: "과거 NPC의 정체성은 적대, 안내, 설명, 세계 구성 같은 안정적 스크립트 기능에 기반했습니다.",
        },
        finding2: {
          en: "Contemporary NPCs increasingly maintain memory, contextual dialogue, and adaptive behavior, shifting from fixed content toward ongoing relationship.",
          ko: "현재 NPC는 기억, 맥락 대화, 적응 행동을 갖추며 고정 콘텐츠에서 지속 관계로 이동하고 있습니다.",
        },
        finding3: {
          en: "Future NPC design must negotiate autonomous goals, learning, cooperation, and the risk that agent initiative reduces player control or narrative coherence.",
          ko: "미래 NPC 설계는 자율 목표·학습·협력과 함께 에이전트 주도성이 플레이어 통제나 서사 정합성을 줄이는 위험을 다뤄야 합니다.",
        },
        implication: {
          en: "Constrain AI-NPC autonomy within the game's rules and identity, prioritize cooperation that strengthens player agency, and evaluate effects on enjoyment and control.",
          ko: "AI NPC의 자율성을 게임 규칙과 정체성 안에 제한하고, 플레이어 주체성을 강화하는 협력을 우선하며, 즐거움과 통제감에 미치는 영향을 평가해야 합니다.",
        },
        scope: {
          en: "A conceptual slide-based conference presentation built from selected examples and eight references, not a systematic review or user study; its design claims require empirical validation in concrete games.",
          ko: "선별 사례와 문헌 8편으로 구성한 슬라이드 기반 개념 발표이며 체계적 문헌고찰이나 사용자 연구가 아닙니다. 설계 주장은 구체적인 게임에서 실증 검증이 필요합니다.",
        },
      },
    },
    {
      slug: "rag-enhanced-gaia",
      sourceIndex: 7,
      shortTitle: {
        en: "Testing an AI Game Assistant",
        ko: "AI 게임 어시스턴트 평가",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Fragmented game knowledge and hallucination threaten the usefulness of novice support.",
          ko: "분산된 게임 지식과 환각은 초보자 지원의 실용성을 위협합니다.",
        },
        design: {
          en: "Grounded answers in curated Street Fighter 6 sources and judged executable correctness, not similarity alone.",
          ko: "Street Fighter 6 선별 자료에 답변을 근거화하고 유사도만이 아니라 실행 가능한 정확성을 판단했습니다.",
        },
        artifact: {
          en: "A multimodal Discord GAIA prototype and a 19-answer retrieval evaluation.",
          ko: "멀티모달 Discord GAIA 프로토타입과 답변 19개의 검색 평가를 구현했습니다.",
        },
        evidence: {
          en: "I contributed equally with the other authors listed after the first author. We evaluated 19 answers with mean ROUGE-1 of 0.210 and RDASS of 0.214.",
          ko: "제1저자 다음에 기재된 다른 저자들과 동등하게 기여했습니다. 연구팀은 19개 답변을 평가해 평균 ROUGE-1 0.210, RDASS 0.214를 보고했습니다.",
        },
      },
      palette: "oxide",
      pattern: "grid",
      height: "short",
      width: "regular",
      mark: "HCI",
      editorial: {
        question: {
          en: "Can a RAG-enhanced LLM chatbot give beginners accurate, actionable help for a complex fighting game?",
          ko: "RAG 적용 LLM 챗봇은 복잡한 격투게임 초보자에게 정확하고 실행 가능한 도움을 제공할 수 있는가?",
        },
        gap: {
          en: "Game knowledge is fragmented across tutorials, communities, and media, while general LLMs can hallucinate, become outdated, and ignore the player's immediate game context.",
          ko: "게임 지식은 튜토리얼·커뮤니티·미디어에 흩어져 있고 일반 LLM은 환각·지식 노후화·즉시 게임 맥락 누락의 문제가 있습니다.",
        },
        contribution: {
          en: "A Street Fighter 6 Discord assistant combining a curated database, FAISS retrieval, GPT-4 Turbo, and text, voice, image, and video support, plus an answer-level evaluation.",
          ko: "정제 DB, FAISS 검색, GPT-4 Turbo, 텍스트·음성·이미지·영상 지원을 결합한 Street Fighter 6 Discord 어시스턴트와 답변 단위 평가를 제시합니다.",
        },
        method: {
          en: "Web-crawled and manually curated Street Fighter 6 knowledge; 19 researcher-authored beginner questions and expected answers; ROUGE-1 lexical overlap and RDASS semantic similarity; qualitative inspection of top and bottom responses in live game context.",
          ko: "웹 크롤링·수기 정제 Street Fighter 6 지식, 연구진이 만든 초보 질문·기대답변 19개, ROUGE-1 단어 중복과 RDASS 의미 유사도, 상·하위 답변의 실제 게임 맥락 질적 검토를 사용했습니다.",
        },
        takeaway: {
          en: "RAG made explicit steps and button inputs useful, but retrieval similarity was not the same as gameplay correctness.",
          ko: "RAG는 명시적 절차와 버튼 입력에 유용했지만 검색·문장 유사도는 실제 게임 정답성과 같지 않았습니다.",
        },
        finding1: {
          en: "Across 19 answers, mean ROUGE-1 was 0.210 and mean RDASS was 0.214; direct action sequences and exact inputs formed the strongest responses.",
          ko: "19개 답변의 평균 ROUGE-1은 0.210, RDASS는 0.214였고 직접 행동 절차와 정확한 입력 질문에서 가장 강했습니다.",
        },
        finding2: {
          en: "High text similarity could still hide a wrong in-game path, showing a gap between automatic metrics and situated correctness.",
          ko: "텍스트 유사도가 높아도 게임 안에서는 잘못된 경로일 수 있어 자동 지표와 상황적 정답성의 간극을 드러냈습니다.",
        },
        finding3: {
          en: "Failures included missing near-match records, irrelevant elaboration, and hallucinated move information despite a domain database.",
          ko: "도메인 DB가 있어도 유사 기록 누락, 불필요한 부연, 기술 정보 환각이 발생했습니다.",
        },
        implication: {
          en: "Game-AI teams should use executable task tests, domain-expert review, and novice sessions as primary quality gates, treating lexical and semantic scores as diagnostic signals rather than release criteria.",
          ko: "게임 AI 팀은 실행 가능한 과업 검사, 도메인 전문가 검토, 초보 사용자 세션을 핵심 품질 게이트로 사용하고, 어휘·의미 점수는 출시 기준이 아닌 진단 신호로 다뤄야 합니다.",
        },
        scope: {
          en: "One game and 19 researcher-created question-answer pairs; no novice participant study, and the automatic metrics were demonstrably incomplete proxies for correctness.",
          ko: "한 게임과 연구진 생성 질의응답 19개를 사용했으며 초보 참여자 연구가 없고 자동 지표는 정답성의 불완전한 대리변수였습니다.",
        },
      },
    },
    {
      slug: "pleth-ethical-llm",
      sourceIndex: 8,
      shortTitle: {
        en: "AI Ethics Across Cultures",
        ko: "문화권별 AI 윤리",
      },
      category: {
        en: "Conference Poster",
        ko: "학술대회 포스터",
      },
      story: {
        research: {
          en: "Cultural alignment can conflict with ethical acceptability in language-model decisions.",
          ko: "언어모델의 의사결정에서 문화적 정렬과 윤리적 수용성이 충돌할 수 있습니다.",
        },
        design: {
          en: "Scored cultural relevance, coherence, consistency, and acceptability separately, with human escalation as a requirement.",
          ko: "문화적 관련성·정합성·일관성·수용성을 분리해 평가하고 인간 검토를 필수로 두었습니다.",
        },
        artifact: {
          en: "PLETH: 12 cultural profiles by nine moral scenarios across four criteria.",
          ko: "PLETH는 12개 문화 프로필과 9개 도덕 시나리오를 네 기준으로 평가합니다.",
        },
        evidence: {
          en: "As co-first author, I co-led an exploratory AI-ethics framework comparing 12 cultural profiles across nine moral scenarios. Decisions and scoring were model-generated, so the results remain exploratory.",
          ko: "공동 제1저자로서 12개 문화 프로필과 9개 도덕 시나리오를 비교한 탐색적 AI 윤리 프레임워크 연구를 공동 주도했습니다. 의사결정과 평가는 모두 모델이 수행했으므로 결과는 탐색적 근거로 해석합니다.",
        },
      },
      palette: "plum",
      pattern: "rules",
      height: "tall",
      width: "narrow",
      mark: "KAIA",
      editorial: {
        question: {
          en: "Can cultural dimensions be embedded in LLM prompts so ethical decisions reflect specific cultural contexts without losing coherence and ethical acceptability?",
          ko: "문화 차원을 LLM 프롬프트에 삽입해 정합성과 윤리적 수용성을 잃지 않으면서 문화별 윤리 판단을 반영할 수 있는가?",
        },
        gap: {
          en: "LLMs can describe cultural values, but static evaluations weakly connect cultural profiles to behavior in complex moral decisions.",
          ko: "LLM은 문화 가치를 설명할 수 있지만 정적 평가는 문화 프로필을 복잡한 도덕 판단 행동과 약하게 연결합니다.",
        },
        contribution: {
          en: "As co-first author, I co-led the development of PLETH, a few-shot prompting and LLM-as-a-judge framework combining twelve Hofstede-derived profiles, nine Moral Machine trolley scenarios, and four evaluation criteria.",
          ko: "공동 제1저자로서 Hofstede 기반 12개 프로필, Moral Machine 트롤리 딜레마 9개, 4개 평가 기준을 결합한 few-shot·LLM-as-a-judge 프레임워크 PLETH의 개발을 공동 주도했습니다.",
        },
        method: {
          en: "GPT-4o generated decisions for one neutral control and twelve cultural profiles across nine scenarios; another LLM scored coherence, ethical acceptability, cultural relevance, and consistency from 1 to 5.",
          ko: "GPT-4o가 중립 대조군 1개와 문화 프로필 12개로 9개 시나리오를 판단하고 다른 LLM이 정합성·윤리적 수용성·문화 관련성·일관성을 1~5점으로 평가했습니다.",
        },
        takeaway: {
          en: "Cultural prompting improved cultural relevance and consistency, but made visible a real tension between context-sensitive norms and universal ethical principles.",
          ko: "문화 프롬프팅은 문화 관련성과 일관성을 높였지만 맥락적 규범과 보편 윤리 원칙의 실제 긴장을 드러냈습니다.",
        },
        finding1: {
          en: "Culturally embedded profiles generally scored high in coherence and cultural relevance; the neutral profile was weakest on cultural relevance.",
          ko: "문화 삽입 프로필은 대체로 정합성과 문화 관련성이 높았고 중립 프로필은 문화 관련성이 가장 낮았습니다.",
        },
        finding2: {
          en: "Most embedded profiles maintained consistency around 4–5, while the control varied more on culturally charged scenarios.",
          ko: "대부분의 문화 프로필은 일관성 4~5 수준을 유지했고 대조군은 문화적으로 민감한 시나리오에서 더 흔들렸습니다.",
        },
        finding3: {
          en: "Some strongly framed profiles scored lower on ethical acceptability when cultural priorities conflicted with generalized human-rights norms; the control often scored higher there.",
          ko: "강한 문화 프로필 일부는 문화 우선순위가 일반적 인권 규범과 충돌할 때 윤리 수용성이 낮았고 이 지점에서는 대조군이 더 높았습니다.",
        },
        implication: {
          en: "Culturally aware ethical systems need independent human review and an explicit method for negotiating cultural specificity against non-negotiable safeguards.",
          ko: "문화 인식 윤리 시스템에는 독립적 인간 검토와 문화 특수성을 비협상 안전 원칙과 조율하는 명시적 방법이 필요합니다.",
        },
        scope: {
          en: "LLMs both decided and judged, creating shared-model bias; few-shot prompting was basic; trolley dilemmas simplify real ethics; no human evaluator or real-world outcome was included.",
          ko: "LLM이 판단과 평가를 모두 수행해 공유 모델 편향이 있고 few-shot 기법은 기초적이며 트롤리 딜레마는 실제 윤리를 단순화합니다. 인간 평가자나 실제 결과가 없습니다.",
        },
      },
    },
    {
      slug: "gaia-service-framework",
      sourceIndex: 9,
      shortTitle: {
        en: "AI Support for Player Struggles",
        ko: "플레이 어려움을 돕는 AI",
      },
      category: {
        en: "Conference Short Paper",
        ko: "학술대회 단편 논문",
      },
      story: {
        research: {
          en: "Player difficulty can be informational, practical, or emotional rather than one uniform state.",
          ko: "플레이어의 어려움은 하나의 상태가 아니라 정보적·실행적·정서적 문제일 수 있습니다.",
        },
        design: {
          en: "Routed states to separate problem-solving and emotion-regulation strategies with explicitly governed memory.",
          ko: "상태를 문제 해결과 감정 조절 전략으로 분기하고 기억을 명시적으로 관리하도록 설계했습니다.",
        },
        artifact: {
          en: "A two-path conceptual GAIA service architecture and UX scenario.",
          ko: "두 경로의 개념적 GAIA 서비스 아키텍처와 UX 시나리오를 제안했습니다.",
        },
        evidence: {
          en: "As co-first author, I co-designed a two-page service-architecture proposal; implementation and user evaluation are the next research phase.",
          ko: "공동 제1저자로서 2쪽 분량의 서비스 아키텍처 제안을 공동 설계했으며, 구현과 사용자 평가는 다음 연구 단계입니다.",
        },
      },
      palette: "cobalt",
      pattern: "signal",
      height: "standard",
      width: "wide",
      mark: "KCGS",
      editorial: {
        question: {
          en: "How can a game AI assistant support both problem solving and emotion regulation when players struggle during play?",
          ko: "플레이어가 게임 중 어려움을 겪을 때 게임 AI 어시스턴트는 문제 해결과 감정 조절을 함께 어떻게 지원할 수 있는가?",
        },
        gap: {
          en: "Existing game assistants emphasize information and technique while often ignoring frustration, conflict, and other affective barriers that determine whether play continues.",
          ko: "기존 게임 어시스턴트는 정보·기술 지원에 집중하고 플레이 지속을 좌우하는 좌절·갈등 같은 정서 장벽을 놓칩니다.",
        },
        contribution: {
          en: "As co-first author, I co-designed a hybrid GAIA service framework and UX scenario that routes player difficulty to either a problem-solving strategy or an emotion-regulation strategy using game context and dialogue state.",
          ko: "공동 제1저자로서 게임 맥락과 대화 상태에 따라 어려움을 문제 해결 전략 또는 감정 조절 전략으로 라우팅하는 하이브리드 GAIA 서비스 프레임워크와 UX 시나리오를 공동 설계했습니다.",
        },
        method: {
          en: "Conceptual architecture and scenario design: an overlaid chat interface, real-time gameplay context, LLM classification, separate strategy databases, and long-term memory for high-intensity emotional episodes.",
          ko: "개념 아키텍처·시나리오 설계로 오버레이 채팅, 실시간 게임 맥락, LLM 분류, 분리된 전략 DB, 고강도 감정 에피소드 장기 기억을 구성했습니다.",
        },
        takeaway: {
          en: "Useful game assistance must address both the obstacle and the player's state, then route each to a different kind of support.",
          ko: "유용한 게임 지원은 장애물과 플레이어 상태를 함께 다루고 각각 다른 지원 경로로 보내야 합니다.",
        },
        finding1: {
          en: "Information and skill difficulties require settings, rules, or strategy retrieval grounded in the current game context.",
          ko: "정보·기술 어려움에는 현재 게임 맥락에 근거한 설정·규칙·전략 검색이 필요합니다.",
        },
        finding2: {
          en: "Emotion-regulation difficulty requires a separate response path for labeling, expressing, and regulating affect rather than another gameplay hint.",
          ko: "감정 조절 어려움에는 또 다른 게임 힌트가 아니라 감정 구체화·표현·조절을 위한 별도 경로가 필요합니다.",
        },
        finding3: {
          en: "The proposed long-term-memory component could personalize later support when similar difficulty patterns recur; this remains an unimplemented design hypothesis.",
          ko: "제안한 장기기억 구성요소는 유사한 어려움이 반복될 때 후속 지원을 개인화할 수 있으나, 아직 구현되지 않은 설계 가설입니다.",
        },
        implication: {
          en: "Architect affective routing and memory explicitly instead of treating every difficulty as an information-retrieval request.",
          ko: "모든 어려움을 정보 검색 요청으로 보지 말고 정서 라우팅과 기억을 명시적으로 설계해야 합니다.",
        },
        scope: {
          en: "A two-page conceptual conference paper with no implemented-system or participant evaluation; the authors call for a working prototype, user study, and emotion-strategy database.",
          ko: "구현 시스템이나 참여자 평가가 없는 2쪽 개념 학술대회 논문이며 작동형 프로토타입·사용자 연구·감정 전략 DB가 후속 과제입니다.",
        },
      },
    },
    {
      slug: "llm-npc-scoping-review",
      sourceIndex: 10,
      shortTitle: {
        en: "AI Characters in Games",
        ko: "게임 속 AI 캐릭터",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Six early LLM-NPC studies exposed hallucination, latency, memory, and realism-led design gaps.",
          ko: "초기 LLM-NPC 연구 6편에서 환각·지연·기억·사실성 중심 설계의 공백이 드러났습니다.",
        },
        design: {
          en: "Defined the NPC's job, constraints, and evaluation needs before selecting an LLM.",
          ko: "LLM을 선택하기 전에 NPC의 역할·제약·평가 요구를 정의하도록 제안했습니다.",
        },
        artifact: {
          en: "A technical, design, and evaluation decision framework with a research agenda.",
          ko: "기술·설계·평가 의사결정 프레임워크와 연구 의제를 정리했습니다.",
        },
        evidence: {
          en: "As second author, I helped synthesize six early LLM-NPC studies into a practical technical, design, and evaluation agenda.",
          ko: "제2저자로 초기 LLM-NPC 연구 6편을 종합해 기술·설계·평가를 아우르는 실무적 연구 의제를 정리했습니다.",
        },
      },
      palette: "ink",
      pattern: "orbit",
      height: "short",
      width: "regular",
      mark: "KGS",
      editorial: {
        question: {
          en: "What technical, design, and evaluation challenges define the emerging use of LLMs for game NPCs?",
          ko: "게임 NPC에 LLM을 활용하는 초기 연구를 규정하는 기술·설계·평가 과제는 무엇인가?",
        },
        gap: {
          en: "Early LLM-NPC demonstrations were fragmented and realism-led, without consolidated guidance on system constraints, the LLM's game function, or what should be evaluated.",
          ko: "초기 LLM-NPC 시연은 분절되고 현실성에 치우쳐 시스템 제약, LLM의 게임 기능, 평가 대상에 대한 종합 지침이 부족했습니다.",
        },
        contribution: {
          en: "A scoping review that organizes six 2023 studies into technical, design, and evaluation challenges and translates them into a research agenda.",
          ko: "2023년 연구 6편을 기술·설계·평가 과제로 구조화하고 연구 의제로 전환한 주제범위 문헌고찰입니다.",
        },
        method: {
          en: "Six 2023 papers involving implemented game NPCs and interaction strategies were selected and coded through a scoping-review approach.",
          ko: "구현된 게임 NPC와 상호작용 전략을 다룬 2023년 논문 6편을 선정해 주제범위 문헌고찰 방식으로 코딩했습니다.",
        },
        takeaway: {
          en: "Adding an LLM is not a design rationale: the NPC's game role, latency and memory constraints, and target experience must be explicit.",
          ko: "LLM을 추가하는 것 자체는 설계 근거가 아닙니다. NPC의 게임 역할, 지연·기억 제약, 목표 경험을 명시해야 합니다.",
        },
        finding1: {
          en: "Technical challenges centered on hallucination, memory and capacity limits, and response latency.",
          ko: "기술 과제는 환각, 기억·용량 한계, 응답 지연에 집중됐습니다.",
        },
        finding2: {
          en: "Design challenges included realism bias, an unclear functional role for the LLM, and weak selection of data for persona, knowledge, and context.",
          ko: "설계 과제는 현실성 편향, 불분명한 LLM 기능 배치, 페르소나·지식·맥락 데이터 선택의 취약성이었습니다.",
        },
        finding3: {
          en: "Evaluation lacked game-specific UX studies, concrete targets, and measures of NPC capability or believability.",
          ko: "평가는 게임 특화 UX 연구, 구체적 평가 대상, NPC 역량·신뢰성 지표가 부족했습니다.",
        },
        implication: {
          en: "Define the NPC's function first, engineer memory and latency around it, then evaluate player experience and capability in an actual game loop.",
          ko: "NPC 기능을 먼저 정의하고 이에 맞춰 기억·지연을 설계한 뒤 실제 게임 루프에서 플레이어 경험과 역량을 평가해야 합니다.",
        },
        scope: {
          en: "Only six papers from one fast-moving publication year; the authors identify the evidence base as insufficient and call for more empirical work.",
          ko: "빠르게 변하는 한 해의 논문 6편만 다뤘으며 근거 기반이 부족해 추가 실증 연구가 필요합니다.",
        },
      },
    },
    {
      slug: "hybe-multilabel-review",
      sourceIndex: 11,
      shortTitle: {
        en: "How HYBE Organizes Labels",
        ko: "HYBE의 레이블 운영 구조",
      },
      category: {
        en: "Conference Abstract",
        ko: "학술대회 초록",
      },
      story: {
        research: {
          en: "HYBE suggests label autonomy operating inside a shared ownership structure.",
          ko: "HYBE 사례는 공유 소유구조 안에서 레이블 자율성이 작동할 가능성을 보여줍니다.",
        },
        design: {
          en: "Framed decentralization as a testable operating-model hypothesis, not universal proof.",
          ko: "분권화를 보편적 증명이 아니라 검증 가능한 운영모델 가설로 다뤘습니다.",
        },
        artifact: {
          en: "A one-page technical literature-review abstract about autonomy, infrastructure, and coordination.",
          ko: "자율성·공유 인프라·조정을 다룬 한 페이지 기술 문헌검토 초록입니다.",
        },
        evidence: {
          en: "As corresponding author, I helped analyze HYBE's multi-label structure as a decentralized management strategy; this publication is a conference abstract.",
          ko: "교신저자로 HYBE의 멀티레이블 구조를 분권형 경영 전략으로 분석하는 데 기여했으며, 이 출판물은 학술대회 초록입니다.",
        },
      },
      palette: "moss",
      pattern: "grid",
      height: "standard",
      width: "narrow",
      mark: "KTIS",
      editorial: {
        question: {
          en: "How can HYBE's multi-label structure be understood as a decentralized post-M&A management model, and where might that model transfer?",
          ko: "HYBE의 멀티레이블 구조를 분산형 인수합병 후 경영 모델로 어떻게 이해하며 어디까지 전이할 수 있는가?",
        },
        gap: {
          en: "The multi-label model is visible as an industry strategy, but its organizational logic, flexibility, and transferability had not been systematically framed in the accessible conference record.",
          ko: "멀티레이블 모델은 산업 전략으로 알려졌지만 조직 논리·유연성·전이 가능성을 체계적으로 구조화한 접근은 제한적이었습니다.",
        },
        contribution: {
          en: "As corresponding author, I co-authored a technical review framing HYBE's independent-label system as a case of decentralized management and differentiated creative strategy.",
          ko: "교신저자로서 HYBE 독립 레이블 체계를 분산 경영과 차별화된 창작 전략 사례로 해석한 기술 문헌검토를 공동 집필했습니다.",
        },
        method: {
          en: "This conference abstract presents a focused technical literature review of HYBE's multi-label management structure; it does not report databases, corpus size, or an appraisal protocol.",
          ko: "HYBE 멀티레이블 경영 구조에 초점을 둔 기술적 문헌고찰 초록이며 DB·문헌 수·평가 절차는 보고하지 않았습니다.",
        },
        takeaway: {
          en: "Independent labels can preserve distinct artist strategies and identities inside a shared corporate portfolio, but that premise is not yet a validated cross-industry result.",
          ko: "독립 레이블은 공동 기업 포트폴리오 안에서 서로 다른 아티스트 전략과 정체성을 유지할 수 있지만 산업 전반의 검증 결과는 아닙니다.",
        },
        finding1: {
          en: "The structure separates label-level creative identity from group-level ownership and resource coordination.",
          ko: "구조는 레이블 단위 창작 정체성을 그룹 단위 소유·자원 조정과 분리합니다.",
        },
        finding2: {
          en: "Decentralization is presented as a mechanism for managerial and market flexibility after acquisition.",
          ko: "분산화는 인수 이후 경영·시장 유연성을 위한 메커니즘으로 제시됩니다.",
        },
        finding3: {
          en: "Transfer to other sectors remains a proposition because the abstract does not report comparative cases or outcome measures.",
          ko: "비교 사례나 결과 지표가 보고되지 않아 타 산업 전이는 제안 수준에 머뭅니다.",
        },
        implication: {
          en: "Use the case to generate testable questions about autonomy, shared infrastructure, and post-M&A coordination rather than as proof of one optimal structure.",
          ko: "단일 최적 구조의 증거가 아니라 자율성·공유 인프라·인수 후 조정에 관한 검증 가능한 질문을 만드는 사례로 사용해야 합니다.",
        },
        scope: {
          en: "One-company, one-page conference abstract with no reproducible search protocol, comparison group, or causal outcome evidence.",
          ko: "한 기업을 다룬 1쪽 학술대회 초록으로 재현 가능한 검색 절차·비교군·인과 결과 근거가 없습니다.",
        },
      },
    },
    {
      slug: "bighit-to-hybe",
      sourceIndex: 12,
      shortTitle: {
        en: "How BigHit Became HYBE",
        ko: "BigHit의 HYBE 전환",
      },
      category: {
        en: "Conference Abstract",
        ko: "학술대회 초록",
      },
      story: {
        research: {
          en: "45,393 Korean news articles captured media framing across the BigHit-to-HYBE transition.",
          ko: "한국 뉴스 45,393건에서 BigHit에서 HYBE로 전환되는 동안의 미디어 프레이밍을 추적했습니다.",
        },
        design: {
          en: "Monitored innovation narratives and organizational conflict together rather than as isolated signals.",
          ko: "혁신 서사와 조직 갈등을 분리된 신호가 아니라 함께 추적했습니다.",
        },
        artifact: {
          en: "A longitudinal sentiment and keyword analysis spanning 2005 through 2024.",
          ko: "2005년부터 2024년까지의 종단 감성·키워드 분석을 수행했습니다.",
        },
        evidence: {
          en: "This work is available as an abstract-book entry; media sentiment is not stakeholder attitude or business performance. I am the corresponding author.",
          ko: "이 연구는 초록집에 수록된 결과물이며 미디어 감성은 이해관계자 태도나 사업 성과와 동일하지 않습니다. 교신저자로 참여했습니다.",
        },
      },
      palette: "oxide",
      pattern: "type",
      height: "tall",
      width: "regular",
      mark: "KSIME",
      editorial: {
        question: {
          en: "How did the tone and strategic vocabulary of Korean news coverage change as BigHit evolved into HYBE?",
          ko: "BigHit이 HYBE로 전환하는 동안 한국 뉴스 보도의 감성과 전략 언어는 어떻게 변했는가?",
        },
        gap: {
          en: "Corporate-transition narratives are often retrospective and selective; large-scale longitudinal news analysis can reveal how sentiment and strategic themes moved across the transition.",
          ko: "기업 전환 서사는 회고적·선택적인 경우가 많으며 대규모 장기 뉴스 분석은 전환 전후 감성과 전략 주제의 변화를 드러낼 수 있습니다.",
        },
        contribution: {
          en: "A longitudinal news-data analysis connecting sentiment and keyword patterns to the strategic transition from BigHit to HYBE.",
          ko: "감성·키워드 패턴을 BigHit에서 HYBE로의 전략 전환과 연결한 장기 뉴스 데이터 분석입니다.",
        },
        method: {
          en: "45,393 Korean news articles from 2005–2024; lexicon-based analysis plus NLTK/TextBlob sentiment and keyword analysis; comparison of BigHit and HYBE eras.",
          ko: "2005~2024년 한국 뉴스 45,393건, 사전 기반 분석과 NLTK/TextBlob 감성·키워드 분석, BigHit·HYBE 시기 비교를 사용했습니다.",
        },
        takeaway: {
          en: "HYBE's expansion broadened the strategic story, but average news sentiment was lower and more exposed to conflict than in the BigHit era.",
          ko: "HYBE의 확장은 전략 서사를 넓혔지만 평균 뉴스 감성은 BigHit 시기보다 낮고 갈등에 더 노출됐습니다.",
        },
        finding1: {
          en: "Mean sentiment was 0.0243 in the BigHit era and 0.0076 in the HYBE era.",
          ko: "평균 감성은 BigHit 시기 0.0243, HYBE 시기 0.0076이었습니다.",
        },
        finding2: {
          en: "Growth and success language was associated with more positive BigHit-era coverage.",
          ko: "성장·성공 언어는 BigHit 시기의 더 긍정적인 보도와 연결됐습니다.",
        },
        finding3: {
          en: "Innovation supported HYBE's positive narrative, while internal conflict reduced sentiment.",
          ko: "혁신은 HYBE의 긍정 서사를 지지했지만 내부 갈등은 감성을 낮췄습니다.",
        },
        implication: {
          en: "Track strategic transition with both innovation signals and organizational-conflict indicators; corporate scale alone does not secure a positive public narrative.",
          ko: "전략 전환을 혁신 신호와 조직 갈등 지표로 함께 추적해야 하며 기업 규모만으로 긍정적 공론을 확보할 수는 없습니다.",
        },
        scope: {
          en: "News sentiment is a proxy for media framing, not stakeholder attitude or business performance; results depend on corpus construction and text-analysis choices.",
          ko: "뉴스 감성은 미디어 프레이밍의 대리변수이지 이해관계자 태도나 경영 성과가 아니며 결과는 코퍼스 구성과 텍스트 분석 선택에 의존합니다.",
        },
      },
    },
    {
      slug: "vr-environmental-awareness",
      sourceIndex: 13,
      shortTitle: {
        en: "VR for Environmental Learning",
        ko: "환경 학습을 위한 VR",
      },
      category: {
        en: "Journal Article",
        ko: "학술지 논문",
      },
      story: {
        research: {
          en: "Content sequence and social form may matter more than positive or negative valence alone.",
          ko: "긍정·부정의 방향만으로는 부족하며 콘텐츠 순서와 사회적 형식이 중요할 수 있습니다.",
        },
        design: {
          en: "Tested content order and collaboration as separate experience-design levers.",
          ko: "콘텐츠 순서와 협동을 서로 다른 경험 설계 변수로 시험했습니다.",
        },
        artifact: {
          en: "A four-condition OptiTrack VR recycling study with individual and team play.",
          ko: "개인·팀 플레이를 비교하는 4조건 OptiTrack VR 재활용 연구를 수행했습니다.",
        },
        evidence: {
          en: "A journal study with N=65; small unequal cells and short-term self-report limit causal and general claims.",
          ko: "N=65 학술지 연구이며 작고 불균등한 셀과 단기 자기보고로 인과·일반화 주장에 한계가 있습니다.",
        },
      },
      palette: "moss",
      pattern: "terrain",
      height: "tall",
      width: "wide",
      mark: "JKCGS",
      editorial: {
        question: {
          en: "How do positive and negative VR content, their sequence, and individual versus cooperative play shape environmental awareness?",
          ko: "긍정·부정 VR 콘텐츠와 제시 순서, 개인·협력 플레이가 환경 인식에 어떤 영향을 주는가?",
        },
        gap: {
          en: "VR environmental studies suggest attitude effects, but rarely separate content valence from social play format and presentation order.",
          ko: "VR 환경 연구는 태도 효과를 제시하지만 콘텐츠 정서가, 사회적 플레이 방식, 제시 순서를 분리해 다룬 경우는 드뭅니다.",
        },
        contribution: {
          en: "A four-condition study showing that environmental-awareness outcomes depend on the interaction between content sequence and individual or team-based play.",
          ko: "환경 인식 결과가 콘텐츠 순서와 개인·팀 플레이의 결합에 따라 달라짐을 보인 4조건 연구입니다.",
        },
        method: {
          en: "65 university students ages 19–27; a projection-based VR recycling game using 12 OptiTrack Prime17W cameras; individual or three-person cooperative play with positive and negative content sequences; pre, mid, and post surveys; paired and independent-sample t-tests.",
          ko: "19~27세 대학생 65명, OptiTrack Prime17W 12대 기반 프로젝션 VR 재활용 게임, 개인 또는 3인 협력 플레이와 긍정·부정 콘텐츠 순서, 사전·중간·사후 설문, 대응·독립표본 t검정을 사용했습니다.",
        },
        takeaway: {
          en: "Environmental impact in VR came from the sequence and social form of play, not from positive or negative content alone.",
          ko: "VR의 환경 인식 효과는 긍정·부정 콘텐츠 하나가 아니라 제시 순서와 사회적 플레이 형식에서 나왔습니다.",
        },
        finding1: {
          en: "Positive content in individual play increased perceived importance of recycling.",
          ko: "개인 플레이의 긍정 콘텐츠는 재활용 중요성 인식을 높였습니다.",
        },
        finding2: {
          en: "Positive team play and negative individual play increased perceived seriousness of pollution, showing different routes to concern.",
          ko: "긍정 팀 플레이와 부정 개인 플레이는 오염 심각성 인식을 높여 서로 다른 경로의 우려 형성을 보였습니다.",
        },
        finding3: {
          en: "In individual play, a positive-to-negative sequence increased environmental interest, indicating that order mattered.",
          ko: "개인 플레이에서 긍정 후 부정 순서는 환경 관심을 높여 제시 순서의 중요성을 보였습니다.",
        },
        implication: {
          en: "Design environmental games as an affective and social sequence: select not only what players see, but when and with whom they encounter it.",
          ko: "환경 게임을 정서적·사회적 시퀀스로 설계해 무엇을 볼지뿐 아니라 언제 누구와 경험할지도 결정해야 합니다.",
        },
        scope: {
          en: "One university-age sample, small and unequal condition cells, one recycling scenario, and short-term self-report outcomes limit statistical power and generalization.",
          ko: "한 대학 연령 표본, 작고 불균형한 조건 집단, 단일 재활용 시나리오, 단기 자기보고 결과로 검정력과 일반화에 한계가 있습니다.",
        },
      },
    },
    {
      slug: "ml-demand-forecasting",
      sourceIndex: 14,
      shortTitle: {
        en: "Machine Learning for Demand",
        ko: "머신러닝 수요 예측",
      },
      category: {
        en: "Preprint, Not Peer Reviewed",
        ko: "프리프린트, 동료심사 전",
      },
      story: {
        research: {
          en: "Heterogeneous product demand weakens a single global forecasting pipeline.",
          ko: "상품별로 다른 수요 패턴은 하나의 전역 예측 파이프라인을 약화시킵니다.",
        },
        design: {
          en: "Clustered demand patterns, selected features by segment, then forecast with LSTM.",
          ko: "수요 패턴을 군집화하고 구간별 변수를 선택한 뒤 LSTM으로 예측했습니다.",
        },
        artifact: {
          en: "A three-stage pipeline evaluated across 2,548 retail products.",
          ko: "소매 상품 2,548개에 적용한 3단계 예측 파이프라인입니다.",
        },
        evidence: {
          en: "The full hybrid led three metrics; this is an unreviewed preprint from one retailer, and inconsistent cluster counts are omitted.",
          ko: "전체 결합 모델이 세 지표에서 가장 좋았지만 단일 소매사의 동료심사 전 프리프린트이며, 불일치하는 군집 수는 생략했습니다.",
        },
      },
      palette: "ink",
      pattern: "grid",
      height: "short",
      width: "narrow",
      mark: "RS",
      editorial: {
        question: {
          en: "Can demand-pattern clustering and cluster-specific feature selection improve LSTM forecasts across heterogeneous retail products?",
          ko: "수요 패턴 군집화와 군집별 변수 선택이 이질적인 소매 제품의 LSTM 수요 예측을 개선할 수 있는가?",
        },
        gap: {
          en: "A single forecasting pipeline struggles with heterogeneous, irregular product demand and can spend substantial effort on features that matter differently by pattern.",
          ko: "단일 예측 파이프라인은 이질적·불규칙한 제품 수요를 다루기 어렵고 패턴별 중요도가 다른 변수에 불필요한 비용을 쓸 수 있습니다.",
        },
        contribution: {
          en: "A three-stage forecasting pipeline: K-means demand-pattern clustering, cluster-specific LASSO feature selection, and LSTM sequence prediction.",
          ko: "K-means 수요 패턴 군집화, 군집별 LASSO 변수 선택, LSTM 시계열 예측의 3단계 파이프라인을 제시합니다.",
        },
        method: {
          en: "U.S. retail data from 2014-01-01 to 2016-03-26; 2,548 products and 312,388 observations; 104 training weeks and 12 verification weeks; 24 demand-derived plus six external variables; mMAPE, RMSE, and MAE against LSTM and two partial hybrids.",
          ko: "2014-01-01부터 2016-03-26까지의 미국 소매 데이터, 상품 2,548개와 관측치 312,388건, 학습 104주와 검증 12주, 수요 파생 변수 24개와 외생 변수 6개를 사용해 LSTM 및 두 부분 결합 모델과 mMAPE·RMSE·MAE를 비교했습니다.",
        },
        takeaway: {
          en: "Segment first, select features within each pattern, then forecast: on this dataset the full pipeline outperformed every partial model.",
          ko: "먼저 패턴을 나누고 군집별 변수를 고른 뒤 예측하는 전체 파이프라인이 이 데이터에서 모든 부분 모델보다 우수했습니다.",
        },
        finding1: {
          en: "The full hybrid achieved mMAPE 0.356, RMSE 0.958, and MAE 0.387, the best result across all three metrics.",
          ko: "전체 결합 모델은 mMAPE 0.356, RMSE 0.958, MAE 0.387로 세 지표 모두 최고 성능을 보였습니다.",
        },
        finding2: {
          en: "Plain LSTM scored 0.627/1.282/0.654; K-means plus LSTM 0.528/1.165/0.560; LASSO plus LSTM 0.440/1.080/0.467.",
          ko: "단일 LSTM은 0.627/1.282/0.654, K-means+LSTM은 0.528/1.165/0.560, LASSO+LSTM은 0.440/1.080/0.467이었습니다.",
        },
        finding3: {
          en: "LASSO retained different feature sets by cluster, while lag and moving-average variables remained recurrent signals across patterns.",
          ko: "LASSO는 군집별로 다른 변수 집합을 선택했고 시차·이동평균 변수는 패턴 전반에서 반복되는 신호였습니다.",
        },
        implication: {
          en: "For heterogeneous retail portfolios, model segmentation and feature governance should be designed together rather than added independently.",
          ko: "이질적 소매 포트폴리오에서는 모델 세분화와 변수 관리를 별도 단계가 아니라 함께 설계해야 합니다.",
        },
        scope: {
          en: "Unreviewed preprint using one retailer and limited external covariates; the paper contains an inconsistent product/cluster count, so cluster counts are omitted and cross-company validation is required.",
          ko: "동료심사 전 프리프린트로 한 소매사와 제한된 외생 변수를 사용했습니다. 제품 수와 군집 합계가 불일치해 군집별 수는 제시하지 않으며 타 기업 검증이 필요합니다.",
        },
      },
    },
    {
      slug: "recycling-gamification",
      sourceIndex: 15,
      shortTitle: {
        en: "Games for Recycling Behavior",
        ko: "재활용 행동을 위한 게임",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Cooperative commitment may change task execution more than broad environmental attitude.",
          ko: "협동적 몰입은 광범위한 환경 태도보다 과업 수행을 더 직접적으로 바꿀 수 있습니다.",
        },
        design: {
          en: "Compared solo and group play on the same timed recycling task.",
          ko: "동일한 제한시간 재활용 과업에서 개인 플레이와 집단 플레이를 비교했습니다.",
        },
        artifact: {
          en: "A motion-capture recycling game with behavior-specific attitude measures.",
          ko: "행동별 태도 척도를 포함한 모션캡처 재활용 게임을 구현했습니다.",
        },
        evidence: {
          en: "N=48 with fixed solo-to-group order and short exposure; the result does not support a broad causal attitude claim.",
          ko: "N=48, 개인 후 집단의 고정 순서와 짧은 노출이므로 광범위한 태도의 인과 변화를 주장할 수 없습니다.",
        },
      },
      palette: "sand",
      pattern: "orbit",
      height: "standard",
      width: "regular",
      mark: "HCI",
      editorial: {
        question: {
          en: "Does group commitment in a motion-capture recycling game increase task completion and recycling motivation compared with solo play?",
          ko: "모션캡처 재활용 게임의 집단 몰입은 개인 플레이보다 과업 완수와 재활용 동기를 높이는가?",
        },
        gap: {
          en: "Recycling gamification often reports engagement benefits, but the specific contribution of shared commitment has rarely been isolated.",
          ko: "재활용 게이미피케이션은 참여 효과를 보고하지만 공동 몰입 자체의 기여를 분리해 본 연구는 드뭅니다.",
        },
        contribution: {
          en: "A within-sequence comparison of solo and multiplayer recycling that links cooperative commitment to performance and behavior-specific attitude change.",
          ko: "개인 후 다인 재활용 과업을 비교해 협력 몰입을 수행과 행동 특화 태도 변화에 연결했습니다.",
        },
        method: {
          en: "48 participants in four groups of 12; an OptiTrack recycling task with 30 items and a 60-second limit; each participant first played solo, then in multiplayer; adapted pre/post recycling-awareness survey.",
          ko: "12명씩 4개 집단, 30개 물품·60초 제한 OptiTrack 재활용 과업, 모든 참여자가 개인 후 다인 플레이, 수정된 재활용 인식 사전·사후 설문을 사용했습니다.",
        },
        takeaway: {
          en: "Cooperation changed what participants were willing to do more clearly than it changed their general environmental worldview.",
          ko: "협력은 전반적 환경관보다 참여자가 실제로 하려는 행동을 더 분명하게 바꿨습니다.",
        },
        finding1: {
          en: "No participant completed the solo task, while every group completed the multiplayer task.",
          ko: "개인 과업 완수자는 없었지만 모든 다인 집단은 과업을 완료했습니다.",
        },
        finding2: {
          en: "Willingness to make an effort to recycle increased by 28.9 percent after group play.",
          ko: "집단 플레이 후 재활용을 위해 노력하려는 의향이 28.9% 증가했습니다.",
        },
        finding3: {
          en: "Prioritizing personal convenience decreased by 10.7 percent, while broad perceptions of environmental issues did not significantly shift.",
          ko: "개인 편의를 우선하는 태도는 10.7% 감소했지만 광범위한 환경 문제 인식은 유의하게 변하지 않았습니다.",
        },
        implication: {
          en: "Use cooperative commitment when the target is task performance and behavior-specific motivation, but do not assume a brief game changes general environmental attitudes.",
          ko: "과업 수행과 행동 특화 동기가 목표라면 협력 몰입을 활용하되 짧은 게임이 전반적 환경 태도를 바꾼다고 가정해서는 안 됩니다.",
        },
        scope: {
          en: "Fixed solo-to-group order, short exposure, limited demographic and statistical detail, and no long-term behavior measure constrain causal interpretation.",
          ko: "개인 후 집단으로 고정된 순서, 짧은 노출, 제한된 인구통계·통계 정보, 장기 행동 측정 부재로 인과 해석에 한계가 있습니다.",
        },
      },
    },
    {
      slug: "diplopia-rehabilitation",
      sourceIndex: 16,
      shortTitle: {
        en: "Games for Eye Exercise",
        ko: "안구 운동을 위한 게임",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Repetitive eye exercises can create adherence and participation problems.",
          ko: "반복적인 안구 운동은 참여와 지속의 어려움을 만들 수 있습니다.",
        },
        design: {
          en: "Gamified three exercise types and measured anticipation, continuation, and interest.",
          ko: "세 가지 운동을 게임화하고 기대감·지속 의향·흥미를 측정했습니다.",
        },
        artifact: {
          en: "An early gamified eye-exercise pilot tested across two sessions.",
          ko: "두 차례 세션에서 시험한 초기 게임화 안구 운동 파일럿입니다.",
        },
        evidence: {
          en: "N=7 descriptive evidence; diagnoses were not established, and no clinical efficacy was tested.",
          ko: "N=7의 기술적 근거이며 진단 여부가 확인되지 않았고 임상 효과를 시험하지 않았습니다.",
        },
      },
      palette: "plum",
      pattern: "current",
      height: "tall",
      width: "narrow",
      mark: "KCGS",
      editorial: {
        question: {
          en: "Can gamifying eye-movement exercises sustain anticipation, continuation, and interest better than conventional repetition?",
          ko: "안구 운동을 게임화하면 기존 반복 운동보다 기대·지속 의향·흥미를 유지할 수 있는가?",
        },
        gap: {
          en: "Diplopia exercises can be repetitive and monotonous, creating an adherence problem even when the movement protocol itself is available.",
          ko: "복시 운동은 반복적이고 단조로워 운동 프로토콜이 있어도 지속 참여 문제가 생깁니다.",
        },
        contribution: {
          en: "An early gamified exercise design spanning saccade, smooth pursuit, and optokinetic nystagmus, with a preliminary engagement comparison.",
          ko: "단속성 안구운동·원활 추종·시운동성 안진을 아우르는 초기 게임형 운동 설계와 예비 참여 비교를 제시합니다.",
        },
        method: {
          en: "Seven participants: four in a gamified condition and three controls; two exercise sessions 24 hours apart; 1–5 self-report ratings of anticipation, desire to continue, and interest.",
          ko: "참여자 7명(게임형 4명, 대조 3명), 24시간 간격 2회 운동, 기대·지속 의향·흥미 1~5점 자기보고를 사용했습니다.",
        },
        takeaway: {
          en: "Gamification showed a promising adherence signal, but this pilot did not establish rehabilitation efficacy.",
          ko: "게임화는 지속 참여의 가능성을 보였지만 이 예비 연구는 재활 효과를 입증하지 않았습니다.",
        },
        finding1: {
          en: "Anticipation for the next exercise increased in the gamified group while it declined in the control group.",
          ko: "다음 운동 기대는 게임형 집단에서 증가하고 대조 집단에서 감소했습니다.",
        },
        finding2: {
          en: "Desire to continue rose in the gamified group while the control group remained at the floor.",
          ko: "지속 의향은 게임형 집단에서 상승했고 대조 집단은 최저 수준에 머물렀습니다.",
        },
        finding3: {
          en: "Interest remained high with gamification but declined under conventional exercise.",
          ko: "흥미는 게임형 운동에서 높게 유지됐지만 기존 운동에서는 감소했습니다.",
        },
        implication: {
          en: "Treat engagement as a measurable rehabilitation-design outcome, then test whether improved adherence translates into clinical benefit.",
          ko: "참여도를 측정 가능한 재활 설계 결과로 다루고 향상된 지속성이 임상 효과로 이어지는지 검증해야 합니다.",
        },
        scope: {
          en: "N=7, descriptive percentages only, and the paper does not establish that participants had diagnosed diplopia or stroke. No clinical efficacy claim is warranted.",
          ko: "N=7의 기술적 비율만 제시하며 참여자의 복시·뇌졸중 진단이 확인되지 않습니다. 임상 효능을 주장할 수 없습니다.",
        },
      },
    },
    {
      slug: "eye-tracking-vr-games",
      sourceIndex: 17,
      shortTitle: {
        en: "Eye-Tracking VR",
        ko: "시선 추적 VR",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Repetition can limit sustained participation in conventional eye exercises.",
          ko: "기존 안구 운동의 반복성은 지속적인 참여를 제한할 수 있습니다.",
        },
        design: {
          en: "Converted saccade and smooth-pursuit exercises into gaze mechanics with staged difficulty and feedback.",
          ko: "단속성·원활추종 운동을 단계형 난이도와 피드백을 갖춘 시선 메커니즘으로 전환했습니다.",
        },
        artifact: {
          en: "A Meta Quest Pro eye-tracking VR game prototype.",
          ko: "Meta Quest Pro 기반 시선추적 VR 게임 프로토타입입니다.",
        },
        evidence: {
          en: "Feedback from 24 elementary students supports feasibility only, not diagnosis or therapeutic effectiveness; I am fourth author.",
          ko: "초등학생 24명의 피드백은 구현 가능성만 뒷받침하며 진단이나 치료 효과의 근거가 아닙니다. 제4저자로 참여했습니다.",
        },
      },
      palette: "cobalt",
      pattern: "signal",
      height: "short",
      width: "regular",
      mark: "KMMS",
      editorial: {
        question: {
          en: "How can saccade and smooth-pursuit exercises become a sustainable gaze-controlled VR game?",
          ko: "단속성 안구운동과 원활 추종 운동을 지속 가능한 시선 제어 VR 게임으로 어떻게 만들 수 있는가?",
        },
        gap: {
          en: "Eye exercises can support rehabilitation goals, but repetition reduces adherence and the usability of eye-tracked exercise games remains underexplored.",
          ko: "안구 운동은 재활 목표를 지원할 수 있지만 반복은 참여를 낮추며 시선 추적 운동 게임의 사용성은 충분히 탐구되지 않았습니다.",
        },
        contribution: {
          en: "A Meta Quest Pro prototype translating saccade and pursuit exercises into gaze-controlled mechanics, staged difficulty, markers, and feedback.",
          ko: "단속성·추종 운동을 시선 제어 메커닉, 단계 난이도, 마커, 피드백으로 옮긴 Meta Quest Pro 프로토타입입니다.",
        },
        method: {
          en: "Unity with Oculus and Meta Movement SDKs on Meta Quest Pro; gaze-based saccade and smooth-pursuit mechanics; a preliminary prototype check with 24 elementary-school students.",
          ko: "Meta Quest Pro에서 Unity·Oculus·Meta Movement SDK, 시선 기반 단속성·원활 추종 메커닉, 초등학생 24명 대상 예비 프로토타입 확인을 사용했습니다.",
        },
        takeaway: {
          en: "The study established prototype feasibility and engagement direction, not therapeutic effectiveness.",
          ko: "연구는 프로토타입 구현 가능성과 참여 방향을 확인했으며 치료 효과를 입증하지 않았습니다.",
        },
        finding1: {
          en: "The prototype implemented gaze markers, exercise-specific interaction, staged challenge, and immediate game feedback.",
          ko: "프로토타입은 시선 마커, 운동별 상호작용, 단계적 도전, 즉시 게임 피드백을 구현했습니다.",
        },
        finding2: {
          en: "The school pilot elicited positive reactions to immersion and participation.",
          ko: "학교 예비 확인에서 몰입과 참여에 긍정적 반응이 나타났습니다.",
        },
        finding3: {
          en: "No clinical outcome, diagnostic sample, or controlled therapeutic comparison was reported.",
          ko: "임상 결과, 진단 표본, 통제 치료 비교는 보고되지 않았습니다.",
        },
        implication: {
          en: "Use the prototype as a platform for ophthalmology-linked usability and clinical testing, with measures beyond enjoyment.",
          ko: "프로토타입을 안과 연계 사용성·임상 검증 플랫폼으로 사용하고 재미 이상의 지표를 측정해야 합니다.",
        },
        scope: {
          en: "Children rather than patients, sparse pilot-method detail, and no statistical or clinical endpoint; feasibility cannot be generalized to rehabilitation efficacy.",
          ko: "환자가 아닌 아동 표본, 제한된 예비 방법 정보, 통계·임상 종점 부재로 구현 가능성을 재활 효능으로 일반화할 수 없습니다.",
        },
      },
    },
    {
      slug: "cynophobia-vr-exposure",
      sourceIndex: 18,
      shortTitle: {
        en: "VR Exposure for Dog Fear",
        ko: "개 공포 완화를 위한 VR 노출",
      },
      category: {
        en: "Preliminary Conference Abstract",
        ko: "예비 학술대회 초록",
      },
      story: {
        research: {
          en: "Earlier VR exposure designs did not structure distance as a person-specific progression parameter.",
          ko: "기존 VR 노출 설계는 거리를 개인별 진행 변수로 구조화하지 않았습니다.",
        },
        design: {
          en: "Made exposure distance a controllable progression rather than a fixed scene property.",
          ko: "노출 거리를 고정된 장면 속성이 아니라 조절 가능한 진행 단계로 만들었습니다.",
        },
        artifact: {
          en: "A preliminary graded-distance versus immediate-close VR comparison.",
          ko: "점진적 거리와 즉시 근접 조건을 비교한 예비 VR 연구입니다.",
        },
        evidence: {
          en: "A one-page abstract with no reported N, instrument, effect estimate, or follow-up; it does not establish treatment efficacy.",
          ko: "한 페이지 초록이며 표본 수·측정도구·효과 추정치·추적조사를 보고하지 않아 치료 효과를 입증하지 않습니다.",
        },
      },
      palette: "oxide",
      pattern: "terrain",
      height: "standard",
      width: "wide",
      mark: "KMMS",
      editorial: {
        question: {
          en: "Does graded distance-based VR exposure reduce fear and create a more positive experience than immediate close exposure for people reporting cynophobia?",
          ko: "개 공포를 보고한 사람에게 거리 기반 단계적 VR 노출이 즉시 근접 노출보다 공포를 줄이고 더 긍정적 경험을 만드는가?",
        },
        gap: {
          en: "Real-world exposure is resource-intensive and difficult to control, while prior VR designs did not sufficiently structure space and distance as person-specific exposure variables.",
          ko: "현실 노출은 자원이 많이 들고 통제가 어려우며 기존 VR 설계는 공간·거리를 개인별 노출 변수로 충분히 구조화하지 못했습니다.",
        },
        contribution: {
          en: "A preliminary comparison treating spatial distance as an explicit dose variable in a VR cynophobia exposure sequence.",
          ko: "공간 거리를 VR 개 공포 노출 순서의 명시적 용량 변수로 다룬 예비 비교입니다.",
        },
        method: {
          en: "Preliminary randomized two-group VR study; a realistic dog advanced through stages from far away to hand reach versus immediate closest-stage exposure; pre/post fear questionnaire. The one-page source does not report N, instrument, or statistics.",
          ko: "예비 무작위 2집단 VR 연구로 현실적 개가 먼 거리에서 손 닿는 거리까지 단계적으로 접근하는 조건과 즉시 근접 조건을 비교하고 사전·사후 공포 설문을 사용했습니다. 1쪽 자료에는 N·도구·통계가 없습니다.",
        },
        takeaway: {
          en: "Exposure distance should be designed as a controllable progression, not treated as scene decoration.",
          ko: "노출 거리는 장면 장식이 아니라 조절 가능한 단계로 설계해야 합니다.",
        },
        finding1: {
          en: "The authors report reduced fear in the graded-exposure condition.",
          ko: "저자들은 단계적 노출 조건에서 공포가 감소했다고 보고했습니다.",
        },
        finding2: {
          en: "Successive distance stages supported adaptation and a sense of mastery.",
          ko: "연속 거리 단계는 적응과 숙달감을 지원했습니다.",
        },
        finding3: {
          en: "Participants remembered staged exposure more positively than immediate close exposure.",
          ko: "참여자들은 단계적 노출을 즉시 근접 노출보다 더 긍정적으로 기억했습니다.",
        },
        implication: {
          en: "Parameterize exposure distance and progression so intensity can be matched to the person and adjusted over time.",
          ko: "노출 거리와 진행 단계를 매개변수화해 개인에게 강도를 맞추고 시간에 따라 조절해야 합니다.",
        },
        scope: {
          en: "One-page preliminary abstract with no sample size, demographics, validated measure, statistical test, effect size, clinical supervision, or follow-up. It does not establish treatment efficacy.",
          ko: "표본 수·인구통계·검증 척도·통계 검정·효과크기·임상 감독·추적관찰이 없는 1쪽 예비 초록으로 치료 효능을 입증하지 않습니다.",
        },
      },
    },
    {
      slug: "clustering-prediction",
      sourceIndex: 19,
      shortTitle: {
        en: "Product Demand Prediction",
        ko: "상품 수요 예측",
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문",
      },
      story: {
        research: {
          en: "Global models can miss heterogeneous product-demand shapes.",
          ko: "전역 모델은 상품마다 다른 수요 형태를 놓칠 수 있습니다.",
        },
        design: {
          en: "Clustered products before comparing five forecasting model families.",
          ko: "상품을 먼저 군집화한 뒤 다섯 예측 모델 계열을 비교했습니다.",
        },
        artifact: {
          en: "A hybrid specialization layer evaluated across 1,624 products.",
          ko: "상품 1,624개에 적용한 결합형 전문화 계층입니다.",
        },
        evidence: {
          en: "Available metadata and abstract report improvement direction but no extractable magnitude, uncertainty, or external validity.",
          ko: "확인 가능한 메타데이터와 초록은 개선 방향만 보고하며 크기·불확실성·외적 타당도는 제시하지 않습니다.",
        },
      },
      palette: "moss",
      pattern: "grid",
      height: "tall",
      width: "narrow",
      mark: "KMIS",
      editorial: {
        question: {
          en: "Can grouping retail products by time-series and demand-pattern features improve the predictive performance of multiple machine-learning models?",
          ko: "시계열·수요 패턴 특징으로 소매 제품을 군집화하면 여러 머신러닝 모델의 예측 성능을 높일 수 있는가?",
        },
        gap: {
          en: "A global forecasting model treats heterogeneous product-demand shapes alike, even though different patterns may require different decision boundaries.",
          ko: "전역 예측 모델은 서로 다른 제품 수요 형태를 동일하게 다루지만 패턴마다 다른 판단 경계가 필요할 수 있습니다.",
        },
        contribution: {
          en: "A hybrid clustering approach that segments products before applying and comparing DNN, MLP, LSTM, random forest, and XGBoost demand models.",
          ko: "제품을 먼저 세분화한 뒤 DNN·MLP·LSTM·랜덤포레스트·XGBoost 수요 모델을 적용·비교하는 결합 군집화 접근입니다.",
        },
        method: {
          en: "1,624 retail products with three years of weekly demand; K-means over combined time-series and demand-pattern features; five forecasting model families compared with and without clustering.",
          ko: "제품 1,624개의 3년 주간 수요, 시계열·수요 패턴 결합 특징의 K-means, 군집화 전후 5개 예측 모델군 비교를 사용했습니다.",
        },
        takeaway: {
          en: "Segmenting heterogeneous demand before prediction can improve the fit of downstream models, but the accessible record does not expose exact gains.",
          ko: "예측 전에 이질적 수요를 세분화하면 후속 모델의 적합도를 높일 수 있지만 공개 기록에는 정확한 향상값이 없습니다.",
        },
        finding1: {
          en: "The framework groups products by both temporal shape and demand characteristics rather than by category labels alone.",
          ko: "프레임워크는 범주 라벨만이 아니라 시간적 형태와 수요 특성을 함께 사용해 제품을 묶습니다.",
        },
        finding2: {
          en: "Multiple neural and tree-based forecasters were tested under clustered and unclustered conditions.",
          ko: "여러 신경망·트리 기반 예측기를 군집화 조건과 비군집 조건에서 비교했습니다.",
        },
        finding3: {
          en: "The official abstract reports performance enhancement from clustering but does not provide extractable effect values.",
          ko: "공식 초록은 군집화에 따른 성능 향상을 보고하지만 추출 가능한 효과 값은 제시하지 않습니다.",
        },
        implication: {
          en: "Use clustering as a model-selection and specialization layer, then publish cluster stability and per-model effect sizes for operational decisions.",
          ko: "군집화를 모델 선택·특화 계층으로 사용하고 운영 판단을 위해 군집 안정성과 모델별 효과크기를 보고해야 합니다.",
        },
        scope: {
          en: "One retail dataset and abstract-level public results; the accessible record does not establish external validity, uncertainty, or exact improvement magnitudes.",
          ko: "한 소매 데이터셋과 초록 수준 공개 결과로 외적 타당성·불확실성·정확한 향상 크기를 확인할 수 없습니다.",
        },
      },
    },
    {
      slug: "regression-clustering",
      sourceIndex: 20,
      shortTitle: {
        en: "Forecasting Product Demand",
        ko: "상품 수요 예측 모델",
      },
      category: {
        en: "Conference Abstract",
        ko: "학술대회 초록",
      },
      story: {
        research: {
          en: "One global feature set may not fit heterogeneous demand segments.",
          ko: "하나의 전역 변수 집합은 서로 다른 수요 구간에 맞지 않을 수 있습니다.",
        },
        design: {
          en: "Combined K-means, cluster-specific LASSO, and LSTM forecasting.",
          ko: "K-means, 군집별 LASSO, LSTM 예측을 결합했습니다.",
        },
        artifact: {
          en: "An early auditable hybrid pipeline evaluated across 2,693 products.",
          ko: "상품 2,693개에 적용한 초기 감사 가능 결합 파이프라인입니다.",
        },
        evidence: {
          en: "This one-page abstract does not report numerical results or uncertainty; the later preprint provides stronger evidence. I am fourth author.",
          ko: "수치 결과나 불확실성을 보고하지 않은 한 페이지 초록이며 후속 프리프린트가 더 강한 근거를 제공합니다. 제4저자로 참여했습니다.",
        },
      },
      palette: "ink",
      pattern: "rules",
      height: "standard",
      width: "regular",
      mark: "KIISS",
      editorial: {
        question: {
          en: "Can K-means clustering, cluster-specific LASSO shrinkage, and LSTM forecasting outperform benchmark demand models?",
          ko: "K-means 군집화, 군집별 LASSO 축소, LSTM 예측을 결합하면 기준 수요 모델보다 성능이 좋아지는가?",
        },
        gap: {
          en: "Conventional demand forecasts struggle to remain accurate across heterogeneous patterns and may use the same predictors for every segment.",
          ko: "기존 수요 예측은 이질적 패턴 전반에서 안정적 정확도를 유지하기 어렵고 모든 세그먼트에 같은 변수를 사용할 수 있습니다.",
        },
        contribution: {
          en: "An early hybrid pipeline that clusters demand patterns, selects predictors within each cluster through LASSO, and forecasts sequences with LSTM.",
          ko: "수요 패턴을 군집화하고 군집별 LASSO로 변수를 고른 뒤 LSTM으로 예측하는 초기 결합 파이프라인입니다.",
        },
        method: {
          en: "2,693 retail products; two years of weekly demand; 24 demand-derived and six external variables; K-means, cluster-specific LASSO, and LSTM; mMAPE, RMSE, and MAE against four benchmarks.",
          ko: "소매 제품 2,693개, 2년 주간 수요, 수요 파생 24개·외생 6개 변수, K-means·군집별 LASSO·LSTM, 4개 기준 모델과 mMAPE·RMSE·MAE를 비교했습니다.",
        },
        takeaway: {
          en: "Pattern-specific feature selection is a plausible bridge between segmentation and sequence forecasting, but this abstract does not quantify the advantage.",
          ko: "패턴별 변수 선택은 세분화와 시계열 예측을 잇는 타당한 방법이지만 이 초록은 장점을 정량화하지 않습니다.",
        },
        finding1: {
          en: "The source reports that the full hybrid performed best overall, without numerical values.",
          ko: "자료는 전체 결합 모델이 전반적으로 최고였다고 보고하지만 수치는 제시하지 않습니다.",
        },
        finding2: {
          en: "Clustering created demand-pattern-specific modeling groups before forecasting.",
          ko: "군집화는 예측 전에 수요 패턴별 모델링 집단을 만들었습니다.",
        },
        finding3: {
          en: "LASSO selected inputs separately inside each cluster instead of enforcing one global feature set.",
          ko: "LASSO는 하나의 전역 변수 집합을 강제하지 않고 군집 안에서 별도로 입력을 선택했습니다.",
        },
        implication: {
          en: "Forecasting systems should make segmentation and variable selection auditable before sequence-model complexity is added.",
          ko: "예측 시스템은 시계열 모델 복잡성을 더하기 전에 세분화와 변수 선택을 감사 가능하게 만들어야 합니다.",
        },
        scope: {
          en: "One-page abstract without data provenance, split protocol, benchmark identities, numerical results, or uncertainty; the later preprint is the stronger evidence source.",
          ko: "데이터 출처·분할 절차·기준 모델명·수치 결과·불확실성이 없는 1쪽 초록이며 후속 프리프린트가 더 강한 근거입니다.",
        },
      },
    },
  ],
  awards: [
    {
      slug: "krafton-fde-challenge",
      sourceIndex: 0,
      shortTitle: {
        en: "Top 3 AI Product Build",
        ko: "AI 제품 개발 최종 3팀",
      },
      category: {
        en: "AI Product Challenge",
        ko: "AI 제품 챌린지",
      },
      story: {
        research: {
          en: "A one-day FDE final tested problem definition, AI direction, iteration, and handoff under time pressure.",
          ko: "하루 동안 진행된 FDE 결선은 제한된 시간 안의 문제 정의·AI 방향·반복 개선·인계를 다뤘습니다.",
        },
        design: {
          en: "I translated ambiguous input from a scenario agent into a rapid build plan.",
          ko: "시나리오 에이전트의 모호한 요구를 빠른 구현 계획으로 전환했습니다.",
        },
        artifact: {
          en: "A working application and blind-review handoff documented as produced in under four hours.",
          ko: "4시간 이내에 구현했다고 기록된 작동형 애플리케이션과 블라인드 심사 인계물입니다.",
        },
        evidence: {
          en: "My team placed in the final top three during the one-day event, which included a documented prize and recruiting fast-track.",
          ko: "공식 상금과 채용 우대가 제공된 1일 행사에서 우리 팀이 최종 3팀에 선정되었습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "FDE",
      spineVenue: "FDE",
      awardName: {
        en: "KRAFTON Cofathon: AI Native Battlegrounds – Top 3 Finalist",
        ko: "KRAFTON 코파톤: AI Native Battlegrounds – 최종 3팀",
      },
      editorial: {
        verifiedResult: {
          en: "My team advanced from approximately 25 entries to the final 3, completing a working AI application and blind-review handoff in under four hours.",
          ko: "약 25개 팀 가운데 최종 3팀에 선정되었으며, 4시간 이내에 작동하는 AI 애플리케이션과 블라인드 심사용 인계를 완성했습니다.",
        },
        selectionContext: {
          en: "The event compressed discovery, implementation, verification, and handoff into a one-day final with a documented prize pool and recruiting fast-track.",
          ko: "행사는 요구 발굴, 구현, 검증, 인계를 공식 상금과 채용 우대가 있는 1일 결선에 압축했습니다.",
        },
        challenge: {
          en: "Participants had to communicate with virtual stakeholders, define an unseen business problem, plan a solution, and implement a working application under a compressed event schedule.",
          ko: "가상 이해관계자와 소통해 처음 보는 비즈니스 문제를 정의하고 압축된 일정 안에 해결안을 기획·구현해 작동형 애플리케이션을 제출해야 했습니다.",
        },
        contribution: {
          en: "I led agent-assisted requirements discovery, translated the findings into a build plan, implemented the application in under four hours, and prepared the blind-review handoff.",
          ko: "에이전트를 활용한 요구사항 발굴을 주도하고 결과를 구현 계획으로 전환했으며, 4시간 이내에 애플리케이션을 개발하고 블라인드 심사용 인계를 준비했습니다.",
        },
        criteria: {
          en: "Problem definition; direction and use of AI; iteration under constraint; verification and handoff quality.",
          ko: "문제 정의; AI 지휘·활용; 제약 속 반복 개선; 검증·핸드오프 품질",
        },
        validates: {
          en: "Rapidly turning ambiguous requirements into a working, review-ready AI product.",
          ko: "불명확한 요구사항을 빠르게 작동형 AI 제품과 검토 가능한 결과물로 전환하는 역량",
        },
      },
    },
    {
      slug: "game-society-best-presentation",
      sourceIndex: 1,
      shortTitle: {
        en: "Accessible AI Paper Award",
        ko: "접근성 AI 논문상",
      },
      category: {
        en: "Research Award",
        ko: "연구 수상",
      },
      story: {
        research: {
          en: "The team converted open responses from 112 players with disabilities into defensible accessibility requirements.",
          ko: "팀은 장애인 플레이어 112명의 서술 응답을 근거 있는 접근성 요구사항으로 전환했습니다.",
        },
        design: {
          en: "Synthesized barrier interpretation and a To Play, Easy Play, Better Play design hierarchy.",
          ko: "장벽 해석과 To Play·Easy Play·Better Play 설계 위계를 종합했습니다.",
        },
        artifact: {
          en: "A six-page Korea Game Society conference paper that I co-authored.",
          ko: "제가 공동 저자로 참여한 6쪽 분량의 한국게임학회 학술대회 논문입니다.",
        },
        evidence: {
          en: "As second author, I contributed the accessibility-AI framing, barrier analysis, and design synthesis to the award-winning paper.",
          ko: "제2저자로서 수상 논문의 접근성 AI 관점 수립, 장벽 분석, 설계 원칙 종합에 기여했습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KGS",
      spineVenue: "KGS",
      awardName: {
        en: "Best Presentation Award, Korea Game Society Spring Conference 2026",
        ko: "2026 한국게임학회 춘계학술발표대회 우수발표논문상",
      },
      editorial: {
        verifiedResult: {
          en: "The paper received the Best Presentation Award, with me contributing as second author.",
          ko: "제2저자로 참여한 논문이 우수발표논문상을 받았습니다.",
        },
        selectionContext: {
          en: "I am second author of the six-page conference paper (pp. 83–88), presented in the 30 May 2026 session at Tech University of Korea. The presenter was listed separately from my coauthor role.",
          ko: "2026년 5월 30일 한국공학대학교 세션에서 발표된 6쪽 분량의 학술대회 논문(83~88쪽)에 제2저자로 참여했습니다. 발표자는 제 공저자 역할과 별도로 지정되었습니다.",
        },
        challenge: {
          en: "The team had to convert open-ended responses from 112 players with disabilities into defensible barrier categories, accessibility requirements, design principles, and a concise conference presentation.",
          ko: "장애인 플레이어 112명의 개방형 응답을 방어 가능한 장벽 범주·접근성 요구사항·설계 원칙으로 전환해 간결한 학술 발표로 제시해야 했습니다.",
        },
        contribution: {
          en: "As second author, I contributed accessibility-AI framing, barrier interpretation, design-principle synthesis, and preparation of the research output.",
          ko: "제2저자로 접근성 AI 프레이밍, 장벽 해석, 설계 원칙 종합, 연구 결과물 준비에 기여했습니다.",
        },
        criteria: {
          en: "Research clarity; strength of evidence; contribution; quality of the paper and presentation.",
          ko: "연구의 명료성, 근거의 충실성, 연구 기여, 논문과 발표의 완성도",
        },
        validates: {
          en: "My ability to translate disability research into actionable principles for accessible game-AI design.",
          ko: "장애 관련 연구 결과를 접근 가능한 게임 AI의 실행 가능한 설계 원칙으로 전환하는 역량",
        },
      },
    },
    {
      slug: "edu40-ta-excellence",
      sourceIndex: 2,
      shortTitle: {
        en: "Education4.0 Q First Place",
        ko: "Education4.0 Q 최우수상",
      },
      category: {
        en: "Education Recognition",
        ko: "교육 성과 인정",
      },
      story: {
        research: {
          en: "Question-centered teaching support required a clear record of planning, operation, and reflection.",
          ko: "질문 중심 수업 지원은 계획·운영·성찰을 명확하게 기록해야 했습니다.",
        },
        design: {
          en: "Structured teaching operations and reflection for institutional review and reuse.",
          ko: "교육 운영과 성찰을 기관 검토와 재사용이 가능한 구조로 정리했습니다.",
        },
        artifact: {
          en: "The Education4.0 Q teaching-assistant activity report that I authored.",
          ko: "제가 작성한 Education4.0 Q 조교 활동보고서입니다.",
        },
        evidence: {
          en: "Certificate EC-2026-0001 verifies the Top Excellence Award and first-place result for the Education4.0 Q TA Report.",
          ko: "상장 EC-2026-0001은 Education4.0 Q 조교 활동보고서의 최우수상과 1위 성과를 확인합니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KAIST",
      spineVenue: "KAIST",
      awardName: {
        en: "Top Excellence Award (1st Place), Education4.0 Q TA Activity Report",
        ko: "Education4.0 Q 조교 활동보고서 최우수상(1위)",
      },
      editorial: {
        verifiedResult: {
          en: "I won first place and received KAIST's Top Excellence Award for the Education4.0 Q TA Activity Report on 23 March 2026.",
          ko: "2026년 3월 23일 KAIST Education4.0 Q 조교 활동보고서 평가에서 1위에 선정되어 최우수상을 받았습니다.",
        },
        selectionContext: {
          en: "KAIST awarded the first-place distinction for teaching-assistant practice within its question-centered Education4.0 Q learning model.",
          ko: "KAIST는 질문 중심 Education4.0 Q 학습 모델의 조교 실천 평가에서 1위 성과에 최우수상을 수여했습니다.",
        },
        challenge: {
          en: "The assessed work was a TA activity report documenting how question-centered course support was planned, operated, and reflected upon.",
          ko: "질문 중심 수업 지원을 어떻게 기획·운영하고 성찰했는지 기록한 조교 활동보고서가 평가 대상이었습니다.",
        },
        contribution: {
          en: "I authored the report and articulated the teaching intervention, its operation, and the lessons drawn from practice.",
          ko: "활동보고서를 작성하고 교육 개입의 설계와 운영 과정, 실천에서 도출한 교훈을 정리했습니다.",
        },
        criteria: {
          en: "Quality of the TA activity report and the clarity of its account of educational practice.",
          ko: "조교 활동보고서의 완성도와 교육 실천을 설명하는 내용의 명료성",
        },
        validates: {
          en: "Turning hands-on teaching practice into a clear, reflective, and reusable account.",
          ko: "현장의 교육 실천을 명료하고 성찰적이며 재사용 가능한 기록으로 전환하는 역량",
        },
      },
    },
    {
      slug: "asan-climate-tech-team",
      sourceIndex: 3,
      shortTitle: {
        en: "Climate-Tech Venture Selection",
        ko: "기후테크 창업팀 선정",
      },
      category: {
        en: "Startup Selection",
        ko: "창업팀 선정",
      },
      story: {
        research: {
          en: "Glean framed litter recognition and recycling incentives as a climate-tech venture problem.",
          ko: "Glean은 쓰레기 인식과 재활용 인센티브를 기후테크 벤처 문제로 정의했습니다.",
        },
        design: {
          en: "Integrated AR scanning, incentives, environmental data, AI modeling, and IP planning.",
          ko: "AR 스캔·인센티브·환경 데이터·AI 모델링·지식재산 계획을 통합했습니다.",
        },
        artifact: {
          en: "A venture submission that I led as the named team representative.",
          ko: "팀 대표로서 제가 주도한 벤처 지원서입니다.",
        },
        evidence: {
          en: "Asan UniverCT selected the team; this was a program selection, and no paid-support amount is claimed.",
          ko: "Asan UniverCT가 팀을 선정했으며 이는 프로그램 선정이고 지원금 지급액은 주장하지 않습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "ASAN",
      spineVenue: "ASAN",
      awardName: {
        en: "Asan UniverCT Climate-Tech Venture Team",
        ko: "아산 UniverCT 기후테크 창업팀",
      },
      editorial: {
        verifiedResult: {
          en: "I represented Glean when the team was selected for KAIST's Asan UniverCT climate-tech program.",
          ko: "Glean의 팀 대표로 KAIST 아산 UniverCT 기후테크 프로그램에 선정되었습니다.",
        },
        selectionContext: {
          en: "Selected teams received mentorship and venture-development support from the Asan Nanum Foundation.",
          ko: "선정팀은 아산나눔재단의 멘토링과 사업화 지원을 받았습니다.",
        },
        challenge: {
          en: "Teams had to frame a climate problem as a viable venture and develop it through university-linked entrepreneurship support toward a demonstrable concept.",
          ko: "기후 문제를 실행 가능한 벤처로 정의하고 대학 연계 창업 지원 안에서 시연 가능한 콘셉트로 발전시켜야 했습니다.",
        },
        contribution: {
          en: "As team representative, I led venture coordination, AI modeling, and patent development for Glean's AR litter-scanning and recycling-reward service.",
          ko: "팀 대표로 Glean의 AR 쓰레기 스캔·재활용 리워드 서비스에 대한 사업 총괄, AI 모델링, 특허 개발을 이끌었습니다.",
        },
        criteria: {
          en: "Climate relevance; venture feasibility; team execution; and potential for development within the university program. The program did not publish its exact scoring rubric.",
          ko: "기후 문제 적합성, 사업 실행 가능성, 팀 실행력, 대학 프로그램 내 발전 가능성이 평가의 중심이었습니다. 프로그램은 정확한 배점표를 공개하지 않았습니다.",
        },
        validates: {
          en: "Verified selection into a structured climate-tech entrepreneurship program.",
          ko: "구조화된 기후테크 창업 프로그램 선정 성과입니다.",
        },
      },
    },
    {
      slug: "pohang-media-facade-camp",
      sourceIndex: 4,
      shortTitle: {
        en: "Underwater Media Art",
        ko: "수중 미디어 아트",
      },
      category: {
        en: "Interactive Media Project",
        ko: "인터랙티브 미디어 프로젝트",
      },
      story: {
        research: {
          en: "A five-day Unreal Engine camp asked teams to build environmental content for an architectural media surface.",
          ko: "5일간의 Unreal Engine 캠프는 건축 미디어 표면에서 작동하는 환경 콘텐츠 제작을 요구했습니다.",
        },
        design: {
          en: "I led the Unreal Engine implementation of an underwater smart-city media-façade concept.",
          ko: "수중 스마트시티 미디어 파사드 콘셉트의 Unreal Engine 구현을 주도했습니다.",
        },
        artifact: {
          en: "A documented Unreal Engine media-façade implementation.",
          ko: "구현 기록이 있는 Unreal Engine 기반 미디어파사드입니다.",
        },
        evidence: {
          en: "The co-hosts awarded our media-façade prototype the Grand Prize, and I led its technical implementation.",
          ko: "공동 주최 기관이 우리 미디어파사드 프로토타입에 대상을 수여했으며 제가 기술 구현을 총괄했습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "HGU",
      spineVenue: "HGU",
      awardName: {
        en: "Handong Global University President's Award, Pohang Culture and Arts Factory Media-Façade Hackathon",
        ko: "한동대학교 총장상, 포항문화예술공장 미디어파사드 해커톤",
      },
      editorial: {
        verifiedResult: {
          en: "I led the technical development of the Unreal Engine media-façade prototype that received the hackathon's Grand Prize and HGU President's Award.",
          ko: "해커톤 대상인 한동대학교 총장상을 받은 Unreal Engine 미디어 파사드 프로토타입의 기술 개발을 주도했습니다.",
        },
        selectionContext: {
          en: "The five-day Unreal Engine program was limited to 20 participants and carried a KRW 5 million-equivalent reward pool topped by the HGU President's Award, which is the prize this prototype received.",
          ko: "5일간 Unreal Engine 프로그램은 20명 정원이며 한동대 총장상을 최고상으로 하는 500만원 상당의 시상을 두었고, 이 프로토타입이 그 총장상을 받았습니다.",
        },
        challenge: {
          en: "The team had to turn an environmental and smart-city theme into large-scale content that could run reliably on a real architectural media surface.",
          ko: "환경·스마트시티 주제를 실제 건축 미디어 표면에서 안정적으로 구동되는 대형 콘텐츠로 구현해야 했습니다.",
        },
        contribution: {
          en: "I led the Unreal Engine implementation and technical delivery of the working underwater media-façade experience.",
          ko: "실제로 구동되는 수중 미디어 파사드 경험의 Unreal Engine 구현과 기술 개발을 총괄했습니다.",
        },
        criteria: {
          en: "Concept and public relevance; technical execution; fit to the media-façade format; completeness for exhibition. The exact scored rubric was not located.",
          ko: "콘셉트·공공성; 기술 구현; 미디어 파사드 형식 적합성; 전시 완성도. 정확한 배점표는 확인되지 않았습니다.",
        },
        validates: {
          en: "Leading the technical realization of a large-scale interactive-media concept under a fixed production schedule.",
          ko: "정해진 제작 일정 안에서 대형 인터랙티브 미디어 콘셉트의 기술 구현을 이끄는 역량",
        },
      },
    },
    {
      slug: "eye-tracking-vr-research-award",
      sourceIndex: 5,
      shortTitle: {
        en: "Eye-Tracking VR Excellence",
        ko: "시선 추적 VR 우수상",
      },
      category: {
        en: "Research Recognition",
        ko: "연구 성과 인정",
      },
      story: {
        research: {
          en: "The paper translated eye exercises into a gaze-controlled VR research prototype.",
          ko: "논문은 안구 운동을 시선 제어형 VR 연구 프로토타입으로 전환했습니다.",
        },
        design: {
          en: "Combined gaze interaction, exercise logic, and a preliminary user-facing experience.",
          ko: "시선 상호작용·운동 논리·예비 사용자 경험을 하나로 결합했습니다.",
        },
        artifact: {
          en: "The seven-author Eye-Tracking-Based VR Interactive Game for Eye Exercises paper.",
          ko: "저자 7명의 시선추적 기반 VR 안구 운동 게임 논문입니다.",
        },
        evidence: {
          en: "Our paper received the society's Excellence Award. I am fourth author; the award does not certify an individual task or clinical efficacy.",
          ko: "우리 논문이 학회 우수상을 받았습니다. 저는 제4저자이며, 이 상은 개인 업무나 임상 효과를 인증하는 결과는 아닙니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KMMS",
      spineVenue: "KMMS",
      awardName: {
        en: "2023 KMMS Fall Undergraduate Paper Competition",
        ko: "2023 한국멀티미디어학회 추계학부생논문경진대회",
      },
      editorial: {
        verifiedResult: {
          en: "I received an Excellence Award as fourth author of “Eye-tracking-based VR interactive game for eye exercises” on 17 November 2023.",
          ko: "2023년 11월 17일 「안구 운동을 위한 시선 추적 기반 VR 인터랙티브 게임」의 제4저자로 우수상을 받았습니다.",
        },
        selectionContext: {
          en: "The award was issued in the society's fall undergraduate paper competition to a seven-author research team. It is a paper-level team result, not an individual first-author award.",
          ko: "학회 추계학부생논문경진대회에서 7인 연구팀 논문에 수여된 팀 단위 결과이며 개인 제1저자상이 아닙니다.",
        },
        challenge: {
          en: "The paper had to present a viable gaze-controlled VR game that translated eye exercises into interactive mechanics and a preliminary user-facing prototype.",
          ko: "안구 운동을 상호작용 메커닉으로 전환한 시선 제어 VR 게임과 예비 사용자 프로토타입을 제시해야 했습니다.",
        },
        contribution: {
          en: "As fourth author, I contributed to the research and development of the VR game prototype.",
          ko: "제4저자로 VR 게임 프로토타입의 연구와 개발에 기여했습니다.",
        },
        criteria: {
          en: "This was a paper-level award; it does not attribute an individual score or establish clinical efficacy.",
          ko: "논문 단위 수상이며 개인 점수를 부여하거나 임상 효능을 입증한 결과는 아닙니다.",
        },
        validates: {
          en: "Society recognition for an implemented gaze-interaction research prototype, with authorship and clinical scope represented accurately.",
          ko: "저자 역할과 임상 범위를 정확히 제한한 시선 상호작용 연구 프로토타입에 대한 학회 인정입니다.",
        },
      },
    },
    {
      slug: "watchers-metaverse-excellence",
      sourceIndex: 6,
      shortTitle: {
        en: "Watchers VR Excellence",
        ko: "Watchers VR 우수상",
      },
      category: {
        en: "Digital Health Recognition",
        ko: "디지털 헬스 성과 인정",
      },
      story: {
        research: {
          en: "The team translated eye-muscle exercise requirements into a coherent Meta Quest Pro experience.",
          ko: "팀은 안구 근육 운동 요구를 일관된 Meta Quest Pro 경험으로 전환했습니다.",
        },
        design: {
          en: "I contributed VR content research and experience design; Youngsung Lee served as team lead.",
          ko: "VR 콘텐츠 조사와 경험 설계에 기여했으며, 이영성이 팀 리드를 맡았습니다.",
        },
        artifact: {
          en: "Watchers, an integrated demonstrable XR experience by Team EyeCU.",
          ko: "Team EyeCU가 구현한 통합형 XR 경험 Watchers입니다.",
        },
        evidence: {
          en: "Verified Excellence and Skonec CEO Awards included KRW 5 million and a recruitment benefit; Youngsung Lee was team leader.",
          ko: "우수상과 스코넥 대표이사상, 상금 500만원과 채용 혜택이 확인됐으며 팀 리더는 이영성이었습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "NIPA",
      spineVenue: "NIPA",
      awardName: {
        en: "2023 Metaverse Developer Contest, Adult Division",
        ko: "2023 메타버스 개발자 경진대회 성인 부문",
      },
      editorial: {
        verifiedResult: {
          en: "Excellence Award, Skonec Entertainment CEO Award, Team EyeCU, for Watchers, dated 18 October 2023.",
          ko: "Watchers를 개발한 Team EyeCU로 2023년 10월 18일 우수상·스코넥엔터테인먼트 대표이사상을 수상했습니다.",
        },
        selectionContext: {
          en: "The official contest awarded 37 teams from a KRW 219 million pool. Independent reporting names EyeCU's Watchers as the Skonec task winner with KRW 5 million, recruitment benefit, and potential joint development.",
          ko: "공식 대회는 총상금 2억 1,900만원 규모로 37개 팀을 시상했습니다. 독립 보도는 EyeCU의 Watchers가 스코넥 지정과제 수상팀이며 500만원·채용 우대·공동개발 가능성을 받았다고 확인합니다.",
        },
        challenge: {
          en: "The team had to create a Meta Quest Pro application that turned eye-muscle rehabilitation exercises into a coherent, demonstrable VR experience.",
          ko: "안구 근육 재활 운동을 일관되고 시연 가능한 Meta Quest Pro VR 경험으로 구현해야 했습니다.",
        },
        contribution: {
          en: "I contributed VR content research and experience design to Watchers as a member of Team EyeCU; Youngsung Lee served as team lead.",
          ko: "Team EyeCU의 구성원으로 Watchers의 VR 콘텐츠 조사와 경험 설계에 기여했으며, 이영성이 팀 리드를 맡았습니다.",
        },
        criteria: {
          en: "Task fit; technical implementation; experience and content design; completion and demonstration. The organizer's exact scorecard was not in the reviewed artifact.",
          ko: "지정과제 적합성; 기술 구현; 경험·콘텐츠 설계; 완성·시연. 검토 자료에는 주최 측 정확한 배점표가 없었습니다.",
        },
        validates: {
          en: "National external recognition for translating rehabilitation exercises into a working eye-tracked VR content concept as part of a multidisciplinary team.",
          ko: "다학제 팀에서 재활 운동을 작동형 시선 추적 VR 콘텐츠로 전환한 작업에 대한 전국 규모 외부 인정입니다.",
        },
      },
    },
    {
      slug: "esg-ar-encouragement-prize",
      sourceIndex: 7,
      shortTitle: {
        en: "Glean Startup Award",
        ko: "Glean 창업 수상",
      },
      category: {
        en: "Climate-Tech Recognition",
        ko: "기후기술 성과 인정",
      },
      story: {
        research: {
          en: "CGreen framed recycling behavior, user incentives, and XR participation as one venture problem.",
          ko: "CGreen은 재활용 행동·사용자 인센티브·XR 참여를 하나의 벤처 문제로 정의했습니다.",
        },
        design: {
          en: "I integrated the ESG problem, service concept, incentive model, and competition narrative.",
          ko: "ESG 문제·서비스 콘셉트·인센티브 모델·대회 서사를 통합했습니다.",
        },
        artifact: {
          en: "The Glean venture proposal that I led as the named team representative.",
          ko: "팀 대표로서 제가 주도한 Glean 벤처 제안서입니다.",
        },
        evidence: {
          en: "I represented Team CGreen when we received the Handong Global University President's Award.",
          ko: "Team CGreen의 대표로 참여해 한동대학교 총장상을 받았습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "HGU",
      spineVenue: "HGU",
      awardName: {
        en: "Handong Global University President's Award, Startup Idea Competition",
        ko: "한동대학교 총장상, 창업아이디어 경진대회",
      },
      editorial: {
        verifiedResult: {
          en: "I represented Team CGreen when we received the Handong Global University President's Award on 24 November 2022.",
          ko: "Team CGreen의 대표로 참여해 2022년 11월 24일 한동대학교 총장상을 받았습니다.",
        },
        selectionContext: {
          en: "The award was presented in the university's final competition for student venture teams.",
          ko: "학생 벤처팀을 대상으로 한 교내 창업아이디어 경진대회 본선에서 받은 상입니다.",
        },
        challenge: {
          en: "CGreen proposed Glean, an XR and metaverse recycling-reward application connecting environmentally responsible behavior with user incentives.",
          ko: "CGreen은 환경 책임 행동을 사용자 보상과 연결한 XR·메타버스 재활용 리워드 앱 Glean을 제안했습니다.",
        },
        contribution: {
          en: "As the named team representative, I led the venture submission and helped frame the ESG problem, XR service concept, and competition delivery.",
          ko: "팀 대표로 창업 신청을 이끌고 ESG 문제, XR 서비스 콘셉트, 경진대회 결과물 구성을 주도했습니다.",
        },
        criteria: {
          en: "Problem and social value; business-model feasibility; technical concept; team execution. The exact competition scorecard was not preserved.",
          ko: "문제·사회적 가치; 비즈니스 모델 실행 가능성; 기술 콘셉트; 팀 실행력. 정확한 대회 배점표는 확보되지 않았습니다.",
        },
        validates: {
          en: "Early external evidence of venture leadership and the ability to connect immersive technology with an environmental behavior model, recognized with the university President's Award.",
          ko: "몰입형 기술을 환경 행동 모델과 연결한 초기 벤처 리더십의 외부 근거이며 총장상으로 인정받았습니다.",
        },
      },
    },
    {
      slug: "cynophobia-vr-research-award",
      sourceIndex: 8,
      shortTitle: {
        en: "VR Exposure Research Award",
        ko: "VR 노출 연구 수상",
      },
      category: {
        en: "Research Recognition",
        ko: "연구 성과 인정",
      },
      story: {
        research: {
          en: "The team framed spatial distance as a controllable variable in preliminary VR exposure research.",
          ko: "팀은 예비 VR 노출 연구에서 공간적 거리를 조절 가능한 변수로 정의했습니다.",
        },
        design: {
          en: "Compared staged spatial progression with immediate close exposure.",
          ko: "단계적 공간 진행과 즉시 근접 노출을 비교했습니다.",
        },
        artifact: {
          en: "A one-page preliminary conference paper that I coauthored.",
          ko: "제가 공동저자로 참여한 한 페이지 예비 학술대회 논문입니다.",
        },
        evidence: {
          en: "Our paper received a shared Presentation Award. I am second author, and the result does not validate clinical efficacy.",
          ko: "우리 논문이 공동 발표상을 받았습니다. 저는 제2저자이며, 이 결과는 임상 효과를 입증하지 않습니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KMMS",
      spineVenue: "KMMS",
      awardName: {
        en: "2022 KMMS Spring Undergraduate Paper Competition",
        ko: "2022 한국멀티미디어학회 춘계학부생논문경진대회",
      },
      editorial: {
        verifiedResult: {
          en: "I received an Excellence Presentation Award as second author of the VR cynophobia exposure paper on 13 May 2022.",
          ko: "2022년 5월 13일 개 공포증 VR 노출 연구 논문의 제2저자로 우수발표상을 받았습니다.",
        },
        selectionContext: {
          en: "A society undergraduate paper competition recognized the team's preliminary research on staged spatial exposure. The result is paper-level and shared across the author team.",
          ko: "학회 학부생논문경진대회가 단계적 공간 노출 예비 연구를 인정한 팀 단위 논문 수상입니다.",
        },
        challenge: {
          en: "The research had to turn distance and spatial progression into a controllable VR exposure design and communicate preliminary evidence within a one-page conference format.",
          ko: "거리·공간 진행을 조절 가능한 VR 노출 설계로 만들고 1쪽 학술대회 형식에 예비 근거를 전달해야 했습니다.",
        },
        contribution: {
          en: "As second author, I contributed to the VR exposure research and preparation of the paper.",
          ko: "제2저자로 VR 노출 연구와 논문 작성에 기여했습니다.",
        },
        criteria: {
          en: "This presentation award recognized preliminary design research; it does not establish clinical treatment efficacy.",
          ko: "예비 설계 연구를 인정한 발표상이며 임상 치료 효능을 입증한 결과는 아닙니다.",
        },
        validates: {
          en: "Society recognition for converting a therapeutic-design question into a controllable VR exposure concept while retaining appropriate clinical caution.",
          ko: "치료 설계 질문을 조절 가능한 VR 노출 콘셉트로 전환하면서 임상적 신중함을 유지한 연구에 대한 학회 인정입니다.",
        },
      },
    },
    {
      slug: "db-snubiz-startup-challenge",
      sourceIndex: 9,
      shortTitle: {
        en: "Top 14 Global Startup Finalist",
        ko: "글로벌 창업 본선 14팀",
      },
      category: {
        en: "Startup Competition",
        ko: "창업 경진대회",
      },
      story: {
        research: {
          en: "A global startup competition narrowed 152 applications to 38 teams, then 14 finalists.",
          ko: "글로벌 창업대회는 지원 152팀을 38팀, 다시 결선 14팀으로 좁혔습니다.",
        },
        design: {
          en: "I contributed to developing the blockchain venture proposition and delivering the final pitch.",
          ko: "블록체인 벤처 제안을 개발하고 본선 피치를 준비·발표하는 데 기여했습니다.",
        },
        artifact: {
          en: "A documented competition pitch; no independent team roster or organizer record is available.",
          ko: "기록된 대회 피치이며 독립적인 팀 명단이나 주최 측 기록은 확보되지 않았습니다.",
        },
        evidence: {
          en: "The competition funnel is verified, and the team is among the 14 finalists it selected.",
          ko: "대회 선발 구조가 확인되며, 팀은 그 선발을 통과한 본선 14팀에 포함됩니다.",
        },
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "SNU",
      spineVenue: "SNU",
      awardName: {
        en: "Top 14 Finalist, DB-SNUbiz Global Startup Challenge",
        ko: "본선 14팀, DB-SNUbiz 글로벌 창업 챌린지",
      },
      editorial: {
        verifiedResult: {
          en: "My team advanced from 152 applicants to the final 14 and presented its venture proposal in the live final on 21 July 2021.",
          ko: "152개 지원팀 가운데 본선 14팀에 선정되어 2021년 7월 21일 현장 결선에서 벤처 제안을 발표했습니다.",
        },
        selectionContext: {
          en: "152 applications, 33 domestic and 119 international, narrowed to 38 in the first selection and 14 final teams for live presentations.",
          ko: "국내 33팀·해외 119팀, 총 152개 지원팀에서 1차 38팀을 거쳐 14개 본선팀으로 선발됐습니다.",
        },
        challenge: {
          en: "Finalists had to present a global startup proposal live to business-school, venture-capital, and industry judges.",
          ko: "본선팀은 경영대학·벤처투자·산업 전문가 심사자 앞에서 글로벌 창업안을 라이브로 발표해야 했습니다.",
        },
        contribution: {
          en: "I contributed to developing the team's blockchain solution and preparing and delivering the final pitch.",
          ko: "팀의 블록체인 솔루션 개발과 본선 피치 준비·발표에 기여했습니다.",
        },
        criteria: {
          en: "Global venture proposition; business feasibility; solution differentiation; live pitch and responses. The exact scored rubric was not located.",
          ko: "글로벌 사업 제안; 사업 실행 가능성; 솔루션 차별성; 라이브 피칭·응답. 정확한 배점표는 확인되지 않았습니다.",
        },
        validates: {
          en: "The organizer-verified funnel establishes the competition's selectivity, and places the team among its 14 finalists.",
          ko: "주최 측이 확인한 선발 흐름은 대회의 경쟁도를 보여주며, 팀은 본선 14팀에 포함됩니다.",
        },
      },
    },
  ],
};

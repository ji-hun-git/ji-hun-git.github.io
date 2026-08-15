"use strict";

window.PROJECT_LIBRARY_DESIGNS = {
  projects: [
    {
      slug: "inclusive-game-ai",
      sourceIndex: 0,
      shortTitle: {
        en: "Accessible Game AI",
        ko: "접근 가능한 게임 AI"
      },
      category: {
        en: "Assistive AI",
        ko: "보조 AI"
      },
      story: {
        research: {
          en: "Field interviews with players with disabilities identified barriers they could not resolve independently.",
          ko: "장애인 플레이어 현장 인터뷰를 통해 혼자 해결하기 어려운 실제 장벽을 발견했습니다."
        },
        design: {
          en: "Mapped assistance to Explainer, Reader, and player-authorized Surrogate roles so support could adapt without overriding agency.",
          ko: "지원을 Explainer, Reader, 사용자 승인형 Surrogate 역할에 연결해 주체성을 침해하지 않으면서 상황에 맞게 전환하도록 설계했습니다."
        },
        artifact: {
          en: "A game-grounded RAG agent with text and voice interaction, optional visual context, logging, and an operator workflow.",
          ko: "게임 지식 기반 RAG, 텍스트·음성 상호작용, 선택형 시각 맥락, 기록, 운영 워크플로를 갖춘 에이전트입니다."
        },
        evidence: {
          en: "The program triangulated controlled tasks, professional playtester interviews, and an N=112 survey; design principles were published at ACM IUI '26.",
          ko: "통제 과업, 전문 접근성 플레이테스터 인터뷰, N=112 설문을 종합했으며 설계 원칙은 ACM IUI '26에 게재되었습니다."
        }
      },
      editorial: {
        question: {
          en: "How can an AI assistant help players overcome context-dependent barriers without taking away control over play?",
          ko: "AI 어시스턴트는 플레이의 통제권을 빼앗지 않으면서 장애 플레이어의 맥락 의존적 장벽 해결을 어떻게 도울 수 있을까?"
        },
        responsibility: {
          en: "I led field interviews, requirements discovery, agent development, prototype evaluation, analysis, and research dissemination.",
          ko: "현장 인터뷰와 요구사항 도출부터 에이전트 개발, 프로토타입 평가, 분석, 연구 확산까지 주도했습니다."
        },
        evaluation: {
          en: "We triangulated a controlled Minecraft study, professional accessibility-playtester interviews, and a survey of 112 players with disabilities.",
          ko: "통제된 Minecraft 연구, 전문 접근성 플레이테스터 인터뷰, 장애인 플레이어 112명 설문을 종합했습니다."
        },
        outcome: {
          en: "The resulting timing, modality, customization, and automation principles were published at ACM IUI '26.",
          ko: "도출된 개입 시점, 모달리티, 개인화, 자동화 원칙은 ACM IUI '26에 게재되었습니다."
        },
        lesson: {
          en: "Useful assistance must match the active barrier and preserve player agency.",
          ko: "유용한 지원은 현재의 장벽에 맞으면서 플레이어 주체성을 보존해야 합니다."
        }
      },
      palette: "cobalt",
      pattern: "signal",
      height: "tall",
      width: "wide",
      mark: "GAIA",
      spineVenue: "KAIST"
    },
    {
      slug: "data-quality-engine",
      sourceIndex: 1,
      shortTitle: {
        en: "Data-Quality Engine",
        ko: "데이터 품질 엔진"
      },
      category: {
        en: "Data Systems",
        ko: "데이터 시스템"
      },
      story: {
        research: {
          en: "Mapped enterprise data-quality rules and audit requirements against real production data.",
          ko: "실제 운영 데이터를 바탕으로 기업 데이터 품질 규칙과 감사 요구사항을 정리했습니다."
        },
        design: {
          en: "Chose deterministic rules and statistics where LLM variability would weaken auditability.",
          ko: "LLM의 변동성이 감사 가능성을 약화하는 구간에는 결정론적 규칙과 통계를 선택했습니다."
        },
        artifact: {
          en: "A version-controlled, production-oriented engine for automated data-quality measurement and verification.",
          ko: "데이터 품질 측정·검증을 자동화하는 버전 관리형 운영 지향 엔진입니다."
        },
        evidence: {
          en: "A formal verification report documents module- and test-level validation; client acceptance is outside the available evidence.",
          ko: "공식 검증 보고서는 모듈·테스트 단위 검증을 기록하며 고객 인수 여부는 확보된 근거 범위 밖입니다."
        }
      },
      editorial: {
        question: {
          en: "How can enterprise data be verified automatically while preserving auditability and reproducibility?",
          ko: "감사 가능성과 재현성을 유지하면서 기업 데이터를 어떻게 자동 검증할 수 있을까?"
        },
        responsibility: {
          en: "I was sole developer of the DQM v1.0 engine — which detects and corrects data-quality errors and infers primary keys, foreign keys, indexes and column-level rules — covering rule interpretation, architecture, implementation, version control, and verification, within SKAIWORLDWIDE's Ministry of SMEs and Startups R&D project.",
          ko: "스카이월드와이드가 수행한 중소벤처기업부 R&D 과제 안에서 DQM v1.0 엔진을 단독 개발하며 규칙 해석, 아키텍처, 구현, 버전 관리, 검증을 담당했습니다."
        },
        evaluation: {
          en: "The release was checked against real enterprise data and documented in a formal verification report.",
          ko: "실제 기업 데이터로 릴리스를 검증하고 공식 검증 보고서에 기록했습니다."
        },
        outcome: {
          en: "A version-controlled, production-oriented engine and formal results package were prepared for handoff; client acceptance is not claimed.",
          ko: "버전 관리형 운영 지향 엔진과 공식 결과 패키지를 인수인계용으로 준비했으며 고객 인수 완료는 주장하지 않습니다."
        },
        lesson: {
          en: "Choosing where AI does not belong is part of responsible engineering.",
          ko: "AI를 사용하지 않을 영역을 정하는 것 역시 책임 있는 엔지니어링입니다."
        }
      },
      palette: "ink",
      pattern: "grid",
      height: "standard",
      width: "regular",
      mark: "DQM",
      spineVenue: "IND"
    },
    {
      slug: "haenyeo-legacy",
      sourceIndex: 2,
      shortTitle: {
        en: "Haenyeo Heritage",
        ko: "해녀 문화유산"
      },
      category: {
        en: "Serious Games",
        ko: "시리어스 게임"
      },
      story: {
        research: {
          en: "Worked with Haenyeo communities and the museum on the loss of intergenerational knowledge.",
          ko: "해녀 공동체와 박물관과 함께 세대 간 지식 단절 문제를 조사했습니다."
        },
        design: {
          en: "Translated diving practice and ecological knowledge into learnable serious-game mechanics.",
          ko: "잠수 작업과 생태 지식을 학습 가능한 시리어스 게임 메커니즘으로 전환했습니다."
        },
        artifact: {
          en: "A community-reviewed game concept, narrative, mechanics, visual journey, and care-centered design method.",
          ko: "공동체가 검토한 게임 콘셉트·서사·메커니즘·비주얼 여정과 돌봄 중심 설계 방법입니다."
        },
        evidence: {
          en: "Two workshop cycles involved six Haenyeo and one Haenam; participants refined mechanics and representation.",
          ko: "두 차례 워크숍에 해녀 6명과 해남 1명이 참여해 메커니즘과 재현 방식을 다듬었습니다."
        }
      },
      editorial: {
        question: {
          en: "How can tacit cultural knowledge be transferred through play without reducing it to static documentation?",
          ko: "암묵적 문화 지식을 정적인 기록으로 축소하지 않고 놀이를 통해 어떻게 전승할 수 있을까?"
        },
        responsibility: {
          en: "I conducted field-based design work with Haenyeo communities and translated their practice into game mechanics.",
          ko: "해녀 공동체와 현장 기반 디자인을 수행하고 그들의 실천 지식을 게임 메커니즘으로 전환했습니다."
        },
        evaluation: {
          en: "The game concept and visual journey were grounded through two co-design cycles with six Haenyeo and one Haenam.",
          ko: "해녀 6명과 해남 1명이 참여한 두 차례 공동 설계를 통해 게임 콘셉트와 시각적 여정을 검토했습니다."
        },
        outcome: {
          en: "The work produced a community-reviewed game concept, narrative, mechanics, visual journey, and care-centered design method; a playable build remains future work.",
          ko: "공동체가 검토한 게임 콘셉트·서사·메커니즘·시각적 여정과 돌봄 중심 설계 방법을 만들었으며 플레이 가능한 빌드는 후속 과제입니다."
        }
      },
      palette: "oxide",
      pattern: "current",
      height: "short",
      width: "wide",
      mark: "HNY",
      spineVenue: "KAIST"
    },
    {
      slug: "adaptive-xr",
      sourceIndex: 3,
      shortTitle: {
        en: "Adaptive XR",
        ko: "적응형 XR"
      },
      category: {
        en: "Extended Reality",
        ko: "확장현실"
      },
      story: {
        research: {
          en: "Studied how changing physical environments break the fit between real and virtual space.",
          ko: "변화하는 물리 환경이 현실과 가상 공간의 정합성을 어떻게 깨뜨리는지 탐구했습니다."
        },
        design: {
          en: "Contributed to adaptive spatial rules and multimodal visual-haptic feedback within an international consortium.",
          ko: "국제 컨소시엄에서 적응형 공간 규칙과 멀티모달 시각·햅틱 피드백에 기여했습니다."
        },
        artifact: {
          en: "A real-time XR interface that repositions virtual content around physical conditions.",
          ko: "물리 조건에 맞춰 가상 콘텐츠를 재배치하는 실시간 XR 인터페이스입니다."
        },
        evidence: {
          en: "Built within an international consortium; available records do not document a Jihun-specific user-study result.",
          ko: "국제 컨소시엄에서 개발했으며, 현재 자료에는 지훈 개인 단위의 사용자 연구 결과가 기록되어 있지 않습니다."
        }
      },
      editorial: {
        question: {
          en: "How can an XR interface adapt virtual content to changing physical conditions without breaking presence?",
          ko: "XR 인터페이스는 현존감을 깨뜨리지 않으면서 변화하는 물리 환경에 가상 콘텐츠를 어떻게 적응시킬 수 있을까?"
        },
        responsibility: {
          en: "As a student researcher, I contributed to adaptive spatial behavior and multimodal visual-haptic feedback within an international consortium.",
          ko: "학생연구원으로서 국제 컨소시엄의 적응형 공간 동작과 멀티모달 시각·햅틱 피드백에 기여했습니다."
        },
        outcome: {
          en: "The project produced a real-time interface that repositions virtual content around physical conditions.",
          ko: "물리 조건에 따라 가상 콘텐츠를 재배치하는 실시간 인터페이스를 구현했습니다."
        }
      },
      palette: "plum",
      pattern: "orbit",
      height: "tall",
      width: "regular",
      mark: "XR",
      spineVenue: "KAIST"
    },
    {
      slug: "camouflage-effectiveness",
      sourceIndex: 4,
      shortTitle: {
        en: "Computer Vision for Camouflage",
        ko: "위장 분석 컴퓨터 비전"
      },
      category: {
        en: "Computer Vision",
        ko: "컴퓨터 비전"
      },
      story: {
        research: {
          en: "Analyzed aircraft detectability across altitude, terrain, and weather using vision and simulation.",
          ko: "컴퓨터 비전과 시뮬레이션으로 고도·지형·기상별 항공기 피탐성을 분석했습니다."
        },
        design: {
          en: "Developed camouflage colorways and pattern configurations for changing conditions.",
          ko: "변화하는 조건에 대응하는 위장 컬러웨이와 패턴 구성을 설계했습니다."
        },
        artifact: {
          en: "A comparative evaluation pipeline and camouflage proposals for the KF-21 Boramae.",
          ko: "KF-21 보라매를 위한 비교 평가 파이프라인과 위장 제안안입니다."
        },
        evidence: {
          en: "Evidence supports selected proposals entering project outputs; public materials do not establish operational adoption, performance, or an individually measured result.",
          ko: "확보된 근거는 선택된 제안의 과제 결과물 반영을 뒷받침하지만 공개 자료만으로 실제 운용 채택·성능이나 개인 단위 측정 결과를 입증할 수는 없습니다."
        }
      },
      editorial: {
        question: {
          en: "How can vision and simulation test camouflage across altitude, terrain, and weather before real-world adoption?",
          ko: "실제 적용 전에 고도·지형·기상 조건별 위장 성능을 비전과 시뮬레이션으로 어떻게 검증할 수 있을까?"
        },
        responsibility: {
          en: "I analyzed detectability and developed camouflage colorways and pattern configurations.",
          ko: "피탐성을 분석하고 위장 컬러웨이와 패턴 구성을 개발했습니다."
        },
        evaluation: {
          en: "We compared detectability across altitude, terrain, and weather conditions.",
          ko: "고도·지형·기상 조건에 따라 피탐성을 비교 평가했습니다."
        },
        outcome: {
          en: "Selected directions entered sponsored-project outputs; public materials do not establish operational adoption or performance.",
          ko: "선정된 방향은 산학 과제 결과물에 반영되었으며 공개 자료만으로 실제 운용 채택이나 성능을 입증할 수는 없습니다."
        }
      },
      palette: "moss",
      pattern: "terrain",
      height: "standard",
      width: "wide",
      mark: "KF-21",
      spineVenue: "KAI"
    },
    {
      slug: "smart-city-tracking",
      sourceIndex: 5,
      shortTitle: {
        en: "Smart-City Object Tracking",
        ko: "스마트시티 객체 추적"
      },
      category: {
        en: "Smart Infrastructure",
        ko: "스마트 인프라"
      },
      story: {
        research: {
          en: "Framed dense-traffic detection around road scenes and roadside sensing constraints.",
          ko: "도로 장면과 노변 센싱 제약을 중심으로 고밀도 교통 탐지 문제를 정의했습니다."
        },
        design: {
          en: "Optimized preprocessing, detection flow, anchor boxes, and the physical sensor enclosure.",
          ko: "전처리·탐지 흐름·앵커 박스와 물리 센서 인클로저를 함께 최적화했습니다."
        },
        artifact: {
          en: "An object-tracking pipeline connected to IoT hardware in a 3D-printed enclosure.",
          ko: "3D 프린팅 하우징의 IoT 하드웨어와 연결된 객체 추적 파이프라인입니다."
        },
        evidence: {
          en: "Project records document end-to-end integration; no independent benchmark or deployment record is available.",
          ko: "과제 기록은 종단 간 통합을 문서화하며 독립 벤치마크나 배치 기록은 확보되지 않았습니다."
        }
      },
      editorial: {
        question: {
          en: "How can roadside sensing track dense traffic accurately while remaining deployable as physical infrastructure?",
          ko: "도로변 센싱은 물리 인프라로 배치 가능하면서도 고밀도 교통을 어떻게 정확히 추적할 수 있을까?"
        },
        responsibility: {
          en: "My documented contribution covered preprocessing, detection-flow and anchor-box tuning, IoT integration, and 3D-printed enclosure development.",
          ko: "문서화된 제 기여는 전처리, 탐지 흐름·앵커 박스 조정, IoT 통합, 3D 프린팅 하우징 개발입니다."
        },
        outcome: {
          en: "The work produced an integrated sensing, enclosure-prototyping, and road-scene-detection research prototype; deployment performance is not claimed.",
          ko: "센싱, 하우징 프로토타이핑, 도로 장면 탐지를 통합한 연구 프로토타입을 구현했으며 배치 성능은 주장하지 않습니다."
        },
        lesson: {
          en: "A deployable tracking system must connect model behavior to the realities of sensing hardware.",
          ko: "배치 가능한 추적 시스템은 모델 동작을 센싱 하드웨어의 현실적 조건과 연결해야 합니다."
        }
      },
      palette: "sand",
      pattern: "grid",
      height: "short",
      width: "regular",
      mark: "IoT",
      spineVenue: "HGU"
    }
  ],
  publications: [
    {
      slug: "ai-assistant-disabilities-thesis",
      sourceIndex: 0,
      shortTitle: {
        en: "Accessible AI for Games",
        ko: "게임 접근성을 위한 AI"
      },
      category: {
        en: "Master's Thesis",
        ko: "석사학위논문"
      },
      story: {
        research: {
          en: "Twelve disabled players exposed information, perception, and execution barriers in Minecraft tasks.",
          ko: "장애인 플레이어 12명의 Minecraft 과업에서 정보·지각·실행 장벽이 드러났습니다."
        },
        design: {
          en: "Mapped each active gap to Explainer, Reader, or player-authorized Surrogate support.",
          ko: "각 간극을 Explainer·Reader·사용자 승인형 Surrogate 지원에 연결했습니다."
        },
        artifact: {
          en: "A master's thesis, Information-Perception-Execution framework, and three-role GAIA model.",
          ko: "석사학위논문과 정보·지각·실행 프레임워크, 세 가지 GAIA 역할 모델을 정리했습니다."
        },
        evidence: {
          en: "Controlled mixed-method evidence showed information value alongside modality and input mismatches.",
          ko: "통제된 혼합방법 연구에서 정보 지원의 가치와 모달리티·입력 불일치를 함께 확인했습니다."
        }
      },
      palette: "ink",
      pattern: "type",
      height: "tall",
      width: "wide",
      mark: "MGCT"
    },
    {
      slug: "toward-ludic-ai",
      sourceIndex: 1,
      shortTitle: {
        en: "Evaluating Playful AI",
        ko: "놀이형 AI 평가"
      },
      category: {
        en: "Journal Article",
        ko: "학술지 논문"
      },
      story: {
        research: {
          en: "Achievement metrics miss voluntary constraint, rule boundaries, and relational play.",
          ko: "성취 지표만으로는 자발적 제약·규칙 경계·관계적 놀이를 포착할 수 없었습니다."
        },
        design: {
          en: "Translated play theory into observable behavioral dimensions grounded in what the AI actually does.",
          ko: "놀이 이론을 AI의 실제 행동에 근거한 관찰 가능한 차원으로 번역했습니다."
        },
        artifact: {
          en: "A three-dimension framework for evaluating the ludic competence of game-playing AI.",
          ko: "게임 AI의 루딕 역량을 평가하는 세 차원 프레임워크를 제안했습니다."
        },
        evidence: {
          en: "A peer-reviewed conceptual journal article; empirical validation remains open.",
          ko: "학술지에 게재된 개념 논문이며 실증 검증은 후속 과제입니다."
        }
      },
      palette: "oxide",
      pattern: "orbit",
      height: "standard",
      width: "regular",
      mark: "DGR"
    },
    {
      slug: "game-accessibility-preferences",
      sourceIndex: 2,
      shortTitle: {
        en: "What Players Want from AI",
        ko: "플레이어가 원하는 AI 지원"
      },
      category: {
        en: "Journal Article",
        ko: "학술지 논문"
      },
      story: {
        research: {
          en: "Responses from 112 disabled players showed that diagnoses and functional barriers are not interchangeable.",
          ko: "장애인 플레이어 112명의 응답에서 진단 범주와 기능적 장벽이 동일하지 않음이 드러났습니다."
        },
        design: {
          en: "Organized support by barrier, timing, and context, with setup labor as the first priority.",
          ko: "지원을 장벽·시점·맥락으로 구성하고 초기 설정 부담을 첫 우선순위로 두었습니다."
        },
        artifact: {
          en: "A four-unit AI-support preference map with exploratory, multiple-comparison-aware statistics.",
          ko: "네 가지 AI 지원 선호 지도와 다중비교를 고려한 탐색적 통계를 만들었습니다."
        },
        evidence: {
          en: "Setup and automation averaged 6.31 of 7; individual regressions did not survive FDR correction.",
          ko: "설정·자동화 평균은 7점 중 6.31이었고 개별 회귀계수는 FDR 보정 후 유의하지 않았습니다."
        }
      },
      palette: "cobalt",
      pattern: "signal",
      height: "tall",
      width: "narrow",
      mark: "JKMS"
    },
    {
      slug: "gaia-design-principles",
      sourceIndex: 3,
      shortTitle: {
        en: "Designing Accessible AI",
        ko: "접근 가능한 AI 설계"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Seven professional accessibility playtesters rejected interruption during high-concentration play.",
          ko: "전문 접근성 플레이테스터 7명은 고집중 플레이 중 개입을 거부했습니다."
        },
        design: {
          en: "Adapted timing and modality while preserving agency and ownership of accomplishment.",
          ko: "시점과 모달리티를 조정하면서 주체성과 성취의 소유권을 보존하도록 설계했습니다."
        },
        artifact: {
          en: "Dual Context Adaptation and an Ethical Framework for Agency and Accomplishment.",
          ko: "Dual Context Adaptation과 Agency and Accomplishment 윤리 프레임워크를 제안했습니다."
        },
        evidence: {
          en: "An ACM IUI qualitative study whose seven-person lead-user sample limits generalization.",
          ko: "ACM IUI 질적 연구이며 7명의 리드유저 표본이므로 일반화에 한계가 있습니다."
        }
      },
      palette: "plum",
      pattern: "grid",
      height: "standard",
      width: "wide",
      mark: "IUI"
    },
    {
      slug: "game-ai-assistant-barriers",
      sourceIndex: 4,
      shortTitle: {
        en: "Barriers to Game Access",
        ko: "게임 접근 장벽"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Open responses from 112 disabled players mapped barriers across five functional domains.",
          ko: "장애인 플레이어 112명의 서술 응답에서 다섯 기능 영역의 장벽을 구조화했습니다."
        },
        design: {
          en: "Prioritized To Play before Easy Play and Better Play in the assistance ladder.",
          ko: "지원 단계에서 Easy Play와 Better Play보다 To Play를 먼저 확보하도록 우선순위를 정했습니다."
        },
        artifact: {
          en: "A three-level requirements map for baseline access, workload reduction, and personalization.",
          ko: "기본 접근·부담 완화·개인화를 구분하는 3단계 요구사항 지도를 제안했습니다."
        },
        evidence: {
          en: "This conference-stage analysis shares the N=112 survey lineage with Publication 03; it is not independent evidence.",
          ko: "이 학술대회 단계 분석은 Publication 03과 동일한 N=112 설문 계보를 공유하며 독립된 근거가 아닙니다."
        }
      },
      palette: "moss",
      pattern: "rules",
      height: "short",
      width: "regular",
      mark: "KGS"
    },
    {
      slug: "press-start-to-continue",
      sourceIndex: 5,
      shortTitle: {
        en: "How Players Adapt",
        ko: "플레이어의 적응 과정"
      },
      category: {
        en: "Extended Abstract",
        ko: "확장 초록"
      },
      story: {
        research: {
          en: "Five hardcore disabled players described iterative adaptation across personal, social, cultural, and game resources.",
          ko: "장애인 하드코어 플레이어 5명은 개인·사회·문화·게임 자원을 넘나드는 반복적 적응을 설명했습니다."
        },
        design: {
          en: "Reframed adaptation as a resource system rather than an individual deficit.",
          ko: "적응을 개인의 결핍이 아니라 자원 시스템의 문제로 재구성했습니다."
        },
        artifact: {
          en: "A thematic process model explaining how gameplay adaptation continues or breaks down.",
          ko: "게임 적응이 지속되거나 무너지는 과정을 설명하는 주제 기반 모델을 만들었습니다."
        },
        evidence: {
          en: "CHI Extended Abstract with explicit co-first authorship; the N=5 sample was hearing-skewed.",
          ko: "공동 제1저자가 명시된 CHI 확장 초록이며, N=5 표본은 청각장애 참여자 비중이 높았습니다."
        }
      },
      palette: "cobalt",
      pattern: "current",
      height: "tall",
      width: "wide",
      mark: "CHI"
    },
    {
      slug: "game-npc-identity",
      sourceIndex: 6,
      shortTitle: {
        en: "Designing AI Game Characters",
        ko: "AI 게임 캐릭터 설계"
      },
      category: {
        en: "Conference Presentation",
        ko: "학술대회 발표"
      },
      story: {
        research: {
          en: "NPC roles evolved from scripted functions toward increasingly adaptive agents.",
          ko: "NPC 역할은 정해진 기능에서 점차 적응적인 에이전트로 변화해 왔습니다."
        },
        design: {
          en: "Bound autonomy within game rules and identity while protecting player agency.",
          ko: "자율성을 게임 규칙과 정체성 안에 제한하고 플레이어 주체성을 보호하도록 제안했습니다."
        },
        artifact: {
          en: "A historical and conceptual periodization with a future design agenda.",
          ko: "역사적·개념적 시대 구분과 미래 설계 의제를 정리했습니다."
        },
        evidence: {
          en: "As first author, Jihun synthesized eight sources and selected game examples into a conceptual history and future design agenda for game characters.",
          ko: "제1저자 채지훈은 문헌 8편과 게임 사례를 종합해 게임 캐릭터의 역사와 미래 설계 의제를 정리했습니다."
        }
      },
      palette: "sand",
      pattern: "type",
      height: "standard",
      width: "narrow",
      mark: "DiGRA"
    },
    {
      slug: "rag-enhanced-gaia",
      sourceIndex: 7,
      shortTitle: {
        en: "Testing an AI Game Assistant",
        ko: "AI 게임 어시스턴트 평가"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Fragmented game knowledge and hallucination threaten the usefulness of novice support.",
          ko: "분산된 게임 지식과 환각은 초보자 지원의 실용성을 위협합니다."
        },
        design: {
          en: "Grounded answers in curated Street Fighter 6 sources and judged executable correctness, not similarity alone.",
          ko: "Street Fighter 6 선별 자료에 답변을 근거화하고 유사도만이 아니라 실행 가능한 정확성을 판단했습니다."
        },
        artifact: {
          en: "A multimodal Discord GAIA prototype and a 19-answer retrieval evaluation.",
          ko: "멀티모달 Discord GAIA 프로토타입과 답변 19개의 검색 평가를 구현했습니다."
        },
        evidence: {
          en: "Jihun contributed equally with the other authors listed after the first author. The team evaluated 19 answers with mean ROUGE-1 of 0.210 and RDASS of 0.214.",
          ko: "채지훈은 제1저자 다음에 기재된 다른 저자들과 동등하게 기여했습니다. 연구팀은 19개 답변을 평가해 평균 ROUGE-1 0.210, RDASS 0.214를 보고했습니다."
        }
      },
      palette: "oxide",
      pattern: "grid",
      height: "short",
      width: "regular",
      mark: "HCI"
    },
    {
      slug: "pleth-ethical-llm",
      sourceIndex: 8,
      shortTitle: {
        en: "AI Ethics Across Cultures",
        ko: "문화권별 AI 윤리"
      },
      category: {
        en: "Conference Poster",
        ko: "학술대회 포스터"
      },
      story: {
        research: {
          en: "Cultural alignment can conflict with ethical acceptability in language-model decisions.",
          ko: "언어모델의 의사결정에서 문화적 정렬과 윤리적 수용성이 충돌할 수 있습니다."
        },
        design: {
          en: "Scored cultural relevance, coherence, consistency, and acceptability separately, with human escalation as a requirement.",
          ko: "문화적 관련성·정합성·일관성·수용성을 분리해 평가하고 인간 검토를 필수로 두었습니다."
        },
        artifact: {
          en: "PLETH: 12 cultural profiles by nine moral scenarios across four criteria.",
          ko: "PLETH는 12개 문화 프로필과 9개 도덕 시나리오를 네 기준으로 평가합니다."
        },
        evidence: {
          en: "As the second-listed author, Jihun contributed to an exploratory AI-ethics framework comparing 12 cultural profiles across nine moral scenarios. Decisions and scoring were model-generated, so the results remain exploratory.",
          ko: "두 번째 기재 저자인 채지훈은 12개 문화 프로필과 9개 도덕 시나리오를 비교한 탐색적 AI 윤리 프레임워크에 기여했습니다. 의사결정과 평가는 모두 모델이 수행했으므로 결과는 탐색적 근거로 해석합니다."
        }
      },
      palette: "plum",
      pattern: "rules",
      height: "tall",
      width: "narrow",
      mark: "KAIA"
    },
    {
      slug: "gaia-service-framework",
      sourceIndex: 9,
      shortTitle: {
        en: "AI Support for Player Struggles",
        ko: "플레이 어려움을 돕는 AI"
      },
      category: {
        en: "Conference Short Paper",
        ko: "학술대회 단편 논문"
      },
      story: {
        research: {
          en: "Player difficulty can be informational, practical, or emotional rather than one uniform state.",
          ko: "플레이어의 어려움은 하나의 상태가 아니라 정보적·실행적·정서적 문제일 수 있습니다."
        },
        design: {
          en: "Routed states to separate problem-solving and emotion-regulation strategies with explicitly governed memory.",
          ko: "상태를 문제 해결과 감정 조절 전략으로 분기하고 기억을 명시적으로 관리하도록 설계했습니다."
        },
        artifact: {
          en: "A two-path conceptual GAIA service architecture and UX scenario.",
          ko: "두 경로의 개념적 GAIA 서비스 아키텍처와 UX 시나리오를 제안했습니다."
        },
        evidence: {
          en: "Jihun was one of the first three equal contributors to a two-page service-architecture proposal; implementation and user evaluation are the next research phase.",
          ko: "채지훈은 2쪽 분량의 서비스 아키텍처 제안에 참여한 앞의 세 명의 동등기여 저자 중 한 명이며, 구현과 사용자 평가는 다음 연구 단계입니다."
        }
      },
      palette: "cobalt",
      pattern: "signal",
      height: "standard",
      width: "wide",
      mark: "KCGS"
    },
    {
      slug: "llm-npc-scoping-review",
      sourceIndex: 10,
      shortTitle: {
        en: "AI Characters in Games",
        ko: "게임 속 AI 캐릭터"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Six early LLM-NPC studies exposed hallucination, latency, memory, and realism-led design gaps.",
          ko: "초기 LLM-NPC 연구 6편에서 환각·지연·기억·사실성 중심 설계의 공백이 드러났습니다."
        },
        design: {
          en: "Defined the NPC's job, constraints, and evaluation needs before selecting an LLM.",
          ko: "LLM을 선택하기 전에 NPC의 역할·제약·평가 요구를 정의하도록 제안했습니다."
        },
        artifact: {
          en: "A technical, design, and evaluation decision framework with a research agenda.",
          ko: "기술·설계·평가 의사결정 프레임워크와 연구 의제를 정리했습니다."
        },
        evidence: {
          en: "As second author, Jihun helped synthesize six early LLM-NPC studies into a practical technical, design, and evaluation agenda.",
          ko: "제2저자 채지훈은 초기 LLM-NPC 연구 6편을 종합해 기술·설계·평가를 아우르는 실무적 연구 의제를 정리했습니다."
        }
      },
      palette: "ink",
      pattern: "orbit",
      height: "short",
      width: "regular",
      mark: "KGS"
    },
    {
      slug: "hybe-multilabel-review",
      sourceIndex: 11,
      shortTitle: {
        en: "How HYBE Organizes Labels",
        ko: "HYBE의 레이블 운영 구조"
      },
      category: {
        en: "Conference Abstract",
        ko: "학술대회 초록"
      },
      story: {
        research: {
          en: "HYBE suggests label autonomy operating inside a shared ownership structure.",
          ko: "HYBE 사례는 공유 소유구조 안에서 레이블 자율성이 작동할 가능성을 보여줍니다."
        },
        design: {
          en: "Framed decentralization as a testable operating-model hypothesis, not universal proof.",
          ko: "분권화를 보편적 증명이 아니라 검증 가능한 운영모델 가설로 다뤘습니다."
        },
        artifact: {
          en: "A one-page technical literature-review abstract about autonomy, infrastructure, and coordination.",
          ko: "자율성·공유 인프라·조정을 다룬 한 페이지 기술 문헌검토 초록입니다."
        },
        evidence: {
          en: "As second author, Jihun helped analyze HYBE's multi-label structure as a decentralized management strategy; the available record is a conference abstract.",
          ko: "제2저자 채지훈은 HYBE의 멀티레이블 구조를 분권형 경영 전략으로 분석하는 데 기여했으며, 확보된 결과물은 학술대회 초록입니다."
        }
      },
      palette: "moss",
      pattern: "grid",
      height: "standard",
      width: "narrow",
      mark: "KTIS"
    },
    {
      slug: "bighit-to-hybe",
      sourceIndex: 12,
      shortTitle: {
        en: "How BigHit Became HYBE",
        ko: "BigHit의 HYBE 전환"
      },
      category: {
        en: "Conference Abstract",
        ko: "학술대회 초록"
      },
      story: {
        research: {
          en: "45,393 Korean news articles captured media framing across the BigHit-to-HYBE transition.",
          ko: "한국 뉴스 45,393건에서 BigHit에서 HYBE로 전환되는 동안의 미디어 프레이밍을 추적했습니다."
        },
        design: {
          en: "Monitored innovation narratives and organizational conflict together rather than as isolated signals.",
          ko: "혁신 서사와 조직 갈등을 분리된 신호가 아니라 함께 추적했습니다."
        },
        artifact: {
          en: "A longitudinal sentiment and keyword analysis spanning 2005 through 2024.",
          ko: "2005년부터 2024년까지의 종단 감성·키워드 분석을 수행했습니다."
        },
        evidence: {
          en: "An abstract-book record only; media sentiment is not stakeholder attitude or business performance. Jihun is corresponding author.",
          ko: "초록집 기록만 존재하며 미디어 감성은 이해관계자 태도나 사업 성과가 아닙니다. 지훈은 교신저자입니다."
        }
      },
      palette: "oxide",
      pattern: "type",
      height: "tall",
      width: "regular",
      mark: "KSIME"
    },
    {
      slug: "vr-environmental-awareness",
      sourceIndex: 13,
      shortTitle: {
        en: "VR for Environmental Learning",
        ko: "환경 학습을 위한 VR"
      },
      category: {
        en: "Journal Article",
        ko: "학술지 논문"
      },
      story: {
        research: {
          en: "Content sequence and social form may matter more than positive or negative valence alone.",
          ko: "긍정·부정의 방향만으로는 부족하며 콘텐츠 순서와 사회적 형식이 중요할 수 있습니다."
        },
        design: {
          en: "Tested content order and collaboration as separate experience-design levers.",
          ko: "콘텐츠 순서와 협동을 서로 다른 경험 설계 변수로 시험했습니다."
        },
        artifact: {
          en: "A four-condition OptiTrack VR recycling study with individual and team play.",
          ko: "개인·팀 플레이를 비교하는 4조건 OptiTrack VR 재활용 연구를 수행했습니다."
        },
        evidence: {
          en: "A journal study with N=65; small unequal cells and short-term self-report limit causal and general claims.",
          ko: "N=65 학술지 연구이며 작고 불균등한 셀과 단기 자기보고로 인과·일반화 주장에 한계가 있습니다."
        }
      },
      palette: "moss",
      pattern: "terrain",
      height: "tall",
      width: "wide",
      mark: "JKCGS"
    },
    {
      slug: "ml-demand-forecasting",
      sourceIndex: 14,
      shortTitle: {
        en: "Machine Learning for Demand",
        ko: "머신러닝 수요 예측"
      },
      category: {
        en: "Preprint, Not Peer Reviewed",
        ko: "프리프린트, 동료심사 전"
      },
      story: {
        research: {
          en: "Heterogeneous product demand weakens a single global forecasting pipeline.",
          ko: "상품별로 다른 수요 패턴은 하나의 전역 예측 파이프라인을 약화시킵니다."
        },
        design: {
          en: "Clustered demand patterns, selected features by segment, then forecast with LSTM.",
          ko: "수요 패턴을 군집화하고 구간별 변수를 선택한 뒤 LSTM으로 예측했습니다."
        },
        artifact: {
          en: "A three-stage pipeline evaluated across 2,548 retail products.",
          ko: "소매 상품 2,548개에 적용한 3단계 예측 파이프라인입니다."
        },
        evidence: {
          en: "The full hybrid led three metrics; this is an unreviewed preprint from one retailer, and inconsistent cluster counts are omitted.",
          ko: "전체 결합 모델이 세 지표에서 가장 좋았지만 단일 소매사의 동료심사 전 프리프린트이며, 불일치하는 군집 수는 생략했습니다."
        }
      },
      palette: "ink",
      pattern: "grid",
      height: "short",
      width: "narrow",
      mark: "RS"
    },
    {
      slug: "recycling-gamification",
      sourceIndex: 15,
      shortTitle: {
        en: "Games for Recycling Behavior",
        ko: "재활용 행동을 위한 게임"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Cooperative commitment may change task execution more than broad environmental attitude.",
          ko: "협동적 몰입은 광범위한 환경 태도보다 과업 수행을 더 직접적으로 바꿀 수 있습니다."
        },
        design: {
          en: "Compared solo and group play on the same timed recycling task.",
          ko: "동일한 제한시간 재활용 과업에서 개인 플레이와 집단 플레이를 비교했습니다."
        },
        artifact: {
          en: "A motion-capture recycling game with behavior-specific attitude measures.",
          ko: "행동별 태도 척도를 포함한 모션캡처 재활용 게임을 구현했습니다."
        },
        evidence: {
          en: "N=48 with fixed solo-to-group order and short exposure; the result does not support a broad causal attitude claim.",
          ko: "N=48, 개인 후 집단의 고정 순서와 짧은 노출이므로 광범위한 태도의 인과 변화를 주장할 수 없습니다."
        }
      },
      palette: "sand",
      pattern: "orbit",
      height: "standard",
      width: "regular",
      mark: "HCI"
    },
    {
      slug: "diplopia-rehabilitation",
      sourceIndex: 16,
      shortTitle: {
        en: "Games for Eye Exercise",
        ko: "안구 운동을 위한 게임"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Repetitive eye exercises can create adherence and participation problems.",
          ko: "반복적인 안구 운동은 참여와 지속의 어려움을 만들 수 있습니다."
        },
        design: {
          en: "Gamified three exercise types and measured anticipation, continuation, and interest.",
          ko: "세 가지 운동을 게임화하고 기대감·지속 의향·흥미를 측정했습니다."
        },
        artifact: {
          en: "An early gamified eye-exercise pilot tested across two sessions.",
          ko: "두 차례 세션에서 시험한 초기 게임화 안구 운동 파일럿입니다."
        },
        evidence: {
          en: "N=7 descriptive evidence; diagnoses were not established, and no clinical efficacy was tested.",
          ko: "N=7의 기술적 근거이며 진단 여부가 확인되지 않았고 임상 효과를 시험하지 않았습니다."
        }
      },
      palette: "plum",
      pattern: "current",
      height: "tall",
      width: "narrow",
      mark: "KCGS"
    },
    {
      slug: "eye-tracking-vr-games",
      sourceIndex: 17,
      shortTitle: {
        en: "Eye-Tracking VR",
        ko: "시선 추적 VR"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Repetition can limit sustained participation in conventional eye exercises.",
          ko: "기존 안구 운동의 반복성은 지속적인 참여를 제한할 수 있습니다."
        },
        design: {
          en: "Converted saccade and smooth-pursuit exercises into gaze mechanics with staged difficulty and feedback.",
          ko: "단속성·원활추종 운동을 단계형 난이도와 피드백을 갖춘 시선 메커니즘으로 전환했습니다."
        },
        artifact: {
          en: "A Meta Quest Pro eye-tracking VR game prototype.",
          ko: "Meta Quest Pro 기반 시선추적 VR 게임 프로토타입입니다."
        },
        evidence: {
          en: "Feedback from 24 elementary students supports feasibility only, not diagnosis or therapeutic effectiveness; Jihun is fourth author.",
          ko: "초등학생 24명의 피드백은 구현 가능성만 뒷받침하며 진단이나 치료 효과의 근거가 아닙니다. 지훈은 제4저자입니다."
        }
      },
      palette: "cobalt",
      pattern: "signal",
      height: "short",
      width: "regular",
      mark: "KMMS"
    },
    {
      slug: "cynophobia-vr-exposure",
      sourceIndex: 18,
      shortTitle: {
        en: "VR Exposure for Dog Fear",
        ko: "개 공포 완화를 위한 VR 노출"
      },
      category: {
        en: "Preliminary Conference Abstract",
        ko: "예비 학술대회 초록"
      },
      story: {
        research: {
          en: "Earlier VR exposure designs did not structure distance as a person-specific progression parameter.",
          ko: "기존 VR 노출 설계는 거리를 개인별 진행 변수로 구조화하지 않았습니다."
        },
        design: {
          en: "Made exposure distance a controllable progression rather than a fixed scene property.",
          ko: "노출 거리를 고정된 장면 속성이 아니라 조절 가능한 진행 단계로 만들었습니다."
        },
        artifact: {
          en: "A preliminary graded-distance versus immediate-close VR comparison.",
          ko: "점진적 거리와 즉시 근접 조건을 비교한 예비 VR 연구입니다."
        },
        evidence: {
          en: "A one-page abstract with no reported N, instrument, effect estimate, or follow-up; it does not establish treatment efficacy.",
          ko: "한 페이지 초록이며 표본 수·측정도구·효과 추정치·추적조사를 보고하지 않아 치료 효과를 입증하지 않습니다."
        }
      },
      palette: "oxide",
      pattern: "terrain",
      height: "standard",
      width: "wide",
      mark: "KMMS"
    },
    {
      slug: "clustering-prediction",
      sourceIndex: 19,
      shortTitle: {
        en: "Product Demand Prediction",
        ko: "상품 수요 예측"
      },
      category: {
        en: "Conference Paper",
        ko: "학술대회 논문"
      },
      story: {
        research: {
          en: "Global models can miss heterogeneous product-demand shapes.",
          ko: "전역 모델은 상품마다 다른 수요 형태를 놓칠 수 있습니다."
        },
        design: {
          en: "Clustered products before comparing five forecasting model families.",
          ko: "상품을 먼저 군집화한 뒤 다섯 예측 모델 계열을 비교했습니다."
        },
        artifact: {
          en: "A hybrid specialization layer evaluated across 1,624 products.",
          ko: "상품 1,624개에 적용한 결합형 전문화 계층입니다."
        },
        evidence: {
          en: "Available metadata and abstract report improvement direction but no extractable magnitude, uncertainty, or external validity.",
          ko: "확인 가능한 메타데이터와 초록은 개선 방향만 보고하며 크기·불확실성·외적 타당도는 제시하지 않습니다."
        }
      },
      palette: "moss",
      pattern: "grid",
      height: "tall",
      width: "narrow",
      mark: "KMIS"
    },
    {
      slug: "regression-clustering",
      sourceIndex: 20,
      shortTitle: {
        en: "Forecasting Product Demand",
        ko: "상품 수요 예측 모델"
      },
      category: {
        en: "Conference Abstract",
        ko: "학술대회 초록"
      },
      story: {
        research: {
          en: "One global feature set may not fit heterogeneous demand segments.",
          ko: "하나의 전역 변수 집합은 서로 다른 수요 구간에 맞지 않을 수 있습니다."
        },
        design: {
          en: "Combined K-means, cluster-specific LASSO, and LSTM forecasting.",
          ko: "K-means, 군집별 LASSO, LSTM 예측을 결합했습니다."
        },
        artifact: {
          en: "An early auditable hybrid pipeline evaluated across 2,693 products.",
          ko: "상품 2,693개에 적용한 초기 감사 가능 결합 파이프라인입니다."
        },
        evidence: {
          en: "A one-page abstract without numerical results or uncertainty; the later preprint provides stronger evidence. Jihun is fourth author.",
          ko: "수치 결과나 불확실성이 없는 한 페이지 초록이며 후속 프리프린트가 더 강한 근거를 제공합니다. 지훈은 제4저자입니다."
        }
      },
      palette: "ink",
      pattern: "rules",
      height: "standard",
      width: "regular",
      mark: "KIISS"
    }
  ],
  awards: [
    {
      slug: "krafton-fde-challenge",
      sourceIndex: 0,
      shortTitle: { en: "Rapid AI Product Build", ko: "AI 제품 신속 개발" },
      category: { en: "AI Product Challenge", ko: "AI 제품 챌린지" },
      story: {
        research: {
          en: "A one-day FDE final tested problem definition, AI direction, iteration, and handoff under time pressure.",
          ko: "하루 동안 진행된 FDE 결선은 제한된 시간 안의 문제 정의·AI 방향·반복 개선·인계를 다뤘습니다."
        },
        design: {
          en: "Project records describe translating a scenario agent's ambiguity into a rapid build plan.",
          ko: "과제 기록은 시나리오 에이전트의 모호함을 빠른 구현 계획으로 전환한 과정을 설명합니다."
        },
        artifact: {
          en: "A working application and blind-review handoff documented as produced in under four hours.",
          ko: "4시간 이내에 구현했다고 기록된 작동형 애플리케이션과 블라인드 심사 인계물입니다."
        },
        evidence: {
          en: "Official materials verify the event and prize context; this entry does not claim a competition placement.",
          ko: "공식 자료는 행사와 상금 맥락을 확인하며 이 항목은 대회 순위를 주장하지 않습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "FDE",
      spineVenue: "FDE"
    },
    {
      slug: "game-society-best-presentation",
      sourceIndex: 1,
      shortTitle: { en: "Accessible AI Paper Award", ko: "접근성 AI 논문상" },
      category: { en: "Research Recognition", ko: "연구 성과 인정" },
      story: {
        research: {
          en: "The team converted open responses from 112 disabled players into defensible accessibility requirements.",
          ko: "팀은 장애인 플레이어 112명의 서술 응답을 근거 있는 접근성 요구사항으로 전환했습니다."
        },
        design: {
          en: "Synthesized barrier interpretation and a To Play, Easy Play, Better Play design hierarchy.",
          ko: "장벽 해석과 To Play·Easy Play·Better Play 설계 위계를 종합했습니다."
        },
        artifact: {
          en: "A six-page Korea Game Society conference paper coauthored by Jihun.",
          ko: "지훈이 공동저자로 참여한 6쪽 분량의 한국게임학회 학술대회 논문입니다."
        },
        evidence: {
          en: "As second author, Jihun contributed accessibility-AI framing and design synthesis to the recognized paper. A professor's CV records the award; no organizer-issued certificate is available.",
          ko: "제2저자 채지훈은 수상 논문의 접근성 AI 프레이밍과 설계 종합에 기여했습니다. 교수 CV가 수상을 기록하며 주최 측 발행 증서는 확보되지 않았습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KGS",
      spineVenue: "KGS"
    },
    {
      slug: "edu40-ta-excellence",
      sourceIndex: 2,
      shortTitle: { en: "TA Report Excellence", ko: "조교 활동보고서 우수상" },
      category: { en: "Education Recognition", ko: "교육 성과 인정" },
      story: {
        research: {
          en: "Question-centered teaching support required a clear record of planning, operation, and reflection.",
          ko: "질문 중심 수업 지원은 계획·운영·성찰을 명확하게 기록해야 했습니다."
        },
        design: {
          en: "Structured teaching operations and reflection for institutional review and reuse.",
          ko: "교육 운영과 성찰을 기관 검토와 재사용이 가능한 구조로 정리했습니다."
        },
        artifact: {
          en: "An Education4.0 Q teaching-assistant activity report authored by Jihun.",
          ko: "지훈이 작성한 Education4.0 Q 조교 활동 보고서입니다."
        },
        evidence: {
          en: "Certificate EC-2026-0001 verifies Excellence for the Education4.0 Q TA Report.",
          ko: "상장 EC-2026-0001은 Education4.0 Q 조교 활동보고서 우수상을 확인합니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KAIST",
      spineVenue: "KAIST"
    },
    {
      slug: "asan-climate-tech-team",
      sourceIndex: 3,
      shortTitle: { en: "Climate-Tech Team Selection", ko: "기후기술 팀 선정" },
      category: { en: "Startup Selection", ko: "창업팀 선정" },
      story: {
        research: {
          en: "Glean framed litter recognition and recycling incentives as a climate-tech venture problem.",
          ko: "Glean은 쓰레기 인식과 재활용 인센티브를 기후테크 벤처 문제로 정의했습니다."
        },
        design: {
          en: "Integrated AR scanning, incentives, environmental data, AI modeling, and IP planning.",
          ko: "AR 스캔·인센티브·환경 데이터·AI 모델링·지식재산 계획을 통합했습니다."
        },
        artifact: {
          en: "A venture submission led by Jihun as the named team representative.",
          ko: "팀 대표로 명시된 지훈이 주도한 벤처 지원서입니다."
        },
        evidence: {
          en: "Asan UniverCT selected the team; this was a program selection, and no paid-support amount is claimed.",
          ko: "Asan UniverCT가 팀을 선정했으며 이는 프로그램 선정이고 지원금 지급액은 주장하지 않습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "ASAN",
      spineVenue: "ASAN"
    },
    {
      slug: "pohang-media-facade-camp",
      sourceIndex: 4,
      shortTitle: { en: "Underwater Media Art", ko: "수중 미디어 아트" },
      category: { en: "Interactive Media Project", ko: "인터랙티브 미디어 프로젝트" },
      story: {
        research: {
          en: "A five-day Unreal Engine camp asked teams to build environmental content for an architectural media surface.",
          ko: "5일간의 Unreal Engine 캠프는 건축 미디어 표면에서 작동하는 환경 콘텐츠 제작을 요구했습니다."
        },
        design: {
          en: "Project records describe an underwater smart-city concept and technical-lead role.",
          ko: "과제 기록은 수중 스마트시티 콘셉트와 기술 리드 역할을 설명합니다."
        },
        artifact: {
          en: "A documented Unreal Engine media-façade implementation.",
          ko: "구현 기록이 있는 Unreal Engine 기반 미디어파사드입니다."
        },
        evidence: {
          en: "The camp and award context are verified; no named result currently confirms an individual award placement or team role.",
          ko: "캠프와 시상 맥락은 확인됐지만 개인 수상 등급이나 팀 역할을 확인하는 실명 결과는 확보되지 않았습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "HGU",
      spineVenue: "HGU"
    },
    {
      slug: "eye-tracking-vr-research-award",
      sourceIndex: 5,
      shortTitle: { en: "Eye-Tracking VR Paper Award", ko: "시선추적 VR 논문상" },
      category: { en: "Research Recognition", ko: "연구 성과 인정" },
      story: {
        research: {
          en: "The paper translated eye exercises into a gaze-controlled VR research prototype.",
          ko: "논문은 안구 운동을 시선 제어형 VR 연구 프로토타입으로 전환했습니다."
        },
        design: {
          en: "Combined gaze interaction, exercise logic, and a preliminary user-facing experience.",
          ko: "시선 상호작용·운동 논리·예비 사용자 경험을 하나로 결합했습니다."
        },
        artifact: {
          en: "The seven-author Eye-Tracking-Based VR Interactive Game for Eye Exercises paper.",
          ko: "저자 7명의 시선추적 기반 VR 안구 운동 게임 논문입니다."
        },
        evidence: {
          en: "The society certificate verifies a paper-level Excellence Award; Jihun is fourth author, with no individual task or clinical efficacy certified.",
          ko: "학회 상장은 논문 단위 우수상을 확인하며 지훈은 제4저자입니다. 개인 업무나 임상 효과는 인증하지 않습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KMMS",
      spineVenue: "KMMS"
    },
    {
      slug: "watchers-metaverse-excellence",
      sourceIndex: 6,
      shortTitle: { en: "VR Health App Award", ko: "VR 헬스 앱 수상" },
      category: { en: "Digital Health Recognition", ko: "디지털 헬스 성과 인정" },
      story: {
        research: {
          en: "The team translated eye-muscle exercise requirements into a coherent Meta Quest Pro experience.",
          ko: "팀은 안구 근육 운동 요구를 일관된 Meta Quest Pro 경험으로 전환했습니다."
        },
        design: {
          en: "Jihun contributed VR content research and experience design; Youngsung Lee served as team lead.",
          ko: "채지훈은 VR 콘텐츠 조사와 경험 설계에 기여했으며, 이영성이 팀 리드를 맡았습니다."
        },
        artifact: {
          en: "Watchers, an integrated demonstrable XR experience by Team EyeCU.",
          ko: "Team EyeCU가 구현한 통합형 XR 경험 Watchers입니다."
        },
        evidence: {
          en: "Verified Excellence and Skonec CEO Awards included KRW 5 million and a recruitment benefit; Youngsung Lee was team leader.",
          ko: "우수상과 스코넥 대표이사상, 상금 500만원과 채용 혜택이 확인됐으며 팀 리더는 이영성이었습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "NIPA",
      spineVenue: "NIPA"
    },
    {
      slug: "esg-ar-encouragement-prize",
      sourceIndex: 7,
      shortTitle: { en: "Circular Design Startup Award", ko: "순환 디자인 창업상" },
      category: { en: "Climate-Tech Recognition", ko: "기후기술 성과 인정" },
      story: {
        research: {
          en: "CGreen framed recycling behavior, user incentives, and XR participation as one venture problem.",
          ko: "CGreen은 재활용 행동·사용자 인센티브·XR 참여를 하나의 벤처 문제로 정의했습니다."
        },
        design: {
          en: "Jihun integrated the ESG problem, service concept, incentive model, and competition narrative.",
          ko: "지훈은 ESG 문제·서비스 콘셉트·인센티브 모델·대회 서사를 통합했습니다."
        },
        artifact: {
          en: "The Glean venture proposal led by Jihun as named team representative.",
          ko: "팀 대표로 명시된 지훈이 주도한 Glean 벤처 제안서입니다."
        },
        evidence: {
          en: "The certificate verifies the Encouragement Prize for Team CGreen, represented by Jihun Chae.",
          ko: "상장은 채지훈이 대표한 Team CGreen의 장려상을 확인합니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "HGU",
      spineVenue: "HGU"
    },
    {
      slug: "cynophobia-vr-research-award",
      sourceIndex: 8,
      shortTitle: { en: "VR Exposure Paper Award", ko: "VR 노출 연구 논문상" },
      category: { en: "Research Recognition", ko: "연구 성과 인정" },
      story: {
        research: {
          en: "The team framed spatial distance as a controllable variable in preliminary VR exposure research.",
          ko: "팀은 예비 VR 노출 연구에서 공간적 거리를 조절 가능한 변수로 정의했습니다."
        },
        design: {
          en: "Compared staged spatial progression with immediate close exposure.",
          ko: "단계적 공간 진행과 즉시 근접 노출을 비교했습니다."
        },
        artifact: {
          en: "A one-page preliminary conference paper coauthored by Jihun.",
          ko: "지훈이 공동저자로 참여한 한 페이지 예비 학술대회 논문입니다."
        },
        evidence: {
          en: "The certificate verifies a shared paper-level Presentation Award; Jihun is second author, and the result does not validate clinical efficacy.",
          ko: "상장은 논문 단위 공동 발표상을 확인하며 지훈은 제2저자입니다. 이 결과는 임상 효과를 입증하지 않습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "KMMS",
      spineVenue: "KMMS"
    },
    {
      slug: "db-snubiz-startup-challenge",
      sourceIndex: 9,
      shortTitle: { en: "Global Startup Pitch", ko: "글로벌 스타트업 피치" },
      category: { en: "Startup Competition", ko: "창업 경진대회" },
      story: {
        research: {
          en: "A global startup competition narrowed 152 applications to 38 teams, then 14 finalists.",
          ko: "글로벌 창업대회는 지원 152팀을 38팀, 다시 결선 14팀으로 좁혔습니다."
        },
        design: {
          en: "Project records describe Jihun's contribution to developing and pitching a blockchain venture proposition.",
          ko: "과제 기록은 블록체인 벤처 제안 개발과 피칭에 대한 지훈의 기여를 설명합니다."
        },
        artifact: {
          en: "A documented competition pitch; no independent team roster or organizer record is available.",
          ko: "기록된 대회 피치이며 독립적인 팀 명단이나 주최 측 기록은 확보되지 않았습니다."
        },
        evidence: {
          en: "The competition funnel is verified; this entry does not claim independently verified finalist placement.",
          ko: "대회 선발 구조는 확인됐으며 이 항목은 독립 검증된 본선 진출을 주장하지 않습니다."
        }
      },
      palette: "award",
      pattern: "plain",
      height: "standard",
      width: "regular",
      mark: "SNU",
      spineVenue: "SNU"
    }
  ]
};

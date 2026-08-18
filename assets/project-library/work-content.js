(() => {
  "use strict";

  const designs = window.PROJECT_LIBRARY_DESIGNS;
  if (!designs) return;

  const p = (en, ko = en) => ({ en, ko });
  const merge = (target, source) => {
    Object.entries(source || {}).forEach(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value) && !("en" in value) && !("ko" in value)) {
        target[key] = merge(target[key] || {}, value);
      } else {
        target[key] = value;
      }
    });
    return target;
  };

  const content = {
    projects: {
      "inclusive-game-ai": {
        subtitle: p(
          "An accessibility assistant that changes roles when explanation alone is not enough.",
          "설명만으로 부족할 때 역할을 전환하는 게임 접근성 어시스턴트"
        ),
        editorial: {
          question: p(
            "How can we help players with disabilities cross game-specific barriers without taking control, challenge, or accomplishment away from them?",
            "장애인 플레이어의 통제감·도전·성취를 빼앗지 않으면서 게임 장벽을 넘도록 어떻게 도울 수 있을까?"
          ),
          problem: p(
            "Players with disabilities encounter information, perception, and execution gaps during settings and live play. Existing accessibility options cover known cases, but a text-first overlay can still fail when support conflicts with screen readers, vision, motor capacity, or the pace of play.",
            "장애인 플레이어는 설정과 실제 플레이에서 정보·지각·실행의 간극을 겪습니다. 기존 접근성 옵션은 알려진 사례를 다루지만, 텍스트 중심 오버레이는 스크린 리더·시각·운동 능력·플레이 속도와 충돌할 때 다시 장벽이 됩니다."
          ),
          responsibility: p(
            "As lead student researcher, I helped shape the funded research from proposal and field discovery through requirements, GAIA prototyping, evaluation, analysis, and publication. My direct work included interviews, system design, RAG and multimodal implementation, and study synthesis.",
            "학생연구원 총괄로서 과제 제안과 현장 문제 발굴부터 요구사항, GAIA 프로토타입, 평가, 분석, 논문화까지 연결했습니다. 인터뷰, 시스템 설계, RAG·멀티모달 구현, 연구 종합을 직접 수행했습니다."
          ),
          build: p(
            "A domain-grounded assistant combining a Minecraft and fighting-game knowledge layer, RAG, text and voice interaction, optional visual context, interaction logging, and an operator-facing workflow for study and iteration.",
            "게임 지식 레이어, RAG, 텍스트·음성 상호작용, 선택적 화면 맥락, 상호작용 로그, 연구·개선을 위한 운영 워크플로를 결합한 도메인 특화 어시스턴트입니다."
          ),
          decision: p(
            "We organized assistance around the barrier in the moment, not the diagnosis: Explainer for information, Reader for perception, and Surrogate for player-authorized execution. This keeps modality and agency inside the design decision.",
            "진단명이 아니라 순간의 장벽을 기준으로 정보는 Explainer, 지각은 Reader, 사용자 승인 실행은 Surrogate로 역할을 나눴습니다. 지원 모달리티와 주체성을 설계의 핵심에 둔 결정입니다."
          ),
          validation: p(
            "Across the project, we conducted in-depth interviews with approximately 30 participants and surveys of approximately 200 participants recruited through partner organizations.",
            "프로젝트 전반 약 30명 심층 인터뷰와 협력단체를 통한 약 200명 설문을 진행했습니다."
          ),
          outcomeSystem: p(
            "A working GAIA research platform and a modular Explainer-Reader-Surrogate roadmap were handed forward for continued development.",
            "작동하는 GAIA 연구 플랫폼과 Explainer-Reader-Surrogate 모듈형 발전 로드맵을 구축했습니다."
          ),
          outcomeEvidence: p(
            "The studies showed strong value for information gaps, but exposed modality mismatch for perception and input burden for execution. The work produced peer-reviewed outputs at CHI, IUI, HCI Korea, and Korean journals and conferences.",
            "정보 간극에는 높은 효용을 보였지만 지각에서는 출력 모달리티 불일치, 실행에서는 입력 부담을 확인했습니다. 결과는 CHI·IUI·HCI Korea 및 국내 학술지·학회 논문으로 이어졌습니다."
          ),
          outcomeValue: p(
            "The project connects KAIST research with disability communities, the National Rehabilitation Center, game-industry partners, and international accessibility organizations.",
            "KAIST 연구를 장애인 커뮤니티, 국립재활원, 게임 산업 파트너, 해외 접근성 기관과 연결했습니다."
          ),
          lesson: p(
            "The challenge was not making AI answer more questions. It was aligning what the assistant can sense, express, and do with how a particular player can perceive and act in that moment.",
            "핵심은 AI가 더 많은 질문에 답하게 하는 것이 아니었습니다. 특정 순간 플레이어가 지각하고 행동하는 방식에 AI의 감지·표현·실행 능력을 맞추는 일이었습니다."
          )
        }
      },
      "data-quality-engine": {
        subtitle: p(
          "A production verification engine designed for repeatability, traceability, and audit.",
          "반복 가능성·추적성·감사를 위해 설계한 운영 검증 엔진"
        ),
        editorial: {
          question: p(
            "How can we automate enterprise data-quality verification without trading away determinism, auditability, or reproducibility?",
            "결정론·감사 가능성·재현성을 포기하지 않고 기업 데이터 품질 검증을 어떻게 자동화할 수 있을까?"
          ),
          problem: p(
            "Operational teams must apply many quality rules to real data, but manual checks are slow and difficult to reproduce. A probabilistic model can generate plausible explanations while still weakening the exact audit trail the client needs.",
            "운영 조직은 실제 데이터에 많은 품질 규칙을 적용해야 하지만 수작업 검사는 느리고 재현하기 어렵습니다. 확률적 모델은 그럴듯한 설명을 만들 수 있어도 고객이 필요로 하는 정확한 감사 추적성을 약화시킬 수 있습니다."
          ),
          responsibility: p(
            "As sole developer of the DQM v1.0 engine, I owned rule translation, architecture, implementation, versioning, and verification — the engine detects and corrects data-quality errors, then infers primary keys, foreign keys, indexes and column-level rules. The engine is my scope within SKAIWORLDWIDE's 2024-2026 Ministry of SMEs and Startups R&D project, not the project itself.",
            "DQM v1.0 엔진의 단독 개발자로서 규칙 해석, 아키텍처, 구현, 버전 관리, 검증을 맡았습니다. 이 엔진은 스카이월드와이드가 수행한 2024~2026년 중소벤처기업부 R&D 과제 안에서 제가 맡은 범위이며, 과제 전체가 아닙니다."
          ),
          build: p(
            "A versioned data-quality engine that applies deterministic rules and statistical checks to production datasets and records reviewable outputs for delivery.",
            "운영 데이터에 결정론적 규칙과 통계 검사를 적용하고 검토 가능한 결과를 기록하는 버전형 데이터 품질 엔진을 구축했습니다."
          ),
          decision: p(
            "I used rules and statistics instead of an LLM wherever an identical input had to produce an inspectable, repeatable result.",
            "동일 입력이 검토 가능하고 반복 가능한 동일 결과를 내야 하는 구간에는 LLM 대신 규칙과 통계를 선택했습니다."
          ),
          validation: p(
            "The engine was tested with enterprise datasets and documented in a formal verification report. The available evidence supports technical delivery, not a claim of client acceptance.",
            "기업 데이터셋으로 엔진을 검증하고 공식 검증 보고서에 기록했습니다. 확보된 근거는 기술 납품을 뒷받침하지만 고객 인수 완료를 입증하지는 않습니다."
          ),
          outcomeSystem: p("A production-oriented, versioned verification engine and a formal results report prepared for handoff.", "운영 지향 버전형 검증 엔진과 인수인계를 위해 작성한 공식 결과보고서"),
          outcomeEvidence: p("Rule-level results can be reproduced and inspected rather than accepted as model judgment.", "모델 판단을 수용하는 대신 규칙 단위 결과를 재현하고 점검할 수 있게 했습니다."),
          outcomeValue: p("The work created an auditable foundation for recurring quality checks and future extension; client acceptance is outside the documented evidence.", "반복 품질 검사와 향후 확장을 위한 감사 가능한 기반을 구축했으며 고객 인수 여부는 문서화된 근거 범위 밖입니다."),
          lesson: p("The challenge was not adding AI. It was choosing the smallest reliable mechanism for each decision boundary.", "핵심은 AI를 더하는 일이 아니라 각 판단 경계에 가장 작고 신뢰할 수 있는 메커니즘을 선택하는 일이었습니다.")
        }
      },
      "haenyeo-legacy": {
        subtitle: p(
          "The Golden Tewak, a community-authored game concept for carrying living heritage forward.",
          "살아 있는 유산을 다음 세대로 잇는 공동체 기반 게임 콘셉트, The Golden Tewak"
        ),
        editorial: {
          question: p(
            "How can we translate embodied Haenyeo knowledge into play without flattening it into folklore or replacing community voice with designer interpretation?",
            "해녀의 체화된 지식을 민속 이미지로 축소하거나 디자이너의 해석으로 공동체 목소리를 대체하지 않고 어떻게 놀이로 옮길 수 있을까?"
          ),
          problem: p(
            "Jeju Haenyeo knowledge is ecological, embodied, and intergenerational. Static documentation can preserve artifacts, but it struggles to communicate the lived logic of breath, mutual responsibility, environmental change, and community survival.",
            "제주 해녀의 지식은 생태적·체화적·세대 간 지식입니다. 정적 기록은 자료를 보존할 수 있지만 숨, 상호 책임, 환경 변화, 공동체 생존의 살아 있는 논리를 전달하기 어렵습니다."
          ),
          responsibility: p(
            "As a student researcher and game designer, I joined preparatory fieldwork, participatory workshops, design synthesis, mechanics and narrative development, and the return session for community review.",
            "학생연구원·게임 디자이너로 사전 현장 조사, 참여형 워크숍, 설계 종합, 메커닉·내러티브 개발, 공동체 검토를 위한 재방문 세션에 참여했습니다."
          ),
          build: p(
            "A slide-based and visual-journey concept for The Golden Tewak, with a breath-centered core loop, diving tasks, community decisions, characters, environmental dilemmas, and the Inspiration Game Design with Care method.",
            "숨 중심 코어 루프, 물질 과업, 공동체 의사결정, 인물, 환경 딜레마를 담은 The Golden Tewak 시각 콘셉트와 Inspiration Game Design with Care 방법을 만들었습니다."
          ),
          decision: p(
            "We treated relationship building and interpretation as design work. The team returned repeatedly to community narratives and used an insider-interpreter to preserve cultural meaning beyond literal translation.",
            "관계 형성과 해석 자체를 설계 작업으로 보았습니다. 공동체 서사로 반복해서 돌아가고 내부자 통역자의 문화적 해석을 통해 문자 번역 이상의 의미를 보존했습니다."
          ),
          validation: p(
            "Evidence came from preparatory meetings, interviews with two senior Haenyeo, two participatory workshop cycles, a four-day design sprint, six Haenyeo plus one Haenam representing three villages and Jeju City, and consultation with Haenyeo Museum experts.",
            "사전 회의, 고령 해녀 2명 인터뷰, 2차례 참여형 워크숍, 4일 디자인 스프린트, 3개 마을·제주시를 대표한 해녀 6명과 해남 1명, 해녀박물관 전문가 자문으로 검증했습니다."
          ),
          outcomeSystem: p("A community-reviewed game concept, narrative, mechanics, visual journey, and reusable care-centered design method.", "공동체 검토를 거친 게임 콘셉트·내러티브·메커닉·비주얼 여정과 재사용 가능한 돌봄 중심 설계 방법"),
          outcomeEvidence: p("Participants unanimously said it was a game they would play and refined the breathing mechanic, platform direction, art direction, and representation.", "참여자 전원이 직접 플레이하고 싶은 게임이라고 평가했으며 숨 메커닉, 플랫폼, 아트 방향, 재현 방식을 함께 수정했습니다."),
          outcomeValue: p("The community recognized shared ownership; the Haenyeo Museum identified value for education and international interpretation. A playable prototype remains future work.", "공동체는 공동 소유감을 확인했고 해녀박물관은 교육·국제 관람객 해설 도구의 가치를 확인했습니다. 플레이 가능한 프로토타입은 후속 과제입니다."),
          lesson: p("The challenge was not digitizing tradition. It was creating enough trust and generative friction for a community to imagine its own future through play.", "핵심은 전통의 디지털화가 아니라 공동체가 놀이를 통해 자신의 미래를 상상할 수 있도록 신뢰와 생산적 긴장을 만드는 일이었습니다.")
        }
      },
      "adaptive-xr": {
        subtitle: p("Real-time spatial adaptation that keeps virtual content coherent with a changing room.", "변화하는 현실 공간과 가상 콘텐츠의 정합성을 유지하는 실시간 공간 적응"),
        editorial: {
          question: p("How can XR content adapt to changing physical conditions without breaking presence or forcing users to recalibrate the experience?", "XR 콘텐츠는 현존감을 깨뜨리거나 사용자의 반복 보정을 요구하지 않고 변화하는 물리 조건에 어떻게 적응할 수 있을까?"),
          problem: p("Room geometry, obstacles, and user position change, while many XR layouts assume a stable calibrated space. That mismatch can reduce safety, reachability, and presence.", "방 구조·장애물·사용자 위치는 변하지만 많은 XR 레이아웃은 고정된 보정 공간을 가정합니다. 이 불일치는 안전성·도달 가능성·현존감을 떨어뜨립니다."),
          responsibility: p("As a student researcher, I contributed to adaptive spatial behavior and multimodal visual-haptic feedback within an international research and industry consortium.", "학생연구원으로 국제 산학 컨소시엄에서 적응형 공간 동작과 시각·햅틱 멀티모달 피드백 연구에 기여했습니다."),
          build: p("A research interface that senses physical conditions and repositions or re-expresses virtual content with visual and haptic feedback.", "물리 조건을 감지해 가상 콘텐츠를 재배치하고 시각·햅틱 피드백으로 다시 표현하는 연구 인터페이스입니다."),
          decision: p("We treated environmental fit as a continuous interaction problem, not a one-time calibration step.", "환경 정합성을 일회성 보정이 아니라 지속적인 상호작용 문제로 다뤘습니다."),
          validation: p("Built within an international consortium; the evidence supports a team research contribution, not an individually attributable user-study result.", "국제 컨소시엄에서 개발했으며 확보된 근거는 팀 연구 기여를 뒷받침하지만 개인에게 귀속되는 사용자 연구 결과를 입증하지는 않습니다."),
          outcomeSystem: p("Adaptive spatial and multimodal interaction components for the consortium's real-time XR research stack.", "컨소시엄 실시간 XR 연구 스택을 위한 적응형 공간·멀티모달 상호작용 구성요소"),
          outcomeEvidence: p("The project established a concrete implementation direction for environment-responsive XR; public records do not support a quantified efficacy claim.", "환경 반응형 XR의 구체적 구현 방향을 마련했지만 공개 자료만으로 정량적 효과를 주장하지는 않습니다."),
          outcomeValue: p("Connected human-centered interface work across KAIST, Fraunhofer, NYU, UniSA, Anipen, and bHaptics.", "KAIST·Fraunhofer·NYU·UniSA·Anipen·bHaptics의 인간 중심 인터페이스 연구를 연결했습니다."),
          lesson: p("The challenge was not placing content in a room. It was preserving an intelligible relationship between body, space, and feedback as the room changes.", "핵심은 방 안에 콘텐츠를 놓는 일이 아니라 공간이 변해도 몸·공간·피드백의 이해 가능한 관계를 유지하는 일이었습니다.")
        }
      },
      "camouflage-effectiveness": {
        subtitle: p("Computer-vision and simulation studies of detectability across operational conditions.", "운용 조건별 피탐성을 분석한 컴퓨터 비전·시뮬레이션 연구"),
        editorial: {
          question: p("How can we compare camouflage color and pattern proposals across altitude, terrain, and weather without relying only on subjective visual judgment?", "주관적 시각 판단에만 의존하지 않고 고도·지형·기상별 위장 색상과 패턴 제안을 어떻게 비교할 수 있을까?"),
          problem: p("A camouflage scheme that works in one scene can fail under another background or viewing condition. Static reviews do not expose that condition-dependent detectability.", "한 장면에서 유효한 위장안도 다른 배경·관측 조건에서는 실패할 수 있습니다. 정적 검토만으로는 조건 의존적 피탐성을 드러내기 어렵습니다."),
          responsibility: p("As a student researcher, I supported image-based effectiveness analysis and developed colorway and pattern configurations for the HGU-KAI sponsored project.", "학생연구원으로 한동대-KAI 과제에서 영상 기반 효과 분석과 컬러웨이·패턴 구성을 개발했습니다."),
          build: p("A simulation and computer-vision comparison workflow for KF-21 camouflage proposals under varied environmental conditions.", "다양한 환경 조건에서 KF-21 위장 제안을 비교하는 시뮬레이션·컴퓨터 비전 워크플로입니다."),
          decision: p("We compared proposals across conditions instead of treating one preferred rendering as universal evidence.", "하나의 선호 렌더링을 보편적 근거로 삼지 않고 조건별로 제안을 비교했습니다."),
          validation: p("Designs were reviewed within the sponsored university-industry project. Evidence supports their inclusion in project outputs, but not operational adoption or performance.", "산학 과제 안에서 디자인을 검토했습니다. 확보된 근거는 과제 결과물 반영을 뒷받침하지만 실제 운용 채택이나 성능을 입증하지는 않습니다."),
          outcomeSystem: p("Condition-aware colorway and camouflage pattern proposals supported by a comparative analysis workflow.", "조건별 비교 분석 워크플로에 근거한 컬러웨이·위장 패턴 제안"),
          outcomeEvidence: p("The work replaced a single-scene aesthetic judgment with repeatable cross-condition comparison.", "단일 장면의 미적 판단을 반복 가능한 조건 간 비교로 전환했습니다."),
          outcomeValue: p("Selected design directions were incorporated into sponsored-project outputs; operational adoption is not claimed.", "선정된 디자인 방향은 산학 과제 결과물에 반영되었으며 실제 운용 채택은 주장하지 않습니다."),
          lesson: p("The challenge was not making a pattern look plausible. It was making its effectiveness comparable across the conditions that could invalidate it.", "핵심은 패턴을 그럴듯하게 보이게 하는 것이 아니라 효과를 무효화할 수 있는 조건 전반에서 비교 가능하게 만드는 일이었습니다.")
        }
      },
      "smart-city-tracking": {
        subtitle: p("A roadside sensing prototype linking enclosure design to an AI detection pipeline.", "하우징 설계와 AI 탐지 파이프라인을 연결한 도로변 센싱 프로토타입"),
        editorial: {
          question: p("How can roadside sensing track dense traffic while remaining buildable, protectable, and deployable as physical infrastructure?", "도로변 센싱은 제작·보호·배치 가능한 물리 인프라로 유지되면서 고밀도 교통을 어떻게 추적할 수 있을까?"),
          problem: p("Road-scene models depend on the quality and position of the sensing hardware that feeds them. Optimizing detection without the enclosure and data path leaves the system undeployable.", "도로 장면 모델은 입력 센서의 품질과 위치에 의존합니다. 하우징과 데이터 경로를 제외한 탐지 최적화만으로는 시스템을 배치할 수 없습니다."),
          responsibility: p("My documented contribution covered preprocessing, detection-flow and anchor-box tuning, IoT integration, and 3D-printed enclosure development.", "문서화된 제 기여는 전처리, 탐지 흐름·앵커박스 조정, IoT 통합, 3D 프린팅 하우징 개발입니다."),
          build: p("An integrated roadside prototype combining sensing hardware, a custom enclosure, and an object-tracking pipeline for dense traffic scenes.", "센싱 하드웨어, 맞춤형 하우징, 고밀도 교통 장면 객체 추적 파이프라인을 결합한 도로변 프로토타입입니다."),
          decision: p("We co-designed the physical and model layers so camera placement, protection, preprocessing, and detection behavior could be tuned as one system.", "카메라 배치·보호·전처리·탐지 동작을 하나의 시스템으로 조정하도록 물리 계층과 모델 계층을 함께 설계했습니다."),
          validation: p("Project records document integration of sensing, enclosure fabrication, and road-scene detection. No independent benchmark or deployment study is available.", "과제 기록은 센싱, 하우징 제작, 도로 장면 탐지의 통합을 문서화합니다. 독립 벤치마크나 배치 연구는 확보되지 않았습니다."),
          outcomeSystem: p("An IoT roadside-sensing and object-tracking research prototype with a fabricated enclosure.", "제작 하우징을 포함한 IoT 노변 센싱·객체 추적 연구 프로토타입입니다."),
          outcomeEvidence: p("Project records document end-to-end integration from physical sensing to the detection workflow; deployment performance is not claimed.", "과제 기록은 물리 센싱부터 탐지 워크플로까지의 종단 간 통합을 문서화하며 배치 성능은 주장하지 않습니다."),
          outcomeValue: p("The prototype was developed as a smart-city traffic-sensing research platform at Handong Global University.", "한동대학교에서 스마트시티 교통 센싱 연구 플랫폼으로 프로토타입을 개발했습니다."),
          lesson: p("The challenge was not tuning a detector in isolation. It was making model behavior answerable to the realities of the sensor that produces its data.", "핵심은 탐지기를 따로 조정하는 일이 아니라 모델 동작을 데이터를 만드는 센서의 현실 조건에 연결하는 일이었습니다.")
        }
      }
    },
    publications: {
      "ai-assistant-disabilities-thesis": {
        editorial: {
          question: p("When, how, and for whom does a domain-specific AI assistant reduce or reproduce accessibility barriers during mainstream gameplay?", "도메인 특화 AI 어시스턴트는 주류 게임 플레이에서 언제·어떻게·누구에게 접근성 장벽을 줄이거나 재생산하는가?"),
          gap: p("Game AI assistants are usually judged by answer quality or model capability; evidence is limited on how an overlay coexists with disabled players' assistive tools, perception, motor capacity, and live play practices.", "게임 AI 어시스턴트는 주로 답변 품질이나 모델 능력으로 평가됐으며, 오버레이가 장애인 플레이어의 보조 기술·지각·운동 능력·실제 플레이 관행과 어떻게 공존하는지에 대한 근거는 부족했습니다."),
          contribution: p("A mixed-methods account of AI-assisted Minecraft play, the Information-Perception-Execution gap framework, and three corresponding assistant roles: Explainer, Reader, and Surrogate.", "AI 보조 Minecraft 플레이의 혼합방법 연구, 정보·지각·실행 간극 프레임, 그리고 Explainer·Reader·Surrogate 세 역할을 제시합니다."),
          method: p("12 players with disabilities, ages 23-53; six configuration and early-game tasks under counterbalanced baseline and GAIA conditions; task outcomes, interaction logs, post-task questionnaires, 30-60 minute interviews, and reflexive thematic analysis. Six participants completed both questionnaires, so quantitative comparisons are exploratory.", "장애인 플레이어 12명(23~53세), 기준선과 GAIA 조건을 교차 배치한 설정·초반 플레이 과업 6개, 과업 결과·상호작용 로그·사후 설문·30~60분 인터뷰, 성찰적 주제 분석을 사용했습니다. 양 조건 설문을 완료한 6명의 정량 비교는 탐색적입니다."),
          takeaway: p("Accessibility depends less on raw AI capability than on alignment between the assistant's modalities and the player's ability to perceive and act.", "접근성은 AI의 원초적 능력보다 어시스턴트의 모달리티와 플레이어의 지각·행동 능력 간 정합성에 달려 있습니다."),
          finding1: p("Information gaps were tractable. For players who could see the overlay and execute inputs, GAIA reduced search and memory burden while preserving agency.", "정보 간극은 해결 가능했습니다. 오버레이를 보고 입력을 수행할 수 있는 플레이어에게 GAIA는 탐색·기억 부담을 줄이면서 주체성을 유지했습니다."),
          finding2: p("Perception gaps exposed output mismatch. A visual text overlay was inaccessible to blind and low-vision players and could conflict with trusted screen-reader workflows.", "지각 간극은 출력 불일치를 드러냈습니다. 시각 텍스트 오버레이는 전맹·저시력 플레이어에게 접근 불가능했고 기존 스크린 리더와 충돌할 수 있었습니다."),
          finding3: p("Execution gaps required action, not more explanation. Correct advice did not help when typing or performing the instructed sequence was itself the barrier.", "실행 간극에는 더 많은 설명이 아니라 행동 지원이 필요했습니다. 타이핑이나 지시된 동작 자체가 장벽이면 정확한 조언도 도움이 되지 않았습니다."),
          implication: p("Evaluate and orchestrate assistant roles by the active gap: explain information, translate perception, or execute only scoped player-authorized actions.", "현재 간극에 따라 역할을 평가·조율해야 합니다. 정보를 설명하고, 지각을 변환하며, 제한된 사용자 승인 행동만 실행해야 합니다."),
          scope: p("One controlled Minecraft study with a disability-community sample; the prototype lacked native screen-reader integration, voice input, and a working Surrogate. Findings do not yet generalize to mobile, novice, or high-twitch multiplayer play.", "장애 커뮤니티 표본을 사용한 통제된 Minecraft 단일 연구입니다. 프로토타입에는 네이티브 스크린 리더, 음성 입력, 작동형 Surrogate가 없었으며 모바일·초보·고속 멀티플레이로 일반화할 수 없습니다.")
        }
      },
      "toward-ludic-ai": {
        editorial: {
          question: p("How can game-playing AI be evaluated for the competence to play with others, not only for winning efficiently?", "게임 AI를 효율적 승리뿐 아니라 다른 존재와 함께 노는 역량으로 어떻게 평가할 수 있을까?"),
          gap: p("Win rate, sample efficiency, and completion metrics capture achievement but miss voluntary constraint, recognition of rule boundaries, and adjustment to a co-player's frame.", "승률·표본 효율·완료율은 성취를 포착하지만 자발적 제약, 규칙 경계 인식, 함께 노는 상대의 틀에 대한 조율을 놓칩니다."),
          contribution: p("A behavioral evaluation framework with three dimensions: intentional inefficiency, epistemic boundary awareness, and relational attunement, linked to measurable indicators and AI-alignment problems.", "의도적 비효율성, 인식론적 경계 자각, 관계적 조율의 세 차원을 행동 지표와 AI 정렬 문제에 연결한 평가 프레임을 제안합니다."),
          method: p("Theoretical synthesis and critical analysis: Suits, Sicart, Galloway, and Bateson are translated into observable behavior; benchmark cases are reread through the framework; the history and politics of win-rate measurement are examined.", "이론 종합과 비판 분석을 사용합니다. Suits·Sicart·Galloway·Bateson을 관찰 가능한 행동으로 번역하고 벤치마크 사례와 승률 측정의 역사·정치를 재검토합니다."),
          takeaway: p("An AI that only optimizes victory can be highly capable while remaining unable to recognize what makes an interaction play.", "승리만 최적화하는 AI는 매우 유능할 수 있지만 상호작용을 놀이로 만드는 조건은 인식하지 못할 수 있습니다."),
          finding1: p("Intentional inefficiency measures whether a system can accept meaningful self-constraint when efficiency is not the point of the shared activity.", "의도적 비효율성은 효율이 공동 활동의 목적이 아닐 때 시스템이 의미 있는 자기 제약을 수용하는지 측정합니다."),
          finding2: p("Epistemic boundary awareness tests behavior, not verbal disclaimers: the system must detect and change course at the gap between specified rules and intended play.", "인식론적 경계 자각은 말이 아니라 행동을 봅니다. 명시 규칙과 의도된 놀이의 간극을 감지하고 행동을 바꿔야 합니다."),
          finding3: p("Relational attunement asks whether the system adapts signals, challenge, and surplus interaction to sustain a mutually accepted play frame.", "관계적 조율은 시스템이 상호 수용된 놀이 틀을 유지하도록 신호·도전·잉여 상호작용을 조정하는지 묻습니다."),
          implication: p("Pair achievement metrics with constraint cost, boundary and reward-hacking diagnostics, relational surplus, and human judgment when evaluating cooperative game AI.", "협력형 게임 AI 평가에서 성취 지표에 제약 비용, 경계·보상 해킹 진단, 관계적 잉여, 인간 평가를 함께 사용해야 합니다."),
          scope: p("A conceptual and measurement proposal, not an empirical validation. It cannot establish inner experience, solve the politics of player labor, or prevent the framework itself from becoming a target for metric gaming.", "경험적 검증이 아닌 개념·측정 제안입니다. 내적 경험을 판정하거나 플레이어 노동의 정치 문제를 해결하거나 프레임 자체의 지표 게임화를 막을 수 없습니다.")
        }
      },
      "game-accessibility-preferences": {
        editorial: {
          question: p("How do disabled players' preferences for AI support differ by support type and intervention timing, and how are those preferences related to functional barriers?", "장애인 플레이어의 AI 지원 선호는 지원 유형·개입 시점에 따라 어떻게 달라지며 기능적 장벽과 어떤 관련이 있는가?"),
          gap: p("Accessibility is often designed from diagnosis labels or feature availability, with limited quantitative evidence separating setup, in-play guidance, assistive recommendation, and timing or reflection.", "접근성은 진단 범주나 기능 제공 여부를 중심으로 설계되어 왔으며, 초기 설정·플레이 중 안내·보조 추천·개입 시점과 성찰을 구분한 정량 근거는 부족했습니다."),
          contribution: p("A 112-person exploratory map of disability identity, functional barriers, play motivations, and four design-oriented AI preference units, with multiple-comparison correction.", "장애인 플레이어 112명의 장애 정체성·기능적 장벽·플레이 동기·4개 AI 선호 단위를 다중비교 보정과 함께 탐색적으로 지도화했습니다."),
          method: p("Online survey of 112 players with disabilities; descriptive analysis, identity-barrier association tests, maximum-likelihood exploratory factor analysis with oblimin rotation, Friedman and Holm comparisons, Spearman correlations, multiple regression, and Benjamini-Hochberg FDR correction.", "장애인 플레이어 112명 온라인 설문, 기술통계, 정체성-장벽 연관 검정, 최대우도·oblimin 탐색적 요인분석, Friedman·Holm 비교, Spearman 상관, 다중회귀, Benjamini-Hochberg FDR 보정을 사용했습니다."),
          takeaway: p("Players broadly welcomed AI support, but the strongest preference was for setup and automation, and barrier-specific relationships were more stable than motivation-based ones.", "플레이어는 전반적으로 AI 지원을 수용했지만 초기 설정·자동화 선호가 가장 높았고, 동기보다 장벽별 관련성이 더 안정적이었습니다."),
          finding1: p("Identity and barrier partly overlapped but were not interchangeable. Functional difficulties extended beyond the corresponding diagnosis categories.", "정체성과 장벽은 부분적으로 겹쳤지만 동일하지 않았고, 기능적 어려움은 대응 진단 범주보다 넓게 나타났습니다."),
          finding2: p("Setup and Automation ranked highest at M=6.31/7, ahead of Assistive Recommendation (5.93), In-Play Guidance (5.92), and Timing and Reflection (5.75).", "초기 설정·자동화는 평균 6.31/7로 보조 추천 5.93, 플레이 중 안내 5.92, 시점·성찰 5.75보다 높았습니다."),
          finding3: p("Visual barriers correlated positively with setup support and motor barriers with assistive recommendation; hearing barriers correlated negatively with both. Individual regression coefficients did not survive FDR correction.", "시각 장벽은 설정 지원, 운동 장벽은 보조 추천과 정적 관련을 보였고 청각 장벽은 두 유형과 부적 관련을 보였습니다. 개별 회귀계수는 FDR 보정 후 유의성을 유지하지 못했습니다."),
          implication: p("Design support as a configurable portfolio organized by barrier, timing, and context, with setup labor treated as a first-class accessibility problem.", "장벽·시점·맥락별로 조절 가능한 지원 포트폴리오를 설계하고 초기 설정 노동을 핵심 접근성 문제로 다뤄야 합니다."),
          scope: p("Exploratory, self-report, cross-sectional data from a Korean sample; several outcomes were single items and barriers were binary. Results identify design hypotheses, not universal preference laws.", "한국 표본의 탐색적·자기보고·횡단 자료이며 일부 결과는 단일 문항, 장벽은 이분형입니다. 보편 법칙이 아니라 설계 가설을 제시합니다.")
        }
      },
      "gaia-design-principles": {
        editorial: {
          question: p("When do hardcore players with disabilities perceive a game AI assistant as useful or disruptive, and what ethical boundaries preserve agency and accomplishment?", "하드코어 장애인 플레이어는 게임 AI 어시스턴트를 언제 유용하거나 방해된다고 느끼며 주체성과 성취를 지키는 윤리적 경계는 무엇인가?"),
          gap: p("Assistive AI research offers accessibility functions, but provides little evidence about timing, flow, customization, and fair assistance inside a time-critical game loop.", "보조 AI 연구는 접근성 기능을 제안하지만 시간 압박이 있는 게임 루프에서 개입 시점·몰입·개인화·공정한 조력에 대한 근거가 부족했습니다."),
          contribution: p("Two empirically grounded principles: Dual Context Adaptation for protecting flow, and an Ethical Framework for Agency and Accomplishment for constraining assistance.", "몰입 보호를 위한 Dual Context Adaptation과 조력 범위를 제한하는 Ethical Framework for Agency and Accomplishment라는 두 실증 기반 원칙을 제시합니다."),
          method: p("Ethics-approved semi-structured interviews with seven professional accessibility playtesters who averaged 21 hours of play per week; a Discord-based GAIA prototype shown in a high-concentration fighting-game context; reflexive thematic analysis, audit trail, and participant feedback on themes.", "주당 평균 21시간 플레이하는 전문 접근성 플레이테스터 7명 대상 윤리 승인 반구조화 인터뷰, 고집중 격투게임 맥락의 Discord 기반 GAIA 프로토타입, 성찰적 주제 분석·감사 추적·참여자 주제 피드백을 사용했습니다."),
          takeaway: p("The best assistant does not maximize intervention. It senses both player and game state, protects flow, and leaves meaningful accomplishment with the player.", "최선의 어시스턴트는 개입을 극대화하지 않습니다. 플레이어와 게임 상태를 함께 감지하고 몰입을 보호하며 의미 있는 성취를 플레이어에게 남깁니다."),
          finding1: p("Timing divided acceptance. Participants welcomed support during onboarding, settings, and discovery, but rejected interruption during high-concentration play.", "개입 시점이 수용을 갈랐습니다. 온보딩·설정·탐색 단계 지원은 환영했지만 고집중 플레이 중 방해는 거부했습니다."),
          finding2: p("A centralized guide had value, but verbose responses, limited customization, and weak visual cues made the prototype itself a source of effort.", "중앙화된 안내는 가치가 있었지만 장황한 답변, 제한된 개인화, 약한 시각 단서가 프로토타입 자체를 새로운 노력으로 만들었습니다."),
          finding3: p("Players accepted assistance that restores access while retaining decisions and challenge; automation became ethically suspect when it displaced authorship of the achievement.", "플레이어는 결정과 도전을 남겨둔 채 접근을 회복하는 지원을 수용했지만 성취의 주체를 대체하는 자동화는 윤리적으로 경계했습니다."),
          implication: p("Sense dual context, adapt timing and modality, make assistance levels negotiable, and constrain automation around player-defined goals and fair play.", "이중 맥락을 감지하고 시점·모달리티를 조절하며 조력 수준을 협상 가능하게 하고 사용자 정의 목표와 공정한 플레이를 중심으로 자동화를 제한해야 합니다."),
          scope: p("Seven expert players recruited through one professional program; the external Discord prototype was a design stimulus, not a fully integrated or summatively evaluated in-game system.", "한 전문 프로그램에서 모집한 전문가 7명 표본이며 외부 Discord 프로토타입은 완전 통합·총괄 평가된 게임 내 시스템이 아니라 설계 자극물이었습니다.")
        }
      },
      "game-ai-assistant-barriers": {
        editorial: {
          question: p("What functional barriers do players with different disabilities encounter, and what do they require from a game AI assistant?", "서로 다른 장애를 가진 플레이어가 경험하는 기능적 장벽은 무엇이며 게임 AI 어시스턴트에 무엇을 요구하는가?"),
          gap: p("Diagnosis-based settings and single-modality AI aids cannot capture the mismatch between a game's demands and a player's remaining abilities across a live play journey.", "진단명 기반 설정과 단일 모달리티 AI 보조는 실제 플레이 여정에서 게임 요구와 플레이어 잔존 능력 사이의 불일치를 충분히 포착하지 못합니다."),
          contribution: p("A barrier-centered requirements map and three-level design framework: To Play for basic access, Easy Play for reduced load, and Better Play for personalized strategy and experience.", "장벽 중심 요구사항 지도와 기본 접근의 To Play, 부담 감소의 Easy Play, 개인화된 전략·경험의 Better Play 3단계 프레임을 제시합니다."),
          method: p("Ethics-approved online survey of 112 players with disabilities; five functional-barrier domains; open-ended AI support preferences; inductive thematic coding by disability group and organization of requirements into three accessibility levels.", "장애인 플레이어 112명 대상 윤리 승인 온라인 설문, 5개 기능적 장벽 영역, 개방형 AI 지원 선호, 장애 유형별 귀납적 주제 코딩과 3개 접근성 수준 구조화를 사용했습니다."),
          takeaway: p("Accessible game AI must filter and translate the right information, adapt its intrusiveness to context, and let the player choose how much help is allowed.", "접근 가능한 게임 AI는 필요한 정보만 선별·변환하고 맥락에 따라 침습도를 조절하며 조력 강도를 플레이어가 선택하게 해야 합니다."),
          finding1: p("Disability category did not determine one fixed barrier. Visual, auditory, motor, cognitive, and communication difficulties crossed diagnostic boundaries and combined differently by context.", "장애 범주는 하나의 고정 장벽을 결정하지 않았습니다. 시각·청각·운동·인지·의사소통 어려움은 진단 경계를 넘어 맥락별로 다르게 결합했습니다."),
          finding2: p("To Play requirements centered on modality conversion and alternative input: game-state narration, spatial audio translated to visual or haptic form, voice or gaze input, and selectable communication responses.", "To Play 요구는 게임 상태 음성화, 공간 음향의 시각·촉각 변환, 음성·시선 입력, 선택형 의사소통 답변 등 모달리티 변환과 대체 입력에 집중됐습니다."),
          finding3: p("Easy and Better Play introduced a tension: setup automation, summaries, navigation, and strategy were desired, but high-intensity intervention and over-automation could increase load or erode challenge.", "Easy·Better Play에서는 설정 자동화·요약·길 찾기·전략 지원을 원했지만 고강도 상황 개입과 과도한 자동화는 부담을 높이거나 도전을 훼손할 수 있었습니다."),
          implication: p("Build a context filter, multimodal output and input, adaptive intervention timing, and an explicit player-controlled assistance ladder from hint to authorized execution.", "맥락 필터, 멀티모달 입출력, 적응형 개입 시점, 힌트부터 승인 실행까지 사용자 통제 조력 단계를 설계해야 합니다."),
          scope: p("This paper shares the same N=112 survey lineage as the accessibility-preferences paper and is not an independent dataset. Online self-report may overrepresent connected communities; cognitive load was subjective, genre was not modeled, and the principles require prototype and usability validation.", "이 논문은 접근성 선호 논문과 동일한 N=112 설문 계보를 공유하며 독립 데이터셋이 아닙니다. 온라인 자기보고는 연결된 커뮤니티를 과대표할 수 있고 인지 부하는 주관적이며 장르를 모델링하지 않았으므로 원칙에 대한 프로토타입·사용성 검증이 필요합니다.")
        }
      },
      "press-start-to-continue": {
        editorial: {
          question: p("How do hardcore players with disabilities iteratively adapt when gameplay difficulties persist beyond the available accessibility features?", "하드코어 장애인 플레이어는 기존 접근성 기능으로 해결되지 않는 어려움에 반복적으로 어떻게 적응하는가?"),
          gap: p("Prior work identifies individual tools and barriers, but offers limited cross-disability evidence on how coping strategies and personal, social, cultural, and game resources evolve together over time.", "선행연구는 개별 도구와 장벽을 다루지만 대처 전략과 개인·사회·문화·게임 자원이 시간에 따라 함께 진화하는 과정을 장애 전반에서 설명한 근거는 부족했습니다."),
          contribution: p("A three-theme, ten-subtheme account of an iterative adaptation loop linking gameplay difficulty, coping strategies, available resources, and the decision to continue or leave a game.", "게임 어려움, 대처 전략, 가용 자원, 지속 또는 이탈 결정을 연결하는 3개 주제·10개 하위주제의 반복 적응 모델을 제시합니다."),
          method: p("Semi-structured interviews with five hardcore players with disabilities; disability and play-history presurvey; inductive thematic analysis with iterative cross-checking against participant accounts.", "하드코어 장애인 플레이어 5명 반구조화 인터뷰, 장애·플레이 이력 사전 설문, 참여자 진술과 반복 교차검토한 귀납적 주제 분석을 사용했습니다."),
          takeaway: p("Players persist when they can iteratively combine personal strategy with game, social, and cultural resources; when the environment cannot be modified, even expert players leave.", "플레이어는 개인 전략을 게임·사회·문화 자원과 반복적으로 결합할 수 있을 때 지속하며 환경을 수정할 수 없으면 숙련자도 떠납니다."),
          finding1: p("Coping was active and iterative: practice, custom settings, assistive devices, accessibility tools, and social play styles were refined through trial and error.", "대처는 능동적·반복적이었습니다. 연습, 맞춤 설정, 보조기기, 접근성 도구, 사회적 플레이 스타일을 시행착오로 개선했습니다."),
          finding2: p("Social resources could turn a barrier into a sustainable strategy. Real-time directions from friends let a low-vision participant continue complex raids.", "사회적 자원은 장벽을 지속 가능한 전략으로 바꿀 수 있었습니다. 친구의 실시간 방향 안내는 저시력 참여자가 복잡한 레이드를 지속하게 했습니다."),
          finding3: p("When game-environment resources were absent, adaptation reached a ceiling. A player with hearing loss left audio-dependent FPS play despite extensive personal workarounds.", "게임 환경 자원이 없으면 적응은 한계에 도달했습니다. 청각장애 참여자는 다양한 개인 전략에도 음향 의존 FPS를 떠났습니다."),
          implication: p("Design AI to help players discover, combine, and refine resources, not to replace the experimentation and challenge they value.", "AI는 플레이어가 자원을 발견·조합·개선하도록 도와야 하며 플레이어가 가치 있게 여기는 실험과 도전을 대체해서는 안 됩니다."),
          scope: p("Five self-report interviews, skewed toward hearing disabilities and hardcore multiplayer play; players who had already stopped gaming were not represented.", "자기보고 인터뷰 5명으로 청각장애와 하드코어 멀티플레이에 치우쳤으며 게임을 이미 중단한 사람은 포함되지 않았습니다.")
        }
      },
      "game-npc-identity": {
        editorial: {
          question: p("How has the identity and role of the game NPC changed, and what should define an NPC when generative AI makes it more adaptive and autonomous?", "게임 NPC의 정체성과 역할은 어떻게 변해왔으며 생성형 AI가 적응성과 자율성을 높일 때 NPC를 무엇으로 정의해야 하는가?"),
          gap: p("NPCs are commonly described by scripted functions, while newer systems blur the boundary between background object, narrative actor, simulated agent, and co-player.", "NPC는 주로 스크립트 기능으로 설명돼 왔지만 최신 시스템은 배경 객체·서사 행위자·시뮬레이션 에이전트·협력 플레이어의 경계를 흐립니다."),
          contribution: p("A historical and conceptual account of NPC roles and a future-facing lens organized around autonomous goals, learning and adaptation, and cooperative relationship with the player.", "NPC 역할의 역사·개념 분석과 자율적 목표, 학습·적응, 플레이어와의 협력 관계를 중심으로 한 미래 관점을 제시합니다."),
          method: p("Conceptual conference presentation using selected game examples and eight cited sources; historical synthesis and design reflection with no systematic search, corpus-selection protocol, or user study.", "선별한 게임 사례와 인용 문헌 8편을 활용한 개념적 학술대회 발표입니다. 체계적 검색, 코퍼스 선정 절차, 사용자 연구 없이 역사적 종합과 설계 성찰을 수행했습니다."),
          takeaway: p("A more intelligent NPC is not automatically a better NPC; its autonomy must strengthen the player's play rather than compete with authorship of it.", "더 지능적인 NPC가 자동으로 더 좋은 NPC는 아닙니다. NPC의 자율성은 플레이어의 플레이를 강화해야지 그 주체성과 경쟁해서는 안 됩니다."),
          finding1: p("Past NPC identity was anchored in stable scripted functions such as opposition, guidance, exposition, and world population.", "과거 NPC의 정체성은 적대, 안내, 설명, 세계 구성 같은 안정적 스크립트 기능에 기반했습니다."),
          finding2: p("Contemporary NPCs increasingly maintain memory, contextual dialogue, and adaptive behavior, shifting from fixed content toward ongoing relationship.", "현재 NPC는 기억, 맥락 대화, 적응 행동을 갖추며 고정 콘텐츠에서 지속 관계로 이동하고 있습니다."),
          finding3: p("Future NPC design must negotiate autonomous goals, learning, cooperation, and the risk that agent initiative reduces player control or narrative coherence.", "미래 NPC 설계는 자율 목표·학습·협력과 함께 에이전트 주도성이 플레이어 통제나 서사 정합성을 줄이는 위험을 다뤄야 합니다."),
          implication: p("Constrain AI-NPC autonomy within the game's rules and identity, prioritize cooperation that strengthens player agency, and evaluate effects on enjoyment and control.", "AI NPC의 자율성을 게임 규칙과 정체성 안에 제한하고, 플레이어 주체성을 강화하는 협력을 우선하며, 즐거움과 통제감에 미치는 영향을 평가해야 합니다."),
          scope: p("A conceptual slide-based conference presentation built from selected examples and eight references, not a systematic review or user study; its design claims require empirical validation in concrete games.", "선별 사례와 문헌 8편으로 구성한 슬라이드 기반 개념 발표이며 체계적 문헌고찰이나 사용자 연구가 아닙니다. 설계 주장은 구체적인 게임에서 실증 검증이 필요합니다.")
        }
      },
      "rag-enhanced-gaia": {
        editorial: {
          question: p("Can a RAG-enhanced LLM chatbot give beginners accurate, actionable help for a complex fighting game?", "RAG 적용 LLM 챗봇은 복잡한 격투게임 초보자에게 정확하고 실행 가능한 도움을 제공할 수 있는가?"),
          gap: p("Game knowledge is fragmented across tutorials, communities, and media, while general LLMs can hallucinate, become outdated, and ignore the player's immediate game context.", "게임 지식은 튜토리얼·커뮤니티·미디어에 흩어져 있고 일반 LLM은 환각·지식 노후화·즉시 게임 맥락 누락의 문제가 있습니다."),
          contribution: p("A Street Fighter 6 Discord assistant combining a curated database, FAISS retrieval, GPT-4 Turbo, and text, voice, image, and video support, plus an answer-level evaluation.", "정제 DB, FAISS 검색, GPT-4 Turbo, 텍스트·음성·이미지·영상 지원을 결합한 Street Fighter 6 Discord 어시스턴트와 답변 단위 평가를 제시합니다."),
          method: p("Web-crawled and manually curated Street Fighter 6 knowledge; 19 researcher-authored beginner questions and expected answers; ROUGE-1 lexical overlap and RDASS semantic similarity; qualitative inspection of top and bottom responses in live game context.", "웹 크롤링·수기 정제 Street Fighter 6 지식, 연구진이 만든 초보 질문·기대답변 19개, ROUGE-1 단어 중복과 RDASS 의미 유사도, 상·하위 답변의 실제 게임 맥락 질적 검토를 사용했습니다."),
          takeaway: p("RAG made explicit steps and button inputs useful, but retrieval similarity was not the same as gameplay correctness.", "RAG는 명시적 절차와 버튼 입력에 유용했지만 검색·문장 유사도는 실제 게임 정답성과 같지 않았습니다."),
          finding1: p("Across 19 answers, mean ROUGE-1 was 0.210 and mean RDASS was 0.214; direct action sequences and exact inputs formed the strongest responses.", "19개 답변의 평균 ROUGE-1은 0.210, RDASS는 0.214였고 직접 행동 절차와 정확한 입력 질문에서 가장 강했습니다."),
          finding2: p("High text similarity could still hide a wrong in-game path, showing a gap between automatic metrics and situated correctness.", "텍스트 유사도가 높아도 게임 안에서는 잘못된 경로일 수 있어 자동 지표와 상황적 정답성의 간극을 드러냈습니다."),
          finding3: p("Failures included missing near-match records, irrelevant elaboration, and hallucinated move information despite a domain database.", "도메인 DB가 있어도 유사 기록 누락, 불필요한 부연, 기술 정보 환각이 발생했습니다."),
          implication: p("Game-AI teams should use executable task tests, domain-expert review, and novice sessions as primary quality gates, treating lexical and semantic scores as diagnostic signals rather than release criteria.", "게임 AI 팀은 실행 가능한 과업 검사, 도메인 전문가 검토, 초보 사용자 세션을 핵심 품질 게이트로 사용하고, 어휘·의미 점수는 출시 기준이 아닌 진단 신호로 다뤄야 합니다."),
          scope: p("One game and 19 researcher-created question-answer pairs; no novice participant study, and the automatic metrics were demonstrably incomplete proxies for correctness.", "한 게임과 연구진 생성 질의응답 19개를 사용했으며 초보 참여자 연구가 없고 자동 지표는 정답성의 불완전한 대리변수였습니다.")
        }
      },
      "pleth-ethical-llm": {
        editorial: {
          question: p("Can cultural dimensions be embedded in LLM prompts so ethical decisions reflect specific cultural contexts without losing coherence and ethical acceptability?", "문화 차원을 LLM 프롬프트에 삽입해 정합성과 윤리적 수용성을 잃지 않으면서 문화별 윤리 판단을 반영할 수 있는가?"),
          gap: p("LLMs can describe cultural values, but static evaluations weakly connect cultural profiles to behavior in complex moral decisions.", "LLM은 문화 가치를 설명할 수 있지만 정적 평가는 문화 프로필을 복잡한 도덕 판단 행동과 약하게 연결합니다."),
          contribution: p("PLETH, a few-shot prompting and LLM-as-a-judge framework combining twelve Hofstede-derived profiles, nine Moral Machine trolley scenarios, and four evaluation criteria.", "Hofstede 기반 12개 프로필, Moral Machine 트롤리 딜레마 9개, 4개 평가 기준을 결합한 few-shot·LLM-as-a-judge 프레임 PLETH를 제안합니다."),
          method: p("GPT-4o generated decisions for one neutral control and twelve cultural profiles across nine scenarios; another LLM scored coherence, ethical acceptability, cultural relevance, and consistency from 1 to 5.", "GPT-4o가 중립 대조군 1개와 문화 프로필 12개로 9개 시나리오를 판단하고 다른 LLM이 정합성·윤리적 수용성·문화 관련성·일관성을 1~5점으로 평가했습니다."),
          takeaway: p("Cultural prompting improved cultural relevance and consistency, but made visible a real tension between context-sensitive norms and universal ethical principles.", "문화 프롬프팅은 문화 관련성과 일관성을 높였지만 맥락적 규범과 보편 윤리 원칙의 실제 긴장을 드러냈습니다."),
          finding1: p("Culturally embedded profiles generally scored high in coherence and cultural relevance; the neutral profile was weakest on cultural relevance.", "문화 삽입 프로필은 대체로 정합성과 문화 관련성이 높았고 중립 프로필은 문화 관련성이 가장 낮았습니다."),
          finding2: p("Most embedded profiles maintained consistency around 4-5, while the control varied more on culturally charged scenarios.", "대부분의 문화 프로필은 일관성 4~5 수준을 유지했고 대조군은 문화적으로 민감한 시나리오에서 더 흔들렸습니다."),
          finding3: p("Some strongly framed profiles scored lower on ethical acceptability when cultural priorities conflicted with generalized human-rights norms; the control often scored higher there.", "강한 문화 프로필 일부는 문화 우선순위가 일반적 인권 규범과 충돌할 때 윤리 수용성이 낮았고 이 지점에서는 대조군이 더 높았습니다."),
          implication: p("Culturally aware ethical systems need independent human review and an explicit method for negotiating cultural specificity against non-negotiable safeguards.", "문화 인식 윤리 시스템에는 독립적 인간 검토와 문화 특수성을 비협상 안전 원칙과 조율하는 명시적 방법이 필요합니다."),
          scope: p("LLMs both decided and judged, creating shared-model bias; few-shot prompting was basic; trolley dilemmas simplify real ethics; no human evaluator or real-world outcome was included.", "LLM이 판단과 평가를 모두 수행해 공유 모델 편향이 있고 few-shot 기법은 기초적이며 트롤리 딜레마는 실제 윤리를 단순화합니다. 인간 평가자나 실제 결과가 없습니다.")
        }
      },
      "gaia-service-framework": {
        editorial: {
          question: p("How can a game AI assistant support both problem solving and emotion regulation when players struggle during play?", "플레이어가 게임 중 어려움을 겪을 때 게임 AI 어시스턴트는 문제 해결과 감정 조절을 함께 어떻게 지원할 수 있는가?"),
          gap: p("Existing game assistants emphasize information and technique while often ignoring frustration, conflict, and other affective barriers that determine whether play continues.", "기존 게임 어시스턴트는 정보·기술 지원에 집중하고 플레이 지속을 좌우하는 좌절·갈등 같은 정서 장벽을 놓칩니다."),
          contribution: p("A hybrid GAIA service framework and UX scenario that routes player difficulty to either a problem-solving strategy or an emotion-regulation strategy using game context and dialogue state.", "게임 맥락과 대화 상태로 어려움을 문제 해결 전략 또는 감정 조절 전략으로 라우팅하는 하이브리드 GAIA 서비스 프레임과 UX 시나리오를 제시합니다."),
          method: p("Conceptual architecture and scenario design: an overlaid chat interface, real-time gameplay context, LLM classification, separate strategy databases, and long-term memory for high-intensity emotional episodes.", "개념 아키텍처·시나리오 설계로 오버레이 채팅, 실시간 게임 맥락, LLM 분류, 분리된 전략 DB, 고강도 감정 에피소드 장기 기억을 구성했습니다."),
          takeaway: p("Useful game assistance must address both the obstacle and the player's state, then route each to a different kind of support.", "유용한 게임 지원은 장애물과 플레이어 상태를 함께 다루고 각각 다른 지원 경로로 보내야 합니다."),
          finding1: p("Information and skill difficulties require settings, rules, or strategy retrieval grounded in the current game context.", "정보·기술 어려움에는 현재 게임 맥락에 근거한 설정·규칙·전략 검색이 필요합니다."),
          finding2: p("Emotion-regulation difficulty requires a separate response path for labeling, expressing, and regulating affect rather than another gameplay hint.", "감정 조절 어려움에는 또 다른 게임 힌트가 아니라 감정 구체화·표현·조절을 위한 별도 경로가 필요합니다."),
          finding3: p("The proposed long-term-memory component could personalize later support when similar difficulty patterns recur; this remains an unimplemented design hypothesis.", "제안한 장기기억 구성요소는 유사한 어려움이 반복될 때 후속 지원을 개인화할 수 있으나, 아직 구현되지 않은 설계 가설입니다."),
          implication: p("Architect affective routing and memory explicitly instead of treating every difficulty as an information-retrieval request.", "모든 어려움을 정보 검색 요청으로 보지 말고 정서 라우팅과 기억을 명시적으로 설계해야 합니다."),
          scope: p("A two-page conceptual conference paper with no implemented-system or participant evaluation; the authors call for a working prototype, user study, and emotion-strategy database.", "구현 시스템이나 참여자 평가가 없는 2쪽 개념 학술대회 논문이며 작동형 프로토타입·사용자 연구·감정 전략 DB가 후속 과제입니다.")
        }
      },
      "llm-npc-scoping-review": {
        editorial: {
          question: p("What technical, design, and evaluation challenges define the emerging use of LLMs for game NPCs?", "게임 NPC에 LLM을 활용하는 초기 연구를 규정하는 기술·설계·평가 과제는 무엇인가?"),
          gap: p("Early LLM-NPC demonstrations were fragmented and realism-led, without consolidated guidance on system constraints, the LLM's game function, or what should be evaluated.", "초기 LLM-NPC 시연은 분절되고 현실성에 치우쳐 시스템 제약, LLM의 게임 기능, 평가 대상에 대한 종합 지침이 부족했습니다."),
          contribution: p("A scoping review that organizes six 2023 studies into technical, design, and evaluation challenges and translates them into a research agenda.", "2023년 연구 6편을 기술·설계·평가 과제로 구조화하고 연구 의제로 전환한 주제범위 문헌고찰입니다."),
          method: p("Six 2023 papers involving implemented game NPCs and interaction strategies were selected and coded through a scoping-review approach.", "구현된 게임 NPC와 상호작용 전략을 다룬 2023년 논문 6편을 선정해 주제범위 문헌고찰 방식으로 코딩했습니다."),
          takeaway: p("Adding an LLM is not a design rationale: the NPC's game role, latency and memory constraints, and target experience must be explicit.", "LLM을 추가하는 것 자체는 설계 근거가 아닙니다. NPC의 게임 역할, 지연·기억 제약, 목표 경험을 명시해야 합니다."),
          finding1: p("Technical challenges centered on hallucination, memory and capacity limits, and response latency.", "기술 과제는 환각, 기억·용량 한계, 응답 지연에 집중됐습니다."),
          finding2: p("Design challenges included realism bias, an unclear functional role for the LLM, and weak selection of data for persona, knowledge, and context.", "설계 과제는 현실성 편향, 불분명한 LLM 기능 배치, 페르소나·지식·맥락 데이터 선택의 취약성이었습니다."),
          finding3: p("Evaluation lacked game-specific UX studies, concrete targets, and measures of NPC capability or believability.", "평가는 게임 특화 UX 연구, 구체적 평가 대상, NPC 역량·신뢰성 지표가 부족했습니다."),
          implication: p("Define the NPC's function first, engineer memory and latency around it, then evaluate player experience and capability in an actual game loop.", "NPC 기능을 먼저 정의하고 이에 맞춰 기억·지연을 설계한 뒤 실제 게임 루프에서 플레이어 경험과 역량을 평가해야 합니다."),
          scope: p("Only six papers from one fast-moving publication year; the authors identify the evidence base as insufficient and call for more empirical work.", "빠르게 변하는 한 해의 논문 6편만 다뤘으며 근거 기반이 부족해 추가 실증 연구가 필요합니다.")
        }
      },
      "hybe-multilabel-review": {
        editorial: {
          question: p("How can HYBE's multi-label structure be understood as a decentralized post-M&A management model, and where might that model transfer?", "HYBE의 멀티레이블 구조를 분산형 인수합병 후 경영 모델로 어떻게 이해하며 어디까지 전이할 수 있는가?"),
          gap: p("The multi-label model is visible as an industry strategy, but its organizational logic, flexibility, and transferability had not been systematically framed in the accessible conference record.", "멀티레이블 모델은 산업 전략으로 알려졌지만 조직 논리·유연성·전이 가능성을 체계적으로 구조화한 접근은 제한적이었습니다."),
          contribution: p("A technical literature-review framing of HYBE's independent-label system as a case of decentralized management and differentiated creative strategy.", "HYBE 독립 레이블 체계를 분산 경영과 차별화된 창작 전략 사례로 보는 기술적 문헌고찰 프레임을 제시합니다."),
          method: p("Conference abstract describing a focused technical literature review of HYBE's multi-label management structure; the available record does not report databases, corpus size, or an appraisal protocol.", "HYBE 멀티레이블 경영 구조에 초점을 둔 기술적 문헌고찰 초록이며 확보 자료에는 DB·문헌 수·평가 절차가 보고되지 않았습니다."),
          takeaway: p("Independent labels can preserve distinct artist strategies and identities inside a shared corporate portfolio, but that premise is not yet a validated cross-industry result.", "독립 레이블은 공동 기업 포트폴리오 안에서 서로 다른 아티스트 전략과 정체성을 유지할 수 있지만 산업 전반의 검증 결과는 아닙니다."),
          finding1: p("The structure separates label-level creative identity from group-level ownership and resource coordination.", "구조는 레이블 단위 창작 정체성을 그룹 단위 소유·자원 조정과 분리합니다."),
          finding2: p("Decentralization is presented as a mechanism for managerial and market flexibility after acquisition.", "분산화는 인수 이후 경영·시장 유연성을 위한 메커니즘으로 제시됩니다."),
          finding3: p("Transfer to other sectors remains a proposition because the abstract does not report comparative cases or outcome measures.", "비교 사례나 결과 지표가 보고되지 않아 타 산업 전이는 제안 수준에 머뭅니다."),
          implication: p("Use the case to generate testable questions about autonomy, shared infrastructure, and post-M&A coordination rather than as proof of one optimal structure.", "단일 최적 구조의 증거가 아니라 자율성·공유 인프라·인수 후 조정에 관한 검증 가능한 질문을 만드는 사례로 사용해야 합니다."),
          scope: p("One-company, one-page conference abstract with no reproducible search protocol, comparison group, or causal outcome evidence.", "한 기업을 다룬 1쪽 학술대회 초록으로 재현 가능한 검색 절차·비교군·인과 결과 근거가 없습니다.")
        }
      },
      "bighit-to-hybe": {
        editorial: {
          question: p("How did the tone and strategic vocabulary of Korean news coverage change as BigHit evolved into HYBE?", "BigHit이 HYBE로 전환하는 동안 한국 뉴스 보도의 감성과 전략 언어는 어떻게 변했는가?"),
          gap: p("Corporate-transition narratives are often retrospective and selective; large-scale longitudinal news analysis can reveal how sentiment and strategic themes moved across the transition.", "기업 전환 서사는 회고적·선택적인 경우가 많으며 대규모 장기 뉴스 분석은 전환 전후 감성과 전략 주제의 변화를 드러낼 수 있습니다."),
          contribution: p("A longitudinal news-data analysis connecting sentiment and keyword patterns to the strategic transition from BigHit to HYBE.", "감성·키워드 패턴을 BigHit에서 HYBE로의 전략 전환과 연결한 장기 뉴스 데이터 분석입니다."),
          method: p("45,393 Korean news articles from 2005-2024; lexicon-based analysis plus NLTK/TextBlob sentiment and keyword analysis; comparison of BigHit and HYBE eras.", "2005~2024년 한국 뉴스 45,393건, 사전 기반 분석과 NLTK/TextBlob 감성·키워드 분석, BigHit·HYBE 시기 비교를 사용했습니다."),
          takeaway: p("HYBE's expansion broadened the strategic story, but average news sentiment was lower and more exposed to conflict than in the BigHit era.", "HYBE의 확장은 전략 서사를 넓혔지만 평균 뉴스 감성은 BigHit 시기보다 낮고 갈등에 더 노출됐습니다."),
          finding1: p("Mean sentiment was 0.0243 in the BigHit era and 0.0076 in the HYBE era.", "평균 감성은 BigHit 시기 0.0243, HYBE 시기 0.0076이었습니다."),
          finding2: p("Growth and success language was associated with more positive BigHit-era coverage.", "성장·성공 언어는 BigHit 시기의 더 긍정적인 보도와 연결됐습니다."),
          finding3: p("Innovation supported HYBE's positive narrative, while internal conflict reduced sentiment.", "혁신은 HYBE의 긍정 서사를 지지했지만 내부 갈등은 감성을 낮췄습니다."),
          implication: p("Track strategic transition with both innovation signals and organizational-conflict indicators; corporate scale alone does not secure a positive public narrative.", "전략 전환을 혁신 신호와 조직 갈등 지표로 함께 추적해야 하며 기업 규모만으로 긍정적 공론을 확보할 수는 없습니다."),
          scope: p("News sentiment is a proxy for media framing, not stakeholder attitude or business performance; results depend on corpus construction and text-analysis choices.", "뉴스 감성은 미디어 프레이밍의 대리변수이지 이해관계자 태도나 경영 성과가 아니며 결과는 코퍼스 구성과 텍스트 분석 선택에 의존합니다.")
        }
      },
      "vr-environmental-awareness": {
        editorial: {
          question: p("How do positive and negative VR content, their sequence, and individual versus cooperative play shape environmental awareness?", "긍정·부정 VR 콘텐츠와 제시 순서, 개인·협력 플레이가 환경 인식에 어떤 영향을 주는가?"),
          gap: p("VR environmental studies suggest attitude effects, but rarely separate content valence from social play format and presentation order.", "VR 환경 연구는 태도 효과를 제시하지만 콘텐츠 정서가, 사회적 플레이 방식, 제시 순서를 분리해 다룬 경우는 드뭅니다."),
          contribution: p("A four-condition study showing that environmental-awareness outcomes depend on the interaction between content sequence and individual or team-based play.", "환경 인식 결과가 콘텐츠 순서와 개인·팀 플레이의 결합에 따라 달라짐을 보인 4조건 연구입니다."),
          method: p("65 university students ages 19-27; a projection-based VR recycling game using 12 OptiTrack Prime17W cameras; individual or three-person cooperative play with positive and negative content sequences; pre, mid, and post surveys; paired and independent-sample t-tests.", "19~27세 대학생 65명, OptiTrack Prime17W 12대 기반 프로젝션 VR 재활용 게임, 개인 또는 3인 협력 플레이와 긍정·부정 콘텐츠 순서, 사전·중간·사후 설문, 대응·독립표본 t검정을 사용했습니다."),
          takeaway: p("Environmental impact in VR came from the sequence and social form of play, not from positive or negative content alone.", "VR의 환경 인식 효과는 긍정·부정 콘텐츠 하나가 아니라 제시 순서와 사회적 플레이 형식에서 나왔습니다."),
          finding1: p("Positive content in individual play increased perceived importance of recycling.", "개인 플레이의 긍정 콘텐츠는 재활용 중요성 인식을 높였습니다."),
          finding2: p("Positive team play and negative individual play increased perceived seriousness of pollution, showing different routes to concern.", "긍정 팀 플레이와 부정 개인 플레이는 오염 심각성 인식을 높여 서로 다른 경로의 우려 형성을 보였습니다."),
          finding3: p("In individual play, a positive-to-negative sequence increased environmental interest, indicating that order mattered.", "개인 플레이에서 긍정 후 부정 순서는 환경 관심을 높여 제시 순서의 중요성을 보였습니다."),
          implication: p("Design environmental games as an affective and social sequence: select not only what players see, but when and with whom they encounter it.", "환경 게임을 정서적·사회적 시퀀스로 설계해 무엇을 볼지뿐 아니라 언제 누구와 경험할지도 결정해야 합니다."),
          scope: p("One university-age sample, small and unequal condition cells, one recycling scenario, and short-term self-report outcomes limit statistical power and generalization.", "한 대학 연령 표본, 작고 불균형한 조건 집단, 단일 재활용 시나리오, 단기 자기보고 결과로 검정력과 일반화에 한계가 있습니다.")
        }
      },
      "ml-demand-forecasting": {
        editorial: {
          question: p("Can demand-pattern clustering and cluster-specific feature selection improve LSTM forecasts across heterogeneous retail products?", "수요 패턴 군집화와 군집별 변수 선택이 이질적인 소매 제품의 LSTM 수요 예측을 개선할 수 있는가?"),
          gap: p("A single forecasting pipeline struggles with heterogeneous, irregular product demand and can spend substantial effort on features that matter differently by pattern.", "단일 예측 파이프라인은 이질적·불규칙한 제품 수요를 다루기 어렵고 패턴별 중요도가 다른 변수에 불필요한 비용을 쓸 수 있습니다."),
          contribution: p("A three-stage forecasting pipeline: K-means demand-pattern clustering, cluster-specific LASSO feature selection, and LSTM sequence prediction.", "K-means 수요 패턴 군집화, 군집별 LASSO 변수 선택, LSTM 시계열 예측의 3단계 파이프라인을 제시합니다."),
          method: p("U.S. retail data from 2014-01-01 to 2016-03-26; 2,548 products and 312,388 observations; 104 training weeks and 12 verification weeks; 24 demand-derived plus six external variables; mMAPE, RMSE, and MAE against LSTM and two partial hybrids.", "2014-01-01부터 2016-03-26까지의 미국 소매 데이터, 상품 2,548개와 관측치 312,388건, 학습 104주와 검증 12주, 수요 파생 변수 24개와 외생 변수 6개를 사용해 LSTM 및 두 부분 결합 모델과 mMAPE·RMSE·MAE를 비교했습니다."),
          takeaway: p("Segment first, select features within each pattern, then forecast: on this dataset the full pipeline outperformed every partial model.", "먼저 패턴을 나누고 군집별 변수를 고른 뒤 예측하는 전체 파이프라인이 이 데이터에서 모든 부분 모델보다 우수했습니다."),
          finding1: p("The full hybrid achieved mMAPE 0.356, RMSE 0.958, and MAE 0.387, the best result across all three metrics.", "전체 결합 모델은 mMAPE 0.356, RMSE 0.958, MAE 0.387로 세 지표 모두 최고 성능을 보였습니다."),
          finding2: p("Plain LSTM scored 0.627/1.282/0.654; K-means plus LSTM 0.528/1.165/0.560; LASSO plus LSTM 0.440/1.080/0.467.", "단일 LSTM은 0.627/1.282/0.654, K-means+LSTM은 0.528/1.165/0.560, LASSO+LSTM은 0.440/1.080/0.467이었습니다."),
          finding3: p("LASSO retained different feature sets by cluster, while lag and moving-average variables remained recurrent signals across patterns.", "LASSO는 군집별로 다른 변수 집합을 선택했고 시차·이동평균 변수는 패턴 전반에서 반복되는 신호였습니다."),
          implication: p("For heterogeneous retail portfolios, model segmentation and feature governance should be designed together rather than added independently.", "이질적 소매 포트폴리오에서는 모델 세분화와 변수 관리를 별도 단계가 아니라 함께 설계해야 합니다."),
          scope: p("Unreviewed preprint using one retailer and limited external covariates; the paper contains an inconsistent product/cluster count, so cluster counts are omitted and cross-company validation is required.", "동료심사 전 프리프린트로 한 소매사와 제한된 외생 변수를 사용했습니다. 제품 수와 군집 합계가 불일치해 군집별 수는 제시하지 않으며 타 기업 검증이 필요합니다.")
        }
      },
      "recycling-gamification": {
        editorial: {
          question: p("Does group commitment in a motion-capture recycling game increase task completion and recycling motivation compared with solo play?", "모션캡처 재활용 게임의 집단 몰입은 개인 플레이보다 과업 완수와 재활용 동기를 높이는가?"),
          gap: p("Recycling gamification often reports engagement benefits, but the specific contribution of shared commitment has rarely been isolated.", "재활용 게이미피케이션은 참여 효과를 보고하지만 공동 몰입 자체의 기여를 분리해 본 연구는 드뭅니다."),
          contribution: p("A within-sequence comparison of solo and multiplayer recycling that links cooperative commitment to performance and behavior-specific attitude change.", "개인 후 다인 재활용 과업을 비교해 협력 몰입을 수행과 행동 특화 태도 변화에 연결했습니다."),
          method: p("48 participants in four groups of 12; an OptiTrack recycling task with 30 items and a 60-second limit; each participant first played solo, then in multiplayer; adapted pre/post recycling-awareness survey.", "12명씩 4개 집단, 30개 물품·60초 제한 OptiTrack 재활용 과업, 모든 참여자가 개인 후 다인 플레이, 수정된 재활용 인식 사전·사후 설문을 사용했습니다."),
          takeaway: p("Cooperation changed what participants were willing to do more clearly than it changed their general environmental worldview.", "협력은 전반적 환경관보다 참여자가 실제로 하려는 행동을 더 분명하게 바꿨습니다."),
          finding1: p("No participant completed the solo task, while every group completed the multiplayer task.", "개인 과업 완수자는 없었지만 모든 다인 집단은 과업을 완료했습니다."),
          finding2: p("Willingness to make an effort to recycle increased by 28.9 percent after group play.", "집단 플레이 후 재활용을 위해 노력하려는 의향이 28.9% 증가했습니다."),
          finding3: p("Prioritizing personal convenience decreased by 10.7 percent, while broad perceptions of environmental issues did not significantly shift.", "개인 편의를 우선하는 태도는 10.7% 감소했지만 광범위한 환경 문제 인식은 유의하게 변하지 않았습니다."),
          implication: p("Use cooperative commitment when the target is task performance and behavior-specific motivation, but do not assume a brief game changes general environmental attitudes.", "과업 수행과 행동 특화 동기가 목표라면 협력 몰입을 활용하되 짧은 게임이 전반적 환경 태도를 바꾼다고 가정해서는 안 됩니다."),
          scope: p("Fixed solo-to-group order, short exposure, limited demographic and statistical detail, and no long-term behavior measure constrain causal interpretation.", "개인 후 집단으로 고정된 순서, 짧은 노출, 제한된 인구통계·통계 정보, 장기 행동 측정 부재로 인과 해석에 한계가 있습니다.")
        }
      },
      "diplopia-rehabilitation": {
        editorial: {
          question: p("Can gamifying eye-movement exercises sustain anticipation, continuation, and interest better than conventional repetition?", "안구 운동을 게임화하면 기존 반복 운동보다 기대·지속 의향·흥미를 유지할 수 있는가?"),
          gap: p("Diplopia exercises can be repetitive and monotonous, creating an adherence problem even when the movement protocol itself is available.", "복시 운동은 반복적이고 단조로워 운동 프로토콜이 있어도 지속 참여 문제가 생깁니다."),
          contribution: p("An early gamified exercise design spanning saccade, smooth pursuit, and optokinetic nystagmus, with a preliminary engagement comparison.", "단속성 안구운동·원활 추종·시운동성 안진을 아우르는 초기 게임형 운동 설계와 예비 참여 비교를 제시합니다."),
          method: p("Seven participants: four in a gamified condition and three controls; two exercise sessions 24 hours apart; 1-5 self-report ratings of anticipation, desire to continue, and interest.", "참여자 7명(게임형 4명, 대조 3명), 24시간 간격 2회 운동, 기대·지속 의향·흥미 1~5점 자기보고를 사용했습니다."),
          takeaway: p("Gamification showed a promising adherence signal, but this pilot did not establish rehabilitation efficacy.", "게임화는 지속 참여의 가능성을 보였지만 이 예비 연구는 재활 효과를 입증하지 않았습니다."),
          finding1: p("Anticipation for the next exercise increased in the gamified group while it declined in the control group.", "다음 운동 기대는 게임형 집단에서 증가하고 대조 집단에서 감소했습니다."),
          finding2: p("Desire to continue rose in the gamified group while the control group remained at the floor.", "지속 의향은 게임형 집단에서 상승했고 대조 집단은 최저 수준에 머물렀습니다."),
          finding3: p("Interest remained high with gamification but declined under conventional exercise.", "흥미는 게임형 운동에서 높게 유지됐지만 기존 운동에서는 감소했습니다."),
          implication: p("Treat engagement as a measurable rehabilitation-design outcome, then test whether improved adherence translates into clinical benefit.", "참여도를 측정 가능한 재활 설계 결과로 다루고 향상된 지속성이 임상 효과로 이어지는지 검증해야 합니다."),
          scope: p("N=7, descriptive percentages only, and the paper does not establish that participants had diagnosed diplopia or stroke. No clinical efficacy claim is warranted.", "N=7의 기술적 비율만 제시하며 참여자의 복시·뇌졸중 진단이 확인되지 않습니다. 임상 효능을 주장할 수 없습니다.")
        }
      },
      "eye-tracking-vr-games": {
        editorial: {
          question: p("How can saccade and smooth-pursuit exercises become a sustainable gaze-controlled VR game?", "단속성 안구운동과 원활 추종 운동을 지속 가능한 시선 제어 VR 게임으로 어떻게 만들 수 있는가?"),
          gap: p("Eye exercises can support rehabilitation goals, but repetition reduces adherence and the usability of eye-tracked exercise games remains underexplored.", "안구 운동은 재활 목표를 지원할 수 있지만 반복은 참여를 낮추며 시선 추적 운동 게임의 사용성은 충분히 탐구되지 않았습니다."),
          contribution: p("A Meta Quest Pro prototype translating saccade and pursuit exercises into gaze-controlled mechanics, staged difficulty, markers, and feedback.", "단속성·추종 운동을 시선 제어 메커닉, 단계 난이도, 마커, 피드백으로 옮긴 Meta Quest Pro 프로토타입입니다."),
          method: p("Unity with Oculus and Meta Movement SDKs on Meta Quest Pro; gaze-based saccade and smooth-pursuit mechanics; a preliminary prototype check with 24 elementary-school students.", "Meta Quest Pro에서 Unity·Oculus·Meta Movement SDK, 시선 기반 단속성·원활 추종 메커닉, 초등학생 24명 대상 예비 프로토타입 확인을 사용했습니다."),
          takeaway: p("The study established prototype feasibility and engagement direction, not therapeutic effectiveness.", "연구는 프로토타입 구현 가능성과 참여 방향을 확인했으며 치료 효과를 입증하지 않았습니다."),
          finding1: p("The prototype implemented gaze markers, exercise-specific interaction, staged challenge, and immediate game feedback.", "프로토타입은 시선 마커, 운동별 상호작용, 단계적 도전, 즉시 게임 피드백을 구현했습니다."),
          finding2: p("The school pilot elicited positive reactions to immersion and participation.", "학교 예비 확인에서 몰입과 참여에 긍정적 반응이 나타났습니다."),
          finding3: p("No clinical outcome, diagnostic sample, or controlled therapeutic comparison was reported.", "임상 결과, 진단 표본, 통제 치료 비교는 보고되지 않았습니다."),
          implication: p("Use the prototype as a platform for ophthalmology-linked usability and clinical testing, with measures beyond enjoyment.", "프로토타입을 안과 연계 사용성·임상 검증 플랫폼으로 사용하고 재미 이상의 지표를 측정해야 합니다."),
          scope: p("Children rather than patients, sparse pilot-method detail, and no statistical or clinical endpoint; feasibility cannot be generalized to rehabilitation efficacy.", "환자가 아닌 아동 표본, 제한된 예비 방법 정보, 통계·임상 종점 부재로 구현 가능성을 재활 효능으로 일반화할 수 없습니다.")
        }
      },
      "cynophobia-vr-exposure": {
        editorial: {
          question: p("Does graded distance-based VR exposure reduce fear and create a more positive experience than immediate close exposure for people reporting cynophobia?", "개 공포를 보고한 사람에게 거리 기반 단계적 VR 노출이 즉시 근접 노출보다 공포를 줄이고 더 긍정적 경험을 만드는가?"),
          gap: p("Real-world exposure is resource-intensive and difficult to control, while prior VR designs did not sufficiently structure space and distance as person-specific exposure variables.", "현실 노출은 자원이 많이 들고 통제가 어려우며 기존 VR 설계는 공간·거리를 개인별 노출 변수로 충분히 구조화하지 못했습니다."),
          contribution: p("A preliminary comparison treating spatial distance as an explicit dose variable in a VR cynophobia exposure sequence.", "공간 거리를 VR 개 공포 노출 순서의 명시적 용량 변수로 다룬 예비 비교입니다."),
          method: p("Preliminary randomized two-group VR study; a realistic dog advanced through stages from far away to hand reach versus immediate closest-stage exposure; pre/post fear questionnaire. The one-page source does not report N, instrument, or statistics.", "예비 무작위 2집단 VR 연구로 현실적 개가 먼 거리에서 손 닿는 거리까지 단계적으로 접근하는 조건과 즉시 근접 조건을 비교하고 사전·사후 공포 설문을 사용했습니다. 1쪽 자료에는 N·도구·통계가 없습니다."),
          takeaway: p("Exposure distance should be designed as a controllable progression, not treated as scene decoration.", "노출 거리는 장면 장식이 아니라 조절 가능한 단계로 설계해야 합니다."),
          finding1: p("The authors report reduced fear in the graded-exposure condition.", "저자들은 단계적 노출 조건에서 공포가 감소했다고 보고했습니다."),
          finding2: p("Successive distance stages supported adaptation and a sense of mastery.", "연속 거리 단계는 적응과 숙달감을 지원했습니다."),
          finding3: p("Participants remembered staged exposure more positively than immediate close exposure.", "참여자들은 단계적 노출을 즉시 근접 노출보다 더 긍정적으로 기억했습니다."),
          implication: p("Parameterize exposure distance and progression so intensity can be matched to the person and adjusted over time.", "노출 거리와 진행 단계를 매개변수화해 개인에게 강도를 맞추고 시간에 따라 조절해야 합니다."),
          scope: p("One-page preliminary abstract with no sample size, demographics, validated measure, statistical test, effect size, clinical supervision, or follow-up. It does not establish treatment efficacy.", "표본 수·인구통계·검증 척도·통계 검정·효과크기·임상 감독·추적관찰이 없는 1쪽 예비 초록으로 치료 효능을 입증하지 않습니다.")
        }
      },
      "clustering-prediction": {
        editorial: {
          question: p("Can grouping retail products by time-series and demand-pattern features improve the predictive performance of multiple machine-learning models?", "시계열·수요 패턴 특징으로 소매 제품을 군집화하면 여러 머신러닝 모델의 예측 성능을 높일 수 있는가?"),
          gap: p("A global forecasting model treats heterogeneous product-demand shapes alike, even though different patterns may require different decision boundaries.", "전역 예측 모델은 서로 다른 제품 수요 형태를 동일하게 다루지만 패턴마다 다른 판단 경계가 필요할 수 있습니다."),
          contribution: p("A hybrid clustering approach that segments products before applying and comparing DNN, MLP, LSTM, random forest, and XGBoost demand models.", "제품을 먼저 세분화한 뒤 DNN·MLP·LSTM·랜덤포레스트·XGBoost 수요 모델을 적용·비교하는 결합 군집화 접근입니다."),
          method: p("1,624 retail products with three years of weekly demand; K-means over combined time-series and demand-pattern features; five forecasting model families compared with and without clustering.", "제품 1,624개의 3년 주간 수요, 시계열·수요 패턴 결합 특징의 K-means, 군집화 전후 5개 예측 모델군 비교를 사용했습니다."),
          takeaway: p("Segmenting heterogeneous demand before prediction can improve the fit of downstream models, but the accessible record does not expose exact gains.", "예측 전에 이질적 수요를 세분화하면 후속 모델의 적합도를 높일 수 있지만 공개 기록에는 정확한 향상값이 없습니다."),
          finding1: p("The framework groups products by both temporal shape and demand characteristics rather than by category labels alone.", "프레임은 범주 라벨만이 아니라 시간적 형태와 수요 특성을 함께 사용해 제품을 묶습니다."),
          finding2: p("Multiple neural and tree-based forecasters were tested under clustered and unclustered conditions.", "여러 신경망·트리 기반 예측기를 군집화 조건과 비군집 조건에서 비교했습니다."),
          finding3: p("The official abstract reports performance enhancement from clustering but does not provide extractable effect values.", "공식 초록은 군집화에 따른 성능 향상을 보고하지만 추출 가능한 효과 값은 제시하지 않습니다."),
          implication: p("Use clustering as a model-selection and specialization layer, then publish cluster stability and per-model effect sizes for operational decisions.", "군집화를 모델 선택·특화 계층으로 사용하고 운영 판단을 위해 군집 안정성과 모델별 효과크기를 보고해야 합니다."),
          scope: p("One retail dataset and abstract-level public results; the accessible record does not establish external validity, uncertainty, or exact improvement magnitudes.", "한 소매 데이터셋과 초록 수준 공개 결과로 외적 타당성·불확실성·정확한 향상 크기를 확인할 수 없습니다.")
        }
      },
      "regression-clustering": {
        editorial: {
          question: p("Can K-means clustering, cluster-specific LASSO shrinkage, and LSTM forecasting outperform benchmark demand models?", "K-means 군집화, 군집별 LASSO 축소, LSTM 예측을 결합하면 기준 수요 모델보다 성능이 좋아지는가?"),
          gap: p("Conventional demand forecasts struggle to remain accurate across heterogeneous patterns and may use the same predictors for every segment.", "기존 수요 예측은 이질적 패턴 전반에서 안정적 정확도를 유지하기 어렵고 모든 세그먼트에 같은 변수를 사용할 수 있습니다."),
          contribution: p("An early hybrid pipeline that clusters demand patterns, selects predictors within each cluster through LASSO, and forecasts sequences with LSTM.", "수요 패턴을 군집화하고 군집별 LASSO로 변수를 고른 뒤 LSTM으로 예측하는 초기 결합 파이프라인입니다."),
          method: p("2,693 retail products; two years of weekly demand; 24 demand-derived and six external variables; K-means, cluster-specific LASSO, and LSTM; mMAPE, RMSE, and MAE against four benchmarks.", "소매 제품 2,693개, 2년 주간 수요, 수요 파생 24개·외생 6개 변수, K-means·군집별 LASSO·LSTM, 4개 기준 모델과 mMAPE·RMSE·MAE를 비교했습니다."),
          takeaway: p("Pattern-specific feature selection is a plausible bridge between segmentation and sequence forecasting, but this abstract does not quantify the advantage.", "패턴별 변수 선택은 세분화와 시계열 예측을 잇는 타당한 방법이지만 이 초록은 장점을 정량화하지 않습니다."),
          finding1: p("The source reports that the full hybrid performed best overall, without numerical values.", "자료는 전체 결합 모델이 전반적으로 최고였다고 보고하지만 수치는 제시하지 않습니다."),
          finding2: p("Clustering created demand-pattern-specific modeling groups before forecasting.", "군집화는 예측 전에 수요 패턴별 모델링 집단을 만들었습니다."),
          finding3: p("LASSO selected inputs separately inside each cluster instead of enforcing one global feature set.", "LASSO는 하나의 전역 변수 집합을 강제하지 않고 군집 안에서 별도로 입력을 선택했습니다."),
          implication: p("Forecasting systems should make segmentation and variable selection auditable before sequence-model complexity is added.", "예측 시스템은 시계열 모델 복잡성을 더하기 전에 세분화와 변수 선택을 감사 가능하게 만들어야 합니다."),
          scope: p("One-page abstract without data provenance, split protocol, benchmark identities, numerical results, or uncertainty; the later preprint is the stronger evidence source.", "데이터 출처·분할 절차·기준 모델명·수치 결과·불확실성이 없는 1쪽 초록이며 후속 프리프린트가 더 강한 근거입니다.")
        }
      }
    },
    awards: {
      "krafton-fde-challenge": {
        shortTitle: p("Rapid AI Product Build", "AI 제품 신속 개발"),
        category: p("AI Product Challenge", "AI 제품 챌린지"),
        awardName: p("KRAFTON Cofathon: AI Native Battlegrounds, Forward Deployed Engineer Track", "KRAFTON 코파톤: AI Native Battlegrounds, Forward Deployed Engineer 트랙"),
        editorial: {
          verifiedResult: p("Official materials verify the one-day final, KRW 10 million prize pool, and recruiting benefit. Project records document a rapid AI application and blind-review handoff; this entry does not claim a competition placement.", "공식 자료는 1일 결선, 총상금 1,000만원, 채용 우대를 확인합니다. 과제 기록은 신속한 AI 애플리케이션 구현과 블라인드 심사 인계를 문서화하며 이 항목은 대회 순위를 주장하지 않습니다."),
          selectionContext: p("The event compressed discovery, implementation, verification, and handoff into a one-day final with a documented prize pool and recruiting fast-track.", "행사는 요구 발굴, 구현, 검증, 인계를 공식 상금과 채용 우대가 있는 1일 결선에 압축했습니다."),
          challenge: p("Participants had to communicate with virtual stakeholders, define an unseen business problem, plan a solution, and implement a working application under a compressed event schedule.", "가상 이해관계자와 소통해 처음 보는 비즈니스 문제를 정의하고 압축된 일정 안에 해결안을 기획·구현해 작동형 애플리케이션을 제출해야 했습니다."),
          contribution: p("Project records document my requirements discovery with a scenario agent, translation into a build plan, implementation in under four hours, and preparation of a blind-review handoff.", "과제 기록은 시나리오 에이전트를 활용한 요구사항 발굴, 빌드 계획 전환, 4시간 이내 구현, 블라인드 심사 인계 준비를 제 기여로 문서화합니다."),
          criteria: p("Problem definition; direction and use of AI; iteration under constraint; verification and handoff quality.", "문제 정의; AI 지휘·활용; 제약 속 반복 개선; 검증·핸드오프 품질"),
          validates: p("This entry documents the challenge format, compressed delivery constraint, and implemented workflow without claiming independently verified placement.", "이 항목은 챌린지 운영 방식, 압축된 개발 제약, 구현 워크플로를 기록하며 독립 검증된 순위는 주장하지 않습니다.")
        }
      },
      "game-society-best-presentation": {
        category: p("Paper-Level Recognition", "논문 단위 인정"),
        awardName: p("Best Presentation Award, Korea Game Society Spring Conference 2026", "2026 한국게임학회 춘계학술발표대회 우수발표논문상"),
        editorial: {
          verifiedResult: p("As second author, Jihun contributed the accessibility-AI framing, barrier interpretation, and design synthesis to this recognized paper. Professor Young Yim Doh's July 2026 CV records the award; no organizer-issued certificate is available.", "제2저자 채지훈은 수상 논문의 접근성 AI 프레이밍, 장벽 해석, 설계 종합에 기여했습니다. 도영임 교수의 2026년 7월 CV가 수상을 기록하며 주최 측 발행 증서는 확보되지 않았습니다."),
          selectionContext: p("Conference paper, pp. 83-88, authored by Sojeong Lee, Jihun Chae, Seoyoon Jeong, and Young Yim Doh. The paper was scheduled on 30 May 2026 at Tech University of Korea; the registration record lists Jihun as a coauthor or related author and identifies the presenter separately.", "이소정·채지훈·정서윤·도영임 공저 학술대회 논문(83~88쪽)으로 2026년 5월 30일 한국공학대학교 세션에 편성됐습니다. 등록 기록은 채지훈을 공저자·논문 관계자로 기재하고 발표자를 별도로 명시합니다."),
          challenge: p("The team had to convert open-ended responses from 112 players with disabilities into defensible barrier categories, accessibility requirements, design principles, and a concise conference presentation.", "장애인 플레이어 112명의 개방형 응답을 방어 가능한 장벽 범주·접근성 요구사항·설계 원칙으로 전환해 간결한 학술 발표로 제시해야 했습니다."),
          contribution: p("As second author, I contributed accessibility-AI framing, barrier interpretation, design-principle synthesis, and preparation of the research output.", "제2저자로 접근성 AI 프레이밍, 장벽 해석, 설계 원칙 종합, 연구 결과물 준비에 기여했습니다."),
          criteria: p("The official rubric was not preserved in the available record. The evaluated artifact was the paper and its presentation, including research clarity, evidence, contribution, and delivery.", "공식 평가표는 확보 자료에 남아 있지 않습니다. 평가 대상은 연구 명료성·근거·기여·전달을 포함한 논문과 발표였습니다."),
          validates: p("Paper-level recognition for translating disability findings into actionable game-AI design principles, with Jihun contributing as second author.", "장애 근거를 실행 가능한 게임 AI 설계 원칙으로 전환한 논문 단위 인정이며, 채지훈은 제2저자로 기여했습니다.")
        }
      },
      "edu40-ta-excellence": {
        shortTitle: p("TA Report Excellence", "조교 활동보고서 우수상"),
        awardName: p("Education4.0 Q Teaching Assistant Report Recognition", "Education4.0 Q 조교 활동보고서 포상"),
        editorial: {
          verifiedResult: p("KAIST awarded Jihun Chae Certificate EC-2026-0001 for Excellence in the Education4.0 Q TA Report on 23 March 2026.", "KAIST는 2026년 3월 23일 채지훈에게 Education4.0 Q 조교 활동보고서 우수상(증서 EC-2026-0001)을 수여했습니다."),
          selectionContext: p("KAIST's Education4.0 Q program recognizes teaching-assistant practice within its question-centered learning model; the certificate does not publish applicant or cohort counts.", "KAIST Education4.0 Q는 질문 중심 학습 모델의 조교 실천을 포상하며 증서에는 지원자나 전체 인원 수가 공개되지 않습니다."),
          challenge: p("The assessed work was a TA activity report documenting how question-centered course support was planned, operated, and reflected upon.", "질문 중심 수업 지원을 어떻게 기획·운영하고 성찰했는지 기록한 조교 활동보고서가 평가 대상이었습니다."),
          contribution: p("As the named TA report author and recipient, I documented the teaching intervention, its operation, and reflection.", "조교 활동보고서의 작성자이자 수상자로서 교육 개입의 운영과 성찰을 기록했습니다."),
          criteria: p("The certificate verifies report-level Excellence; it does not establish cohort rank or top-award status.", "증서는 활동보고서 우수상을 확인하며 전체 순위나 최고상 여부를 입증하지는 않습니다."),
          validates: p("Institutional recognition for turning teaching practice into a clear, reflective, and reusable report.", "교육 실천을 명료하고 성찰적이며 재사용 가능한 보고서로 만든 역량에 대한 기관 인정입니다.")
        }
      },
      "asan-climate-tech-team": {
        shortTitle: p("Climate-Tech Team Selection", "기후기술 팀 선정"),
        awardName: p("Asan UniverCT Climate-Tech Team Selection", "아산 UniverCT 기후테크 팀 선정"),
        editorial: {
          verifiedResult: p("Selected climate-tech student startup team in KAIST's Asan UniverCT program. The primary business plan names Glean and Jihun Chae as team representative; this was a program selection, not a Chung Ju-yung competition award.", "KAIST 아산 UniverCT 기후테크 학생 창업팀으로 선정됐습니다. 1차 사업계획서는 Glean과 팀 대표 채지훈을 명시하며, 정주영 창업경진대회 수상이 아니라 프로그램 선정입니다."),
          selectionContext: p("Asan Nanum Foundation supported selected climate-tech teams through mentoring and venture-development resources; no paid-support amount is claimed.", "아산나눔재단은 선정된 기후테크 팀에 멘토링과 창업 개발 자원을 지원했으며 지원금 지급액은 주장하지 않습니다."),
          challenge: p("Teams had to frame a climate problem as a viable venture and develop it through university-linked entrepreneurship support toward a demonstrable concept.", "기후 문제를 실행 가능한 벤처로 정의하고 대학 연계 창업 지원 안에서 시연 가능한 콘셉트로 발전시켜야 했습니다."),
          contribution: p("As the named team representative, I owned overall venture coordination and the application assigns me AI-modeling and patent filing responsibilities. Glean framed an AR litter-scanning and reward service with environmental-data value for organizations.", "팀 대표로 사업 전반을 총괄했고 신청서는 AI 모델링과 특허 보유·출원 업무를 제 책임으로 배정합니다. Glean은 AR 쓰레기 스캔·리워드 서비스와 기관용 환경 데이터 가치를 제안했습니다."),
          criteria: p("Climate relevance; venture feasibility; team execution; potential for development within the university program. The exact selection rubric is not public in the evidence reviewed.", "기후 문제 적합성; 사업 실행 가능성; 팀 실행력; 대학 프로그램 내 발전 가능성. 검토 자료에는 정확한 선정 평가표가 공개되지 않았습니다."),
          validates: p("Verified selection into a structured climate-tech entrepreneurship program.", "구조화된 기후테크 창업 프로그램 선정 성과입니다.")
        }
      },
      "pohang-media-facade-camp": {
        shortTitle: p("Underwater Media Art", "수중 미디어 아트"),
        category: p("Interactive Media Project", "인터랙티브 미디어 프로젝트"),
        awardName: p("Pohang Culture and Arts Factory Responsive Media-Façade Education Camp", "포항시 문화예술팩토리 반응형 미디어파사드 교육 캠프"),
        editorial: {
          verifiedResult: p("Project records describe technical leadership and an Unreal Engine underwater media-façade implementation. The camp is verified; no named result currently confirms an individual award or role.", "과제 기록은 수중 미디어파사드의 기술 리드와 Unreal Engine 구현을 설명합니다. 캠프는 확인되지만 개인 수상이나 역할을 확인하는 실명 결과는 확보되지 않았습니다."),
          selectionContext: p("The five-day Unreal Engine camp was limited to 20 participants and advertised a KRW 5 million-equivalent reward pool, including an HGU President's Award. Independent reporting verifies the program, not an individual award placement.", "5일간 Unreal Engine 캠프는 20명 정원이며 한동대 총장상을 포함한 500만원 상당의 시상을 예고했습니다. 독립 보도는 프로그램을 확인하지만 개인 수상 등급은 입증하지 않습니다."),
          challenge: p("The team had to turn an environmental and smart-city theme into large-scale content that could run reliably on a real architectural media surface.", "환경·스마트시티 주제를 실제 건축 미디어 표면에서 안정적으로 구동되는 대형 콘텐츠로 구현해야 했습니다."),
          contribution: p("Project records describe my technical-lead role and Unreal Engine implementation; no primary roster or submission artifact independently confirms that role.", "과제 기록은 기술 리드 역할과 Unreal Engine 구현을 설명하며 1차 명단이나 제출물로 해당 역할이 독립 확인되지는 않았습니다."),
          criteria: p("Concept and public relevance; technical execution; fit to the media-facade format; completeness for exhibition. The exact scored rubric was not located.", "콘셉트·공공성; 기술 구현; 미디어 파사드 형식 적합성; 전시 완성도. 정확한 배점표는 확인되지 않았습니다."),
          validates: p("Available evidence verifies the event context; this entry does not claim a personal award result or team role.", "확보된 근거는 행사 맥락을 확인하며 이 항목은 개인 수상 결과나 팀 역할을 주장하지 않습니다.")
        }
      },
      "eye-tracking-vr-research-award": {
        shortTitle: p("Eye-Tracking VR Paper Award", "시선추적 VR 논문상"),
        awardName: p("2023 KMMS Fall Undergraduate Paper Competition", "2023 한국멀티미디어학회 추계학부생논문경진대회"),
        editorial: {
          verifiedResult: p("Excellence Award for 'Eye-Tracking-Based VR Interactive Game for Eye Exercises,' dated 17 November 2023. Jihun Chae is the fourth author on the certificate.", "「안구 운동을 위한 시선 추적 기반 VR 인터랙티브 게임」으로 2023년 11월 17일 우수상 수상. 증서상 채지훈은 제4저자입니다."),
          selectionContext: p("The award was issued in the society's fall undergraduate paper competition to a seven-author research team. It is a paper-level team result, not an individual first-author award.", "학회 추계학부생논문경진대회에서 7인 연구팀 논문에 수여된 팀 단위 결과이며 개인 제1저자상이 아닙니다."),
          challenge: p("The paper had to present a viable gaze-controlled VR game that translated eye exercises into interactive mechanics and a preliminary user-facing prototype.", "안구 운동을 상호작용 메커닉으로 전환한 시선 제어 VR 게임과 예비 사용자 프로토타입을 제시해야 했습니다."),
          contribution: p("As fourth author, I contributed to the team research and VR game work. The certificate does not break down individual tasks, so the contribution is stated at team level.", "제4저자로 팀 연구와 VR 게임 작업에 기여했습니다. 증서는 개인 업무를 구분하지 않아 팀 수준으로 기여를 서술합니다."),
          criteria: p("The certificate verifies the paper-level result; no clinical efficacy or individual score is attributed.", "증서는 논문 단위 결과를 확인하며 임상 효능이나 개인 점수는 귀속하지 않습니다."),
          validates: p("Society recognition for an implemented gaze-interaction research prototype, with authorship and clinical scope represented accurately.", "저자 역할과 임상 범위를 정확히 제한한 시선 상호작용 연구 프로토타입에 대한 학회 인정입니다.")
        }
      },
      "watchers-metaverse-excellence": {
        shortTitle: p("VR Health App Award", "VR 헬스 앱 수상"),
        awardName: p("2023 Metaverse Developer Contest, Adult Division", "2023 메타버스 개발자 경진대회 성인 부문"),
        editorial: {
          verifiedResult: p("Excellence Award, Skonec Entertainment CEO Award, Team EyeCU, for Watchers, dated 18 October 2023.", "Watchers를 개발한 Team EyeCU로 2023년 10월 18일 우수상·스코넥엔터테인먼트 대표이사상을 수상했습니다."),
          selectionContext: p("The official contest awarded 37 teams from a KRW 219 million pool. Independent reporting names EyeCU's Watchers as the Skonec task winner with KRW 5 million, recruitment benefit, and potential joint development.", "공식 대회는 총상금 2억 1,900만원 규모로 37개 팀을 시상했습니다. 독립 보도는 EyeCU의 Watchers가 스코넥 지정과제 수상팀이며 500만원·채용 우대·공동개발 가능성을 받았다고 확인합니다."),
          challenge: p("The team had to create a Meta Quest Pro application that turned eye-muscle rehabilitation exercises into a coherent, demonstrable VR experience.", "안구 근육 재활 운동을 일관되고 시연 가능한 Meta Quest Pro VR 경험으로 구현해야 했습니다."),
          contribution: p("I contributed VR content research and experience design to Watchers as a member of Team EyeCU; Youngsung Lee served as team lead.", "Team EyeCU의 구성원으로 Watchers의 VR 콘텐츠 조사와 경험 설계에 기여했으며, 이영성이 팀 리드를 맡았습니다."),
          criteria: p("Task fit; technical implementation; experience and content design; completion and demonstration. The organizer's exact scorecard was not in the reviewed artifact.", "지정과제 적합성; 기술 구현; 경험·콘텐츠 설계; 완성·시연. 검토 자료에는 주최 측 정확한 배점표가 없었습니다."),
          validates: p("National external recognition for translating rehabilitation exercises into a working eye-tracked VR content concept as part of a multidisciplinary team.", "다학제 팀에서 재활 운동을 작동형 시선 추적 VR 콘텐츠로 전환한 작업에 대한 전국 규모 외부 인정입니다.")
        }
      },
      "esg-ar-encouragement-prize": {
        shortTitle: p("Circular Design Startup Award", "순환 디자인 창업상"),
        awardName: p("11th Handong Startup Competition Final", "제11회 한동창업경진대회 본선"),
        editorial: {
          verifiedResult: p("Team CGreen received the Encouragement Prize on 24 November 2022.", "Team CGreen은 2022년 11월 24일 장려상을 받았습니다."),
          selectionContext: p("A campus startup final for student venture teams. The application names Jihun Chae as team representative; the available evidence does not report applicant, semifinalist, or finalist counts.", "학생 벤처팀 대상 교내 창업경진대회 본선입니다. 신청서에는 채지훈이 팀 대표로 기록되며 지원·예선·본선 팀 수는 확인되지 않습니다."),
          challenge: p("CGreen proposed Glean, an XR and metaverse recycling-reward application connecting environmentally responsible behavior with user incentives.", "CGreen은 환경 책임 행동을 사용자 보상과 연결한 XR·메타버스 재활용 리워드 앱 Glean을 제안했습니다."),
          contribution: p("As the named team representative, I led the venture submission and helped frame the ESG problem, XR service concept, and competition delivery.", "팀 대표로 창업 신청을 이끌고 ESG 문제, XR 서비스 콘셉트, 경진대회 결과물 구성을 주도했습니다."),
          criteria: p("Problem and social value; business-model feasibility; technical concept; team execution. The exact competition scorecard was not preserved.", "문제·사회적 가치; 비즈니스 모델 실행 가능성; 기술 콘셉트; 팀 실행력. 정확한 대회 배점표는 확보되지 않았습니다."),
          validates: p("Early external evidence of venture leadership and the ability to connect immersive technology with an environmental behavior model, accurately represented as an Encouragement Prize.", "몰입형 기술을 환경 행동 모델과 연결한 초기 벤처 리더십의 외부 근거이며 정확히 장려상으로 표기합니다.")
        }
      },
      "cynophobia-vr-research-award": {
        shortTitle: p("VR Exposure Paper Award", "VR 노출 연구 논문상"),
        awardName: p("2022 KMMS Spring Undergraduate Paper Competition", "2022 한국멀티미디어학회 춘계학부생논문경진대회"),
        editorial: {
          verifiedResult: p("Presentation Award certificate stating selection for Excellence, for the VR cynophobia exposure paper, dated 13 May 2022. Jihun Chae is the second author.", "개 공포증 VR 노출 논문으로 2022년 5월 13일 우수상 선정·발표상 증서를 받았으며 채지훈은 제2저자입니다."),
          selectionContext: p("A society undergraduate paper competition recognized the team's preliminary research on staged spatial exposure. The result is paper-level and shared across the author team.", "학회 학부생논문경진대회가 단계적 공간 노출 예비 연구를 인정한 팀 단위 논문 수상입니다."),
          challenge: p("The research had to turn distance and spatial progression into a controllable VR exposure design and communicate preliminary evidence within a one-page conference format.", "거리·공간 진행을 조절 가능한 VR 노출 설계로 만들고 1쪽 학술대회 형식에 예비 근거를 전달해야 했습니다."),
          contribution: p("As second author, I contributed to the VR exposure research and paper; individual technical tasks are not documented.", "제2저자로 VR 노출 연구와 논문에 기여했으며 개인별 기술 업무는 문서화되어 있지 않습니다."),
          criteria: p("The certificate confirms the result. The paper presents preliminary design research and does not establish clinical treatment efficacy.", "증서는 수상 결과를 확인합니다. 논문은 예비 설계 연구이며 임상 치료 효능을 입증하지 않습니다."),
          validates: p("Society recognition for converting a therapeutic-design question into a controllable VR exposure concept while retaining appropriate clinical caution.", "치료 설계 질문을 조절 가능한 VR 노출 콘셉트로 전환하면서 임상적 신중함을 유지한 연구에 대한 학회 인정입니다.")
        }
      },
      "db-snubiz-startup-challenge": {
        shortTitle: p("Global Startup Pitch", "글로벌 스타트업 피치"),
        category: p("Startup Competition", "창업 경진대회"),
        awardName: p("DB-SNUbiz Global Startup Challenge", "DB-SNUbiz 글로벌 창업 챌린지"),
        editorial: {
          verifiedResult: p("The organizer's retrospective verifies the 152-to-38-to-14 funnel and 21 July 2021 final. This entry documents the competition work without claiming independently verified finalist placement.", "주최 측 회고는 152→38→14 선발과 2021년 7월 21일 본선을 확인합니다. 이 항목은 독립 검증된 본선 진출을 주장하지 않고 대회 작업을 기록합니다."),
          selectionContext: p("152 applications, 33 domestic and 119 international, narrowed to 38 in the first selection and 14 final teams for live presentations.", "국내 33팀·해외 119팀, 총 152개 지원팀에서 1차 38팀을 거쳐 14개 본선팀으로 선발됐습니다."),
          challenge: p("Finalists had to present a global startup proposal live to business-school, venture-capital, and industry judges.", "본선팀은 경영대학·벤처투자·산업 전문가 심사자 앞에서 글로벌 창업안을 라이브로 발표해야 했습니다."),
          contribution: p("Project records document my contribution to developing and pitching the team's blockchain solution; no independent role record is available.", "과제 기록은 팀의 블록체인 솔루션 개발·피칭에 대한 제 기여를 설명하며 독립적인 역할 기록은 확보되지 않았습니다."),
          criteria: p("Global venture proposition; business feasibility; solution differentiation; live pitch and responses. The exact scored rubric was not located.", "글로벌 사업 제안; 사업 실행 가능성; 솔루션 차별성; 라이브 피칭·응답. 정확한 배점표는 확인되지 않았습니다."),
          validates: p("The organizer-verified funnel establishes the competition's selectivity; this entry does not claim independently verified finalist status.", "주최 측이 확인한 선발 흐름은 대회의 경쟁도를 보여주며 이 항목은 독립 검증된 본선 진출을 주장하지 않습니다.")
        }
      }
    }
  };

  Object.entries(content).forEach(([collection, records]) => {
    Object.entries(records).forEach(([slug, record]) => {
      const target = designs[collection]?.find((item) => item.slug === slug);
      if (target) merge(target, record);
    });
  });
})();

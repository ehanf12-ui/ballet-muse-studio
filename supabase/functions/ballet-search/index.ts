import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Ballet term database with characteristics for semantic matching
const balletTerms = [
  { kr: "플리에", fr: "Plié", tags: ["구부리기", "기본", "무릎", "준비"] },
  { kr: "드미 플리에", fr: "Demi-plié", tags: ["반 구부리기", "기본", "무릎", "준비", "작은"] },
  { kr: "그랑 플리에", fr: "Grand plié", tags: ["깊은 구부리기", "크게", "무릎", "기본"] },
  { kr: "탄듀", fr: "Tendu", tags: ["뻗기", "발끝", "바닥", "미끄러지기", "기본"] },
  { kr: "데가제", fr: "Dégagé", tags: ["떼기", "빠른", "발끝", "바닥에서 떨어지기"] },
  { kr: "롱드잠", fr: "Rond de jambe", tags: ["원그리기", "다리", "회전", "바닥", "원형"] },
  { kr: "롱드잠 앙 레르", fr: "Rond de jambe en l'air", tags: ["공중 원그리기", "다리", "회전", "공중"] },
  { kr: "바뜨망 프라뻬", fr: "Battement frappé", tags: ["치기", "빠른", "강한", "발끝"] },
  { kr: "쁘띠 바뜨망", fr: "Petit battement", tags: ["작은 치기", "빠른", "발목", "작은"] },
  { kr: "아다지오", fr: "Adagio", tags: ["느린", "우아한", "균형", "천천히", "서정적"] },
  { kr: "드벨로뻬", fr: "Développé", tags: ["펼치기", "다리", "천천히", "높이", "우아한"] },
  { kr: "그랑바뜨망", fr: "Grand battement", tags: ["크게 차기", "높이", "가위차기", "다리", "강한", "킥"] },
  { kr: "포르 드 브라", fr: "Port de bras", tags: ["팔동작", "우아한", "상체", "팔"] },
  { kr: "를르베", fr: "Relevé", tags: ["올라가기", "발끝", "균형", "상승"] },
  { kr: "캄브레", fr: "Cambré", tags: ["젖히기", "상체", "유연성", "뒤로"] },
  { kr: "아라베스크", fr: "Arabesque", tags: ["한발 균형", "뒤로 뻗기", "우아한", "라인", "균형"] },
  { kr: "애티튜드", fr: "Attitude", tags: ["구부린 다리", "균형", "우아한", "포즈"] },
  { kr: "피루엣", fr: "Pirouette", tags: ["회전", "돌기", "한발", "스핀", "턴"] },
  { kr: "쉐네", fr: "Chaînés", tags: ["연속 회전", "돌기", "빠른", "이동", "회전"] },
  { kr: "쏘떼", fr: "Sauté", tags: ["점프", "뛰기", "양발", "기본 점프"] },
  { kr: "샹즈망", fr: "Changement", tags: ["점프", "발 바꾸기", "양발", "교차"] },
  { kr: "에샤뻬", fr: "Échappé", tags: ["벌리기", "점프", "양발", "열기"] },
  { kr: "아쌈블레", fr: "Assemblé", tags: ["모으기", "점프", "한발에서", "착지"] },
  { kr: "줴떼", fr: "Jeté", tags: ["던지기", "점프", "한발", "이동", "가위차기"] },
  { kr: "시쏜", fr: "Sissonne", tags: ["점프", "양발에서 한발", "착지", "날기"] },
  { kr: "그랑 제떼", fr: "Grand jeté", tags: ["큰 점프", "스플릿", "공중", "날기", "비상", "도약"] },
  { kr: "발랑세", fr: "Balancé", tags: ["흔들기", "왈츠", "좌우", "3박자"] },
  { kr: "왈츠 스텝", fr: "Pas de valse", tags: ["왈츠", "걷기", "3박자", "우아한"] },
  { kr: "파 드 바스크", fr: "Pas de basque", tags: ["바스크", "원형", "이동", "3박자"] },
  { kr: "쿠뻬", fr: "Coupé", tags: ["자르기", "발목", "빠른", "연결"] },
  { kr: "삐케", fr: "Piqué", tags: ["찍기", "발끝", "이동", "균형"] },
  { kr: "클로쉬", fr: "En cloche", tags: ["종", "흔들기", "앞뒤", "다리"] },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const termList = balletTerms.map(t => `${t.kr}(${t.fr}): ${t.tags.join(", ")}`).join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `당신은 발레 동작 검색 전문가입니다. 사용자의 검색어(자연어, 특징, 느낌 등)를 분석하여 관련된 발레 동작을 찾아주세요.

아래 발레 동작 목록에서 검색어와 관련된 동작을 최대 8개까지 선택하세요:
${termList}

반드시 tool call로 응답하세요.`,
          },
          { role: "user", content: query },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_search_results",
              description: "Return matching ballet terms",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        term_kr: { type: "string" },
                        term_fr: { type: "string" },
                        reason: { type: "string" },
                      },
                      required: ["term_kr", "term_fr", "reason"],
                    },
                  },
                },
                required: ["results"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_search_results" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let results = [];
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      results = parsed.results;
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ballet-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

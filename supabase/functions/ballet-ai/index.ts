import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { input, sectionTitle, timeSignature } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isWaltz = timeSignature === '3/4';

    const waltzContext = isWaltz ? `

WALTZ (3/4) MODE RULES:
You are in 3/4 time. Each measure has exactly 3 beats. You MUST assign measureIndex and beatIndex to every step.
- measureIndex: 1-based measure number (1, 2, 3, ...)
- beatIndex: position within the measure (1, 2, or 3)
- duration: how many beats this step occupies (1, 2, or 3). A step can span across measures.

Standard ballet step durations in 3/4 time (use as defaults when user doesn't specify):
- 발란세 (Balancé): 3 beats (1 full measure)
- 발란세 앙투너 (Balancé en tournant): 3 beats
- 왈츠 스텝 (Waltz step): 3 beats
- 톰베 (Tombé): 1 beat
- 파드부레 (Pas de bourrée): 2 beats (often tombé 1 + pas de bourrée 2 = 3 beats total)
- 톰베 파드부레 (Tombé pas de bourrée): 3 beats
- 피루엣 (Pirouette): 3 beats (1 full measure)
- 글리사드 (Glissade): 1 beat
- 샤세 (Chassé): 1-2 beats
- 아상블레 (Assemblé): 1 beat
- 주떼 (Jeté): 1 beat
- 수스 (Sous-sus): 1 beat
- 파드발스 (Pas de valse): 3 beats
- 프롬나드 (Promenade): 3-6 beats
- 쁘띠 데벨로뻬 (Petit développé): 1 beat
- 데벨로뻬 (Développé): 3 beats
- 릴레베 (Relevé): 1 beat
- 쁠리에 (Plié): 1-3 beats
- 쿠페 (Coupé): 1 beat
- 포제 (Posé): 1 beat

Fill measures sequentially: start at measureIndex=1, beatIndex=1. After placing a step, advance beatIndex by its duration. If beatIndex > 3, move to next measure.
Example: "오른쪽 발란세, 왼쪽 발란세, 톰베 파드부레" →
  measure 1: 발란세 (mI=1, bI=1, dur=3)
  measure 2: 발란세 (mI=2, bI=1, dur=3)
  measure 3: 톰베 파드부레 (mI=3, bI=1, dur=3)
` : '';

    const descriptionRule = `
- 'description': Extract directional modifiers like "오른쪽", "왼쪽", "앞으로", "뒤로", "옆으로" from the action name and place them in this field. The term_kr should contain only the pure step name without these modifiers. For example, "오른쪽 발란세" → term_kr="발란세", description="오른쪽". If side is already used for left/right, use description for additional qualifiers like "앞으로", "뒤로".`;

    const systemPrompt = `당신은 발레 전문가입니다. 사용자의 입력을 분석해 JSON 배열로만 응답하세요.

CRITICAL RULES:
- Do NOT multiply or calculate counts and repetitions. Extract them EXACTLY as written in the user input.
- "A박자 B번" means duration=A, repetition=B. Do NOT merge them (e.g., "2박자 2번" → duration=2, repetition=2, NOT duration=4, repetition=1).
- If repetition is not mentioned, default repetition to 1.
- IMPORTANT: "N번발" (e.g., 1번발, 5번발) means foot POSITION, NOT repetition. "N번" without "발" means repetition count. These are completely different concepts. Never confuse them.
  - Example: "(1번발) 그랑플리에 2박자 2번" → pose="1번발", duration=2, repetition=2.
  - Example: "5번발 탕뒤 4박자" → pose="5번발", duration=4, repetition=1.
${waltzContext}
Field rules:
- 'duration': 사용자가 명시한 박자 수 그대로 기록. 절대 repetition과 곱하지 마.${isWaltz ? ' In 3/4 mode, if user doesn\'t specify duration, use the standard ballet step duration from the list above.' : ''}
- 'repetition': "N번" (발 없이)으로 표현된 반복 횟수만 기록. 언급 없으면 1. "N번발"의 N은 반복 횟수가 아님!
- 'side': 직접 언급된 방향(오른쪽/왼쪽/오른/왼)만 기록.
- 'pose': "N번발" 또는 "N번 포지션"처럼 발 포지션을 나타내는 표현만 기록. "N번"(반복)과 혼동하지 마.
- 'is_outbeat': 동작 바로 앞에 '&' 기호가 있는 경우 true.
- 'direction': '크로아제', '에파세', '앙파스', '에카르떼' 등 몸 방향이 언급된 경우 해당 한국어 명칭을 기록. 없으면 null.
${descriptionRule}
- 섹션 제목: "${sectionTitle}"
${isWaltz ? '- measureIndex: 마디 번호 (1부터 시작)\n- beatIndex: 마디 내 박자 위치 (1, 2, 3 중 하나)' : ''}
JSON 구조: [{"term_kr":"명칭", "term_fr":"French", "start_beat":1, "duration":2, "repetition":1, "side": "방향"|null, "pose": "발포지션"|null, "is_outbeat": boolean, "direction": "몸방향"|null${isWaltz ? ', "measureIndex": 1, "beatIndex": 1' : ''}, "description": "설명"|null}]`;

    const stepProperties: Record<string, any> = {
      term_kr: { type: "string" },
      term_fr: { type: "string" },
      start_beat: { type: "number" },
      duration: { type: "number", description: "Exact count as stated by user. Do NOT multiply with repetition." + (isWaltz ? " In waltz mode, use standard ballet durations if not specified." : "") },
      repetition: { type: "number", description: "Exact repetition count as stated by user. Default 1 if not mentioned." },
      side: { type: "string", nullable: true },
      pose: { type: "string", nullable: true },
      is_outbeat: { type: "boolean" },
      direction: { type: "string", nullable: true },
      description: { type: "string", nullable: true, description: "Directional modifiers extracted from action name (오른쪽, 왼쪽, 앞으로, 뒤로, etc.)" },
    };

    const requiredFields = ["term_kr", "term_fr", "start_beat", "duration", "repetition", "is_outbeat"];

    if (isWaltz) {
      stepProperties.measureIndex = { type: "number", description: "1-based measure number" };
      stepProperties.beatIndex = { type: "number", description: "Beat position within measure (1, 2, or 3)" };
      requiredFields.push("measureIndex", "beatIndex");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: input },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_ballet_sequence",
              description: "Parse ballet sequence into structured steps",
              parameters: {
                type: "object",
                properties: {
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: stepProperties,
                      required: requiredFields,
                    },
                  },
                },
                required: ["steps"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_ballet_sequence" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "크레딧이 부족합니다." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let steps;
    if (toolCall) {
      const parsed = JSON.parse(toolCall.function.arguments);
      steps = parsed.steps;
    } else {
      const content = data.choices?.[0]?.message?.content || "[]";
      steps = JSON.parse(content);
    }

    return new Response(JSON.stringify({ steps }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ballet-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

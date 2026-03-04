const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');

    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL');
    if (!ADMIN_EMAIL) throw new Error('ADMIN_EMAIL is not configured');

    const { title, content, userEmail, userNickname } = await req.json();

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ballet Note <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `[피드백] ${title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#e91e8c;margin-bottom:8px;">📩 새 피드백이 도착했습니다</h2>
            <p style="color:#666;font-size:13px;">보낸 사람: <strong>${userNickname || '알 수 없음'}</strong> (${userEmail || '이메일 없음'})</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
            <h3 style="margin-bottom:4px;">${title}</h3>
            <p style="white-space:pre-wrap;color:#333;line-height:1.6;">${content}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />
            <p style="color:#999;font-size:11px;">Ballet Sequence Note에서 자동 발송된 메일입니다.</p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending feedback email:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // OPTIONS preflight 요청 처리 (CORS 대응)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // /toss-api 뒤의 실제 토스 API 경로 추출 (예: /oauth2/token)
  const targetPath = url.pathname.replace(/^\/toss-api/, '');
  // [개선] 클라우드플레어 환경변수 TOSS_PROXY_URL이 있으면 가상서버로 우회, 없으면 기본 주소로 작동 (환경 변수 적용 및 재배포 트리거)
  const proxyBaseUrl = context.env.TOSS_PROXY_URL || 'https://openapi.tossinvest.com';
  const targetUrl = `${proxyBaseUrl.replace(/\/$/, '')}${targetPath}${url.search}`;

  // 디버깅용 엔드포인트: 쿼리에 ?debug=1 이 있으면 환경 변수 주입 상태를 출력
  if (url.searchParams.get('debug') === '1') {
    return new Response(JSON.stringify({
      TOSS_PROXY_URL: context.env.TOSS_PROXY_URL || "UNDEFINED (미설정)",
      targetUrl: targetUrl,
      envKeys: Object.keys(context.env || {})
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // [추가] /api/push-notice 요청 가로채기: Cloudflare 환경변수에서 키를 주입하여 GCP VM으로 전달
  if (targetPath === '/api/push-notice' && request.method === 'POST') {
    try {
      const gcpServerUrl = context.env.TOSS_PROXY_URL;
      if (!gcpServerUrl) {
        return new Response(JSON.stringify({ error: 'TOSS_PROXY_URL 환경변수가 설정되지 않았습니다.' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      // 원본 요청 본문 읽기
      const originalBody = await request.json();

      // Cloudflare 환경변수에서 키 주입 (기존 등록된 변수명 그대로 사용)
      const enrichedBody = {
        ...originalBody,
        supabaseUrl: context.env.SUPABASE_URL,
        supabaseKey: context.env.SUPABASE_KEY,
        securityKey: context.env.SECURITY_KEY,
        vapidPublicKey: context.env.VAPID_PUBLIC_KEY,
        vapidPrivateKey: context.env.VAPID_PRIVATE_KEY
      };

      // GCP VM 푸시 서버로 직접 전달 (포트 3000)
      const baseUrl = gcpServerUrl.replace(/\/$/, '').replace(/:\d+$/, '');
      const pushResponse = await fetch(`${baseUrl}:3000/api/push-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrichedBody)
      });

      const pushResult = await pushResponse.text();
      return new Response(pushResult, {
        status: pushResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Push notice proxy failed', detail: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }

  // 중요: Cloudflare 헤더 스푸핑 차단 방지를 위해 필수 헤더만 필터링하여 전달
  const headers = new Headers();
  const allowedHeaders = ['content-type', 'authorization', 'accept', 'accept-encoding', 'user-agent'];
  for (const [key, value] of request.headers.entries()) {
    const lowerKey = key.toLowerCase();
    if (allowedHeaders.includes(lowerKey)) {
      headers.set(key, value);
    }
  }
  
  const fetchOptions = {
    method: request.method,
    headers: headers,
    redirect: 'follow'
  };
  
  // GET/HEAD 이외의 POST 등 바디가 필요한 메서드인 경우 바디 보존
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = await request.clone().arrayBuffer();
  }
  
  try {
    const response = await fetch(targetUrl, fetchOptions);
    
    // 응답 객체 생성 및 클라이언트에 반환 (헤더와 바디 복사 및 CORS 허용 헤더 주입)
    const newResponse = new Response(response.body, response);
    
    // [해결] 401 Unauthorized 응답 시 브라우저가 기본 로그인 창을 띄우지 않도록 WWW-Authenticate 헤더 제거
    newResponse.headers.delete('www-authenticate');
    
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', '*');
    
    return newResponse;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

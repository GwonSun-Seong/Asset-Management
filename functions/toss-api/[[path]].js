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
  // [개선] 클라우드플레어 환경변수 TOSS_PROXY_URL이 있으면 가상서버로 우회, 없으면 기본 주소로 작동
  const proxyBaseUrl = context.env.TOSS_PROXY_URL || 'https://openapi.tossinvest.com';
  const targetUrl = `${proxyBaseUrl.replace(/\/$/, '')}${targetPath}${url.search}`;
  
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

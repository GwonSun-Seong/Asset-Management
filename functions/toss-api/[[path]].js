export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // OPTIONS preflight 요청 처리
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

  // /toss-api 뒤의 실제 토스 API 경로 추출
  const targetPath = url.pathname.replace(/^\/toss-api/, '');
  const targetUrl = `https://openapi.tossinvest.com${targetPath}${url.search}`;
  
  // 기존 요청 헤더 복사 (host 헤더는 fetch 시 Cloudflare가 재정의하므로 삭제)
  const headers = new Headers(request.headers);
  headers.delete('host');
  
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
    
    // 응답 객체 생성 및 클라이언트에 반환 (헤더와 바디 복사)
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

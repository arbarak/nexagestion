import { NextRequest, NextResponse } from 'next/server';
import { apiGateway } from './api-gateway';
import { apiKeyService } from './api-key-service';

export async function apiGatewayMiddleware(request: NextRequest) {
  const startTime = Date.now();
  const method = request.method;
  const path = request.nextUrl.pathname;

  try {
    // Check rate limit
    const rateLimit = await apiGateway.checkRateLimit(request);
    
    if (!rateLimit.allowed) {
      await apiGateway.logRequest(method, path, 429, Date.now() - startTime);
      
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: apiGateway.createRateLimitHeaders(rateLimit),
        }
      );
    }

    // Validate API key if required
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      const isValid = await apiKeyService.validateApiKey(apiKey, '');
      if (!isValid) {
        await apiGateway.logRequest(method, path, 401, Date.now() - startTime);
        
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Track API key usage
      await apiKeyService.trackApiKeyUsage(apiKey);
    }

    // Add rate limit headers to response
    const headers = apiGateway.createRateLimitHeaders(rateLimit);

    return NextResponse.next({
      request: {
        headers: new Headers(request.headers),
      },
    });
  } catch (error) {
    console.error('API Gateway Error:', error);
    await apiGateway.logRequest(method, path, 500, Date.now() - startTime);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export function createApiGatewayMiddleware(config: any) {
  return async (request: NextRequest) => {
    return apiGatewayMiddleware(request);
  };
}


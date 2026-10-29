const getApiUrl = () => {
  const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (import.meta.env.PROD && !configuredApiUrl) {
    throw new Error('VITE_API_BASE_URL is required in production.');
  }

  const baseUrl = configuredApiUrl || 'http://localhost:5000/api/v1';

  let parsedUrl;

  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error('VITE_API_BASE_URL must be a valid URL.');
  }

  if (import.meta.env.PROD && parsedUrl.protocol !== 'https:') {
    throw new Error('VITE_API_BASE_URL must use HTTPS in production.');
  }

  return parsedUrl.toString().replace(/\/$/, '');
};

export async function api(path, options = {}) {
  const apiUrl = getApiUrl();
  const endpoint = path.startsWith('/') ? path : `/${path}`;

  const {
    body,
    headers,
    signal: callerSignal,
    timeoutMs = 10000,
    ...requestOptions
  } = options;

  const controller = new AbortController();
  let timedOut = false;

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const abortRequest = () => controller.abort();

  callerSignal?.addEventListener('abort', abortRequest, { once: true });

  let response;

  try {
    response = await fetch(`${apiUrl}${endpoint}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !(body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...headers,
      },
      body:
        body !== undefined &&
        typeof body !== 'string' &&
        !(body instanceof FormData)
          ? JSON.stringify(body)
          : body,
    });
  } catch (error) {
    if (timedOut) {
      const timeoutError = new Error(
        'The request took too long. Please try again.'
      );

      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
    callerSignal?.removeEventListener('abort', abortRequest);
  }

  const contentType = response.headers.get('content-type') || '';

  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        payload?.message ||
        (typeof payload === 'string' ? payload : null) ||
        `Request failed (${response.status})`
    );
  }

  return payload;
}
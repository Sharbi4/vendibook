export async function startCheckout(payload) {
  const res = await fetch('/api/stripe/createCheckout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();

  if (data?.url) {
    window.location.href = data.url;
  }

  return data;
}

function CheckoutCancel() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Payment canceled. You can retry or return to your listings.</h1>
      <p className="text-base text-gray-600">No charges were made. Feel free to attempt checkout again.</p>
    </main>
  );
}

export default CheckoutCancel;

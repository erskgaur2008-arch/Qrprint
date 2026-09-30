import StaffPunchForm from "@/components/staff-punch-form";

export default async function StaffPunchPage({
  searchParams,
}: {
  searchParams: Promise<{ school?: string; qr?: string }>;
}) {
  const params = await searchParams;
  const schoolId = params.school ?? "";
  const qrToken = params.qr ?? "";

  return (
    <main className="auth-page">
      {schoolId && qrToken ? (
        <StaffPunchForm schoolId={schoolId} qrToken={qrToken} />
      ) : (
        <div className="auth-card">
          <div className="brand-mark">📷</div>
          <h1>Scan Today’s School QR</h1>
          <p className="muted">This attendance page must be opened from the daily QR code displayed by your school.</p>
        </div>
      )}
    </main>
  );
}

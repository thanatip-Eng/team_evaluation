import LoginButton from '@/components/LoginButton';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full mx-auto flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ระบบประเมินเพื่อนในกลุ่ม
          </h1>
          <p className="text-gray-500">Peer Evaluation System</p>
        </div>

        {params?.error === 'unauthorized' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            อีเมลของคุณไม่ได้รับอนุญาตให้ใช้ระบบนี้ กรุณาติดต่อผู้ดูแลระบบ
          </div>
        )}

        {params?.error === 'auth_failed' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง
          </div>
        )}

        {params?.error === 'unauthenticated' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            กรุณาเข้าสู่ระบบก่อนใช้งาน
          </div>
        )}

        <LoginButton />

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            รองรับการเข้าสู่ระบบด้วย Google Account
          </p>
          <p className="text-xs text-gray-400 mt-1">
            CMU IntraID (เร็วๆ นี้)
          </p>
        </div>
      </div>
    </div>
  );
}

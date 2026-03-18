'use client';

export default function HeroCTA() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
      <button
        onClick={() => window.dispatchEvent(new Event('open-chat-widget'))}
        className="px-8 py-4 bg-[#006A4E] hover:bg-[#005a40] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg border border-white/20"
      >
        Chat with Kamrul
      </button>
      <a
        href="/post-tuition"
        className="px-8 py-4 bg-[#E07B2A] hover:bg-[#c96a1f] text-white rounded-xl font-semibold text-lg transition-colors shadow-lg text-center"
      >
        Fill the Form
      </a>
    </div>
  );
}

import Header from '@/components/Header';
import TraditionalView from '@/components/TraditionalView';
import ChaosView from '@/components/ChaosView';
import QuantCopilot from '@/components/AICopilot';

export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-black text-stone-300 font-mono">
      <Header />
      <div className="flex-1 grid grid-cols-10 h-full overflow-hidden p-3 gap-3">
        <TraditionalView />
        <ChaosView />
        <div className="col-span-2 bg-[#0a0a0a] border border-[#333]">
          <QuantCopilot />
        </div>
      </div>
    </main>
  );
}

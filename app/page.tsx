import Header from '@/components/Header';
import TraditionalView from '@/components/TraditionalView';
import ChaosView from '@/components/ChaosView';
import AICopilot from '@/components/AICopilot';

export default function Home() {
  return (
    <main className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <Header />
      <div className="flex-1 grid grid-cols-10 h-full overflow-hidden p-4 gap-4">
        <TraditionalView />
        <ChaosView />
        <div className="col-span-2 bg-slate-900/40 rounded-xl p-4 border border-slate-800">
          <AICopilot />
        </div>
      </div>
    </main>
  );
}

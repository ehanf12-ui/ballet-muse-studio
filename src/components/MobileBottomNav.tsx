import { Home, Folder, BookOpen, User, Plus } from 'lucide-react';

export type MobileTab = 'home' | 'vault' | 'dictionary' | 'profile';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onNewNote: () => void;
}

const tabs: { id: MobileTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'vault', label: '보관함', icon: Folder },
  { id: 'dictionary', label: '사전', icon: BookOpen },
  { id: 'profile', label: '프로필', icon: User },
];

export default function MobileBottomNav({ activeTab, onTabChange, onNewNote }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] gap-0.5 transition-colors ${
                isActive ? 'text-rose-500' : 'text-muted-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}

        {/* FAB */}
        <button
          onClick={onNewNote}
          className="absolute -top-5 right-6 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all"
          aria-label="새 노트 작성"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
}

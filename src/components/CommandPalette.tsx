import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Search, Home, Map, Activity, Settings, Users, BookOpen, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const commands = [
    { icon: Home, label: 'Dashboard', path: '/', shortcut: 'G then D' },
    { icon: Map, label: 'Journey Map', path: '/journey-map', shortcut: 'G then J' },
    { icon: Activity, label: 'Metrics', path: '/metrics', shortcut: 'G then M' },
    { icon: Users, label: 'User Cohorts', path: '/user-cohorts', shortcut: 'G then U' },
    { icon: BookOpen, label: 'Documentation', path: '/documentation', shortcut: 'G then D' },
    { icon: Settings, label: 'Settings', path: '/settings', shortcut: 'G then S' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-2xl">
        <Command className="rounded-lg border-none">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search commands..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group heading="Navigation">
              {commands.map((cmd) => (
                <Command.Item
                  key={cmd.path}
                  onSelect={() => handleSelect(cmd.path)}
                  className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-sm hover:bg-accent"
                >
                  <cmd.icon className="h-4 w-4" />
                  <span className="flex-1">{cmd.label}</span>
                  <span className="text-xs text-muted-foreground">{cmd.shortcut}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="border-t p-2 text-xs text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ⌘K
            </kbd>{' '}
            to open command palette
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

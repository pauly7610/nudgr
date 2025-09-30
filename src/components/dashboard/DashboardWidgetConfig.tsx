import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Settings, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Widget {
  id: string;
  name: string;
  description: string;
  component: string;
  enabled: boolean;
}

const AVAILABLE_WIDGETS: Widget[] = [
  { id: 'friction-summary', name: 'Friction Summary', description: 'Key metrics overview', component: 'StatsCard', enabled: true },
  { id: 'top-friction', name: 'Top Friction Points', description: 'Most critical friction events', component: 'TopFrictionFunnels', enabled: true },
  { id: 'recent-alerts', name: 'Recent Alerts', description: 'Latest friction alerts', component: 'AlertsFeed', enabled: true },
  { id: 'session-recordings', name: 'Session Recordings', description: 'Recent user sessions', component: 'SessionRecordings', enabled: false },
  { id: 'heatmap', name: 'Heatmap Viewer', description: 'Interaction heatmaps', component: 'HeatmapViewer', enabled: false },
  { id: 'ai-insights', name: 'AI Insights', description: 'AI-powered recommendations', component: 'AIInsightsPanel', enabled: false },
  { id: 'journey-map', name: 'Journey Map', description: 'User journey visualization', component: 'JourneyFrictionMap', enabled: false },
  { id: 'ab-tests', name: 'A/B Tests', description: 'Active experiments', component: 'ABTestManager', enabled: false },
];

export const DashboardWidgetConfig = () => {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : AVAILABLE_WIDGETS;
  });

  const handleToggle = (widgetId: string) => {
    const updated = widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    setWidgets(updated);
    localStorage.setItem('dashboard_widgets', JSON.stringify(updated));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
    localStorage.setItem('dashboard_widgets', JSON.stringify(items));
  };

  const resetToDefault = () => {
    setWidgets(AVAILABLE_WIDGETS);
    localStorage.setItem('dashboard_widgets', JSON.stringify(AVAILABLE_WIDGETS));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Widgets</DialogTitle>
          <DialogDescription>
            Customize which widgets appear on your dashboard and their order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Drag to reorder, toggle to show/hide
            </p>
            <Button variant="ghost" size="sm" onClick={resetToDefault}>
              Reset to Default
            </Button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-3 p-3 border rounded-lg bg-background ${
                            snapshot.isDragging ? 'shadow-lg' : ''
                          }`}
                        >
                          <div {...provided.dragHandleProps}>
                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                          </div>
                          
                          <Checkbox
                            id={widget.id}
                            checked={widget.enabled}
                            onCheckedChange={() => handleToggle(widget.id)}
                          />
                          
                          <label htmlFor={widget.id} className="flex-1 cursor-pointer">
                            <p className="font-medium">{widget.name}</p>
                            <p className="text-sm text-muted-foreground">{widget.description}</p>
                          </label>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to get enabled widgets in order
export const useDashboardWidgets = () => {
  const [widgets] = useState<Widget[]>(() => {
    const saved = localStorage.getItem('dashboard_widgets');
    return saved ? JSON.parse(saved) : AVAILABLE_WIDGETS;
  });

  return widgets.filter(w => w.enabled);
};

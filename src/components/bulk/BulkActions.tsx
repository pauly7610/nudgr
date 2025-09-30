import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Download, Archive } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BulkActionsProps {
  selectedItems: string[];
  onClearSelection: () => void;
  itemType: 'events' | 'recordings' | 'tests';
}

export const BulkActions = ({ selectedItems, onClearSelection, itemType }: BulkActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [action, setAction] = useState('');

  const handleBulkAction = async (actionType: string) => {
    setAction(actionType);
    
    if (actionType === 'delete') {
      setShowDeleteDialog(true);
      return;
    }

    try {
      switch (actionType) {
        case 'export':
          // Export logic
          toast({
            title: 'Export started',
            description: `Exporting ${selectedItems.length} ${itemType}...`,
          });
          break;
        case 'archive':
          // Archive logic
          toast({
            title: 'Items archived',
            description: `${selectedItems.length} ${itemType} archived successfully`,
          });
          break;
      }
      onClearSelection();
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Failed to perform bulk action',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Delete logic would go here
      toast({
        title: 'Items deleted',
        description: `${selectedItems.length} ${itemType} deleted successfully`,
      });
      setShowDeleteDialog(false);
      onClearSelection();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete items',
        variant: 'destructive',
      });
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <Card className="border-primary">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox checked={true} disabled />
              <span className="text-sm font-medium">
                {selectedItems.length} {itemType} selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('archive')}
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedItems.length} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected {itemType}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

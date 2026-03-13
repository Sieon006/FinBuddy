import { Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface UndoRedoButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const UndoRedoButtons = ({ canUndo, canRedo, onUndo, onRedo }: UndoRedoButtonsProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8"
        title={t('undo')}
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8"
        title={t('redo')}
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UndoRedoButtons;

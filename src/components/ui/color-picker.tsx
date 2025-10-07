import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
  '#DC2626', // Dark Red
  '#059669', // Dark Green
  '#7C3AED', // Dark Purple
  '#0891B2', // Dark Cyan
  '#CA8A04', // Dark Amber
  '#BE185D', // Dark Pink
  '#16A34A', // Dark Lime
  '#EA580C', // Dark Orange
  '#9333EA', // Dark Violet
];

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-surface border-border",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm">{value}</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <Button
              key={color}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:scale-110 transition-transform"
              onClick={() => onChange(color)}
            >
              <div
                className="w-6 h-6 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            </Button>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Custom:</span>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

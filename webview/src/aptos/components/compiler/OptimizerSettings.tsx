import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";

interface OptimizerSettingsProps {
  enabled: boolean;
  level: string;
  onChange: (enabled: boolean, level?: string) => void;
}

export const OptimizerSettings = ({
  enabled,
  level,
  onChange,
}: OptimizerSettingsProps) => {
  return (
    <Card className="border-gray-700">
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="optimizer-switch" className="text-sm font-medium">
              Optimizer Settings
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable code optimization for better performance
            </p>
          </div>
          <Switch
            id="optimizer-switch"
            checked={enabled}
            onCheckedChange={(checked) => onChange(checked)}
            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-700"
          />
        </div>

        {enabled && (
          <div className="space-y-2">
            <Label
              htmlFor="optimizer-level"
              className="text-sm text-muted-foreground"
            ></Label>
            <Select
              value={level}
              onValueChange={(value) => onChange(enabled, value)}
            >
              <SelectTrigger
                id="optimizer-level"
                className="w-full  bg-gray-900/20"
              >
                <SelectValue placeholder="Select optimizer level" />
              </SelectTrigger>
              <SelectContent className=" bg-gray-900/20 border">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="extra">Extra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

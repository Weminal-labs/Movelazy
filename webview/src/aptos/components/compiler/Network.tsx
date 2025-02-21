import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Network } from "../../types/network";

interface NetworkSelectorProps {
  network: string;
  onChange: (network: Network) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  network,
  onChange,
}) => {
  return (
    <Card className="w-full border-none bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium -mb-4">
          Choose Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={network}
          onValueChange={(value) => onChange(value as Network)}
        >
          <SelectTrigger className="border-gray-800 bg-gray-900/50">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/50">
            <SelectItem value={Network.Testnet}>Testnet</SelectItem>
            <SelectItem value={Network.Devnet}>Devnet</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default NetworkSelector;

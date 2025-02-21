import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";

interface NamedAddressesInputProps {
  namedAddresses: string;
  onChange: (value: string) => void;
}

const NamedAddressesInput: React.FC<NamedAddressesInputProps> = ({
  namedAddresses,
  onChange,
}) => {
  return (
    <Card className="w-full border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Name Module</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            id="module-name"
            value={namedAddresses}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Example: hello_blockchain"
            className="text-base flex flex-col items-center justify-center gap-2 border-gray-700 bg-gray-800/50 hover:bg-gray-800"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NamedAddressesInput;

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AdminLogin = ({ onLogin }) => {
  const [adminKey, setAdminKey] = useState("");

  return (
    <div className="flex gap-2">
      <Input
        type="password"
        value={adminKey}
        onChange={(e) => setAdminKey(e.target.value)}
        placeholder="Enter Admin Key"
      />
      <Button onClick={() => onLogin(adminKey)}>Login</Button>
    </div>
  );
};

export default AdminLogin;

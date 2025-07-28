import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthDialog = ({ isOpen, onClose, initialMode = "login" }: AuthDialogProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  const handleSwitchMode = () => {
    setMode(mode === "login" ? "register" : "login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
        {mode === "login" ? (
          <LoginForm onSwitchToRegister={handleSwitchMode} onClose={onClose} />
        ) : (
          <RegisterForm onSwitchToLogin={handleSwitchMode} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
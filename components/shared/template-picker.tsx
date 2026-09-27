"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TemplatePickerProps {
  title: string;
  defaultContent: string;
  onSave?: (content: string) => void;
}

export function TemplatePicker({ title, defaultContent, onSave }: TemplatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(defaultContent);

  const handleSave = () => {
    if (onSave) onSave(content);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/30 cursor-pointer transition-colors group">
          <span className="font-medium text-sm flex items-center gap-2 text-foreground/90">
            <span className="text-primary text-lg">📄</span> {title}
          </span>
          <Button variant="ghost" size="sm" className="text-primary group-hover:bg-primary/10">Edit</Button>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Template: {title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-4">
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm resize-none"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

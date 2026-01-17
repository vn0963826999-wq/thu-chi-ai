"use client";

import { COLOR_PALETTE } from "@/lib/icon-library";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type ColorPickerProps = {
    selectedColor: string;
    onSelectColor: (color: string) => void;
};

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Màu sắc</span>
                <span className="text-xs text-muted-foreground">{COLOR_PALETTE.length} màu</span>
            </div>

            {/* Color Grid */}
            <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((color) => {
                    const isSelected = selectedColor === color.hex;
                    return (
                        <button
                            key={color.id}
                            type="button"
                            onClick={() => onSelectColor(color.hex)}
                            className={cn(
                                "h-11 w-11 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                                isSelected && "ring-2 ring-primary ring-offset-2 scale-110"
                            )}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                        >
                            {isSelected && (
                                <Check
                                    className="h-4 w-4 mx-auto"
                                    style={{ color: color.hex === "#ffffff" ? "#000" : "#fff" }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ICON_MAP, ALL_ICONS, searchIcons } from "@/lib/icon-library";
import { cn } from "@/lib/utils";

type IconPickerProps = {
    selectedIcon: string;
    onSelectIcon: (iconName: string) => void;
    color?: string;
};

export function IconPicker({ selectedIcon, onSelectIcon, color = "#000000" }: IconPickerProps) {
    const [searchQuery, setSearchQuery] = useState("");

    // Get unique icons - search or all
    const filteredIcons = searchQuery ? searchIcons(searchQuery) : ALL_ICONS;

    return (
        <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Tìm icon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 rounded-xl bg-muted/20 pl-9"
                />
                {searchQuery && (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
                        onClick={() => setSearchQuery("")}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Icon Grid - Single list, no tabs */}
            <div className="rounded-xl border bg-muted/10 p-2">
                <ScrollArea className="h-[200px]">
                    <div className="flex flex-wrap gap-1.5 pr-2">
                        {filteredIcons.length > 0 ? (
                            filteredIcons.map((iconName) => {
                                const IconComponent = ICON_MAP[iconName];
                                if (!IconComponent) return null;

                                const isSelected = selectedIcon === iconName;
                                return (
                                    <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => onSelectIcon(iconName)}
                                        className={cn(
                                            "flex h-11 w-11 items-center justify-center rounded-lg border cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50",
                                            isSelected
                                                ? "border-primary bg-primary/10 ring-2 ring-primary"
                                                : "border-transparent hover:bg-muted"
                                        )}
                                        title={iconName}
                                    >
                                        <IconComponent
                                            className="h-5 w-5"
                                            style={{ color: isSelected ? color : undefined }}
                                        />
                                    </button>
                                );
                            })
                        ) : (
                            <div className="flex h-[180px] w-full items-center justify-center text-sm text-muted-foreground">
                                Không tìm thấy icon
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="mt-2 border-t pt-2 text-center text-xs text-muted-foreground">
                    {filteredIcons.length} icons
                </div>
            </div>
        </div>
    );
}

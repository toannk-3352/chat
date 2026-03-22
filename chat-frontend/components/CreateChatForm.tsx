"use client";

import { createChatAction } from "@/lib/actions/chat";
import { searchUsersAction } from "@/lib/actions/user";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, UserPlus, X, Check, Loader2 } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
};

const CreateChatForm = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await searchUsersAction(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      setMessage("Please select at least one user");
      return;
    }

    try {
      setIsCreating(true);
      setMessage("");
      const participantIds = selectedUsers.map((u) => u.id.toString());
      await createChatAction(participantIds);
      setMessage("Chat created successfully!");
      setSelectedUsers([]);
      setSearchQuery("");
      setSearchResults([]);

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl ">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          Create New Chat
        </CardTitle>
        <CardDescription>
          Search and select users to start a conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col gap-2">
          {/* Search Input with Absolute Dropdown */}
          <div className="relative">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <Search className="w-4 h-4" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type name or email to search..."
              />
              {isSearching && (
                <InputGroupAddon align="inline-end">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </InputGroupAddon>
              )}
            </InputGroup>

            {/* Search Results Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50">
                {searchResults.length > 0 ? (
                  <div className="bg-background border rounded-lg shadow-lg max-h-80 overflow-y-auto p-1">
                    {searchResults.map((user) => {
                      const isSelected = selectedUsers.some(
                        (u) => u.id === user.id
                      );
                      return (
                        <div
                          key={user.id}
                          onClick={() => toggleUserSelection(user)}
                          className={`p-3 rounded-md cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary"
                              : "hover:bg-accent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !isSearching && (
                    <div className="bg-background border rounded-lg shadow-lg p-8 text-center">
                      <p className="text-sm font-medium text-muted-foreground">
                        No users found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try searching with a different term
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-3 p-4 bg-muted/40 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold flex items-center gap-2">
                  Selected Users ({selectedUsers.length})
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                  className="h-7 text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge
                    key={user.id}
                    variant="secondary"
                    className="px-3 py-2 gap-2 text-sm hover:bg-secondary/80 cursor-pointer"
                    onClick={() => toggleUserSelection(user)}
                  >
                    <span className="font-medium max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <X className="w-3.5 h-3.5 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Create Button */}
          <Button
            type="submit"
            disabled={selectedUsers.length === 0 || isCreating}
            className="w-full h-11"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creating Chat...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create Chat{" "}
                {selectedUsers.length > 0 &&
                  `(${selectedUsers.length} ${selectedUsers.length === 1 ? "person" : "people"})`}
              </>
            )}
          </Button>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg text-sm font-medium ${
                message.includes("Error") || message.includes("Please select")
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateChatForm;

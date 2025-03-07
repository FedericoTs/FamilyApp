import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";
import { FamilyMember } from "@/types/profile";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
  onAdd: (
    member: Omit<
      FamilyMember,
      "id" | "profile_id" | "created_at" | "updated_at"
    >,
  ) => Promise<{ error: string | null }>;
  onUpdate: (
    id: string,
    updates: Partial<Omit<FamilyMember, "id" | "profile_id">>,
  ) => Promise<{ error: string | null }>;
  onDelete: (id: string) => Promise<{ error: string | null }>;
}

// Function to calculate age range based on birthdate
const calculateAgeRange = (birthdate: string | null): string => {
  if (!birthdate) return "";

  const today = new Date();
  const birth = new Date(birthdate);

  // Calculate age in years
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  // Determine age range category
  if (age < 1) return "infant";
  if (age >= 1 && age <= 3) return "toddler";
  if (age >= 3 && age <= 5) return "preschool";
  if (age >= 6 && age <= 12) return "child";
  if (age >= 13 && age <= 17) return "teen";
  return "adult";
};

// Function to get display text for age range
const getAgeRangeLabel = (ageRange: string): string => {
  const ageRangeMap: Record<string, string> = {
    infant: "Infant (0-1)",
    toddler: "Toddler (1-3)",
    preschool: "Preschool (3-5)",
    child: "Child (6-12)",
    teen: "Teen (13-17)",
    adult: "Adult (18+)",
  };

  return ageRangeMap[ageRange] || "";
};

// Function to calculate age in years and months
const calculateAge = (birthdate: string | null): string => {
  if (!birthdate) return "";

  const today = new Date();
  const birth = new Date(birthdate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }

  if (years === 0) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  } else {
    return `${years} year${years !== 1 ? "s" : ""}, ${months} month${months !== 1 ? "s" : ""}`;
  }
};

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({
  familyMembers,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    birthdate: "",
  });

  // Refs to store selected years
  const newMemberYearRef = useRef<number>(new Date().getFullYear());
  const editingMemberYearRef = useRef<number>(new Date().getFullYear());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingMember) {
      setEditingMember({ ...editingMember, [name]: value });
    } else {
      setNewMember({ ...newMember, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (editingMember) {
      setEditingMember({ ...editingMember, [name]: value });
    } else {
      setNewMember({ ...newMember, [name]: value });
    }
  };

  const handleAddMember = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await onAdd(newMember);
      if (result.error) {
        setError(result.error);
      } else {
        setNewMember({ name: "", relationship: "", birthdate: "" });
        setIsAddDialogOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while adding family member");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    setLoading(true);
    setError(null);

    try {
      const { id, ...updates } = editingMember;
      const result = await onUpdate(id, updates);
      if (result.error) {
        setError(result.error);
      } else {
        setEditingMember(null);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating family member");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to remove this family member?")) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onDelete(id);
      if (result.error) {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting family member");
    } finally {
      setLoading(false);
    }
  };

  // Handle year change for new member
  const handleNewMemberYearChange = (year: string) => {
    const yearValue = parseInt(year);
    newMemberYearRef.current = yearValue;

    const currentDate = newMember.birthdate
      ? new Date(newMember.birthdate)
      : new Date();

    currentDate.setFullYear(yearValue);

    // Force re-render of calendar with new year
    setNewMember((prev) => ({
      ...prev,
      birthdate: currentDate.toISOString(),
    }));
  };

  // Handle year change for editing member
  const handleEditingMemberYearChange = (year: string) => {
    if (!editingMember) return;

    const yearValue = parseInt(year);
    editingMemberYearRef.current = yearValue;

    const currentDate = editingMember.birthdate
      ? new Date(editingMember.birthdate)
      : new Date();

    currentDate.setFullYear(yearValue);

    // Force re-render of calendar with new year
    setEditingMember({
      ...editingMember,
      birthdate: currentDate.toISOString(),
    });
  };

  // Relationship options remain the same
  const relationshipOptions = [
    { value: "spouse", label: "Spouse/Partner" },
    { value: "child", label: "Child" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "grandparent", label: "Grandparent" },
    { value: "grandchild", label: "Grandchild" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="dark:text-white">Family Members</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={newMember.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={newMember.relationship}
                  onValueChange={(value) =>
                    handleSelectChange("relationship", value)
                  }
                >
                  <SelectTrigger id="relationship">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Birthdate</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200 hover:from-pink-100 hover:to-purple-100"
                    >
                      <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                      {newMember.birthdate ? (
                        format(new Date(newMember.birthdate), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-purple-200 shadow-lg"
                    align="start"
                  >
                    <div className="p-3 space-y-4">
                      <div className="flex justify-center">
                        <Select
                          value={newMemberYearRef.current.toString()}
                          onValueChange={handleNewMemberYearChange}
                        >
                          <SelectTrigger className="w-[120px] bg-purple-50 border-purple-200 focus:ring-purple-500">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[240px]">
                            {Array.from(
                              { length: new Date().getFullYear() - 1899 },
                              (_, i) => (
                                <SelectItem
                                  key={1900 + i}
                                  value={(1900 + i).toString()}
                                >
                                  {1900 + i}
                                </SelectItem>
                              ),
                            ).reverse()}
                          </SelectContent>
                        </Select>
                      </div>

                      <CalendarComponent
                        mode="single"
                        selected={
                          newMember.birthdate
                            ? new Date(newMember.birthdate)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            // Use the year from our ref
                            const newDate = new Date(date);
                            newDate.setFullYear(newMemberYearRef.current);

                            handleInputChange({
                              target: {
                                name: "birthdate",
                                value: newDate.toISOString(),
                              },
                            } as React.ChangeEvent<HTMLInputElement>);
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className="rounded-md border border-purple-200"
                        defaultMonth={
                          newMember.birthdate
                            ? new Date(newMember.birthdate)
                            : new Date(
                                new Date().setFullYear(
                                  newMemberYearRef.current,
                                ),
                              )
                        }
                        month={
                          newMember.birthdate
                            ? new Date(newMember.birthdate)
                            : new Date(
                                new Date().setFullYear(
                                  newMemberYearRef.current,
                                ),
                              )
                        }
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {newMember.birthdate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Age: {calculateAge(newMember.birthdate)}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleAddMember}
                disabled={loading || !newMember.name}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!editingMember}
          onOpenChange={(open) => !open && setEditingMember(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Family Member</DialogTitle>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {editingMember && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    value={editingMember.name}
                    onChange={handleInputChange}
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-relationship">Relationship</Label>
                  <Select
                    value={editingMember.relationship || ""}
                    onValueChange={(value) =>
                      handleSelectChange("relationship", value)
                    }
                  >
                    <SelectTrigger id="edit-relationship">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {relationshipOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-birthdate">Birthdate</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-gradient-to-r from-pink-50 to-purple-50 border-purple-200 hover:from-pink-100 hover:to-purple-100"
                      >
                        <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                        {editingMember.birthdate ? (
                          format(new Date(editingMember.birthdate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-purple-200 shadow-lg"
                      align="start"
                    >
                      <div className="p-3 space-y-4">
                        <div className="flex justify-center">
                          <Select
                            value={
                              editingMember.birthdate
                                ? new Date(editingMember.birthdate)
                                    .getFullYear()
                                    .toString()
                                : editingMemberYearRef.current.toString()
                            }
                            onValueChange={handleEditingMemberYearChange}
                          >
                            <SelectTrigger className="w-[120px] bg-purple-50 border-purple-200 focus:ring-purple-500">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[240px]">
                              {Array.from(
                                { length: new Date().getFullYear() - 1899 },
                                (_, i) => (
                                  <SelectItem
                                    key={1900 + i}
                                    value={(1900 + i).toString()}
                                  >
                                    {1900 + i}
                                  </SelectItem>
                                ),
                              ).reverse()}
                            </SelectContent>
                          </Select>
                        </div>

                        <CalendarComponent
                          mode="single"
                          selected={
                            editingMember.birthdate
                              ? new Date(editingMember.birthdate)
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date && editingMember) {
                              // Use the year from our ref
                              const newDate = new Date(date);
                              newDate.setFullYear(editingMemberYearRef.current);

                              setEditingMember({
                                ...editingMember,
                                birthdate: newDate.toISOString(),
                              });
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="rounded-md border border-purple-200"
                          defaultMonth={
                            editingMember.birthdate
                              ? new Date(editingMember.birthdate)
                              : new Date(
                                  new Date().setFullYear(
                                    editingMemberYearRef.current,
                                  ),
                                )
                          }
                          month={
                            editingMember.birthdate
                              ? new Date(editingMember.birthdate)
                              : new Date(
                                  new Date().setFullYear(
                                    editingMemberYearRef.current,
                                  ),
                                )
                          }
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  {editingMember.birthdate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Age: {calculateAge(editingMember.birthdate)}
                    </p>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={handleUpdateMember}
                disabled={loading || !editingMember?.name}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Member"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {familyMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p>No family members added yet.</p>
            <p className="text-sm mt-2">
              Add family members to share locations and plan activities
              together.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-md dark:bg-gray-700"
              >
                <div>
                  <h3 className="font-medium dark:text-white">{member.name}</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {member.relationship &&
                      relationshipOptions.find(
                        (o) => o.value === member.relationship,
                      )?.label}
                    {member.relationship && member.birthdate && " • "}
                    {member.birthdate && (
                      <>
                        {getAgeRangeLabel(calculateAgeRange(member.birthdate))}
                        <span className="text-xs ml-1">
                          ({calculateAge(member.birthdate)})
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Initialize the year ref when starting to edit
                      if (member.birthdate) {
                        editingMemberYearRef.current = new Date(
                          member.birthdate,
                        ).getFullYear();
                      }
                      setEditingMember(member);
                    }}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMember(member.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyMembersList;

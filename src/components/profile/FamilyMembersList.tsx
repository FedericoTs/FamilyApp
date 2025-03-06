import React, { useState } from "react";
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
} from "lucide-react";
import { FamilyMember } from "@/types/profile";

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
    age_range: "",
  });

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
        setNewMember({ name: "", relationship: "", age_range: "" });
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

  const ageRangeOptions = [
    { value: "infant", label: "Infant (0-1)" },
    { value: "toddler", label: "Toddler (1-3)" },
    { value: "preschool", label: "Preschool (3-5)" },
    { value: "child", label: "Child (6-12)" },
    { value: "teen", label: "Teen (13-17)" },
    { value: "adult", label: "Adult (18+)" },
  ];

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
                <Label htmlFor="age_range">Age Range</Label>
                <Select
                  value={newMember.age_range}
                  onValueChange={(value) =>
                    handleSelectChange("age_range", value)
                  }
                >
                  <SelectTrigger id="age_range">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="edit-age_range">Age Range</Label>
                  <Select
                    value={editingMember.age_range || ""}
                    onValueChange={(value) =>
                      handleSelectChange("age_range", value)
                    }
                  >
                    <SelectTrigger id="edit-age_range">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {ageRangeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    {member.relationship && member.age_range && " • "}
                    {member.age_range &&
                      ageRangeOptions.find((o) => o.value === member.age_range)
                        ?.label}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingMember(member)}
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

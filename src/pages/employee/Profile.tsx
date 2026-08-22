import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getEmployeeById, updateEmployee } from "@/services/employeeService";
import { LoadingSkeleton } from "@/components/common/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Building2, Briefcase, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function Profile() {
  const { id } = useParams();
  const currentUser = useAuthStore((state) => state.currentUser);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    designation: "",
  });

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "hr";
  const isOwnProfile = !id || id === currentUser?.id;
  const canEdit = isAdmin || isOwnProfile;

  useEffect(() => {
    loadProfile();
  }, [id, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const targetId = id || currentUser?.id;
      const employee = await getEmployeeById(targetId || "");
      if (employee) {
        setProfile(employee);
        setFormData({
          fullName: employee.fullName,
          email: employee.email,
          phone: employee.phone,
          address: employee.address,
          department: employee.department,
          designation: employee.designation,
        });
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      const allowedFields = isAdmin
        ? {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            department: formData.department,
            designation: formData.designation,
          }
        : {
            phone: formData.phone,
            address: formData.address,
          };

      await updateEmployee(profile.id, allowedFields);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        department: profile.department,
        designation: profile.designation,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-12">
          <p className="text-center text-slate-500 dark:text-slate-400">
            Profile not found
          </p>
        </CardContent>
      </Card>
    );
  }

  const isFieldEditable = (field: string) => {
    if (isAdmin) return true;
    if (isOwnProfile) {
      return field === "phone" || field === "address";
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Profile
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {isOwnProfile ? "Manage your profile information" : `Viewing ${profile.fullName}'s profile`}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-12 w-12 text-indigo-600" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {profile.fullName}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {profile.designation}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Building2 className="h-4 w-4" />
                {profile.department}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                Joined {format(new Date(profile.joiningDate), "MMM d, yyyy")}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    disabled={!isEditing || !isFieldEditable("fullName")}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing || !isFieldEditable("email")}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing || !isFieldEditable("phone")}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    disabled={!isEditing || !isFieldEditable("department")}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) =>
                      setFormData({ ...formData, designation: e.target.value })
                    }
                    disabled={!isEditing || !isFieldEditable("designation")}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  disabled={!isEditing || !isFieldEditable("address")}
                  className="pl-9 min-h-[80px]"
                />
              </div>
            </div>
            {!canEdit && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You don't have permission to edit this profile.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

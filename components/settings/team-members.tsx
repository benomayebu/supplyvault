"use client";

import { useState, useEffect } from "react";
import { Plus, Mail, User, Trash2 } from "lucide-react";
import { UserRole } from "@prisma/client";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  clerk_user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: Date;
}

interface TeamMembersProps {
  initialMembers: TeamMember[];
  currentUserRole: UserRole;
  currentUserId: string;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  VIEWER: "Viewer",
};

const roleColors: Record<UserRole, string> = {
  ADMIN: "bg-purple-100 text-purple-800",
  EDITOR: "bg-blue-100 text-blue-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

export function TeamMembers({
  initialMembers,
  currentUserRole,
  currentUserId,
}: TeamMembersProps) {
  const [members, setMembers] = useState(initialMembers);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canManageTeam = currentUserRole === UserRole.ADMIN;

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!canManageTeam) return;

    setIsLoading(true);
    setError(null);

    // Optimistic update
    setMembers((prev) =>
      prev.map((m) => (m.id === userId ? { ...m, role: newRole } : m))
    );

    try {
      const response = await fetch(`/api/settings/team/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update role");
      }

      setSuccess("Role updated successfully");
    } catch (err) {
      // Revert optimistic update
      setMembers(initialMembers);
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!canManageTeam) return;

    if (
      !confirm(
        `Are you sure you want to remove ${memberName} from the team? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Optimistic update
    const removedMember = members.find((m) => m.id === userId);
    setMembers((prev) => prev.filter((m) => m.id !== userId));

    try {
      const response = await fetch(`/api/settings/team/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove member");
      }

      setSuccess(`${memberName} removed successfully`);
    } catch (err) {
      // Revert optimistic update
      if (removedMember) {
        setMembers([...members]);
      }
      setError(err instanceof Error ? err.message : "Failed to remove member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = () => {
    // TODO: Implement invite functionality
    alert(
      "Invite functionality will be implemented with Clerk invitation system"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary-navy">Team Members</h2>
          <p className="mt-1 text-gray-600">
            Manage your team members and their permissions
          </p>
        </div>
        {canManageTeam && (
          <button
            onClick={handleInviteMember}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-navy px-4 py-2 text-sm font-medium text-white hover:bg-primary-navy/90"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Added
                </th>
                {canManageTeam && (
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-navy text-white">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Mail className="mr-2 h-4 w-4" />
                      {member.email}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {canManageTeam && member.id !== currentUserId ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.id,
                            e.target.value as UserRole
                          )
                        }
                        disabled={isLoading}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium focus:border-secondary-teal focus:outline-none focus:ring-2 focus:ring-secondary-teal/20"
                      >
                        {Object.entries(roleLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleColors[member.role]}`}
                      >
                        {roleLabels[member.role]}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {format(new Date(member.created_at), "MMM d, yyyy")}
                  </td>
                  {canManageTeam && (
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      {member.id !== currentUserId && (
                        <button
                          onClick={() =>
                            handleRemoveMember(member.id, member.full_name)
                          }
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
